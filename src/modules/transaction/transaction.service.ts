import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Transaction } from './entities/transaction.entity';
import { TransactionHistoryDto } from './dto/transaction-history.dto';
import { ITransaction } from './interfaces/transaction.interface';
import { CACHE_KEYS } from '../../common/types';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async getTransactionHistory(
    walletId: string,
    queryDto: TransactionHistoryDto,
  ): Promise<{
    transactions: ITransaction[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10 } = queryDto;
    const skip = (page - 1) * limit;

    const cacheKey = CACHE_KEYS.transactionHistory(walletId, page, limit);
    const cachedResult = await this.cacheManager.get<{
      transactions: ITransaction[];
      total: number;
      page: number;
      limit: number;
    }>(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    const [transactions, total] = await this.transactionRepository.findAndCount(
      {
        where: { walletId },
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      },
    );

    // Map Transaction entity to ITransaction
    const mapped: ITransaction[] = transactions.map((t) => ({
      id: t.id,
      walletId: t.walletId,
      userId: t.userId ?? '',
      type: t.type,
      amount: Number(t.amount),
      currency: t.currency,
      transactionId: t.transactionId,
      status: t.status,
      processedAt: t.processedAt,
      balanceBefore: Number(t.balanceBefore),
      balanceAfter: Number(t.balanceAfter),
      description: t.description,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt, // assuming this exists on your entity
    }));

    const result = {
      transactions: mapped,
      total,
      page,
      limit,
    };

    await this.cacheManager.set(cacheKey, result, 120_000);
    return result;
  }

  async getTransactionById(
    transactionId: string,
  ): Promise<ITransaction | null> {
    const cacheKey = `transaction:${transactionId}`;
    const cached = await this.cacheManager.get<ITransaction>(cacheKey);

    if (cached) return cached;

    const t = await this.transactionRepository.findOne({
      where: { transactionId },
    });

    if (!t) return null;

    const result: ITransaction = {
      id: t.id,
      walletId: t.walletId,
      userId: t.userId,
      type: t.type,
      amount: Number(t.amount),
      currency: t.currency,
      transactionId: t.transactionId,
      status: t.status,
      processedAt: t.processedAt,
      balanceBefore: Number(t.balanceBefore),
      balanceAfter: Number(t.balanceAfter),
      description: t.description,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    };

    await this.cacheManager.set(cacheKey, result, 300_000); // cache for 5 mins
    return result;
  }
}
