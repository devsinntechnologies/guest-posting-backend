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
exports.UpdateLinkInsertionStatusDto = exports.CreateLinkInsertionDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class CreateLinkInsertionDto {
    targetArticleId;
    anchorText;
    destinationUrl;
    price;
}
exports.CreateLinkInsertionDto = CreateLinkInsertionDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateLinkInsertionDto.prototype, "targetArticleId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLinkInsertionDto.prototype, "anchorText", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateLinkInsertionDto.prototype, "destinationUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLinkInsertionDto.prototype, "price", void 0);
class UpdateLinkInsertionStatusDto {
    status;
    paymentId;
}
exports.UpdateLinkInsertionStatusDto = UpdateLinkInsertionStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.LinkInsertionStatus }),
    (0, class_validator_1.IsEnum)(client_1.LinkInsertionStatus),
    __metadata("design:type", String)
], UpdateLinkInsertionStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateLinkInsertionStatusDto.prototype, "paymentId", void 0);
//# sourceMappingURL=link-insertions.dto.js.map