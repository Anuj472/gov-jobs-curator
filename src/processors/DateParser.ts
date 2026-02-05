import { parse, isValid } from 'date-fns';
import { logger } from '../utils/logger';

export class DateParser {
  private dateFormats = [
    'dd/MM/yyyy',
    'dd-MM-yyyy',
    'MM/dd/yyyy',
    'yyyy-MM-dd',
    'dd MMM yyyy',
    'dd MMMM yyyy',
    'MMM dd, yyyy',
    'MMMM dd, yyyy'
  ];

  extractDates(text: string): {
    notification?: Date;
    start?: Date;
    end?: Date;
    exam?: Date;
  } {
    const dates: any = {};

    // Extract last date
    const lastDatePattern = /(?:last date|closing date|end date)[:\s]*([\d\/\-]+)/i;
    const lastDateMatch = text.match(lastDatePattern);
    if (lastDateMatch) {
      dates.end = this.parseDate(lastDateMatch[1]);
    }

    // Extract start date
    const startDatePattern = /(?:start date|opening date|from)[:\s]*([\d\/\-]+)/i;
    const startDateMatch = text.match(startDatePattern);
    if (startDateMatch) {
      dates.start = this.parseDate(startDateMatch[1]);
    }

    // Extract notification date
    const notificationPattern = /(?:notification|published)[:\s]*([\d\/\-]+)/i;
    const notificationMatch = text.match(notificationPattern);
    if (notificationMatch) {
      dates.notification = this.parseDate(notificationMatch[1]);
    }

    // Extract exam date
    const examPattern = /(?:exam date|examination date)[:\s]*([\d\/\-]+)/i;
    const examMatch = text.match(examPattern);
    if (examMatch) {
      dates.exam = this.parseDate(examMatch[1]);
    }

    return dates;
  }

  parseDate(dateString: string): Date | undefined {
    for (const format of this.dateFormats) {
      try {
        const parsed = parse(dateString, format, new Date());
        if (isValid(parsed)) {
          return parsed;
        }
      } catch (error) {
        continue;
      }
    }

    logger.warn(`Could not parse date: ${dateString}`);
    return undefined;
  }
}
