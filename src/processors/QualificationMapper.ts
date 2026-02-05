import { logger } from '../utils/logger';

const QUALIFICATIONS = {
  '10th': ['10th', 'class 10', 'matric', 'matriculation'],
  '12th': ['12th', 'class 12', 'intermediate', 'higher secondary'],
  'Graduation': ['graduation', 'graduate', 'bachelor', 'degree', 'b.a', 'b.sc', 'b.com', 'b.tech', 'b.e'],
  'Post Graduation': ['post graduation', 'post graduate', 'master', 'pg', 'm.a', 'm.sc', 'm.com', 'm.tech', 'mba'],
  'PhD': ['phd', 'doctorate', 'doctoral'],
  'Diploma': ['diploma', 'iti'],
  'Any': ['any qualification', 'no qualification required']
};

export class QualificationMapper {
  mapQualification(text: string): {
    required: string[];
    min: string;
    max?: string;
  } {
    const lowerText = text.toLowerCase();
    const found: string[] = [];

    for (const [qual, patterns] of Object.entries(QUALIFICATIONS)) {
      for (const pattern of patterns) {
        if (lowerText.includes(pattern)) {
          found.push(qual);
          break;
        }
      }
    }

    const required = found.length > 0 ? found : ['Any'];
    const min = required[0];
    const max = required.length > 1 ? required[required.length - 1] : undefined;

    return { required, min, max };
  }
}
