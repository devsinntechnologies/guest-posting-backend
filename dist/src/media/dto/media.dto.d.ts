import { MediaType } from '@prisma/client';
export declare class UpdateMediaDto {
    altText?: string;
}
export declare class MediaQueryDto {
    page: number;
    limit: number;
    mediaType?: MediaType;
    search?: string;
}
