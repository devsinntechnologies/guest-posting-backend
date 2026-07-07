"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaginatedResult = createPaginatedResult;
function createPaginatedResult(items, total, page, limit) {
    return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}
//# sourceMappingURL=paginated-result.dto.js.map