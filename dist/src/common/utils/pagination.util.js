"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrismaSkipTake = getPrismaSkipTake;
exports.getPrismaOrderBy = getPrismaOrderBy;
function getPrismaSkipTake(page, limit) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    return {
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
    };
}
function getPrismaOrderBy(sortBy, sortOrder = 'desc', allowedFields = ['createdAt', 'updatedAt']) {
    if (!sortBy || !allowedFields.includes(sortBy)) {
        return { createdAt: 'desc' };
    }
    return { [sortBy]: sortOrder };
}
//# sourceMappingURL=pagination.util.js.map