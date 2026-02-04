import pdfParse from 'pdf-parse';
import axios from 'axios';
import { logger } from '../utils/logger';

export class PDFProcessor {
  /**
   * Download and parse PDF
   */
  async processPDF(url: string): Promise<string> {
    try {
      logger.info(`Downloading PDF from: ${url}`);

      // Download PDF
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000
      });

      const buffer = Buffer.from(response.data);

      // Parse PDF
      const data = await pdfParse(buffer);

      logger.info(`Parsed PDF: ${data.numpages} pages, ${data.text.length} characters`);

      return data.text;

    } catch (error) {
      logger.error('Error processing PDF:', error);
      throw error;
    }
  }

  /**
   * Extract structured data from PDF text
   */
  extractStructuredData(text: string): Record<string, string> {
    const patterns = {
      postName: /Post\s*Name\s*:?\s*(.+)/i,
      vacancies: /Total\s*Vacancies?\s*:?\s*(\d+)/i,
      qualification: /(?:Educational\s*)?Qualification\s*:?\s*(.+)/i,
      age: /Age\s*Limit\s*:?\s*(.+)/i,
      lastDate: /Last\s*Date.*?:?\s*([\d\/-]+)/i,
      applicationFee: /(?:Application\s*)?Fee\s*:?\s*(.+)/i
    };

    const extracted: Record<string, string> = {};

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = text.match(pattern);
      if (match && match[1]) {
        extracted[key] = match[1].trim();
      }
    }

    return extracted;
  }
}
