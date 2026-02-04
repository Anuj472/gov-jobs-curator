// Core type definitions for the job curator system

export interface RawJobData {
  source: string;                    // SSC, UPSC, etc.
  sourceUrl: string;                 // Base URL
  title: string;                     // Job title
  organizationName: string;          // Organization name
  organizationType: string;          // Central, State, PSU
  notificationUrl?: string;          // PDF/webpage link
  applyLink?: string;                // Application link
  rawText: string;                   // Raw extracted text
  dateText?: string;                 // Date in original format
  scrapedAt: Date;                   // When scraped
  metadata?: Record<string, any>;    // Additional metadata
}

export interface ProcessedJobData {
  // Basic Info
  jobTitle: string;
  organizationName: string;
  organizationType: string;
  department?: string;
  
  // Vacancies
  totalVacancies: number;
  postCategory?: string;
  
  // Employment Details
  employmentType: string;
  positionLevel: string;
  
  // Location
  locationState: string[];
  locationCities: string[];
  isAllIndia: boolean;
  
  // Qualification
  qualificationRequired: string[];
  minQualification: string;
  maxQualification?: string;
  
  // Age
  minAge?: number;
  maxAge?: number;
  ageRelaxation?: Record<string, any>;
  
  // Experience
  experienceRequired?: string;
  
  // Salary
  salaryMin?: number;
  salaryMax?: number;
  payLevel?: string;
  
  // Application
  applicationMode: string;
  applicationFeeGeneral?: number;
  applicationFeeOBC?: number;
  applicationFeeSCST?: number;
  applicationFeePWD?: number;
  
  // Dates
  notificationDate?: Date;
  applicationStartDate?: Date;
  applicationEndDate?: Date;
  examDate?: Date;
  
  // Links
  officialNotificationUrl?: string;
  applyLink?: string;
  officialWebsite?: string;
  
  // Content
  jobDescription?: string;
  selectionProcess?: string;
  examPattern?: string;
  importantInstructions?: string;
  requiredSkills?: string;
  jobBenefits?: string;
  
  // Metadata
  source: string;
  sourceUrl: string;
  scrapedAt: Date;
  processedAt: Date;
  status: 'active' | 'draft' | 'pending_review';
  
  // Deduplication
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

export interface ScraperConfig {
  name: string;
  url: string;
  enabled: boolean;
  schedule?: string;
  priority?: number;
}
