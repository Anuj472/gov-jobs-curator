import { parse, isValid } from 'date-fns';
import { logger } from '../utils/logger';

export class DateParser {
  private datePatterns = [
    'dd/MM/yyyy',
    'dd-MM-yyyy',
    'dd.MM.yyyy',
    'yyyy-MM-dd',
    'dd MMM yyyy',
    'dd MMMM yyyy',
    'MMM dd, yyyy',
    'MMMM dd, yyyy'
  ];

  /**
   * Extract dates from text
   */
  extractDates(text: string): {
    notification?: Date;
    start?: Date;
    end?: Date;
    exam?: Date;
  } {
    const result: any = {};

    // Patterns for different date types
    const patterns = {
      notification: /notification.*?date.*?:?\s*([\d\/-]+)/i,
      start: /(?:start|opening|from).*?date.*?:?\s*([\d\/-]+)/i,
      end: /(?:last|closing|end|till).*?date.*?:?\s*([\d\/-]+)/i,
      exam: /exam.*?date.*?:?\s*([\d\/-]+)/i
    };

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = text.match(pattern);
      if (match) {
        const parsedDate = this.parseDate(match[1]);
        if (parsedDate) {
          result[key] = parsedDate;
        }
      }
    }

    return result;
  }

  /**
   * Parse date string with multiple format support
   */
  parseDate(dateString: string): Date | null {
    // Clean the date string
    const cleaned = dateString.trim();

    // Try each pattern
    for (const pattern of this.datePatterns) {
      try {
        const parsed = parse(cleaned, pattern, new Date());
        if (isValid(parsed)) {
          return parsed;
        }
      } catch {
        continue;
      }
    }

    // Try native Date parsing as fallback
    try {
      const date = new Date(cleaned);
      if (isValid(date)) {
        return date;
      }
    } catch {
      logger.warn(`Could not parse date: ${dateString}`);
    }

    return null;
  }
}
