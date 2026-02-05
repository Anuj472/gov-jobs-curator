import crypto from 'crypto';

export function generateHash(data: string): string {
  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex');
}

export function generateJobHash(jobData: {
  title: string;
  organization: string;
  endDate?: Date;
  vacancies: number;
}): string {
  const contentString = [
    jobData.title,
    jobData.organization,
    jobData.endDate?.toISOString() || '',
    jobData.vacancies
  ].join('|');

  return generateHash(contentString);
}
