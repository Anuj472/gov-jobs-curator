import { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer';
import { logger } from '../../utils/logger';
import { RawJobData } from '../../types/scraper.types';
import { SCRAPER_CONFIG } from '../../config/constants';

export abstract class BaseScraper {
  protected browser?: Browser;
  protected page?: Page;
  protected sourceName: string;
  protected sourceUrl: string;

  constructor(sourceName: string, sourceUrl: string) {
    this.sourceName = sourceName;
    this.sourceUrl = sourceUrl;
  }

  async initialize(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    await this.page.setUserAgent(SCRAPER_CONFIG.userAgent);
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    logger.info(`Initialized scraper for ${this.sourceName}`);
  }

  async navigate(url?: string): Promise<void> {
    if (!this.page) {
      throw new Error('Page not initialized');
    }
    
    const targetUrl = url || this.sourceUrl;
    await this.page.goto(targetUrl, {
      waitUntil: 'networkidle2',
      timeout: SCRAPER_CONFIG.timeout
    });
    
    logger.info(`Navigated to ${targetUrl}`);
  }

  abstract scrape(): Promise<RawJobData[]>;

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      logger.info(`Closed browser for ${this.sourceName}`);
    }
  }

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

  protected async waitForSelector(selector: string, timeout = 10000): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    await this.page.waitForSelector(selector, { timeout });
  }

  protected async click(selector: string): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    await this.page.click(selector);
  }

  protected async getText(selector: string): Promise<string> {
    if (!this.page) throw new Error('Page not initialized');
    return await this.page.$eval(selector, el => el.textContent?.trim() || '');
  }

  protected async getTexts(selector: string): Promise<string[]> {
    if (!this.page) throw new Error('Page not initialized');
    return await this.page.$$eval(
      selector,
      elements => elements.map(el => el.textContent?.trim() || '')
    );
  }

  protected async getLinks(selector: string): Promise<string[]> {
    if (!this.page) throw new Error('Page not initialized');
    return await this.page.$$eval(
      selector,
      elements => elements.map(el => (el as HTMLAnchorElement).href)
    );
  }

  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
