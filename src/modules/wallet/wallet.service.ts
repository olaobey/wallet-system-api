import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from '../transaction/entities/transaction.entity';
import {
  TransactionType,
  TransactionStatus,
  CACHE_KEYS,
} from '../../common/types';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { TransferDto } from './dto/transfer.dto';
import { BalanceDto } from './dto/balance.dto';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { QueueService, QueueMessage } from '../queue/queue.service';
import { User } from '../user/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { IWallet, ICreateWallet } from './interfaces/wallet.interface';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private dataSource: DataSource,
    private queueService: QueueService,
  ) {}

  // Queue operations
  async queueDeposit(depositDto: DepositDto): Promise<void> {
    const message: QueueMessage = {
      id: uuidv4(),
      type: 'deposit',
      data: depositDto,
      timestamp: new Date(),
    };
    await this.queueService.addToQueue(message);
  }

  async queueWithdraw(withdrawDto: WithdrawDto): Promise<void> {
    const message: QueueMessage = {
      id: uuidv4(),
      type: 'withdraw',
      data: withdrawDto,
      timestamp: new Date(),
    };
    await this.queueService.addToQueue(message);
  }

  async queueTransfer(transferDto: TransferDto, userId: string): Promise<void> {
    transferDto.userId = userId;
    const message: QueueMessage = {
      id: uuidv4(),
      type: 'transfer',
      data: transferDto,
      timestamp: new Date(),
    };
    await this.queueService.addToQueue(message);
  }

  async createWallet(
    dto: CreateWalletDto,
    queryRunner?: QueryRunner,
  ): Promise<Wallet> {
    const userId = dto.userId;
    const currency = dto.currency || 'USD';
    const walletName = dto.walletName || `${currency} Wallet`;

    const cacheKey = `wallet:${userId}:${currency}`;
    const manager = queryRunner
      ? queryRunner.manager
      : this.walletRepository.manager;

    // Prevent duplicate wallet
    const existingWallet = await manager.findOne(Wallet, {
      where: { userId, currency, isActive: true },
    });

    if (existingWallet) {
      throw new BadRequestException(
        `Wallet for user ${userId} with currency ${currency} already exists`,
      );
    }

    const wallet = manager.create(Wallet, {
      userId,
      currency,
      walletName,
      balance: 0,
      isActive: true,
    });

    const savedWallet = await manager.save(wallet);

    // Cache new wallet
    await this.cacheManager.set(cacheKey, savedWallet, 300_000); // 5 mins

    return savedWallet;
  }

  async updateWallet(dto: UpdateWalletDto): Promise<Wallet> {
    const currency = dto.currency || 'USD';

    const wallet = await this.walletRepository.findOne({
      where: { userId: dto.userId, currency },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (dto.isActive !== undefined) {
      wallet.isActive = dto.isActive;
    }

    if (dto.currency && dto.currency !== wallet.currency) {
      wallet.currency = dto.currency;
    }

    const updatedWallet = await this.walletRepository.save(wallet);

    // Update cache
    const cacheKey = `wallet:${dto.userId}:${wallet.currency}`;
    await this.cacheManager.set(cacheKey, updatedWallet, 300_000); // 5 minutes

    return updatedWallet;
  }

  // Actual transaction processing
  async deposit(depositDto: DepositDto): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Early idempotency check to prevent duplicate deposits
      if (depositDto.reference) {
        const existing = await this.transactionRepository.findOne({
          where: { idempotencyKey: depositDto.reference },
        });
        if (existing) {
          this.logger.warn(
            `Duplicate deposit skipped (idempotencyKey: ${depositDto.reference})`,
          );
          await queryRunner.rollbackTransaction();
          return;
        }
      }

      const wallet = await this.getOrCreateWallet(
        depositDto.userId,
        depositDto.currency,
        queryRunner,
      );

      const balanceBefore = Number(wallet.balance);
      const newBalance = balanceBefore + depositDto.amount;

      wallet.version += 1;

      await queryRunner.manager.update(Wallet, wallet.id, {
        balance: newBalance,
        version: wallet.version,
      });

      const transaction = this.transactionRepository.create({
        userId: depositDto.userId,
        walletId: wallet.id,
        type: TransactionType.DEPOSIT,
        amount: depositDto.amount,
        currency: depositDto.currency,
        status: TransactionStatus.COMPLETED,
        transactionId: uuidv4(),
        balanceBefore,
        balanceAfter: newBalance,
        description: depositDto.description || 'Deposit to wallet',
        idempotencyKey: depositDto.reference || uuidv4(),
        processedAt: new Date(),
        metadata: { source: 'api' },
      });

      await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();

      await this.cacheManager.set(
        CACHE_KEYS.walletBalance(wallet.id),
        newBalance,
        300_000,
      );

      this.logger.log(
        `Deposit completed: ${depositDto.amount} ${depositDto.currency} to user ${depositDto.userId}`,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Deposit failed:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async withdraw(withdrawDto: WithdrawDto): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await this.getWallet(
        withdrawDto.userId,
        withdrawDto.currency,
        queryRunner,
      );

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      // Check for idempotent key to skip duplicate transfers
      if (withdrawDto.reference) {
        const existing = await this.transactionRepository.findOne({
          where: { idempotencyKey: withdrawDto.reference },
        });
        if (existing) {
          this.logger.warn(
            `Duplicate transfer skipped (idempotencyKey: ${withdrawDto.reference})`,
          );
          await queryRunner.rollbackTransaction();
          return;
        }
      }
      const balanceBefore = Number(wallet.balance);

      if (balanceBefore < withdrawDto.amount) {
        throw new BadRequestException('Insufficient balance');
      }

      const newBalance = balanceBefore - withdrawDto.amount;

      await queryRunner.manager.update(Wallet, wallet.id, {
        balance: newBalance,
      });

      const transaction: IWallet = this.transactionRepository.create({
        userId: withdrawDto.userId,
        walletId: wallet.id,
        type: TransactionType.WITHDRAW,
        amount: withdrawDto.amount,
        currency: withdrawDto.currency,
        status: TransactionStatus.COMPLETED,
        transactionId: uuidv4(),
        balanceBefore,
        balanceAfter: newBalance,
        description: withdrawDto.description || 'Withdrawal from wallet',
        idempotencyKey: withdrawDto.reference || uuidv4(),
        processedAt: new Date(),
      });

      await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();

      // Invalidate cache
      await this.cacheManager.del(CACHE_KEYS.walletBalance(wallet.id));

      this.logger.log(
        `Withdrawal completed: ${withdrawDto.amount} ${withdrawDto.currency} from user ${withdrawDto.userId}`,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Withdrawal failed:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async transfer(transferDto: TransferDto): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const fromWallet = await this.getWalletById(
        transferDto.fromWalletId,
        queryRunner,
      );
      const toWallet = await this.getWalletById(
        transferDto.toWalletId,
        queryRunner,
      );

      if (!fromWallet || !toWallet) {
        throw new NotFoundException('One or both wallets not found');
      }

      const fromBalanceBefore = Number(fromWallet.balance);
      const toBalanceBefore = Number(toWallet.balance);

      if (fromBalanceBefore < transferDto.amount) {
        throw new BadRequestException('Insufficient balance');
      }

      const fromNewBalance = fromBalanceBefore - transferDto.amount;
      const toNewBalance = toBalanceBefore + transferDto.amount;

      // Check for idempotent key to skip duplicate transfers
      if (transferDto.reference) {
        const existing = await this.transactionRepository.findOne({
          where: { idempotencyKey: transferDto.reference },
        });
        if (existing) {
          this.logger.warn(
            `Duplicate transfer skipped (idempotencyKey: ${transferDto.reference})`,
          );
          await queryRunner.rollbackTransaction();
          return;
        }
      }

      await queryRunner.manager.update(Wallet, fromWallet.id, {
        balance: fromNewBalance,
      });

      await queryRunner.manager.update(Wallet, toWallet.id, {
        balance: toNewBalance,
      });

      const outTransaction = this.transactionRepository.create({
        userId: fromWallet.userId,
        walletId: fromWallet.id,
        type: TransactionType.TRANSFER_OUT,
        amount: transferDto.amount,
        currency: transferDto.currency,
        status: TransactionStatus.COMPLETED,
        transactionId: uuidv4(), // 🔒 Always unique
        idempotencyKey: transferDto.reference ?? undefined,
        relatedUserId: toWallet.userId,
        balanceBefore: fromBalanceBefore,
        balanceAfter: fromNewBalance,
        description:
          transferDto.description || `Transfer to wallet ${toWallet.id}`,
        processedAt: new Date(),
      });

      const inTransaction = this.transactionRepository.create({
        userId: toWallet.userId,
        walletId: toWallet.id,
        type: TransactionType.TRANSFER_IN,
        amount: transferDto.amount,
        currency: transferDto.currency,
        status: TransactionStatus.COMPLETED,
        transactionId: uuidv4(),
        idempotencyKey: transferDto.reference || uuidv4(),
        relatedUserId: fromWallet.userId,
        balanceBefore: toBalanceBefore,
        balanceAfter: toNewBalance,
        description:
          transferDto.description || `Transfer from wallet ${fromWallet.id}`,
        processedAt: new Date(),
      });

      await queryRunner.manager.save([outTransaction, inTransaction]);
      await queryRunner.commitTransaction();

      await Promise.all([
        this.cacheManager.del(CACHE_KEYS.walletBalance(fromWallet.id)),
        this.cacheManager.del(CACHE_KEYS.walletBalance(toWallet.id)),
      ]);

      this.logger.log(
        `Transfer completed: ${transferDto.amount} ${transferDto.currency} from wallet ${fromWallet.id} to ${toWallet.id}`,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Transfer failed:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getBalance(
    userId: string,
    currency: string = 'USD',
  ): Promise<BalanceDto> {
    const wallet = await this.walletRepository.findOne({
      where: { userId, currency, isActive: true },
    });

    if (!wallet) {
      return {
        userId,
        balance: 0,
        currency,
        lastUpdated: new Date(),
      };
    }
    const cachedBalance = await this.cacheManager.get<number>(
      CACHE_KEYS.walletBalance(wallet.id),
    );

    if (cachedBalance !== null && cachedBalance !== undefined) {
      return {
        userId,
        balance: cachedBalance,
        currency,
        lastUpdated: wallet.updatedAt,
      };
    }

    await this.cacheManager.set(
      CACHE_KEYS.walletBalance(wallet.id),
      wallet.balance,
      300000,
    );
    return {
      userId,
      balance: Number(wallet.balance),
      currency,
      lastUpdated: wallet.updatedAt,
    };
  }

  async getTransactionHistory(
    userId: string,
    limit: number = 50,
  ): Promise<Transaction[]> {
    const cacheKey = `transactions:${userId}:limit:${limit}`;
    const cached = await this.cacheManager.get<Transaction[]>(cacheKey);

    if (cached) return cached;

    const transactions = await this.transactionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });

    await this.cacheManager.set(cacheKey, transactions, 60 * 5 * 1000); // Cache for 5 mins
    return transactions;
  }

  async getOrCreateWallet(
    userId: string,
    currency: string,
    queryRunner?: QueryRunner,
  ): Promise<Wallet> {
    const cacheKey = `wallet:${userId}:${currency}`;
    const walletName = `${currency} Wallet`;
    const manager = queryRunner
      ? queryRunner.manager
      : this.walletRepository.manager;

    const cachedWallet = await this.cacheManager.get<Wallet>(cacheKey);
    if (cachedWallet) return cachedWallet;

    const existingWallet = await manager.findOne(Wallet, {
      where: { userId, currency, isActive: true },
    });

    if (existingWallet) return existingWallet;

    // Check to prevent FK violation
    const userExists = await manager.findOne(User, { where: { id: userId } });
    if (!userExists) {
      throw new BadRequestException(`User with ID ${userId} does not exist`);
    }

    const wallet = manager.create(Wallet, {
      userId,
      walletName,
      currency,
      balance: 0,
      isActive: true,
    });

    const savedWallet = await manager.save(wallet);
    await this.cacheManager.set(cacheKey, savedWallet, 300000);

    return savedWallet;
  }

  async getWalletById(
    walletId: string,
    queryRunner?: QueryRunner,
  ): Promise<Wallet | null> {
    const manager = queryRunner
      ? queryRunner.manager
      : this.walletRepository.manager;
    return manager.findOne(Wallet, { where: { id: walletId, isActive: true } });
  }

  private async getWallet(
    userId: string,
    currency: string,
    queryRunner?: any,
  ): Promise<Wallet | null> {
    const cacheKey = `wallet:${userId}:${currency}`;

    // Try cache first
    const cachedWallet = await this.cacheManager.get<Wallet>(cacheKey);
    if (cachedWallet) {
      return cachedWallet;
    }

    const manager = queryRunner
      ? queryRunner.manager
      : await this.walletRepository.manager;

    const wallet = await manager.findOne(Wallet, {
      where: { userId, currency, isActive: true },
    });

    if (wallet) {
      await this.cacheManager.set(cacheKey, wallet, 300000); // 5 mins
    } else {
      this.logger.warn(
        `Wallet not found for user ${userId} and currency ${currency}`,
      );
    }
    return wallet;
  }
}
