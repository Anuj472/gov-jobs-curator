export function cleanString(str: string): string {
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s-]/g, '');
}

export function generateSlug(title: string, organization: string): string {
  const combined = `${title}-${organization}`;
  const slug = combined
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
  
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${slug}-${suffix}`;
}

export function parseNumber(text: string): number | undefined {
  const match = text.match(/\d+/);
  return match ? parseInt(match[0]) : undefined;
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
