import { logger } from '../utils/logger';

export class SalaryParser {
  /**
   * Parse salary information from text
   */
  parseSalary(text: string): {
    min?: number;
    max?: number;
    payLevel?: string;
  } {
    const result: any = {};

    // Pattern for pay level (e.g., Level 7, Pay Level 10)
    const payLevelPattern = /(?:pay\s*)?level[:\s]*([\d]+)/i;
    const payLevelMatch = text.match(payLevelPattern);
    if (payLevelMatch) {
      result.payLevel = `Level ${payLevelMatch[1]}`;
    }

    // Pattern for salary range (e.g., Rs. 44900-142400, 25000-50000)
    const salaryRangePattern = /(?:rs\.?|₹)?\s*(\d{4,})\s*[-to]+\s*(\d{4,})/i;
    const rangeMatch = text.match(salaryRangePattern);
    if (rangeMatch) {
      result.min = parseInt(rangeMatch[1]);
      result.max = parseInt(rangeMatch[2]);
    }

    // Pattern for single salary amount
    if (!result.min) {
      const singleSalaryPattern = /(?:salary|pay).*?(?:rs\.?|₹)?\s*(\d{4,})/i;
      const singleMatch = text.match(singleSalaryPattern);
      if (singleMatch) {
        result.min = parseInt(singleMatch[1]);
      }
    }

    return result;
  }
}
