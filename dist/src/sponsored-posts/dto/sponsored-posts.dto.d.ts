import { SponsoredPlacement } from '@prisma/client';
export declare class CreateSponsoredPostDto {
    articleId: string;
    startDate: string;
    endDate: string;
    placement: SponsoredPlacement;
    isActive?: boolean;
}
export declare class UpdateSponsoredPostDto {
    startDate?: string;
    endDate?: string;
    placement?: SponsoredPlacement;
    isActive?: boolean;
}
