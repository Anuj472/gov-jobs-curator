import { ScraperConfig } from '../types';

export const SCRAPER_SOURCES: ScraperConfig[] = [
  {
    name: 'SSC',
    url: 'https://ssc.nic.in/Portal/LatestAnnouncements',
    enabled: true,
    schedule: '0 9 * * *', // 9 AM daily
    priority: 1
  },
  {
    name: 'UPSC',
    url: 'https://upsc.gov.in/recruitment',
    enabled: true,
    schedule: '0 10 * * *', // 10 AM daily
    priority: 1
  },
  {
    name: 'Railway',
    url: 'https://indianrailways.gov.in/railwayboard/view_section.jsp?lang=0&id=0,1,304,366,554,1778',
    enabled: true,
    schedule: '0 11 * * *', // 11 AM daily
    priority: 2
  },
  {
    name: 'IBPS',
    url: 'https://ibps.in/',
    enabled: true,
    schedule: '0 12 * * *', // 12 PM daily
    priority: 2
  },
  // Add more sources as needed
];
