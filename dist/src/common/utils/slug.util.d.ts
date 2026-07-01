export declare function generateSlug(text: string): string;
export declare function ensureUniqueSlug(baseSlug: string, existsFn: (slug: string) => Promise<boolean>, excludeSlug?: string): Promise<string>;
