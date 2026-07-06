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
exports.SeoController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const seo_service_1 = require("./seo.service");
const seo_dto_1 = require("./dto/seo.dto");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const client_1 = require("@prisma/client");
let SeoController = class SeoController {
    seoService;
    constructor(seoService) {
        this.seoService = seoService;
    }
    findAll(query) {
        return this.seoService.findAll(query);
    }
    findBySlug(slug) {
        return this.seoService.findBySlug(slug);
    }
    getSitemapData() {
        return this.seoService.getSitemapData();
    }
    create(dto) {
        return this.seoService.create(dto);
    }
    bulkGenerate(dto) {
        return this.seoService.bulkGenerate(dto);
    }
    update(id, dto) {
        return this.seoService.update(id, dto);
    }
};
exports.SeoController = SeoController;
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, common_1.Get)('pages'),
    (0, roles_decorator_1.Cacheable)(600),
    (0, swagger_1.ApiOperation)({ summary: 'List SEO pages' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [seo_dto_1.SeoPageQueryDto]),
    __metadata("design:returntype", void 0)
], SeoController.prototype, "findAll", null);
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, common_1.Get)('pages/:slug'),
    (0, roles_decorator_1.Cacheable)(600),
    (0, swagger_1.ApiOperation)({ summary: 'Get SEO page by slug' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SeoController.prototype, "findBySlug", null);
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, common_1.Get)('sitemap-data'),
    (0, roles_decorator_1.Cacheable)(3600),
    (0, swagger_1.ApiOperation)({ summary: 'Get sitemap data for published content' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SeoController.prototype, "getSitemapData", null);
__decorate([
    (0, common_1.Post)('pages'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create SEO page' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [seo_dto_1.CreateSeoPageDto]),
    __metadata("design:returntype", void 0)
], SeoController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('pages/bulk-generate'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk generate programmatic SEO pages' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [seo_dto_1.BulkGenerateSeoDto]),
    __metadata("design:returntype", void 0)
], SeoController.prototype, "bulkGenerate", null);
__decorate([
    (0, common_1.Patch)('pages/:id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update SEO page meta' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, seo_dto_1.UpdateSeoMetaDto]),
    __metadata("design:returntype", void 0)
], SeoController.prototype, "update", null);
exports.SeoController = SeoController = __decorate([
    (0, swagger_1.ApiTags)('SEO'),
    (0, common_1.Controller)('seo'),
    __metadata("design:paramtypes", [seo_service_1.SeoService])
], SeoController);
//# sourceMappingURL=seo.controller.js.map