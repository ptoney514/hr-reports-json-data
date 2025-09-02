# Data Management Guide

## Overview
This guide ensures data consistency between turnover metrics and exit survey data across the HR Reports application.

## Data Flow Architecture

```
Source Excel/CSV → processTurnoverData.js → fy25TurnoverData.json → syncTurnoverToStaticData.js → staticData.js
                                                ↓
                                        Dashboard Components
```

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