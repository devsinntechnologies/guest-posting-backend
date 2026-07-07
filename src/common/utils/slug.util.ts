import slugify from 'slugify';

/**
 * Generates a URL-safe slug from the given text.
 * Appends a short random suffix to guarantee uniqueness within the caller's context.
 */
export function generateSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true,
  });
}

/**
 * Generates a unique slug by appending a random 6-character hex suffix.
 * Use when you need to guarantee DB uniqueness without a DB lookup.
 */
export function generateUniqueSlug(text: string): string {
  const base = generateSlug(text);
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${base}-${suffix}`;
}
