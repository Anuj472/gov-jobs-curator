import dotenv from 'dotenv';
import { SupabaseService } from '../src/services/SupabaseService';
import { logger } from '../src/utils/logger';

dotenv.config();

async function cleanExpiredJobs() {
  logger.info('Cleaning expired jobs...');
  
  const supabase = new SupabaseService();
  const count = await supabase.markExpiredJobs();
  
  logger.info(`Marked ${count} jobs as expired`);
}

cleanExpiredJobs().catch(error => {
  logger.error('Error:', error);
  process.exit(1);
});
