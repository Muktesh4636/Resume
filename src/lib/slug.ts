export function normalizeSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function isValidSlug(s: string): boolean {
  if (s.length < 3 || s.length > 40) return false
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)
}
