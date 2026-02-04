import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('Missing Supabase credentials in environment variables');
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Test connection
export async function testConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('count')
      .limit(1);
    
    if (error) {
      logger.error('Database connection test failed:', error);
      return false;
    }
    
    logger.info('Database connection successful');
    return true;
  } catch (error) {
    logger.error('Database connection test failed:', error);
    return false;
  }
}
