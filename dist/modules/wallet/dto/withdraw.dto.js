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
exports.WithdrawDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class WithdrawDto {
}
exports.WithdrawDto = WithdrawDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'wallet-123' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WithdrawDto.prototype, "walletId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '23617uidxxxx' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WithdrawDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'USD', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['USD', 'CAD', 'NGN'], {
        message: 'Currency must be one of: USD, CAD, NGN',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WithdrawDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50.25 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], WithdrawDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ATM withdrawal', required: false }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WithdrawDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction reference', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], WithdrawDto.prototype, "reference", void 0);
//# sourceMappingURL=withdraw.dto.js.map