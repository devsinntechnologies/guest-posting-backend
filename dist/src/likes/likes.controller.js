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
exports.LikesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const likes_service_1 = require("./likes.service");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const optional_jwt_auth_guard_1 = require("../common/guards/optional-jwt-auth.guard");
let LikesController = class LikesController {
    likesService;
    constructor(likesService) {
        this.likesService = likesService;
    }
    toggleLike(contentId, user) {
        return this.likesService.toggleLike(contentId, user.sub);
    }
    getLikes(contentId, user) {
        return this.likesService.getLikesInfo(contentId, user?.sub);
    }
};
exports.LikesController = LikesController;
__decorate([
    (0, common_1.Post)('content/:contentId/like'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'USER — Toggle like on content' }),
    (0, swagger_1.ApiParam)({ name: 'contentId', description: 'Content UUID' }),
    __param(0, (0, common_1.Param)('contentId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LikesController.prototype, "toggleLike", null);
__decorate([
    (0, common_1.Get)('content/:contentId/likes'),
    (0, roles_decorator_1.Public)(),
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Public — Get like count and toggle status' }),
    (0, swagger_1.ApiParam)({ name: 'contentId', description: 'Content UUID' }),
    __param(0, (0, common_1.Param)('contentId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LikesController.prototype, "getLikes", null);
exports.LikesController = LikesController = __decorate([
    (0, swagger_1.ApiTags)('Likes'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [likes_service_1.LikesService])
], LikesController);
//# sourceMappingURL=likes.controller.js.map