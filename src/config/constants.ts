export const APP_NAME = 'Job Curator';
export const APP_VERSION = '1.0.0';

export const SCRAPER_CONFIG = {
  maxRetries: 3,
  retryDelay: 2000,
  timeout: 30000,
  requestsPerMinute: 30,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

export const JOB_STATUS = {
  ACTIVE: 'active',
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  CLOSED: 'closed'
} as const;

export const EMPLOYMENT_TYPES = [
  'Permanent',
  'Contract',
  'Temporary',
  'Internship',
  'Apprenticeship'
] as const;

export const ORGANIZATION_TYPES = [
  'Central Government',
  'State Government',
  'PSU',
  'Defense',
  'Banking',
  'Railway',
  'Research',
  'Education'
] as const;
