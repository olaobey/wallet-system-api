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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const typeorm_1 = require("typeorm");
const wallet_entity_1 = require("../../wallet/entities/wallet.entity");
const types_1 = require("../../../common/types");
let Transaction = class Transaction {
};
exports.Transaction = Transaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Transaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'user_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Transaction.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Transaction.prototype, "transactionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: types_1.TransactionType }),
    __metadata("design:type", String)
], Transaction.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Transaction.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: types_1.TransactionStatus,
        default: types_1.TransactionStatus.PENDING,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'related_user_id', nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "relatedUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'balance_before', type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Transaction.prototype, "balanceBefore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'balance_after', type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Transaction.prototype, "balanceAfter", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'USD' }),
    __metadata("design:type", String)
], Transaction.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Transaction.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], Transaction.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], Transaction.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'processed_at', nullable: true }),
    __metadata("design:type", Date)
], Transaction.prototype, "processedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'wallet_id', type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Transaction.prototype, "walletId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => wallet_entity_1.Wallet, (wallet) => wallet.transactions),
    __metadata("design:type", wallet_entity_1.Wallet)
], Transaction.prototype, "wallet", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "fromWalletId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "toWalletId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ unique: true, nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "idempotencyKey", void 0);
exports.Transaction = Transaction = __decorate([
    (0, typeorm_1.Entity)('transactions')
], Transaction);
//# sourceMappingURL=transaction.entity.js.map