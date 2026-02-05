# Government Jobs Curator

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue)
![License](https://img.shields.io/badge/license-MIT-green.svg)

A comprehensive job curation and aggregation system to automatically collect government job postings from various sources across India and push them to Supabase database.

</div>

## ✨ Features

- 🔍 **Automated Web Scraping**: Extract jobs from multiple government portals
- 🗄️ **Database Integration**: Push jobs directly to Supabase
- 🔄 **Deduplication**: Smart duplicate detection and merging
- 📊 **Data Normalization**: Structured data extraction from unstructured sources
- ⏰ **Scheduled Execution**: Automated daily scraping with cron jobs
- 🎯 **Multi-Source Support**: SSC, UPSC, Railway, Banking, PSU, and more
- 🏷️ **SEO Optimized**: Auto-generated JSON-LD schemas and meta tags
- 📝 **Comprehensive Logging**: Track all operations with detailed logs

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│         Job Curator System                  │
├─────────────────────────────────────────────┤
│  Scrapers → Processors → Validators         │
│      ↓            ↓            ↓            │
│  Data Normalization Engine                  │
│      ↓                                       │
│  Deduplication & Matching                   │
│      ↓                                       │
│  Supabase Database Writer                   │
└─────────────────────────────────────────────┘
```

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Anuj472/gov-jobs-curator.git
cd gov-jobs-curator
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key-here
LOG_LEVEL=info
```

### 4. Set Up Supabase Database

Create a `jobs` table in your Supabase project:

```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  job_title TEXT NOT NULL,
  organization_name TEXT NOT NULL,
  organization_type TEXT,
  department TEXT,
  total_vacancies INTEGER DEFAULT 1,
  post_category TEXT,
  employment_type TEXT,
  position_level TEXT,
  location_state TEXT[],
  location_cities TEXT[],
  is_all_india BOOLEAN DEFAULT false,
  qualification_required TEXT[],
  min_qualification TEXT,
  max_qualification TEXT,
  min_age INTEGER,
  max_age INTEGER,
  age_relaxation JSONB,
  experience_required TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  pay_level TEXT,
  application_mode TEXT,
  application_fee_general INTEGER,
  application_fee_obc INTEGER,
  application_fee_sc_st INTEGER,
  application_fee_pwd INTEGER,
  notification_date TIMESTAMP,
  application_start_date TIMESTAMP,
  application_end_date TIMESTAMP,
  exam_date TIMESTAMP,
  official_notification_url TEXT,
  apply_link TEXT,
  official_website TEXT,
  job_description TEXT,
  selection_process TEXT,
  exam_pattern TEXT,
  important_instructions TEXT,
  required_skills TEXT,
  job_benefits TEXT,
  json_ld_schema JSONB,
  meta_title TEXT,
  meta_description TEXT,
  content_hash TEXT,
  status TEXT DEFAULT 'active',
  source TEXT,
  source_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  application_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_jobs_content_hash ON jobs(content_hash);
CREATE INDEX idx_jobs_application_end_date ON jobs(application_end_date);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_organization ON jobs(organization_name);
CREATE INDEX idx_jobs_is_active ON jobs(is_active);
```

### 5. Run the Application

#### Development Mode (with auto-restart)

```bash
npm run dev
```

#### Production Mode

```bash
npm run build
npm start
```

#### Run Scrapers Immediately

```bash
# Run all scrapers once
node dist/index.js --run-now

# Run specific scraper
node dist/index.js --run-now --scraper=SSC
```

## 📜 Available Scripts

```bash
# Development
npm run dev              # Run in development mode with auto-reload

# Build
npm run build            # Compile TypeScript to JavaScript

# Production
npm start                # Run compiled code

# Testing
npm test                 # Run tests
npm run test:scraper     # Test specific scraper

# Scrapers
npm run scrape:ssc       # Run SSC scraper manually
npm run scrape:upsc      # Run UPSC scraper manually

# Maintenance
npm run clean:expired    # Mark expired jobs as inactive
```

## 🗂️ Project Structure

```
gov-jobs-curator/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.ts
│   │   └── constants.ts
│   │
│   ├── scrapers/            # Website scrapers
│   │   ├── base/
│   │   │   └── BaseScraper.ts
│   │   └── central/
│   │       ├── SSCScraper.ts
│   │       └── UPSCScraper.ts
│   │
│   ├── processors/          # Data processing
│   │   ├── DataNormalizer.ts
│   │   ├── DateParser.ts
│   │   ├── SalaryParser.ts
│   │   ├── LocationParser.ts
│   │   └── QualificationMapper.ts
│   │
│   ├── services/            # Business logic
│   │   ├── SupabaseService.ts
│   │   ├── DeduplicationService.ts
│   │   └── SchemaGenerator.ts
│   │
│   ├── jobs/                # Scheduled jobs
│   │   └── ScraperJob.ts
│   │
│   ├── types/               # TypeScript types
│   │   └── scraper.types.ts
│   │
│   ├── utils/               # Utility functions
│   │   ├── logger.ts
│   │   ├── retry.ts
│   │   ├── helpers.ts
│   │   └── hash.ts
│   │
│   └── index.ts             # Entry point
│
├── scripts/                 # Utility scripts
│   ├── run-scraper.ts
│   ├── test-scraper.ts
│   └── clean-expired.ts
│
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🔧 Configuration

### Scraper Schedule

By default, scrapers run at these times (configured in `src/jobs/ScraperJob.ts`):

- **SSC Scraper**: Daily at 9:00 AM
- **UPSC Scraper**: Daily at 10:00 AM
- **Cleanup Job**: Daily at 12:00 AM (marks expired jobs)

Modify the cron schedule as needed:

```typescript
// Run SSC scraper every 6 hours
cron.schedule('0 */6 * * *', async () => {
  await this.runScraper('SSC');
});
```

## 📊 Supported Data Sources

### Currently Implemented
- ✅ SSC (Staff Selection Commission)
- ✅ UPSC (Union Public Service Commission)

### Planned
- ⏳ Railway Recruitment Boards
- ⏳ Banking Services (IBPS, SBI)
- ⏳ State PSCs
- ⏳ Defense Recruitment
- ⏳ PSU Jobs

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Using Docker

```bash
# Build image
docker build -t gov-jobs-curator .

# Run container
docker run -d \
  -e SUPABASE_URL=your-url \
  -e SUPABASE_SERVICE_KEY=your-key \
  --name job-curator \
  gov-jobs-curator
```

## 🔍 How It Works

1. **Scraping**: Scrapers extract job data from government websites using Puppeteer
2. **Normalization**: Raw data is processed and normalized into structured format
3. **Validation**: Data is validated against schema and business rules
4. **Deduplication**: Content hash is generated to detect and merge duplicates
5. **Storage**: Jobs are inserted into Supabase with SEO metadata
6. **Scheduling**: Cron jobs run scrapers automatically at specified times

## 🛡️ Error Handling

- **Retry Logic**: Failed scraping attempts are retried with exponential backoff
- **Graceful Degradation**: Individual job failures don't stop the entire process
- **Comprehensive Logging**: All errors are logged with context
- **Health Checks**: Monitor system status

## 📝 Logging

Logs are output to:
- Console (with colors in development)
- File: `./logs/curator.log`

Log levels: `error`, `warn`, `info`, `debug`

Change log level in `.env`:
```env
LOG_LEVEL=debug
```

## 🧪 Testing

```bash
# Test a specific scraper
npm run test:scraper

# Test data normalization
ts-node scripts/test-scraper.ts
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Anuj Kumar Mishra**
- GitHub: [@Anuj472](https://github.com/Anuj472)

## 🙏 Acknowledgments

- Government of India job portals for providing public job data
- Supabase for excellent database services
- Puppeteer team for powerful web scraping tools

## 📞 Support

If you have any questions or issues, please:
- Open an issue on GitHub
- Check existing issues for solutions

---

<div align="center">

Made with ❤️ for Indian job seekers

</div>
