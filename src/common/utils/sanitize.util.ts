import sanitizeHtml from 'sanitize-html';

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    'img',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'figure',
    'figcaption',
    'iframe',
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ['src', 'alt', 'title', 'width', 'height'],
    a: ['href', 'name', 'target', 'rel'],
    iframe: ['src', 'width', 'height', 'frameborder', 'allowfullscreen'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
};

/** Sanitizes rich text / markdown HTML to prevent stored XSS. */
export function sanitizeContent(content: string): string {
  return sanitizeHtml(content, SANITIZE_OPTIONS);
}

/** Estimates reading time in minutes based on word count (~200 wpm). */
export function calculateReadingTime(content: string): number {
  const text = content.replace(/<[^>]*>/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
