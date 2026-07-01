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
exports.UpdateSeoMetaDto = exports.SeoPageQueryDto = exports.BulkGenerateSeoDto = exports.CreateSeoPageDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
class CreateSeoPageDto {
    pageType;
    referenceId;
    slug;
    metaTitle;
    metaDescription;
    h1Heading;
    customContent;
}
exports.CreateSeoPageDto = CreateSeoPageDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.SeoPageType }),
    (0, class_validator_1.IsEnum)(client_1.SeoPageType),
    __metadata("design:type", String)
], CreateSeoPageDto.prototype, "pageType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateSeoPageDto.prototype, "referenceId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSeoPageDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSeoPageDto.prototype, "metaTitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSeoPageDto.prototype, "metaDescription", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSeoPageDto.prototype, "h1Heading", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSeoPageDto.prototype, "customContent", void 0);
class BulkGenerateSeoDto {
    pageTypes;
}
exports.BulkGenerateSeoDto = BulkGenerateSeoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.SeoPageType, isArray: true }),
    (0, class_validator_1.IsEnum)(client_1.SeoPageType, { each: true }),
    __metadata("design:type", Array)
], BulkGenerateSeoDto.prototype, "pageTypes", void 0);
class SeoPageQueryDto extends pagination_dto_1.PaginationDto {
    pageType;
}
exports.SeoPageQueryDto = SeoPageQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.SeoPageType }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.SeoPageType),
    __metadata("design:type", String)
], SeoPageQueryDto.prototype, "pageType", void 0);
class UpdateSeoMetaDto {
    metaTitle;
    metaDescription;
    h1Heading;
    customContent;
}
exports.UpdateSeoMetaDto = UpdateSeoMetaDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSeoMetaDto.prototype, "metaTitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSeoMetaDto.prototype, "metaDescription", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSeoMetaDto.prototype, "h1Heading", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSeoMetaDto.prototype, "customContent", void 0);
//# sourceMappingURL=seo.dto.js.map