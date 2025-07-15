"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var TransactionLoggingInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionLoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let TransactionLoggingInterceptor = TransactionLoggingInterceptor_1 = class TransactionLoggingInterceptor {
    constructor() {
        this.logger = new common_1.Logger(TransactionLoggingInterceptor_1.name);
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { method, url, body } = request;
        this.logger.log(`Transaction request: ${method} ${url}`, { body });
        return next.handle().pipe((0, operators_1.tap)(() => {
            this.logger.log(`Transaction completed: ${method} ${url}`);
        }), (0, operators_1.catchError)((error) => {
            this.logger.error(`Transaction failed: ${method} ${url}`, error.stack);
            throw error;
        }));
    }
};
exports.TransactionLoggingInterceptor = TransactionLoggingInterceptor;
exports.TransactionLoggingInterceptor = TransactionLoggingInterceptor = TransactionLoggingInterceptor_1 = __decorate([
    (0, common_1.Injectable)()
], TransactionLoggingInterceptor);
//# sourceMappingURL=transaction-logging.interceptor.js.map