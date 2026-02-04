import crypto from 'crypto';

/**
 * Generate SHA256 hash from string
 */
export function generateHash(input: string): string {
  return crypto
    .createHash('sha256')
    .update(input)
    .digest('hex');
}

/**
 * Generate content hash for deduplication
 */
export function generateContentHash(fields: string[]): string {
  const contentString = fields.join('|');
  return generateHash(contentString);
}
