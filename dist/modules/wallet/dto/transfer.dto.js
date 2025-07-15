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
exports.TransferDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class TransferDto {
}
exports.TransferDto = TransferDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'wallet-123' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransferDto.prototype, "fromWalletId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'wallet-456' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransferDto.prototype, "toWalletId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '23617uidxxxx' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransferDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 75.0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], TransferDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'USD', required: false }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransferDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Payment for services', required: false }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransferDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction reference', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TransferDto.prototype, "reference", void 0);
//# sourceMappingURL=transfer.dto.js.map