"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeContent = sanitizeContent;
exports.calculateReadingTime = calculateReadingTime;
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const SANITIZE_OPTIONS = {
    allowedTags: sanitize_html_1.default.defaults.allowedTags.concat([
        'img',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'figure',
        'figcaption',
        'iframe',
    ]),
    allowedAttributes: {
        ...sanitize_html_1.default.defaults.allowedAttributes,
        img: ['src', 'alt', 'title', 'width', 'height'],
        a: ['href', 'name', 'target', 'rel'],
        iframe: ['src', 'width', 'height', 'frameborder', 'allowfullscreen'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
};
function sanitizeContent(content) {
    return (0, sanitize_html_1.default)(content, SANITIZE_OPTIONS);
}
function calculateReadingTime(content) {
    const text = content.replace(/<[^>]*>/g, ' ');
    const words = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
}
//# sourceMappingURL=sanitize.util.js.map