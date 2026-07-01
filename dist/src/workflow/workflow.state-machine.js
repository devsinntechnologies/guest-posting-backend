"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertValidTransition = assertValidTransition;
exports.getAllowedTransitions = getAllowedTransitions;
const client_1 = require("@prisma/client");
const common_1 = require("@nestjs/common");
const VALID_TRANSITIONS = {
    [client_1.ArticleStatus.DRAFT]: [client_1.ArticleStatus.PENDING_REVIEW],
    [client_1.ArticleStatus.PENDING_REVIEW]: [
        client_1.ArticleStatus.APPROVED,
        client_1.ArticleStatus.REJECTED,
    ],
    [client_1.ArticleStatus.APPROVED]: [client_1.ArticleStatus.PUBLISHED],
    [client_1.ArticleStatus.REJECTED]: [client_1.ArticleStatus.PENDING_REVIEW],
    [client_1.ArticleStatus.PUBLISHED]: [client_1.ArticleStatus.ARCHIVED],
    [client_1.ArticleStatus.ARCHIVED]: [],
};
function assertValidTransition(from, to) {
    const allowed = VALID_TRANSITIONS[from] || [];
    if (!allowed.includes(to)) {
        throw new common_1.UnprocessableEntityException(`Invalid status transition from ${from} to ${to}`);
    }
}
function getAllowedTransitions(status) {
    return VALID_TRANSITIONS[status] || [];
}
//# sourceMappingURL=workflow.state-machine.js.map