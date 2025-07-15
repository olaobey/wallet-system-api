"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CACHE_KEYS = exports.TransactionStatus = exports.TransactionType = void 0;
var TransactionType;
(function (TransactionType) {
    TransactionType["DEPOSIT"] = "deposit";
    TransactionType["WITHDRAW"] = "withdrawal";
    TransactionType["TRANSFER_OUT"] = "transfer_out";
    TransactionType["TRANSFER_IN"] = "transfer_in";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "pending";
    TransactionStatus["COMPLETED"] = "completed";
    TransactionStatus["FAILED"] = "failed";
    TransactionStatus["CANCELLED"] = "cancelled";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
exports.CACHE_KEYS = {
    walletBalance: (walletId) => `wallet:balance:${walletId}`,
    transactionHistory: (walletId, page, limit) => `wallet:transactions:${walletId}:${page}:${limit}`,
};
//# sourceMappingURL=index.js.map