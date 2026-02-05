import dotenv from 'dotenv';
import { ScraperJob } from './jobs/ScraperJob';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

async function main() {
  try {
    logger.info('='.repeat(60));
    logger.info('Government Jobs Curator System');
    logger.info('Version: 1.0.0');
    logger.info('='.repeat(60));

    // Validate environment variables
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      throw new Error('Missing required environment variables. Please check .env file');
    }

    // Initialize scraper jobs
    const scraperJob = new ScraperJob();

    // Check if we should run immediately
    const runNow = process.argv.includes('--run-now');
    const scraper = process.argv.find(arg => arg.startsWith('--scraper='))?.split('=')[1];

    if (runNow) {
      if (scraper) {
        logger.info(`Running ${scraper} scraper immediately...`);
        await scraperJob.runScraper(scraper);
      } else {
        logger.info('Running all scrapers immediately...');
        await scraperJob.runAllScrapers();
      }
      logger.info('Immediate run completed. Exiting.');
      process.exit(0);
    } else {
      // Schedule jobs
      scraperJob.schedule();
      logger.info('Job Curator System is running');
      logger.info('Press Ctrl+C to exit');
    }

  } catch (error) {
    logger.error('Fatal error:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Received SIGINT. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM. Shutting down gracefully...');
  process.exit(0);
});

// Run main function
main().catch(error => {
  logger.error('Unhandled error:', error);
  process.exit(1);
});
