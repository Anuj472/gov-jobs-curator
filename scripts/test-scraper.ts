import dotenv from 'dotenv';
import { SSCScraper } from '../src/scrapers/central/SSCScraper';
import { DataNormalizer } from '../src/processors/DataNormalizer';
import { logger } from '../src/utils/logger';

dotenv.config();

async function testScraper() {
  logger.info('Testing SSC Scraper...');
  
  const scraper = new SSCScraper();
  const normalizer = new DataNormalizer();

  const rawJobs = await scraper.execute();
  
  logger.info(`Scraped ${rawJobs.length} jobs`);

  if (rawJobs.length > 0) {
    const processed = await normalizer.normalize(rawJobs[0]);
    logger.info('Sample processed job:');
    console.log(JSON.stringify(processed, null, 2));
  }
}

testScraper().catch(error => {
  logger.error('Error:', error);
  process.exit(1);
});
