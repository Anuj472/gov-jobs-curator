import { logger } from '../utils/logger';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli',
  'Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

export class LocationParser {
  parseLocation(text: string): {
    states: string[];
    cities: string[];
    isAllIndia: boolean;
  } {
    const lowerText = text.toLowerCase();
    const states: string[] = [];
    const cities: string[] = [];

    // Check for All India
    const isAllIndia = /all india|pan india|across india|throughout india/i.test(text);

    if (!isAllIndia) {
      // Find state mentions
      for (const state of INDIAN_STATES) {
        if (lowerText.includes(state.toLowerCase())) {
          states.push(state);
        }
      }

      // Find city mentions (basic implementation)
      const cityPattern = /(?:posted at|location[:\s]*|based in[:\s]*)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g;
      const cityMatches = text.matchAll(cityPattern);
      
      for (const match of cityMatches) {
        cities.push(match[1]);
      }
    }

    return {
      states: isAllIndia ? ['All India'] : states,
      cities: isAllIndia ? [] : cities,
      isAllIndia
    };
  }
}
