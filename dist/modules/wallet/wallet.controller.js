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
exports.WalletController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const wallet_service_1 = require("./wallet.service");
const deposit_dto_1 = require("./dto/deposit.dto");
const withdraw_dto_1 = require("./dto/withdraw.dto");
const transfer_dto_1 = require("./dto/transfer.dto");
const balance_dto_1 = require("./dto/balance.dto");
const create_wallet_dto_1 = require("./dto/create-wallet.dto");
const update_wallet_dto_1 = require("./dto/update-wallet.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const currency_validation_pipe_1 = require("../../common/pipes/currency-validation.pipe");
const transaction_logging_interceptor_1 = require("../../common/interceptors/transaction-logging.interceptor");
const wallet_exception_filter_1 = require("../../common/filters/wallet-exception.filter");
let WalletController = class WalletController {
    constructor(walletService) {
        this.walletService = walletService;
    }
    async deposit(depositDto) {
        await this.walletService.queueDeposit(depositDto);
        return { message: 'Deposit request accepted for processing' };
    }
    async create(createWalletDto) {
        const wallet = await this.walletService.createWallet(createWalletDto);
        return { message: 'Wallet created successfully', wallet };
    }
    async update(updateWalletDto) {
        const updatedWallet = await this.walletService.updateWallet(updateWalletDto);
        return { message: 'Wallet updated successfully', updatedWallet };
    }
    async withdraw(withdrawDto, currency) {
        withdrawDto.currency = currency;
        await this.walletService.queueWithdraw(withdrawDto);
        return { message: 'Withdrawal request accepted for processing' };
    }
    async transfer(req, transferDto) {
        const user = req.user;
        const userId = user.sub;
        const currencyPipe = new currency_validation_pipe_1.CurrencyValidationPipe();
        transferDto.currency = currencyPipe.transform(transferDto.currency);
        await this.walletService.queueTransfer(transferDto, userId);
        return { message: 'Transfer request accepted for processing' };
    }
    async getBalance(userId) {
        return await this.walletService.getBalance(userId);
    }
    async getTransactions(userId) {
        return await this.walletService.getTransactionHistory(userId);
    }
    async getWallet(walletId) {
        return await this.walletService.getWalletById(walletId);
    }
};
exports.WalletController = WalletController;
__decorate([
    (0, common_1.Post)('deposit'),
    (0, common_1.UseFilters)(wallet_exception_filter_1.WalletExceptionFilter),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    (0, common_1.UseInterceptors)(transaction_logging_interceptor_1.TransactionLoggingInterceptor),
    (0, swagger_1.ApiOperation)({ summary: 'Deposit funds to wallet' }),
    (0, swagger_1.ApiResponse)({
        status: 202,
        description: 'Deposit request accepted for processing',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [deposit_dto_1.DepositDto]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "deposit", null);
__decorate([
    (0, common_1.Post)('create'),
    (0, common_1.UseFilters)(wallet_exception_filter_1.WalletExceptionFilter),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseInterceptors)(transaction_logging_interceptor_1.TransactionLoggingInterceptor),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new wallet' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Wallet created successfully',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_wallet_dto_1.CreateWalletDto]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('update'),
    (0, common_1.UseFilters)(wallet_exception_filter_1.WalletExceptionFilter),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)(transaction_logging_interceptor_1.TransactionLoggingInterceptor),
    (0, swagger_1.ApiOperation)({ summary: 'Update wallet details' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Wallet updated successfully',
    }),
    __param(0, (0, common_1.Body)(new currency_validation_pipe_1.CurrencyValidationPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_wallet_dto_1.UpdateWalletDto]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('withdraw'),
    (0, common_1.UseFilters)(wallet_exception_filter_1.WalletExceptionFilter),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    (0, common_1.UseInterceptors)(transaction_logging_interceptor_1.TransactionLoggingInterceptor),
    (0, swagger_1.ApiOperation)({ summary: 'Withdraw funds from wallet' }),
    (0, swagger_1.ApiResponse)({
        status: 202,
        description: 'Withdrawal request accepted for processing',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Body)('currency', new currency_validation_pipe_1.CurrencyValidationPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [withdraw_dto_1.WithdrawDto, String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "withdraw", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('transfer'),
    (0, common_1.UseFilters)(wallet_exception_filter_1.WalletExceptionFilter),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    (0, common_1.UseInterceptors)(transaction_logging_interceptor_1.TransactionLoggingInterceptor),
    (0, swagger_1.ApiOperation)({ summary: 'Transfer funds between wallets' }),
    (0, swagger_1.ApiResponse)({
        status: 202,
        description: 'Transfer request accepted for processing',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, transfer_dto_1.TransferDto]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "transfer", null);
__decorate([
    (0, common_1.Get)('balance/:userId'),
    (0, common_1.UseFilters)(wallet_exception_filter_1.WalletExceptionFilter),
    (0, common_1.UseInterceptors)(transaction_logging_interceptor_1.TransactionLoggingInterceptor),
    (0, swagger_1.ApiOperation)({ summary: 'Get wallet balance' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Wallet balance retrieved',
        type: balance_dto_1.BalanceDto,
    }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Get)('transactions/:userId'),
    (0, common_1.UseFilters)(wallet_exception_filter_1.WalletExceptionFilter),
    (0, common_1.UseInterceptors)(transaction_logging_interceptor_1.TransactionLoggingInterceptor),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction history' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transaction history retrieved' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Get)(':walletId'),
    (0, common_1.UseFilters)(wallet_exception_filter_1.WalletExceptionFilter),
    (0, common_1.UseInterceptors)(transaction_logging_interceptor_1.TransactionLoggingInterceptor),
    (0, swagger_1.ApiOperation)({ summary: 'Get wallet details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Wallet details retrieved' }),
    __param(0, (0, common_1.Param)('walletId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getWallet", null);
exports.WalletController = WalletController = __decorate([
    (0, swagger_1.ApiTags)('Wallet'),
    (0, common_1.Controller)('wallet'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [wallet_service_1.WalletService])
], WalletController);
//# sourceMappingURL=wallet.controller.js.map