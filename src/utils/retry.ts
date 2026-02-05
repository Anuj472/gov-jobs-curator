import { logger } from './logger';

export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    backoff?: boolean;
  } = {}
): Promise<T> {
  const { maxRetries = 3, delay = 1000, backoff = true } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      logger.warn(`Attempt ${attempt}/${maxRetries} failed:`, error);

      if (attempt < maxRetries) {
        const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError!;
}
