import { BaseScraper } from '../base/BaseScraper';
import { RawJobData } from '../../types/scraper.types';
import { logger } from '../../utils/logger';

export class UPSCScraper extends BaseScraper {
  constructor() {
    super('UPSC', 'https://upsc.gov.in/recruitment');
  }

  async scrape(): Promise<RawJobData[]> {
    const jobs: RawJobData[] = [];

    try {
      await this.delay(2000);
      
      const jobElements = await this.page!.$$('.view-content .views-row, table tbody tr');

      for (const jobElement of jobElements) {
        try {
          const title = await jobElement.$eval(
            '.views-field-title a, td:first-child a, h3 a',
            el => el.textContent?.trim() || ''
          ).catch(() => '');

          if (!title) continue;

          const notificationLink = await jobElement.$eval(
            'a',
            el => (el as HTMLAnchorElement).href
          ).catch(() => '');

          const dateText = await jobElement.$eval(
            '.views-field-created, td:nth-child(2)',
            el => el.textContent?.trim() || ''
          ).catch(() => '');

          const jobData: RawJobData = {
            source: this.sourceName,
            sourceUrl: this.sourceUrl,
            title: title,
            organizationName: 'Union Public Service Commission',
            organizationType: 'Central Government',
            notificationUrl: notificationLink,
            rawText: title,
            dateText: dateText,
            scrapedAt: new Date(),
            metadata: {
              pageUrl: this.page!.url()
            }
          };

          jobs.push(jobData);

        } catch (error) {
          logger.error('Error extracting UPSC job:', error);
          continue;
        }
      }

      logger.info(`UPSC Scraper found ${jobs.length} jobs`);

    } catch (error) {
      logger.error('Error in UPSC scraper:', error);
    }

    return jobs;
  }
}
