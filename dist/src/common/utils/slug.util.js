"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSlug = generateSlug;
exports.ensureUniqueSlug = ensureUniqueSlug;
const slugify_1 = __importDefault(require("slugify"));
function generateSlug(text) {
    return (0, slugify_1.default)(text, { lower: true, strict: true, trim: true });
}
async function ensureUniqueSlug(baseSlug, existsFn, excludeSlug) {
    let slug = baseSlug;
    let counter = 1;
    while (true) {
        if (excludeSlug && slug === excludeSlug)
            return slug;
        const exists = await existsFn(slug);
        if (!exists)
            return slug;
        counter += 1;
        slug = `${baseSlug}-${counter}`;
    }
}
//# sourceMappingURL=slug.util.js.map