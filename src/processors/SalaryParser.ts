import { logger } from '../utils/logger';

export class SalaryParser {
  parseSalary(text: string): {
    min?: number;
    max?: number;
    payLevel?: string;
  } {
    const result: any = {};

    // Parse salary range (e.g., "Rs. 15000 - 25000")
    const rangePattern = /(?:rs\.?|₹)\s*(\d+(?:,\d+)*)\s*-\s*(?:rs\.?|₹)?\s*(\d+(?:,\d+)*)/i;
    const rangeMatch = text.match(rangePattern);
    
    if (rangeMatch) {
      result.min = parseInt(rangeMatch[1].replace(/,/g, ''));
      result.max = parseInt(rangeMatch[2].replace(/,/g, ''));
    }

    // Parse pay level (e.g., "Level-7")
    const payLevelPattern = /(?:pay level|level)[:\s-]*(\d+)/i;
    const payLevelMatch = text.match(payLevelPattern);
    
    if (payLevelMatch) {
      result.payLevel = `Level-${payLevelMatch[1]}`;
    }

    // Parse pay scale (e.g., "9300-34800")
    const payScalePattern = /(\d+(?:,\d+)*)\s*-\s*(\d+(?:,\d+)*)/;
    const payScaleMatch = text.match(payScalePattern);
    
    if (payScaleMatch && !result.min) {
      result.min = parseInt(payScaleMatch[1].replace(/,/g, ''));
      result.max = parseInt(payScaleMatch[2].replace(/,/g, ''));
    }

    return result;
  }
}
