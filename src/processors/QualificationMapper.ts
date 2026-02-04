import { logger } from '../utils/logger';

export class QualificationMapper {
  private qualificationLevels = [
    { keywords: ['10th', 'class 10', 'matriculation', 'ssc'], level: '10th Pass', order: 1 },
    { keywords: ['12th', 'class 12', 'intermediate', 'higher secondary', '+2'], level: '12th Pass', order: 2 },
    { keywords: ['diploma'], level: 'Diploma', order: 3 },
    { keywords: ['iti'], level: 'ITI', order: 3 },
    { keywords: ['graduation', 'bachelor', 'degree', 'b.tech', 'b.e.', 'b.sc', 'b.com', 'ba', 'bba'], level: 'Graduation', order: 4 },
    { keywords: ['post.*graduation', 'master', 'm.tech', 'm.e.', 'm.sc', 'm.com', 'ma', 'mba'], level: 'Post Graduation', order: 5 },
    { keywords: ['phd', 'doctorate'], level: 'PhD', order: 6 }
  ];

  /**
   * Map qualification from text to standardized format
   */
  mapQualification(text: string): {
    required: string[];
    min: string;
    max?: string;
  } {
    const lowerText = text.toLowerCase();
    const found: Array<{ level: string; order: number }> = [];

    // Find all matching qualifications
    for (const qual of this.qualificationLevels) {
      for (const keyword of qual.keywords) {
        const regex = new RegExp(keyword, 'i');
        if (regex.test(lowerText)) {
          found.push({ level: qual.level, order: qual.order });
          break;
        }
      }
    }

    // Remove duplicates and sort by order
    const unique = Array.from(
      new Map(found.map(item => [item.level, item])).values()
    ).sort((a, b) => a.order - b.order);

    const result: any = {
      required: unique.map(q => q.level),
      min: unique.length > 0 ? unique[0].level : 'Not Specified'
    };

    if (unique.length > 1) {
      result.max = unique[unique.length - 1].level;
    }

    return result;
  }
}
