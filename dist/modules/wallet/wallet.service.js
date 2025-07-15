"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WalletService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cache_manager_1 = require("@nestjs/cache-manager");
const wallet_entity_1 = require("./entities/wallet.entity");
const transaction_entity_1 = require("../transaction/entities/transaction.entity");
const types_1 = require("../../common/types");
const queue_service_1 = require("../queue/queue.service");
const user_entity_1 = require("../user/entities/user.entity");
const uuid_1 = require("uuid");
let WalletService = WalletService_1 = class WalletService {
    constructor(walletRepository, transactionRepository, cacheManager, dataSource, queueService) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.cacheManager = cacheManager;
        this.dataSource = dataSource;
        this.queueService = queueService;
        this.logger = new common_1.Logger(WalletService_1.name);
    }
    async queueDeposit(depositDto) {
        const message = {
            id: (0, uuid_1.v4)(),
            type: 'deposit',
            data: depositDto,
            timestamp: new Date(),
        };
        await this.queueService.addToQueue(message);
    }
    async queueWithdraw(withdrawDto) {
        const message = {
            id: (0, uuid_1.v4)(),
            type: 'withdraw',
            data: withdrawDto,
            timestamp: new Date(),
        };
        await this.queueService.addToQueue(message);
    }
    async queueTransfer(transferDto, userId) {
        transferDto.userId = userId;
        const message = {
            id: (0, uuid_1.v4)(),
            type: 'transfer',
            data: transferDto,
            timestamp: new Date(),
        };
        await this.queueService.addToQueue(message);
    }
    async createWallet(dto, queryRunner) {
        const userId = dto.userId;
        const currency = dto.currency || 'USD';
        const walletName = dto.walletName || `${currency} Wallet`;
        const cacheKey = `wallet:${userId}:${currency}`;
        const manager = queryRunner
            ? queryRunner.manager
            : this.walletRepository.manager;
        const existingWallet = await manager.findOne(wallet_entity_1.Wallet, {
            where: { userId, currency, isActive: true },
        });
        if (existingWallet) {
            throw new common_1.BadRequestException(`Wallet for user ${userId} with currency ${currency} already exists`);
        }
        const wallet = manager.create(wallet_entity_1.Wallet, {
            userId,
            currency,
            walletName,
            balance: 0,
            isActive: true,
        });
        const savedWallet = await manager.save(wallet);
        await this.cacheManager.set(cacheKey, savedWallet, 300_000);
        return savedWallet;
    }
    async updateWallet(dto) {
        const currency = dto.currency || 'USD';
        const wallet = await this.walletRepository.findOne({
            where: { userId: dto.userId, currency },
        });
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        if (dto.isActive !== undefined) {
            wallet.isActive = dto.isActive;
        }
        if (dto.currency && dto.currency !== wallet.currency) {
            wallet.currency = dto.currency;
        }
        const updatedWallet = await this.walletRepository.save(wallet);
        const cacheKey = `wallet:${dto.userId}:${wallet.currency}`;
        await this.cacheManager.set(cacheKey, updatedWallet, 300_000);
        return updatedWallet;
    }
    async deposit(depositDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            if (depositDto.reference) {
                const existing = await this.transactionRepository.findOne({
                    where: { idempotencyKey: depositDto.reference },
                });
                if (existing) {
                    this.logger.warn(`Duplicate deposit skipped (idempotencyKey: ${depositDto.reference})`);
                    await queryRunner.rollbackTransaction();
                    return;
                }
            }
            const wallet = await this.getOrCreateWallet(depositDto.userId, depositDto.currency, queryRunner);
            const balanceBefore = Number(wallet.balance);
            const newBalance = balanceBefore + depositDto.amount;
            wallet.version += 1;
            await queryRunner.manager.update(wallet_entity_1.Wallet, wallet.id, {
                balance: newBalance,
                version: wallet.version,
            });
            const transaction = this.transactionRepository.create({
                userId: depositDto.userId,
                walletId: wallet.id,
                type: types_1.TransactionType.DEPOSIT,
                amount: depositDto.amount,
                currency: depositDto.currency,
                status: types_1.TransactionStatus.COMPLETED,
                transactionId: (0, uuid_1.v4)(),
                balanceBefore,
                balanceAfter: newBalance,
                description: depositDto.description || 'Deposit to wallet',
                idempotencyKey: depositDto.reference ?? undefined,
                processedAt: new Date(),
                metadata: { source: 'api' },
            });
            await queryRunner.manager.save(transaction);
            await queryRunner.commitTransaction();
            await this.cacheManager.set(types_1.CACHE_KEYS.walletBalance(wallet.id), newBalance, 300_000);
            this.logger.log(`Deposit completed: ${depositDto.amount} ${depositDto.currency} to user ${depositDto.userId}`);
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error('Deposit failed:', error);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async withdraw(withdrawDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const wallet = await this.getWallet(withdrawDto.userId, withdrawDto.currency, queryRunner);
            if (!wallet) {
                throw new common_1.NotFoundException('Wallet not found');
            }
            if (withdrawDto.reference) {
                const existing = await this.transactionRepository.findOne({
                    where: { idempotencyKey: withdrawDto.reference },
                });
                if (existing) {
                    this.logger.warn(`Duplicate transfer skipped (idempotencyKey: ${withdrawDto.reference})`);
                    await queryRunner.rollbackTransaction();
                    return;
                }
            }
            const balanceBefore = Number(wallet.balance);
            if (balanceBefore < withdrawDto.amount) {
                throw new common_1.BadRequestException('Insufficient balance');
            }
            const newBalance = balanceBefore - withdrawDto.amount;
            await queryRunner.manager.update(wallet_entity_1.Wallet, wallet.id, {
                balance: newBalance,
            });
            const transaction = this.transactionRepository.create({
                userId: withdrawDto.userId,
                walletId: wallet.id,
                type: types_1.TransactionType.WITHDRAW,
                amount: withdrawDto.amount,
                currency: withdrawDto.currency,
                status: types_1.TransactionStatus.COMPLETED,
                transactionId: (0, uuid_1.v4)(),
                balanceBefore,
                balanceAfter: newBalance,
                description: withdrawDto.description || 'Withdrawal from wallet',
                idempotencyKey: withdrawDto.reference ?? undefined,
                processedAt: new Date(),
            });
            await queryRunner.manager.save(transaction);
            await queryRunner.commitTransaction();
            await this.cacheManager.del(types_1.CACHE_KEYS.walletBalance(wallet.id));
            this.logger.log(`Withdrawal completed: ${withdrawDto.amount} ${withdrawDto.currency} from user ${withdrawDto.userId}`);
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error('Withdrawal failed:', error);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async transfer(transferDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const fromWallet = await this.getWalletById(transferDto.fromWalletId, queryRunner);
            const toWallet = await this.getWalletById(transferDto.toWalletId, queryRunner);
            if (!fromWallet || !toWallet) {
                throw new common_1.NotFoundException('One or both wallets not found');
            }
            const fromBalanceBefore = Number(fromWallet.balance);
            const toBalanceBefore = Number(toWallet.balance);
            if (fromBalanceBefore < transferDto.amount) {
                throw new common_1.BadRequestException('Insufficient balance');
            }
            const fromNewBalance = fromBalanceBefore - transferDto.amount;
            const toNewBalance = toBalanceBefore + transferDto.amount;
            if (transferDto.reference) {
                const existing = await this.transactionRepository.findOne({
                    where: { idempotencyKey: transferDto.reference },
                });
                if (existing) {
                    this.logger.warn(`Duplicate transfer skipped (idempotencyKey: ${transferDto.reference})`);
                    await queryRunner.rollbackTransaction();
                    return;
                }
            }
            await queryRunner.manager.update(wallet_entity_1.Wallet, fromWallet.id, {
                balance: fromNewBalance,
            });
            await queryRunner.manager.update(wallet_entity_1.Wallet, toWallet.id, {
                balance: toNewBalance,
            });
            const outTransaction = this.transactionRepository.create({
                userId: fromWallet.userId,
                walletId: fromWallet.id,
                type: types_1.TransactionType.TRANSFER_OUT,
                amount: transferDto.amount,
                currency: transferDto.currency,
                status: types_1.TransactionStatus.COMPLETED,
                transactionId: (0, uuid_1.v4)(),
                idempotencyKey: transferDto.reference ?? undefined,
                relatedUserId: toWallet.userId,
                balanceBefore: fromBalanceBefore,
                balanceAfter: fromNewBalance,
                description: transferDto.description || `Transfer to wallet ${toWallet.id}`,
                processedAt: new Date(),
            });
            const inTransaction = this.transactionRepository.create({
                userId: toWallet.userId,
                walletId: toWallet.id,
                type: types_1.TransactionType.TRANSFER_IN,
                amount: transferDto.amount,
                currency: transferDto.currency,
                status: types_1.TransactionStatus.COMPLETED,
                transactionId: (0, uuid_1.v4)(),
                idempotencyKey: transferDto.reference || (0, uuid_1.v4)(),
                relatedUserId: fromWallet.userId,
                balanceBefore: toBalanceBefore,
                balanceAfter: toNewBalance,
                description: transferDto.description || `Transfer from wallet ${fromWallet.id}`,
                processedAt: new Date(),
            });
            await queryRunner.manager.save([outTransaction, inTransaction]);
            await queryRunner.commitTransaction();
            await Promise.all([
                this.cacheManager.del(types_1.CACHE_KEYS.walletBalance(fromWallet.id)),
                this.cacheManager.del(types_1.CACHE_KEYS.walletBalance(toWallet.id)),
            ]);
            this.logger.log(`Transfer completed: ${transferDto.amount} ${transferDto.currency} from wallet ${fromWallet.id} to ${toWallet.id}`);
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error('Transfer failed:', error);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getBalance(userId, currency = 'USD') {
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
        const cachedBalance = await this.cacheManager.get(types_1.CACHE_KEYS.walletBalance(wallet.id));
        if (cachedBalance !== null && cachedBalance !== undefined) {
            return {
                userId,
                balance: cachedBalance,
                currency,
                lastUpdated: wallet.updatedAt,
            };
        }
        await this.cacheManager.set(types_1.CACHE_KEYS.walletBalance(wallet.id), wallet.balance, 300000);
        return {
            userId,
            balance: Number(wallet.balance),
            currency,
            lastUpdated: wallet.updatedAt,
        };
    }
    async getTransactionHistory(userId, limit = 50) {
        const cacheKey = `transactions:${userId}:limit:${limit}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached)
            return cached;
        const transactions = await this.transactionRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
        await this.cacheManager.set(cacheKey, transactions, 60 * 5 * 1000);
        return transactions;
    }
    async getOrCreateWallet(userId, currency, queryRunner) {
        const cacheKey = `wallet:${userId}:${currency}`;
        const walletName = `${currency} Wallet`;
        const manager = queryRunner
            ? queryRunner.manager
            : this.walletRepository.manager;
        const cachedWallet = await this.cacheManager.get(cacheKey);
        if (cachedWallet)
            return cachedWallet;
        const existingWallet = await manager.findOne(wallet_entity_1.Wallet, {
            where: { userId, currency, isActive: true },
        });
        if (existingWallet)
            return existingWallet;
        const userExists = await manager.findOne(user_entity_1.User, { where: { id: userId } });
        if (!userExists) {
            throw new common_1.BadRequestException(`User with ID ${userId} does not exist`);
        }
        const wallet = manager.create(wallet_entity_1.Wallet, {
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
    async getWalletById(walletId, queryRunner) {
        const manager = queryRunner
            ? queryRunner.manager
            : this.walletRepository.manager;
        return manager.findOne(wallet_entity_1.Wallet, { where: { id: walletId, isActive: true } });
    }
    async getWallet(userId, currency, queryRunner) {
        const cacheKey = `wallet:${userId}:${currency}`;
        const cachedWallet = await this.cacheManager.get(cacheKey);
        if (cachedWallet) {
            return cachedWallet;
        }
        const manager = queryRunner
            ? queryRunner.manager
            : await this.walletRepository.manager;
        const wallet = await manager.findOne(wallet_entity_1.Wallet, {
            where: { userId, currency, isActive: true },
        });
        if (wallet) {
            await this.cacheManager.set(cacheKey, wallet, 300000);
        }
        else {
            this.logger.warn(`Wallet not found for user ${userId} and currency ${currency}`);
        }
        return wallet;
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = WalletService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(wallet_entity_1.Wallet)),
    __param(1, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(2, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository, Object, typeorm_2.DataSource,
        queue_service_1.QueueService])
], WalletService);
//# sourceMappingURL=wallet.service.js.map