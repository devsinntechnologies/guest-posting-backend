import { SeoPageType } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class CreateSeoPageDto {
    pageType: SeoPageType;
    referenceId?: string;
    slug?: string;
    metaTitle?: string;
    metaDescription?: string;
    h1Heading?: string;
    customContent?: string;
}
export declare class BulkGenerateSeoDto {
    pageTypes: SeoPageType[];
}
export declare class SeoPageQueryDto extends PaginationDto {
    pageType?: SeoPageType;
}
export declare class UpdateSeoMetaDto {
    metaTitle?: string;
    metaDescription?: string;
    h1Heading?: string;
    customContent?: string;
}
