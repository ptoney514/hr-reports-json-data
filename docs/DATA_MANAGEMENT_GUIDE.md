# Data Management Guide

## Overview
This guide ensures data consistency between turnover metrics and exit survey data across the HR Reports application.

## Data Flow Architecture

### Local JSON Flow (Legacy)
```
Source Excel/CSV → processTurnoverData.js → fy25TurnoverData.json → syncTurnoverToStaticData.js → staticData.js
                                                ↓
                                        Dashboard Components
```

### Turnover Metrics ETL Flow (Current)
```
Turnover_Metrics_Master.xlsx → turnover-metrics-to-postgres.js → Neon PostgreSQL
                                                                       ↓
                                                              API (/api/turnover-metrics)
                                                                       ↓
                                                              Dashboard Components
                                                                       ↓ (fallback)
                                                              staticData.js (TURNOVER_METRICS)
```

---

## Turnover Metrics ETL Pipeline

The Turnover Dashboard uses a dedicated ETL pipeline that loads metrics from an Excel template to Neon PostgreSQL.

### Source File
- **Location**: `source-metrics/turnover/Turnover_Metrics_Master.xlsx`
- **Sheets**: 15 sheets containing all turnover metrics
- **Data**: Summary rates, deviation charts, retirement analysis, length of service

### Excel Template Sheets

| Sheet | Purpose | Rows |
|-------|---------|------|
| Summary_Rates | Dashboard summary cards (Total, Faculty, Staff Exempt, Staff Non-Exempt) | 4 |
| Turnover_Rates_Table | FY23-FY25 rates by category with Higher Ed benchmarks | 12 |
| Higher_Ed_Averages | CUPA benchmark data by fiscal year | 12 |
| Turnover_Breakdown | Voluntary/Involuntary/Retirement by category | 3 |
| Staff_Deviation | 33 departments with turnover rates | 33 |
| Faculty_Deviation | 9 schools with turnover rates | 9 |
| Historical_Rates | FY22-FY25 total turnover rates | 4 |
| Length_of_Service | Tenure band breakdown (Faculty & Staff) | 10 |
| Retirements_by_FY | FY18-FY25 retirement counts by category | 8 |
| Faculty_Retirement_Trends | Average age/LOS by year (2019-2025) | 7 |
| Faculty_Age_Distribution | Retirement age categories | 5 |
| Faculty_Retirement_School | Retirements by school | 7 |
| Staff_Retirement_Trends | Average age/LOS by year (2019-2025) | 7 |
| Staff_Age_Distribution | Retirement age categories | 5 |
| Metadata | Fiscal year, version, notes | ~6 |

### ETL Commands

```bash
# Load turnover metrics to PostgreSQL
npm run etl:turnover

# Dry run (preview without database writes)
npm run etl:turnover -- --dry-run

# Specify custom input file
npm run etl:turnover -- --input path/to/file.xlsx

# Generate Excel template (if starting fresh)
npm run etl:turnover:generate
```

### Database Tables

The ETL populates these Neon PostgreSQL tables:

| Table | Purpose |
|-------|---------|
| `fact_turnover_summary_rates` | Summary card metrics |
| `fact_turnover_breakdown` | Voluntary/Involuntary/Retirement |
| `fact_staff_turnover_deviation` | Department-level staff turnover |
| `fact_faculty_turnover_deviation` | School-level faculty turnover |
| `fact_turnover_length_of_service` | Tenure band breakdown |
| `fact_historical_turnover_rates` | Multi-year trend data |
| `fact_retirements_by_fy` | Annual retirement counts |
| `fact_retirement_trends` | Faculty/Staff retirement trends |
| `fact_retirement_age_distribution` | Age category distribution |
| `fact_faculty_retirement_by_school` | School-level retirements |
| `fact_higher_ed_benchmarks` | CUPA benchmark data |

### API Endpoint

```bash
# Fetch turnover metrics from Neon
GET /api/turnover-metrics/FY2025

# Start local API server
npm run api:dev
```

### Validation Dashboard

Access the Turnover Test Dashboard at `/turnover-test` to:
- Compare JSON data vs Neon database data
- Verify all 80+ metrics match before cutover
- Export validation results as JSON

### Workflow: Updating Turnover Metrics

1. **Update Excel template**: Edit `source-metrics/turnover/Turnover_Metrics_Master.xlsx`
2. **Run ETL**: `npm run etl:turnover`
3. **Verify data**: Visit `/turnover-test` in the app
4. **Check dashboard**: Confirm values display correctly

### Fallback Behavior

If the API is unavailable, dashboard components automatically fall back to `staticData.js`:
- **Data service**: `getTurnoverMetrics()` returns static data when API fails
- **Static data location**: `src/data/staticData.js` → `TURNOVER_METRICS` constant

---

## Quick Commands

### Complete Data Update Workflow
```bash
npm run data:update
```
This runs all three steps automatically:
1. Process turnover data
2. Sync to static data  
3. Validate consistency

### Individual Commands
```bash
npm run data:process    # Process Excel turnover data
npm run data:sync       # Sync turnover to static data
npm run data:validate   # Validate data consistency
```

## Data Sources

### Primary Source: `fy25TurnoverData.json`
- **Location**: `/src/data/fy25TurnoverData.json`
- **Source**: Generated from Excel termination reports
- **Contains**: Quarterly termination counts, demographics, reasons
- **Authority**: Single source of truth for turnover metrics

### Exit Survey Data: `staticData.js`
- **Location**: `/src/data/staticData.js`
- **Contains**: Exit survey responses, satisfaction ratings
- **Syncs with**: Turnover data for accurate response rates

## Validation Points

The validation script checks:
- Q4 FY25 total exits match between sources
- Response rate calculations are accurate
- No hardcoded values in components
- Percentage calculations are consistent

## Current FY25 Metrics (Validated)

| Quarter | Exits | Faculty | Staff | Survey Responses | Response Rate |
|---------|-------|---------|-------|------------------|---------------|
| Q1 FY25 | 79    | 5       | 74    | 20               | 25.3%         |
| Q2 FY25 | 36    | 3       | 33    | 11               | 30.6%         |
| Q3 FY25 | 52    | 9       | 43    | 20               | 38.5%         |
| Q4 FY25 | 51    | 15      | 36    | 18               | 35.3%         |
| **Total** | **222** | **32** | **186** | **69**      | **31.1%**     |

## Key Calculations
- **Q1 to Q4 Reduction**: 35.4% decrease (79 → 51)
- **Average Satisfaction**: 65.3% would recommend
- **Average Years of Service**: 6.5 years

## Troubleshooting

### Data Mismatch Issues
If validation reports mismatches:
1. Check the source Excel file for updates
2. Run `npm run data:process` to reprocess
3. Run `npm run data:sync` to update static data
4. Verify with `npm run data:validate`

### Manual Override
If you need to manually adjust exit survey data:
1. Edit `/src/data/staticData.js` directly
2. Run `npm run data:validate` to check consistency
3. Document the reason for manual adjustment

## Best Practices

1. **Always validate after updates**: Run validation after any data changes
2. **Use the workflow**: Follow the process → sync → validate workflow
3. **Check before commits**: Include validation in pre-commit checks
4. **Document changes**: Note any manual adjustments in commit messages
5. **Monitor console warnings**: Dashboard components log data integrity warnings

## Component Usage

Components automatically use the synced data:
- `ExitSurveyFY25Dashboard` - Loads from `fy25TurnoverData.json`
- `ExitSurveyQ4Dashboard` - Uses `staticData.js` (synced values)
- `ExitSurveyOverview` - Combines both sources

## Adding New Data

When adding new quarterly data:
1. Update the Excel source file
2. Run `npm run data:update`
3. Verify dashboards display correctly
4. Commit both JSON and JS data files

## Data Privacy

- Never commit actual employee names or IDs
- Use anonymized employee numbers only
- Keep PII in source files, not in repo