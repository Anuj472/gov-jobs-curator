import { ProcessedJobData } from '../types/scraper.types';

export class SchemaGenerator {
  generateJobSchema(job: ProcessedJobData): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: job.jobTitle,
      description: job.jobDescription || `Job opening for ${job.jobTitle} at ${job.organizationName}`,
      datePosted: job.notificationDate?.toISOString(),
      validThrough: job.applicationEndDate?.toISOString(),
      employmentType: job.employmentType,
      hiringOrganization: {
        '@type': 'Organization',
        name: job.organizationName,
        sameAs: job.officialWebsite
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressRegion: job.locationState.join(', '),
          addressCountry: 'IN'
        }
      },
      baseSalary: job.salaryMin && job.salaryMax ? {
        '@type': 'MonetaryAmount',
        currency: 'INR',
        value: {
          '@type': 'QuantitativeValue',
          minValue: job.salaryMin,
          maxValue: job.salaryMax,
          unitText: 'MONTH'
        }
      } : undefined,
      educationRequirements: {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: job.minQualification
      },
      qualifications: job.requiredSkills,
      applicationContact: {
        '@type': 'ContactPoint',
        url: job.applyLink || job.officialNotificationUrl
      }
    };
  }
}
