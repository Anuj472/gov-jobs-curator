import { ProcessedJobData } from '../types';

export class SchemaGenerator {
  /**
   * Generate JSON-LD schema for job posting
   */
  generateJobSchema(job: ProcessedJobData): Record<string, any> {
    const schema: any = {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: job.jobTitle,
      description: job.jobDescription || `${job.totalVacancies} vacancies for ${job.jobTitle} in ${job.organizationName}`,
      hiringOrganization: {
        '@type': 'Organization',
        name: job.organizationName
      },
      datePosted: job.notificationDate?.toISOString() || job.scrapedAt.toISOString(),
      validThrough: job.applicationEndDate?.toISOString(),
      employmentType: job.employmentType,
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'IN'
        }
      }
    };

    // Add salary if available
    if (job.salaryMin || job.salaryMax) {
      schema.baseSalary = {
        '@type': 'MonetaryAmount',
        currency: 'INR',
        value: {
          '@type': 'QuantitativeValue',
          minValue: job.salaryMin,
          maxValue: job.salaryMax,
          unitText: 'MONTH'
        }
      };
    }

    // Add education requirements
    if (job.minQualification) {
      schema.educationRequirements = {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: job.minQualification
      };
    }

    // Add experience requirements
    if (job.experienceRequired) {
      schema.experienceRequirements = {
        '@type': 'OccupationalExperienceRequirements',
        monthsOfExperience: this.extractMonthsFromExperience(job.experienceRequired)
      };
    }

    return schema;
  }

  private extractMonthsFromExperience(exp: string): number {
    const match = exp.match(/(\d+)/);
    return match ? parseInt(match[1]) * 12 : 0;
  }
}
