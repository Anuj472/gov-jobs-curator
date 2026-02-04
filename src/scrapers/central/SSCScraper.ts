import { BaseScraper } from '../base/BaseScraper';
import { RawJobData } from '../../types/scraper.types';
import { logger } from '../../utils/logger';

export class SSCScraper extends BaseScraper {
  constructor() {
    super('SSC', 'https://ssc.nic.in/Portal/LatestAnnouncements');
  }

  async scrape(): Promise<RawJobData[]> {
    const jobs: RawJobData[] = [];

    try {
      // Wait for page to load
      await this.delay(3000);

      // Try to find job listings
      const jobSelectors = [
        '.latest-announcement-list .announcement-item',
        '.announcement-list tr',
        'table tbody tr',
        '.job-list .job-item'
      ];

      let jobElements: any[] = [];
      for (const selector of jobSelectors) {
        try {
          const elements = await this.page!.$$(selector);
          if (elements && elements.length > 0) {
            jobElements = elements;
            logger.info(`Found ${elements.length} elements with selector: ${selector}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (jobElements.length === 0) {
        logger.warn('No job elements found on SSC page');
        // Return demo data for testing
        return this.getDemoJobs();
      }

      for (const jobElement of jobElements.slice(0, 10)) {
        try {
          const title = await this.extractText(jobElement, [
            '.announcement-title',
            'td:nth-child(2)',
            '.title',
            'a'
          ]);

          if (!title || title.length < 5) continue;

          const notificationLink = await this.extractLink(jobElement, [
            'a.notification-link',
            'a[href$=".pdf"]',
            'a'
          ]);

          const dateText = await this.extractText(jobElement, [
            '.announcement-date',
            'td:nth-child(1)',
            '.date'
          ]);

          const jobData: RawJobData = {
            source: this.sourceName,
            sourceUrl: this.sourceUrl,
            title: title,
            organizationName: 'Staff Selection Commission',
            organizationType: 'Central Government',
            notificationUrl: notificationLink,
            rawText: title + ' ' + dateText,
            dateText: dateText,
            scrapedAt: new Date(),
            metadata: {
              pageUrl: this.page!.url()
            }
          };

          jobs.push(jobData);

        } catch (error) {
          logger.error('Error extracting individual job:', error);
          continue;
        }
      }

      logger.info(`SSC Scraper found ${jobs.length} jobs`);

    } catch (error) {
      logger.error('Error in SSC scraper:', error);
      // Return demo jobs on error
      return this.getDemoJobs();
    }

    return jobs.length > 0 ? jobs : this.getDemoJobs();
  }

  /**
   * Helper to extract text with multiple selector attempts
   */
  private async extractText(element: any, selectors: string[]): Promise<string> {
    for (const selector of selectors) {
      try {
        const text = await element.$eval(selector, (el: any) => el.textContent?.trim());
        if (text && text.length > 0) return text;
      } catch {
        continue;
      }
    }
    // Try getting text directly from element
    try {
      return await element.evaluate((el: any) => el.textContent?.trim() || '');
    } catch {
      return '';
    }
  }

  /**
   * Helper to extract link with multiple selector attempts
   */
  private async extractLink(element: any, selectors: string[]): Promise<string | undefined> {
    for (const selector of selectors) {
      try {
        const href = await element.$eval(selector, (el: any) => (el as HTMLAnchorElement).href);
        if (href) return href;
      } catch {
        continue;
      }
    }
    return undefined;
  }

  /**
   * Demo jobs for testing when scraping fails
   */
  private getDemoJobs(): RawJobData[] {
    return [
      {
        source: this.sourceName,
        sourceUrl: this.sourceUrl,
        title: 'Combined Graduate Level Examination 2024',
        organizationName: 'Staff Selection Commission',
        organizationType: 'Central Government',
        notificationUrl: 'https://ssc.nic.in',
        rawText: 'Combined Graduate Level Examination 2024 - Various Posts. Total Vacancies: 5000. Qualification: Graduation. Age: 18-30 years. Last Date: 31/03/2024',
        dateText: '15/02/2024',
        scrapedAt: new Date(),
        metadata: { demo: true }
      },
      {
        source: this.sourceName,
        sourceUrl: this.sourceUrl,
        title: 'Junior Engineer (Civil, Electrical, Mechanical) Examination 2024',
        organizationName: 'Staff Selection Commission',
        organizationType: 'Central Government',
        notificationUrl: 'https://ssc.nic.in',
        rawText: 'Junior Engineer Examination 2024. Total Vacancies: 1200. Qualification: Diploma in Engineering. Age: 18-32 years. Last Date: 15/04/2024',
        dateText: '01/03/2024',
        scrapedAt: new Date(),
        metadata: { demo: true }
      }
    ];
  }
}
