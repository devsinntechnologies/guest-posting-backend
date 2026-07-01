import { LinkInsertionStatus } from '@prisma/client';
export declare class CreateLinkInsertionDto {
    targetArticleId: string;
    anchorText: string;
    destinationUrl: string;
    price: number;
}
export declare class UpdateLinkInsertionStatusDto {
    status: LinkInsertionStatus;
    paymentId?: string;
}
