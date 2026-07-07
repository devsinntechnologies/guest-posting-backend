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
exports.ReviewController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const review_service_1 = require("./review.service");
const review_dto_1 = require("./dto/review.dto");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
let ReviewController = class ReviewController {
    reviewService;
    constructor(reviewService) {
        this.reviewService = reviewService;
    }
    getQueue(query) {
        return this.reviewService.getQueue(query);
    }
    approve(contentId, user, dto) {
        return this.reviewService.approve(contentId, user.sub, dto);
    }
    publish(contentId, user, dto) {
        return this.reviewService.publish(contentId, user.sub, dto);
    }
    reject(contentId, user, dto) {
        return this.reviewService.reject(contentId, user.sub, dto);
    }
    requestChanges(contentId, user, dto) {
        return this.reviewService.requestChanges(contentId, user.sub, dto);
    }
    unpublish(contentId, user, dto) {
        return this.reviewService.unpublish(contentId, user.sub, dto);
    }
};
exports.ReviewController = ReviewController;
__decorate([
    (0, common_1.Get)('queue'),
    (0, swagger_1.ApiOperation)({ summary: 'ADMIN — Get review queue (pending review content)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [review_dto_1.ReviewQueueQueryDto]),
    __metadata("design:returntype", void 0)
], ReviewController.prototype, "getQueue", null);
__decorate([
    (0, common_1.Post)(':contentId/approve'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'ADMIN — Approve pending content draft' }),
    (0, swagger_1.ApiParam)({ name: 'contentId', description: 'Content UUID' }),
    __param(0, (0, common_1.Param)('contentId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, review_dto_1.ReviewActionDto]),
    __metadata("design:returntype", void 0)
], ReviewController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':contentId/publish'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'ADMIN — Publish content (make live)' }),
    (0, swagger_1.ApiParam)({ name: 'contentId', description: 'Content UUID' }),
    __param(0, (0, common_1.Param)('contentId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, review_dto_1.ReviewActionDto]),
    __metadata("design:returntype", void 0)
], ReviewController.prototype, "publish", null);
__decorate([
    (0, common_1.Post)(':contentId/reject'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'ADMIN — Reject pending content draft' }),
    (0, swagger_1.ApiParam)({ name: 'contentId', description: 'Content UUID' }),
    __param(0, (0, common_1.Param)('contentId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, review_dto_1.ReviewActionDto]),
    __metadata("design:returntype", void 0)
], ReviewController.prototype, "reject", null);
__decorate([
    (0, common_1.Post)(':contentId/request-changes'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'ADMIN — Request revisions on content draft' }),
    (0, swagger_1.ApiParam)({ name: 'contentId', description: 'Content UUID' }),
    __param(0, (0, common_1.Param)('contentId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, review_dto_1.ReviewActionDto]),
    __metadata("design:returntype", void 0)
], ReviewController.prototype, "requestChanges", null);
__decorate([
    (0, common_1.Post)(':contentId/unpublish'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'ADMIN — Unpublish content' }),
    (0, swagger_1.ApiParam)({ name: 'contentId', description: 'Content UUID' }),
    __param(0, (0, common_1.Param)('contentId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, review_dto_1.ReviewActionDto]),
    __metadata("design:returntype", void 0)
], ReviewController.prototype, "unpublish", null);
exports.ReviewController = ReviewController = __decorate([
    (0, swagger_1.ApiTags)('Review Workflow'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Controller)('review'),
    __metadata("design:paramtypes", [review_service_1.ReviewService])
], ReviewController);
//# sourceMappingURL=review.controller.js.map