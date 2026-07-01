import { ArticleStatus } from '@prisma/client';
export declare function assertValidTransition(from: ArticleStatus, to: ArticleStatus): void;
export declare function getAllowedTransitions(status: ArticleStatus): ArticleStatus[];
