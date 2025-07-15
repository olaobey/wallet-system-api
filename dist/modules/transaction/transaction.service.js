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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cache_manager_1 = require("@nestjs/cache-manager");
const transaction_entity_1 = require("./entities/transaction.entity");
const types_1 = require("../../common/types");
let TransactionService = class TransactionService {
    constructor(transactionRepository, cacheManager) {
        this.transactionRepository = transactionRepository;
        this.cacheManager = cacheManager;
    }
    async getTransactionHistory(walletId, queryDto) {
        const { page = 1, limit = 10 } = queryDto;
        const skip = (page - 1) * limit;
        const cacheKey = types_1.CACHE_KEYS.transactionHistory(walletId, page, limit);
        const cachedResult = await this.cacheManager.get(cacheKey);
        if (cachedResult) {
            return cachedResult;
        }
        const [transactions, total] = await this.transactionRepository.findAndCount({
            where: { walletId },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        const mapped = transactions.map((t) => ({
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
            updatedAt: t.updatedAt,
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
    async getTransactionById(transactionId) {
        const cacheKey = `transaction:${transactionId}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached)
            return cached;
        const t = await this.transactionRepository.findOne({
            where: { transactionId },
        });
        if (!t)
            return null;
        const result = {
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
        await this.cacheManager.set(cacheKey, result, 300_000);
        return result;
    }
};
exports.TransactionService = TransactionService;
exports.TransactionService = TransactionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_2.Repository, Object])
], TransactionService);
//# sourceMappingURL=transaction.service.js.map