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
exports.TransactionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const transaction_service_1 = require("./transaction.service");
const transaction_history_dto_1 = require("./dto/transaction-history.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const transaction_logging_interceptor_1 = require("../../common/interceptors/transaction-logging.interceptor");
let TransactionController = class TransactionController {
    constructor(transactionService) {
        this.transactionService = transactionService;
    }
    async getTransactionHistory(walletId, queryDto) {
        return this.transactionService.getTransactionHistory(walletId, queryDto);
    }
    async getTransaction(transactionId) {
        return this.transactionService.getTransactionById(transactionId);
    }
};
exports.TransactionController = TransactionController;
__decorate([
    (0, common_1.Get)('wallet/:walletId'),
    (0, common_1.UseInterceptors)(transaction_logging_interceptor_1.TransactionLoggingInterceptor),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction history for wallet' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transaction history retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('walletId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, transaction_history_dto_1.TransactionHistoryDto]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "getTransactionHistory", null);
__decorate([
    (0, common_1.Get)(':transactionId'),
    (0, common_1.UseInterceptors)(transaction_logging_interceptor_1.TransactionLoggingInterceptor),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transaction retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transaction not found' }),
    __param(0, (0, common_1.Param)('transactionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "getTransaction", null);
exports.TransactionController = TransactionController = __decorate([
    (0, swagger_1.ApiTags)('Transactions'),
    (0, common_1.Controller)('transactions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, throttler_1.ThrottlerGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [transaction_service_1.TransactionService])
], TransactionController);
//# sourceMappingURL=transaction.controller.js.map