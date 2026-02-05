import cron from 'node-cron';
import { SSCScraper, UPSCScraper } from '../scrapers/central';
import { DataNormalizer } from '../processors/DataNormalizer';
import { DeduplicationService } from '../services/DeduplicationService';
import { SupabaseService } from '../services/SupabaseService';
import { logger } from '../utils/logger';
import { retry } from '../utils/retry';

export class ScraperJob {
  private supabase: SupabaseService;
  private normalizer: DataNormalizer;
  private deduplication: DeduplicationService;

  constructor() {
    this.supabase = new SupabaseService();
    this.normalizer = new DataNormalizer();
    this.deduplication = new DeduplicationService(this.supabase);
  }

  schedule(): void {
    // Run SSC scraper every day at 9 AM
    cron.schedule('0 9 * * *', async () => {
      logger.info('Running SSC scraper (scheduled)');
      await this.runScraper('SSC');
    });

    // Run UPSC scraper every day at 10 AM
    cron.schedule('0 10 * * *', async () => {
      logger.info('Running UPSC scraper (scheduled)');
      await this.runScraper('UPSC');
    });

    // Mark expired jobs daily at midnight
    cron.schedule('0 0 * * *', async () => {
      logger.info('Marking expired jobs');
      await this.supabase.markExpiredJobs();
    });

    logger.info('Scraper jobs scheduled successfully');
    logger.info('SSC scraper: Daily at 9:00 AM');
    logger.info('UPSC scraper: Daily at 10:00 AM');
    logger.info('Cleanup job: Daily at 12:00 AM');
  }

  async runScraper(source: string): Promise<void> {
    try {
      logger.info(`Starting scraper: ${source}`);
      
      let scraper;

      switch (source) {
        case 'SSC':
          scraper = new SSCScraper();
          break;
        case 'UPSC':
          scraper = new UPSCScraper();
          break;
        default:
          throw new Error(`Unknown scraper: ${source}`);
      }

      // Execute scraper with retry logic
      const rawJobs = await retry(
        () => scraper.execute(),
        { maxRetries: 3, delay: 2000 }
      );

      logger.info(`Scraped ${rawJobs.length} jobs from ${source}`);

      let insertedCount = 0;
      let duplicateCount = 0;

      // Process each job
      for (const rawJob of rawJobs) {
        try {
          // Normalize data
          const processedJob = await this.normalizer.normalize(rawJob);

          // Generate hash
          const hash = this.deduplication.generateHash(processedJob);
          processedJob.contentHash = hash;

          // Check for duplicates
          const duplicateId = await this.deduplication.findDuplicate(processedJob);

          if (duplicateId) {
            logger.info(`Duplicate found: ${duplicateId}`);
            await this.deduplication.mergeDuplicates(duplicateId, processedJob);
            duplicateCount++;
          } else {
            // Insert new job
            const inserted = await this.supabase.insertJob(processedJob);
            if (inserted) {
              insertedCount++;
            }
          }
        } catch (error) {
          logger.error('Error processing individual job:', error);
          continue;
        }
      }

      logger.info(`Scraper ${source} completed: ${insertedCount} inserted, ${duplicateCount} duplicates`);

    } catch (error) {
      logger.error(`Error in scraper ${source}:`, error);
      throw error;
    }
  }

  async runAllScrapers(): Promise<void> {
    const scrapers = ['SSC', 'UPSC'];
    
    for (const scraper of scrapers) {
      try {
        await this.runScraper(scraper);
      } catch (error) {
        logger.error(`Failed to run ${scraper}:`, error);
      }
    }
  }
}
