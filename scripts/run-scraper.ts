import dotenv from 'dotenv';
import { ScraperJob } from '../src/jobs/ScraperJob';
import { logger } from '../src/utils/logger';

dotenv.config();

async function main() {
  const scraper = process.argv[2] || 'SSC';
  
  logger.info(`Running ${scraper} scraper...`);
  
  const scraperJob = new ScraperJob();
  await scraperJob.runScraper(scraper);
  
  logger.info('Done!');
}

main().catch(error => {
  logger.error('Error:', error);
  process.exit(1);
});
