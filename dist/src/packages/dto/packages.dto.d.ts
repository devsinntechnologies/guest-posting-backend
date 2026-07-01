export declare class CreatePackageDto {
    name: string;
    description?: string;
    price: number;
    currency?: string;
    features?: string[];
    durationDays?: number;
    isActive?: boolean;
}
export declare class UpdatePackageDto {
    name?: string;
    description?: string;
    price?: number;
    currency?: string;
    features?: string[];
    durationDays?: number;
    isActive?: boolean;
}
