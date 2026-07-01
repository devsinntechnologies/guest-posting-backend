import slugify from 'slugify';

/**
 * Generates a URL-safe slug from text. Industry-standard slugify with lowercase and strict mode.
 */
export function generateSlug(text: string): string {
  return slugify(text, { lower: true, strict: true, trim: true });
}

/**
 * Ensures slug uniqueness by appending numeric suffix on collision (e.g. my-post, my-post-2).
 */
export async function ensureUniqueSlug(
  baseSlug: string,
  existsFn: (slug: string) => Promise<boolean>,
  excludeSlug?: string,
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    if (excludeSlug && slug === excludeSlug) return slug;
    const exists = await existsFn(slug);
    if (!exists) return slug;
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }
}
