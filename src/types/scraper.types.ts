export interface RawJobData {
  source: string;
  sourceUrl: string;
  title: string;
  organizationName: string;
  organizationType: string;
  notificationUrl?: string;
  applyLink?: string;
  rawText: string;
  dateText?: string;
  scrapedAt: Date;
  metadata?: Record<string, any>;
}

export interface ProcessedJobData {
  jobTitle: string;
  organizationName: string;
  organizationType: string;
  department?: string;
  totalVacancies: number;
  postCategory?: string;
  employmentType: string;
  positionLevel: string;
  locationState: string[];
  locationCities: string[];
  isAllIndia: boolean;
  qualificationRequired: string[];
  minQualification: string;
  maxQualification?: string;
  minAge?: number;
  maxAge?: number;
  ageRelaxation?: Record<string, any>;
  experienceRequired?: string;
  salaryMin?: number;
  salaryMax?: number;
  payLevel?: string;
  applicationMode: string;
  applicationFeeGeneral?: number;
  applicationFeeOBC?: number;
  applicationFeeSCST?: number;
  applicationFeePWD?: number;
  notificationDate?: Date;
  applicationStartDate?: Date;
  applicationEndDate?: Date;
  examDate?: Date;
  officialNotificationUrl?: string;
  applyLink?: string;
  officialWebsite?: string;
  jobDescription?: string;
  selectionProcess?: string;
  examPattern?: string;
  importantInstructions?: string;
  requiredSkills?: string;
  jobBenefits?: string;
  source: string;
  sourceUrl: string;
  scrapedAt: Date;
  processedAt: Date;
  status: 'active' | 'draft' | 'pending_review';
  contentHash?: string;
  similarityScore?: number;
}

export interface JobInDatabase extends ProcessedJobData {
  id?: string;
  slug: string;
  jsonLdSchema: Record<string, any>;
  metaTitle: string;
  metaDescription: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  isFeatured: boolean;
  viewCount: number;
  applicationCount: number;
}
