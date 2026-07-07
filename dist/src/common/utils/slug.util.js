"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSlug = generateSlug;
exports.generateUniqueSlug = generateUniqueSlug;
const slugify_1 = __importDefault(require("slugify"));
function generateSlug(text) {
    return (0, slugify_1.default)(text, {
        lower: true,
        strict: true,
        trim: true,
    });
}
function generateUniqueSlug(text) {
    const base = generateSlug(text);
    const suffix = Math.random().toString(36).substring(2, 8);
    return `${base}-${suffix}`;
}
//# sourceMappingURL=slug.util.js.map