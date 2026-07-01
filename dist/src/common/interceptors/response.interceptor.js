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
exports.ResponseInterceptor = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const operators_1 = require("rxjs/operators");
const roles_decorator_1 = require("../decorators/roles.decorator");
const crypto_1 = require("crypto");
let ResponseInterceptor = class ResponseInterceptor {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    intercept(context, next) {
        const cacheMaxAge = this.reflector.getAllAndOverride(roles_decorator_1.CACHEABLE_KEY, [context.getHandler(), context.getClass()]);
        return next.handle().pipe((0, operators_1.map)((result) => {
            const response = context.switchToHttp().getResponse();
            if (cacheMaxAge) {
                response.setHeader('Cache-Control', `public, max-age=${cacheMaxAge}`);
                const etag = (0, crypto_1.createHash)('md5')
                    .update(JSON.stringify(result))
                    .digest('hex');
                response.setHeader('ETag', `"${etag}"`);
            }
            if (result &&
                typeof result === 'object' &&
                'items' in result &&
                'total' in result) {
                const paginated = result;
                return {
                    success: true,
                    data: paginated.items,
                    meta: {
                        total: paginated.total,
                        page: paginated.page,
                        limit: paginated.limit,
                        totalPages: paginated.totalPages,
                    },
                };
            }
            return { success: true, data: result };
        }));
    }
};
exports.ResponseInterceptor = ResponseInterceptor;
exports.ResponseInterceptor = ResponseInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], ResponseInterceptor);
//# sourceMappingURL=response.interceptor.js.map