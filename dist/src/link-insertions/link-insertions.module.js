"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkInsertionsModule = void 0;
const common_1 = require("@nestjs/common");
const link_insertions_service_1 = require("./link-insertions.service");
const link_insertions_controller_1 = require("./link-insertions.controller");
let LinkInsertionsModule = class LinkInsertionsModule {
};
exports.LinkInsertionsModule = LinkInsertionsModule;
exports.LinkInsertionsModule = LinkInsertionsModule = __decorate([
    (0, common_1.Module)({
        controllers: [link_insertions_controller_1.LinkInsertionsController],
        providers: [link_insertions_service_1.LinkInsertionsService],
        exports: [link_insertions_service_1.LinkInsertionsService],
    })
], LinkInsertionsModule);
//# sourceMappingURL=link-insertions.module.js.map