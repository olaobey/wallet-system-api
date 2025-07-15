"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitMiddleware = void 0;
const common_1 = require("@nestjs/common");
class TooManyRequestsException extends common_1.BadRequestException {
    constructor() {
        super('Too many requests. Please try again later.');
    }
}
let RateLimitMiddleware = class RateLimitMiddleware {
    constructor() {
        this.requests = new Map();
        this.limit = 100;
        this.windowMs = 60 * 1000;
    }
    use(req, res, next) {
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const now = Date.now();
        let timestamps = this.requests.get(ip) || [];
        timestamps = timestamps.filter((time) => now - time < this.windowMs);
        if (timestamps.length >= this.limit) {
            throw new TooManyRequestsException();
        }
        timestamps.push(now);
        this.requests.set(ip, timestamps);
        next();
    }
};
exports.RateLimitMiddleware = RateLimitMiddleware;
exports.RateLimitMiddleware = RateLimitMiddleware = __decorate([
    (0, common_1.Injectable)()
], RateLimitMiddleware);
//# sourceMappingURL=rate-limit.middleware.js.map