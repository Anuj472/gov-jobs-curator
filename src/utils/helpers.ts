/**
 * Clean and normalize text
 */
export function cleanText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[\r\n]+/g, ' ');
}

/**
 * Generate URL slug
 */
export function generateSlug(text: string, maxLength = 100): string {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, maxLength);
  
  return slug;
}

/**
 * Extract numbers from text
 */
export function extractNumber(text: string): number | null {
  const match = text.match(/\d+/);
  return match ? parseInt(match[0]) : null;
}

/**
 * Parse date string in various formats
 */
export function parseFlexibleDate(dateString: string): Date | null {
  try {
    // Try standard date parsing first
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    // Add more date parsing logic here
    return null;
  } catch {
    return null;
  }
}
