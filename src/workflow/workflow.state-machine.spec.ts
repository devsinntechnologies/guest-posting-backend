import { ArticleStatus } from '@prisma/client';
import {
  assertValidTransition,
  getAllowedTransitions,
} from './workflow.state-machine';

describe('WorkflowStateMachine', () => {
  it('allows DRAFT → PENDING_REVIEW', () => {
    expect(() =>
      assertValidTransition(ArticleStatus.DRAFT, ArticleStatus.PENDING_REVIEW),
    ).not.toThrow();
  });

  it('allows PENDING_REVIEW → APPROVED', () => {
    expect(() =>
      assertValidTransition(
        ArticleStatus.PENDING_REVIEW,
        ArticleStatus.APPROVED,
      ),
    ).not.toThrow();
  });

  it('allows PENDING_REVIEW → REJECTED', () => {
    expect(() =>
      assertValidTransition(
        ArticleStatus.PENDING_REVIEW,
        ArticleStatus.REJECTED,
      ),
    ).not.toThrow();
  });

  it('allows APPROVED → PUBLISHED', () => {
    expect(() =>
      assertValidTransition(ArticleStatus.APPROVED, ArticleStatus.PUBLISHED),
    ).not.toThrow();
  });

  it('allows REJECTED → PENDING_REVIEW (resubmission)', () => {
    expect(() =>
      assertValidTransition(
        ArticleStatus.REJECTED,
        ArticleStatus.PENDING_REVIEW,
      ),
    ).not.toThrow();
  });

  it('allows PUBLISHED → ARCHIVED', () => {
    expect(() =>
      assertValidTransition(ArticleStatus.PUBLISHED, ArticleStatus.ARCHIVED),
    ).not.toThrow();
  });

  it('rejects DRAFT → PUBLISHED', () => {
    expect(() =>
      assertValidTransition(ArticleStatus.DRAFT, ArticleStatus.PUBLISHED),
    ).toThrow('Invalid status transition');
  });

  it('rejects ARCHIVED → any status', () => {
    expect(getAllowedTransitions(ArticleStatus.ARCHIVED)).toEqual([]);
  });
});
