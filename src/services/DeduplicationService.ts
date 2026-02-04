import { ProcessedJobData } from '../types/scraper.types';
import { SupabaseService } from './SupabaseService';
import { logger } from '../utils/logger';
import { generateContentHash } from '../utils/hash';

export class DeduplicationService {
  private supabase: SupabaseService;

  constructor(supabaseService: SupabaseService) {
    this.supabase = supabaseService;
  }

  /**
   * Generate content hash for deduplication
   */
  generateHash(job: ProcessedJobData): string {
    return generateContentHash([
      job.jobTitle,
      job.organizationName,
      job.applicationEndDate?.toISOString() || '',
      job.totalVacancies.toString()
    ]);
  }

  /**
   * Check if job already exists
   */
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

  /**
   * Find similar jobs using fuzzy matching
   */
  async findSimilarJobs(job: ProcessedJobData, threshold = 0.7): Promise<any[]> {
    try {
      const { data, error } = await this.supabase.client
        .rpc('find_similar_jobs', {
          job_title: job.jobTitle,
          org_name: job.organizationName,
          threshold
        });

      if (error) {
        logger.warn('Similar jobs function not available:', error.message);
        return [];
      }

      return data || [];

    } catch (error) {
      logger.error('Error finding similar jobs:', error);
      return [];
    }
  }

  /**
   * Merge duplicate jobs
   */
  async mergeDuplicates(
    existingId: string,
    newJob: ProcessedJobData
  ): Promise<void> {
    try {
      await this.supabase.updateJob(existingId, {
        updatedAt: new Date()
      });

      logger.info(`Merged duplicate job: ${existingId}`);

    } catch (error) {
      logger.error('Error merging duplicates:', error);
      throw error;
    }
  }
}
