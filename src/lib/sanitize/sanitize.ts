/**
 * XSS sanitization wrapper around DOMPurify.
 * Requirements: 27.5
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const DOMPurify = typeof window !== 'undefined' ? require('dompurify') : null

const FORBID_TAGS = ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input']
const FORBID_ATTR = [
  'onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout',
  'onmouseenter', 'onmouseleave', 'onfocus', 'onblur', 'onchange',
  'onsubmit', 'onkeydown', 'onkeyup', 'onkeypress', 'onabort',
  'onbeforeunload', 'ondblclick', 'ondrag', 'ondrop', 'onresize',
  'onscroll', 'onunload',
]

function ssrFallbackStrip(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/on\w+\s*=/gi, '')
}

export function sanitize(input: string): string {
  if (typeof window === 'undefined' || !DOMPurify) {
    return ssrFallbackStrip(input)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (DOMPurify as any).sanitize(input, {
    FORBID_TAGS,
    FORBID_ATTR,
    ALLOW_DATA_ATTR: false,
    FORCE_BODY: false,
  }) as string
}
