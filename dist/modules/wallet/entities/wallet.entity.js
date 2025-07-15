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
exports.Wallet = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../user/entities/user.entity");
const transaction_entity_1 = require("../../transaction/entities/transaction.entity");
let Wallet = class Wallet {
};
exports.Wallet = Wallet;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Wallet.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Wallet.prototype, "walletName", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ unique: true, type: 'uuid' }),
    __metadata("design:type", String)
], Wallet.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Wallet.prototype, "balance", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'USD' }),
    __metadata("design:type", String)
], Wallet.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], Wallet.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Wallet.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Wallet.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.wallets),
    (0, typeorm_1.Index)(),
    __metadata("design:type", user_entity_1.User)
], Wallet.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => transaction_entity_1.Transaction, (transaction) => transaction.wallet),
    __metadata("design:type", Array)
], Wallet.prototype, "transactions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', default: 0 }),
    __metadata("design:type", Number)
], Wallet.prototype, "version", void 0);
exports.Wallet = Wallet = __decorate([
    (0, typeorm_1.Entity)('wallets')
], Wallet);
//# sourceMappingURL=wallet.entity.js.map