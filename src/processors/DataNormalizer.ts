import { RawJobData, ProcessedJobData } from '../types/scraper.types';
import { DateParser } from './DateParser';
import { SalaryParser } from './SalaryParser';
import { LocationParser } from './LocationParser';
import { QualificationMapper } from './QualificationMapper';
import { logger } from '../utils/logger';
import { cleanText } from '../utils/helpers';
import { CONSTANTS } from '../config/constants';

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

  /**
   * Normalize raw job data into structured format
   */
  async normalize(rawData: RawJobData): Promise<ProcessedJobData> {
    logger.info(`Normalizing job: ${rawData.title}`);

    try {
      const cleanedText = cleanText(rawData.rawText);

      // Parse various fields
      const dates = this.dateParser.extractDates(cleanedText);
      const salary = this.salaryParser.parseSalary(cleanedText);
      const location = this.locationParser.parseLocation(cleanedText);
      const qualification = this.qualificationMapper.mapQualification(cleanedText);
      const age = this.parseAge(cleanedText);
      const vacancies = this.parseVacancies(cleanedText);
      const employmentType = this.determineEmploymentType(cleanedText);

      const processedData: ProcessedJobData = {
        // Basic info
        jobTitle: this.cleanTitle(rawData.title),
        organizationName: rawData.organizationName,
        organizationType: rawData.organizationType,
        department: this.extractDepartment(cleanedText),

        // Vacancies
        totalVacancies: vacancies.total,
        postCategory: vacancies.breakdown,

        // Employment
        employmentType: employmentType,
        positionLevel: this.determinePositionLevel(rawData.title),

        // Location
        locationState: location.states,
        locationCities: location.cities,
        isAllIndia: location.isAllIndia,

        // Qualification
        qualificationRequired: qualification.required,
        minQualification: qualification.min,
        maxQualification: qualification.max,

        // Age
        minAge: age.min,
        maxAge: age.max,
        ageRelaxation: age.relaxation,

        // Experience
        experienceRequired: this.extractExperience(cleanedText),

        // Salary
        salaryMin: salary.min,
        salaryMax: salary.max,
        payLevel: salary.payLevel,

        // Application
        applicationMode: this.determineApplicationMode(cleanedText),
        applicationFeeGeneral: this.extractApplicationFee(cleanedText, 'general'),
        applicationFeeOBC: this.extractApplicationFee(cleanedText, 'obc'),
        applicationFeeSCST: this.extractApplicationFee(cleanedText, 'scst'),
        applicationFeePWD: this.extractApplicationFee(cleanedText, 'pwd'),

        // Dates
        notificationDate: dates.notification,
        applicationStartDate: dates.start,
        applicationEndDate: dates.end,
        examDate: dates.exam,

        // Links
        officialNotificationUrl: rawData.notificationUrl,
        applyLink: rawData.applyLink,
        officialWebsite: this.extractOfficialWebsite(cleanedText),

        // Content
        jobDescription: this.extractSection(cleanedText, ['job description', 'duties', 'responsibilities']),
        selectionProcess: this.extractSection(cleanedText, ['selection process', 'selection procedure']),
        examPattern: this.extractSection(cleanedText, ['exam pattern', 'syllabus']),
        importantInstructions: this.extractSection(cleanedText, ['important instructions', 'important dates', 'important notes']),
        requiredSkills: this.extractSkills(cleanedText),
        jobBenefits: this.extractBenefits(cleanedText),

        // Metadata
        source: rawData.source,
        sourceUrl: rawData.sourceUrl,
        scrapedAt: rawData.scrapedAt,
        processedAt: new Date(),
        status: 'pending_review'
      };

      return processedData;

    } catch (error) {
      logger.error('Error normalizing job data:', error);
      throw error;
    }
  }

  private cleanTitle(title: string): string {
    return cleanText(title).substring(0, 200);
  }

  private parseAge(text: string): { min?: number; max?: number; relaxation?: Record<string, any> } {
    const result: any = {};
    const agePattern = /age.*?(\d+).*?(?:to|-).*?(\d+)/i;
    const match = text.match(agePattern);
    if (match) {
      result.min = parseInt(match[1]);
      result.max = parseInt(match[2]);
    }
    return result;
  }

  private parseVacancies(text: string): { total: number; breakdown?: string } {
    const vacancyPattern = /(\d+)\s*(?:post|vacancy|vacancies)/i;
    const match = text.match(vacancyPattern);
    return { total: match ? parseInt(match[1]) : 1 };
  }

  private determineEmploymentType(text: string): string {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('permanent') || lowerText.includes('regular')) return CONSTANTS.EMPLOYMENT_TYPES.PERMANENT;
    if (lowerText.includes('contract')) return CONSTANTS.EMPLOYMENT_TYPES.CONTRACT;
    if (lowerText.includes('temporary')) return CONSTANTS.EMPLOYMENT_TYPES.TEMPORARY;
    if (lowerText.includes('intern')) return CONSTANTS.EMPLOYMENT_TYPES.INTERNSHIP;
    return CONSTANTS.EMPLOYMENT_TYPES.PERMANENT;
  }

  private determinePositionLevel(title: string): string {
    const lowerTitle = title.toLowerCase();
    for (const level of CONSTANTS.POSITION_LEVELS) {
      if (lowerTitle.includes(level.toLowerCase())) return level;
    }
    return 'Other';
  }

  private determineApplicationMode(text: string): string {
    const lowerText = text.toLowerCase();
    const hasOnline = lowerText.includes('online');
    const hasOffline = lowerText.includes('offline');
    if (hasOnline && hasOffline) return CONSTANTS.APPLICATION_MODES.BOTH;
    if (hasOnline) return CONSTANTS.APPLICATION_MODES.ONLINE;
    if (hasOffline) return CONSTANTS.APPLICATION_MODES.OFFLINE;
    return CONSTANTS.APPLICATION_MODES.ONLINE;
  }

  private extractApplicationFee(text: string, category: string): number | undefined {
    const patterns: Record<string, RegExp> = {
      general: /(?:general|gen|ur).*?fee.*?(?:rs\.?|\u20b9)?\s*(\d+)/i,
      obc: /obc.*?fee.*?(?:rs\.?|\u20b9)?\s*(\d+)/i,
      scst: /(?:sc\/st|scst).*?fee.*?(?:rs\.?|\u20b9)?\s*(\d+)/i,
      pwd: /(?:pwd|disabled).*?fee.*?(?:rs\.?|\u20b9)?\s*(\d+)/i
    };
    const match = text.match(patterns[category]);
    return match ? parseInt(match[1]) : undefined;
  }

  private extractDepartment(text: string): string | undefined {
    const deptPattern = /department\s*(?:of|:)?\s*([a-z\s]+)/i;
    const match = text.match(deptPattern);
    return match ? match[1].trim() : undefined;
  }

  private extractOfficialWebsite(text: string): string | undefined {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlPattern);
    return urls ? urls[0] : undefined;
  }

  private extractSection(text: string, keywords: string[]): string | undefined {
    for (const keyword of keywords) {
      const pattern = new RegExp(`${keyword}\s*:?\s*([\s\S]{0,500})`, 'i');
      const match = text.match(pattern);
      if (match) return match[1].trim();
    }
    return undefined;
  }

  private extractSkills(text: string): string | undefined {
    return this.extractSection(text, ['required skills', 'skills required', 'technical skills']);
  }

  private extractBenefits(text: string): string | undefined {
    return this.extractSection(text, ['benefits', 'perks', 'allowances']);
  }

  private extractExperience(text: string): string | undefined {
    const expPattern = /(\d+)\s*(?:year|yr)s?\s*(?:of)?\s*experience/i;
    const match = text.match(expPattern);
    return match ? match[0] : undefined;
  }
}
