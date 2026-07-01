"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SponsoredPostsModule = void 0;
const common_1 = require("@nestjs/common");
const sponsored_posts_service_1 = require("./sponsored-posts.service");
const sponsored_posts_controller_1 = require("./sponsored-posts.controller");
let SponsoredPostsModule = class SponsoredPostsModule {
};
exports.SponsoredPostsModule = SponsoredPostsModule;
exports.SponsoredPostsModule = SponsoredPostsModule = __decorate([
    (0, common_1.Module)({
        controllers: [sponsored_posts_controller_1.SponsoredPostsController],
        providers: [sponsored_posts_service_1.SponsoredPostsService],
        exports: [sponsored_posts_service_1.SponsoredPostsService],
    })
], SponsoredPostsModule);
//# sourceMappingURL=sponsored-posts.module.js.map