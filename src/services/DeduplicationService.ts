import crypto from 'crypto';
import { ProcessedJobData } from '../types/scraper.types';
import { SupabaseService } from './SupabaseService';
import { logger } from '../utils/logger';
import { generateJobHash } from '../utils/hash';

export class DeduplicationService {
  private supabase: SupabaseService;

  constructor(supabaseService: SupabaseService) {
    this.supabase = supabaseService;
  }

  generateHash(job: ProcessedJobData): string {
    return generateJobHash({
      title: job.jobTitle,
      organization: job.organizationName,
      endDate: job.applicationEndDate,
      vacancies: job.totalVacancies
    });
  }

  async findDuplicate(job: ProcessedJobData): Promise<string | null> {
    const hash = this.generateHash(job);

    try {
      const { data, error } = await this.supabase.client
        .from('jobs')
        .select('id, content_hash')
        .eq('content_hash', hash)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data ? data.id : null;

    } catch (error) {
      logger.error('Error checking for duplicate:', error);
      return null;
    }
  }

  async findSimilarJobs(job: ProcessedJobData): Promise<any[]> {
    try {
      const { data, error } = await this.supabase.client
        .from('jobs')
        .select('id, job_title, organization_name')
        .ilike('job_title', `%${job.jobTitle}%`)
        .eq('organization_name', job.organizationName)
        .limit(10);

      if (error) throw error;

      return data || [];

    } catch (error) {
      logger.error('Error finding similar jobs:', error);
      return [];
    }
  }

  async mergeDuplicates(
    existingId: string,
    newJob: ProcessedJobData
  ): Promise<void> {
    try {
      await this.supabase.updateJob(existingId, {
        updated_at: new Date().toISOString()
      } as any);

      logger.info(`Merged duplicate job: ${existingId}`);

    } catch (error) {
      logger.error('Error merging duplicates:', error);
      throw error;
    }
  }
}
