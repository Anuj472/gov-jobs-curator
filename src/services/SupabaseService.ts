import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ProcessedJobData, JobInDatabase } from '../types/scraper.types';
import { logger } from '../utils/logger';
import { SchemaGenerator } from './SchemaGenerator';
import { generateSlug } from '../utils/helpers';

export class SupabaseService {
  public client: SupabaseClient;
  private schemaGenerator: SchemaGenerator;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    this.client = createClient(supabaseUrl, supabaseKey);
    this.schemaGenerator = new SchemaGenerator();
  }

  async insertJob(jobData: ProcessedJobData): Promise<string | null> {
    try {
      const slug = generateSlug(jobData.jobTitle, jobData.organizationName);
      const jsonLdSchema = this.schemaGenerator.generateJobSchema(jobData);
      const metaTitle = `${jobData.jobTitle} - ${jobData.organizationName}`;
      const metaDescription = this.generateMetaDescription(jobData);

      const jobRecord: any = {
        slug,
        job_title: jobData.jobTitle,
        organization_name: jobData.organizationName,
        organization_type: jobData.organizationType,
        department: jobData.department,
        total_vacancies: jobData.totalVacancies,
        post_category: jobData.postCategory,
        employment_type: jobData.employmentType,
        location_state: jobData.locationState,
        location_cities: jobData.locationCities,
        is_all_india: jobData.isAllIndia,
        qualification_required: jobData.qualificationRequired,
        min_qualification: jobData.minQualification,
        max_qualification: jobData.maxQualification,
        position_level: jobData.positionLevel,
        min_age: jobData.minAge,
        max_age: jobData.maxAge,
        age_relaxation: jobData.ageRelaxation,
        experience_required: jobData.experienceRequired,
        salary_min: jobData.salaryMin,
        salary_max: jobData.salaryMax,
        pay_level: jobData.payLevel,
        application_mode: jobData.applicationMode,
        application_fee_general: jobData.applicationFeeGeneral,
        application_fee_obc: jobData.applicationFeeOBC,
        application_fee_sc_st: jobData.applicationFeeSCST,
        application_fee_pwd: jobData.applicationFeePWD,
        notification_date: jobData.notificationDate?.toISOString(),
        application_start_date: jobData.applicationStartDate?.toISOString(),
        application_end_date: jobData.applicationEndDate?.toISOString(),
        exam_date: jobData.examDate?.toISOString(),
        official_notification_url: jobData.officialNotificationUrl,
        apply_link: jobData.applyLink,
        official_website: jobData.officialWebsite,
        selection_process: jobData.selectionProcess,
        exam_pattern: jobData.examPattern,
        job_description: jobData.jobDescription,
        important_instructions: jobData.importantInstructions,
        required_skills: jobData.requiredSkills,
        job_benefits: jobData.jobBenefits,
        json_ld_schema: jsonLdSchema,
        meta_title: metaTitle,
        meta_description: metaDescription,
        content_hash: jobData.contentHash,
        status: jobData.status,
        source: jobData.source,
        source_url: jobData.sourceUrl,
        is_active: true,
        is_featured: false,
        view_count: 0,
        application_count: 0
      };

      const { data, error } = await this.client
        .from('jobs')
        .insert([jobRecord])
        .select('id')
        .single();

      if (error) {
        logger.error('Error inserting job:', error);
        throw error;
      }

      logger.info(`Inserted job: ${data.id}`);
      return data.id;

    } catch (error) {
      logger.error('Error in insertJob:', error);
      return null;
    }
  }

  async updateJob(
    jobId: string,
    updates: Partial<any>
  ): Promise<boolean> {
    try {
      const { error } = await this.client
        .from('jobs')
        .update(updates)
        .eq('id', jobId);

      if (error) throw error;

      logger.info(`Updated job: ${jobId}`);
      return true;

    } catch (error) {
      logger.error('Error updating job:', error);
      return false;
    }
  }

  async bulkInsertJobs(jobs: ProcessedJobData[]): Promise<number> {
    let successCount = 0;

    for (const job of jobs) {
      const inserted = await this.insertJob(job);
      if (inserted) successCount++;
    }

    logger.info(`Bulk inserted ${successCount}/${jobs.length} jobs`);
    return successCount;
  }

  async markExpiredJobs(): Promise<number> {
    try {
      const { data, error } = await this.client
        .from('jobs')
        .update({ is_active: false, status: 'closed' })
        .lt('application_end_date', new Date().toISOString())
        .eq('is_active', true)
        .select('id');

      if (error) throw error;

      const count = data?.length || 0;
      logger.info(`Marked ${count} jobs as expired`);
      return count;

    } catch (error) {
      logger.error('Error marking expired jobs:', error);
      return 0;
    }
  }

  private generateMetaDescription(job: ProcessedJobData): string {
    const parts = [
      `${job.totalVacancies} vacancies for ${job.jobTitle}`,
      `in ${job.organizationName}.`,
      job.minQualification ? `Qualification: ${job.minQualification}.` : '',
      job.applicationEndDate
        ? `Apply before ${job.applicationEndDate.toLocaleDateString()}.`
        : ''
    ];

    return parts.filter(Boolean).join(' ').substring(0, 160);
  }
}
