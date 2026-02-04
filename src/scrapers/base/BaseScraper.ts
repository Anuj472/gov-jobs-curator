import { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer';
import { logger } from '../../utils/logger';
import { RawJobData } from '../../types/scraper.types';

export abstract class BaseScraper {
  protected browser?: Browser;
  protected page?: Page;
  protected sourceName: string;
  protected sourceUrl: string;

  constructor(sourceName: string, sourceUrl: string) {
    this.sourceName = sourceName;
    this.sourceUrl = sourceUrl;
  }

  /**
   * Initialize browser and page
   */
  async initialize(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
    this.page = await this.browser.newPage();
    
    // Set user agent to avoid detection
    await this.page.setUserAgent(
      process.env.USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    );
    
    // Set viewport
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    logger.info(`Initialized scraper for ${this.sourceName}`);
  }

  /**
   * Navigate to the target URL
   */
  async navigate(url?: string): Promise<void> {
    if (!this.page) {
      throw new Error('Page not initialized');
    }
    
    const targetUrl = url || this.sourceUrl;
    await this.page.goto(targetUrl, {
      waitUntil: 'networkidle2',
      timeout: parseInt(process.env.REQUEST_TIMEOUT || '30000')
    });
    
    logger.info(`Navigated to ${targetUrl}`);
  }

  /**
   * Abstract method - must be implemented by child classes
   * This is where the actual scraping logic goes
   */
  abstract scrape(): Promise<RawJobData[]>;

  /**
   * Clean up browser resources
   */
  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      logger.info(`Closed browser for ${this.sourceName}`);
    }
  }

  /**
   * Main execution method
   */
  async execute(): Promise<RawJobData[]> {
    try {
      await this.initialize();
      await this.navigate();
      const jobs = await this.scrape();
      
      logger.info(`Scraped ${jobs.length} jobs from ${this.sourceName}`);
      
      return jobs;
    } catch (error) {
      logger.error(`Error in ${this.sourceName} scraper:`, error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Utility: Wait for element
   */
  protected async waitForSelector(
    selector: string,
    timeout = 10000
  ): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    await this.page.waitForSelector(selector, { timeout });
  }

  /**
   * Utility: Click element
   */
  protected async click(selector: string): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    await this.page.click(selector);
  }

  /**
   * Utility: Get text content
   */
  protected async getText(selector: string): Promise<string> {
    if (!this.page) throw new Error('Page not initialized');
    return await this.page.$eval(selector, el => el.textContent?.trim() || '');
  }

  /**
   * Utility: Get multiple elements text
   */
  protected async getTexts(selector: string): Promise<string[]> {
    if (!this.page) throw new Error('Page not initialized');
    return await this.page.$$eval(
      selector,
      elements => elements.map(el => el.textContent?.trim() || '')
    );
  }

  /**
   * Utility: Extract links
   */
  protected async getLinks(selector: string): Promise<string[]> {
    if (!this.page) throw new Error('Page not initialized');
    return await this.page.$$eval(
      selector,
      elements => elements.map(el => (el as HTMLAnchorElement).href)
    );
  }

  /**
   * Utility: Type into input
   */
  protected async type(selector: string, text: string): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    await this.page.type(selector, text);
  }

  /**
   * Utility: Handle pagination
   */
  protected async paginate(
    nextButtonSelector: string,
    maxPages = 10
  ): Promise<void> {
    let currentPage = 1;
    
    while (currentPage < maxPages) {
      try {
        const hasNext = await this.page!.$(nextButtonSelector);
        if (!hasNext) break;
        
        await this.click(nextButtonSelector);
        await this.page!.waitForNavigation({ waitUntil: 'networkidle2' });
        currentPage++;
        
        // Add delay to avoid rate limiting
        await this.delay(2000);
      } catch (error) {
        logger.warn(`Pagination stopped at page ${currentPage}`);
        break;
      }
    }
  }

  /**
   * Utility: Delay execution
   */
  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
