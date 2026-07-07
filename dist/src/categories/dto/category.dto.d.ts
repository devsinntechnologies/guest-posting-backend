export declare class CreateCategoryDto {
    name: string;
    description?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    parentCategoryId?: string;
    isActive?: boolean;
}
export declare class UpdateCategoryDto {
    name?: string;
    description?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    parentCategoryId?: string;
    isActive?: boolean;
}
export declare class CategoryQueryDto {
    page: number;
    limit: number;
    search?: string;
    parentCategoryId?: string;
    isActive?: boolean;
}
