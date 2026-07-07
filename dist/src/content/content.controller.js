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
exports.ContentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const content_service_1 = require("./content.service");
const content_dto_1 = require("./dto/content.dto");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const subscription_guard_1 = require("../common/guards/subscription.guard");
let ContentController = class ContentController {
    contentService;
    constructor(contentService) {
        this.contentService = contentService;
    }
    findPublished(query) {
        return this.contentService.findPublished(query);
    }
    findBySlug(slug) {
        return this.contentService.findBySlug(slug);
    }
    create(user, dto) {
        return this.contentService.create(user.sub, dto);
    }
    findMy(user, query) {
        return this.contentService.findMyContent(user.sub, query);
    }
    update(id, user, dto) {
        return this.contentService.update(id, user.sub, dto);
    }
    submit(id, user, dto) {
        return this.contentService.submit(id, user.sub, dto);
    }
    resubmit(id, user, dto) {
        return this.contentService.resubmit(id, user.sub, dto);
    }
    delete(id, user) {
        return this.contentService.delete(id, user.sub);
    }
    findAllAdmin(query) {
        return this.contentService.findAllAdmin(query);
    }
    getReviewHistory(id) {
        return this.contentService.getReviewHistory(id);
    }
    adminDelete(id) {
        return this.contentService.adminDelete(id);
    }
    findById(id) {
        return this.contentService.findById(id);
    }
};
exports.ContentController = ContentController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Public — List published content' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [content_dto_1.ContentQueryDto]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "findPublished", null);
__decorate([
    (0, common_1.Get)('slug/:slug'),
    (0, roles_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Public — Get published content by slug' }),
    (0, swagger_1.ApiParam)({ name: 'slug', description: 'Content slug' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "findBySlug", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(subscription_guard_1.SubscriptionGuard),
    (0, swagger_1.ApiOperation)({ summary: 'USER — Create new content draft (requires subscription)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, content_dto_1.CreateContentDto]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'USER — List own content across all statuses' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, content_dto_1.ContentQueryDto]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "findMy", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'USER — Update own draft content' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Content UUID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, content_dto_1.UpdateContentDto]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'USER — Submit draft for admin review' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Content UUID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, content_dto_1.SubmitContentDto]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)(':id/resubmit'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'USER — Resubmit content after changes requested' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Content UUID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, content_dto_1.SubmitContentDto]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "resubmit", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'USER — Delete own draft content' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Content UUID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)('admin/all'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'ADMIN — List all content with filters' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [content_dto_1.AdminContentQueryDto]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "findAllAdmin", null);
__decorate([
    (0, common_1.Get)(':id/review-history'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'ADMIN — Get review history for a content item' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Content UUID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "getReviewHistory", null);
__decorate([
    (0, common_1.Delete)('admin/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'ADMIN — Remove content (soft delete)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Content UUID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "adminDelete", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get content by ID (owner or ADMIN)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Content UUID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "findById", null);
exports.ContentController = ContentController = __decorate([
    (0, swagger_1.ApiTags)('Content'),
    (0, common_1.Controller)('content'),
    __metadata("design:paramtypes", [content_service_1.ContentService])
], ContentController);
//# sourceMappingURL=content.controller.js.map