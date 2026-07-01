import { ArticleStatus } from '@prisma/client';
import { UnprocessableEntityException } from '@nestjs/common';

/** Valid article status transitions enforced as an explicit state machine. */
const VALID_TRANSITIONS: Record<ArticleStatus, ArticleStatus[]> = {
  [ArticleStatus.DRAFT]: [ArticleStatus.PENDING_REVIEW],
  [ArticleStatus.PENDING_REVIEW]: [
    ArticleStatus.APPROVED,
    ArticleStatus.REJECTED,
  ],
  [ArticleStatus.APPROVED]: [ArticleStatus.PUBLISHED],
  [ArticleStatus.REJECTED]: [ArticleStatus.PENDING_REVIEW],
  [ArticleStatus.PUBLISHED]: [ArticleStatus.ARCHIVED],
  [ArticleStatus.ARCHIVED]: [],
};

export function assertValidTransition(
  from: ArticleStatus,
  to: ArticleStatus,
): void {
  const allowed = VALID_TRANSITIONS[from] || [];
  if (!allowed.includes(to)) {
    throw new UnprocessableEntityException(
      `Invalid status transition from ${from} to ${to}`,
    );
  }
}

export function getAllowedTransitions(status: ArticleStatus): ArticleStatus[] {
  return VALID_TRANSITIONS[status] || [];
}
