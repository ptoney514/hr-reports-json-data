# HR Reports Database (Neon Postgres)

This directory contains the database schema, migrations, seeds, and documentation for the HR Reports Neon Postgres database.

## Quick Start

### 1. Set Up Neon Database

1. Create a Neon project at https://console.neon.tech/
2. Create a database named `hr_reports`
3. Copy the connection string

### 2. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your DATABASE_URL
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/hr_reports?sslmode=require
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Migrations

```bash
# Run all migrations and seeds
npm run db:migrate

# Fresh install (drop and recreate all tables)
npm run db:migrate:fresh

# Only run seeds
npm run db:seed
```

### 5. Load Data

```bash
# Load workforce data from Excel
npm run etl:workforce -- --input source-metrics/workforce/raw/file.xlsx --quarter FY25_Q2

# Load demographics from Excel (gender, ethnicity, age bands for benefit-eligible)
npm run etl:demographics -- --date 2025-06-30

# Export demographics from Neon to JSON
npm run etl:demographics:export -- --date 2025-06-30

# Load terminations from Excel
npm run etl:terminations -- --input source-metrics/terminations/raw/file.xlsx --fiscal-year 2025

# Load exit surveys from JSON
npm run etl:exit-surveys -- --from-json --file data.json --quarter FY25_Q2

# Load internal mobility
npm run etl:mobility -- --from-json --file mobility.json --quarter FY25_Q2
```

## Database Schema

### Dimension Tables (Reference Data)

| Table | Description |
|-------|-------------|
| `dim_assignment_categories` | Assignment codes (F12, PT12, SUE, etc.) |
| `dim_schools` | Schools and VP areas |
| `dim_departments` | Departments within schools |
| `dim_term_reasons` | Termination reason codes |
| `dim_fiscal_periods` | Fiscal year/quarter reference |

### Fact Tables (Transactional Data)

| Table | Description |
|-------|-------------|
| `fact_workforce_snapshots` | Point-in-time headcount by period/location/school/category |
| `fact_workforce_demographics` | Demographics (gender, ethnicity, age bands) for benefit-eligible employees |
| `fact_terminations` | Individual termination records |
| `fact_exit_surveys` | Exit survey responses |
| `fact_mobility_events` | Promotions, transfers, demotions |
| `audit_data_loads` | ETL audit trail |

### Views (For API Consumption)

| View | Replaces |
|------|----------|
| `v_workforce_summary` | `getWorkforceData(date)` |
| `v_workforce_demographics` | `getDemographicsData(date)` |
| `v_demographics_gender` | Gender breakdown pivot |
| `v_demographics_age_bands` | Age bands breakdown pivot |
| `v_demographics_totals` | Validation totals |
| `v_turnover_summary` | `getTurnoverData(date)` |
| `v_turnover_rates` | `getAnnualTurnoverRatesByCategory()` |
| `v_exit_survey_metrics` | `getExitSurveyData(date)` |
| `v_school_org_headcount` | `getTop15SchoolOrgData(date)` |
| `v_mobility_summary` | Internal mobility metrics |

## Directory Structure

```
database/
├── migrations/           # SQL migration files (run in order)
│   ├── 001_create_dimension_tables.sql
│   ├── 002_create_fact_tables.sql
│   ├── 003_create_views.sql
│   └── 004_create_demographics_tables.sql
├── seeds/               # Reference data inserts
│   ├── 001_seed_assignment_categories.sql
│   ├── 002_seed_schools.sql
│   ├── 003_seed_term_reasons.sql
│   └── 004_seed_fiscal_periods.sql
└── README.md            # This file
```

## API Endpoints

Once the API is deployed to Vercel, these endpoints are available:

| Endpoint | Description |
|----------|-------------|
| `GET /api/workforce/:date` | Workforce summary (headcount by category/location) |
| `GET /api/demographics/:date` | Demographics (gender, ethnicity, age bands) |
| `GET /api/turnover/:date` | Turnover summary |
| `GET /api/turnover-rates` | Annual turnover rates |
| `GET /api/exit-surveys/:date` | Exit survey metrics |
| `GET /api/schools/:date` | School headcount |
| `GET /api/mobility/:date` | Internal mobility |
| `GET /api/health` | Health check |

## Neon-Specific Features

### Database Branching

Neon supports database branching for safe testing:

```bash
# Create a dev branch in Neon console
# Use the dev branch connection string for testing migrations
```

### Connection Pooling

The `@neondatabase/serverless` driver handles connection pooling automatically for serverless environments.

### Cold Starts

Free tier has ~500ms cold start. For production, consider:
- Paid tier for faster cold starts
- Connection warming strategies

## Troubleshooting

### Connection Issues

```bash
# Test connection
node -e "require('dotenv').config(); const {neon}=require('@neondatabase/serverless'); const sql=neon(process.env.DATABASE_URL); sql\`SELECT 1\`.then(console.log).catch(console.error)"
```

### Migration Errors

If migrations fail with "already exists" errors, either:
- Run `npm run db:migrate:fresh` to start fresh
- Manually drop the conflicting object in Neon console

### ETL Validation

After loading data, verify counts:

```sql
-- Check FY25 terminations (should be 222)
SELECT COUNT(*) FROM fact_terminations WHERE period_date = '2025-06-30';

-- Check workforce by period
SELECT period_date, SUM(headcount) as total
FROM fact_workforce_snapshots
GROUP BY period_date
ORDER BY period_date;

-- Check demographics (FY25 Q4: Faculty=689, Staff=1448)
SELECT category_type, demographic_type, COUNT(*) as values, SUM(count) as total
FROM fact_workforce_demographics
WHERE period_date = '2025-06-30' AND location = 'combined'
GROUP BY category_type, demographic_type
ORDER BY category_type, demographic_type;
```

## Data Flow

```
Excel (source-metrics/)
    │
    ▼
ETL Scripts (scripts/etl/)
    │  - Remove PII
    │  - Categorize/Aggregate
    │  - workforce-to-postgres.js     → fact_workforce_snapshots
    │  - demographics-to-postgres.js  → fact_workforce_demographics
    │  - terminations-to-postgres.js  → fact_terminations
    │  - exit-surveys-to-postgres.js  → fact_exit_surveys
    ▼
Neon Postgres
    │
    ├─► JSON Export (etl:demographics:export)
    │       → src/data/workforce-demographics.json
    │
    ▼
REST API (api/)
    │  /api/workforce/:date     → v_workforce_summary
    │  /api/demographics/:date  → v_workforce_demographics
    │  /api/turnover/:date      → v_turnover_summary
    ▼
React Dashboard (localhost:3000)
```

## Security

- PII is removed/hashed before loading to database
- Employee IDs are SHA-256 hashed (first 12 chars)
- No free-text comments stored (only boolean flags)
- Neon handles encryption at rest and in transit
- Connection requires SSL (`sslmode=require`)
