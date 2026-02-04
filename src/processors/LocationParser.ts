import { CONSTANTS } from '../config/constants';
import { logger } from '../utils/logger';

export class LocationParser {
  /**
   * Parse location information from text
   */
  parseLocation(text: string): {
    states: string[];
    cities: string[];
    isAllIndia: boolean;
  } {
    const result: any = {
      states: [],
      cities: [],
      isAllIndia: false
    };

    // Check for All India
    if (/all\s*india/i.test(text)) {
      result.isAllIndia = true;
      result.states = CONSTANTS.INDIAN_STATES;
      return result;
    }

    // Extract states
    const lowerText = text.toLowerCase();
    for (const state of CONSTANTS.INDIAN_STATES) {
      if (lowerText.includes(state.toLowerCase())) {
        result.states.push(state);
      }
    }

    // If no states found, check for "Pan India" or "Throughout India"
    if (result.states.length === 0) {
      if (/pan\s*india|throughout\s*india|across\s*india/i.test(text)) {
        result.isAllIndia = true;
        result.states = CONSTANTS.INDIAN_STATES;
      }
    }

    return result;
  }
}
