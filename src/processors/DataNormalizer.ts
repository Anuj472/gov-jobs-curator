import { RawJobData, ProcessedJobData } from '../types/scraper.types';
import { DateParser } from './DateParser';
import { SalaryParser } from './SalaryParser';
import { LocationParser } from './LocationParser';
import { QualificationMapper } from './QualificationMapper';
import { logger } from '../utils/logger';
import { cleanString } from '../utils/helpers';

export class DataNormalizer {
  private dateParser: DateParser;
  private salaryParser: SalaryParser;
  private locationParser: LocationParser;
  private qualificationMapper: QualificationMapper;

  constructor() {
    this.dateParser = new DateParser();
    this.salaryParser = new SalaryParser();
    this.locationParser = new LocationParser();
    this.qualificationMapper = new QualificationMapper();
  }

  async normalize(rawData: RawJobData): Promise<ProcessedJobData> {
    logger.info(`Normalizing job: ${rawData.title}`);

    try {
      const dates = this.dateParser.extractDates(rawData.rawText);
      const salary = this.salaryParser.parseSalary(rawData.rawText);
      const location = this.locationParser.parseLocation(rawData.rawText);
      const qualification = this.qualificationMapper.mapQualification(rawData.rawText);
      const age = this.parseAge(rawData.rawText);
      const employmentType = this.determineEmploymentType(rawData.rawText);
      const vacancies = this.parseVacancies(rawData.rawText);

      const processedData: ProcessedJobData = {
        jobTitle: cleanString(rawData.title),
        organizationName: rawData.organizationName,
        organizationType: rawData.organizationType,
        department: undefined,
        totalVacancies: vacancies.total,
        postCategory: vacancies.breakdown,
        employmentType: employmentType,
        positionLevel: this.determinePositionLevel(rawData.title),
        locationState: location.states,
        locationCities: location.cities,
        isAllIndia: location.isAllIndia,
        qualificationRequired: qualification.required,
        minQualification: qualification.min,
        maxQualification: qualification.max,
        minAge: age.min,
        maxAge: age.max,
        ageRelaxation: age.relaxation,
        experienceRequired: undefined,
        salaryMin: salary.min,
        salaryMax: salary.max,
        payLevel: salary.payLevel,
        applicationMode: this.determineApplicationMode(rawData.rawText),
        applicationFeeGeneral: undefined,
        applicationFeeOBC: undefined,
        applicationFeeSCST: undefined,
        applicationFeePWD: undefined,
        notificationDate: dates.notification,
        applicationStartDate: dates.start,
        applicationEndDate: dates.end,
        examDate: dates.exam,
        officialNotificationUrl: rawData.notificationUrl,
        applyLink: rawData.applyLink,
        officialWebsite: undefined,
        jobDescription: undefined,
        selectionProcess: undefined,
        examPattern: undefined,
        importantInstructions: undefined,
        requiredSkills: undefined,
        jobBenefits: undefined,
        source: rawData.source,
        sourceUrl: rawData.sourceUrl,
        scrapedAt: rawData.scrapedAt,
        processedAt: new Date(),
        status: 'pending_review',
        contentHash: undefined,
        similarityScore: undefined
      };

      return processedData;

    } catch (error) {
      logger.error('Error normalizing job data:', error);
      throw error;
    }
  }

  private parseAge(text: string): {
    min?: number;
    max?: number;
    relaxation?: Record<string, any>;
  } {
    const result: any = {};
    
    const agePattern = /age.*?(\d+).*?to.*?(\d+)/i;
    const match = text.match(agePattern);
    
    if (match) {
      result.min = parseInt(match[1]);
      result.max = parseInt(match[2]);
    }
    
    return result;
  }

  private determineEmploymentType(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('permanent') || lowerText.includes('regular')) {
      return 'Permanent';
    } else if (lowerText.includes('contract')) {
      return 'Contract';
    } else if (lowerText.includes('temporary')) {
      return 'Temporary';
    }
    
    return 'Permanent';
  }

  private parseVacancies(text: string): {
    total: number;
    breakdown?: string;
  } {
    const vacancyPattern = /(\d+)\s*(?:post|vacancy|vacancies)/i;
    const match = text.match(vacancyPattern);
    
    const total = match ? parseInt(match[1]) : 1;
    
    return { total, breakdown: undefined };
  }

  private determinePositionLevel(title: string): string {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('director')) return 'Director';
    if (lowerTitle.includes('manager')) return 'Manager';
    if (lowerTitle.includes('officer')) return 'Officer';
    if (lowerTitle.includes('assistant')) return 'Assistant';
    if (lowerTitle.includes('clerk')) return 'Clerk';
    
    return 'Other';
  }

  private determineApplicationMode(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('online') && lowerText.includes('offline')) {
      return 'Both';
    } else if (lowerText.includes('online')) {
      return 'Online';
    } else if (lowerText.includes('offline')) {
      return 'Offline';
    }
    
    return 'Online';
  }
}
