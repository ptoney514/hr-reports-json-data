# Recruiting Metrics Methodology

## Overview

This document describes the data sources, collection processes, and calculation methods for recruiting and new hire metrics displayed in the HR Reports dashboards.

## Data Sources

### 1. Oracle HCM (Source of Truth for New Hires)

**System**: Oracle Human Capital Management
**Frequency**: Quarterly extract
**Contact**: HR Analytics Team

**Data Extracted**:
- Employee name (hashed for privacy)
- Hire date
- Position title
- Department
- School/Organization
- Employee type (Faculty/Staff)
- Assignment category code
- Location (OMA/PHX)
- Demographics (gender, ethnicity, age band)

**Filtering Criteria**:
- Benefit-eligible employees only
- Assignment categories: F09, F11, F12, PT9, PT10, PT12
- Active hire status

### 2. Oracle Recruiting Cloud (myJobs)

**System**: Oracle Recruiting Cloud (myJobs)
**Frequency**: Quarterly snapshot
**Contact**: Talent Acquisition Team

**Metrics Collected**:
| Metric | Description |
|--------|-------------|
| Open Requisitions | Active job postings |
| Reqs per Recruiter | Average load per TA team member |
| Avg Days Open | Mean time req has been open |
| Avg Time to Fill | Mean days from posting to hire |
| Active Applications | Applications in review |
| New Applications | Applications received in period |
| Apps per Requisition | Average applications per job |
| Internal App % | Percentage of internal applicants |
| Referrals | Employee referral applications |
| Offer Acceptance Rate | Offers accepted / offers made |
| Internal Hire Rate | Internal hires / total hires |

**Application Sources Tracked**:
- LinkedIn
- Creighton Careers
- External Career Site
- jobright
- Internal Career Site
- Other/Direct

### 3. Interfolio (Faculty Pipeline)

**System**: Interfolio Faculty Search
**Frequency**: Quarterly snapshot
**Contact**: Academic Affairs

**Metrics Collected**:
| Metric | Description |
|--------|-------------|
| Active Searches | Open faculty positions |
| Completed Searches | Searches resulting in hire |
| Tenure Track Hires | New TT faculty |
| Non-Tenure Hires | NTT faculty hired |
| Instructor Hires | Instructor-level hires |
| Special Faculty | Visiting/adjunct positions |

## Quarterly Data Collection Process

### Step 1: Extract Oracle HCM Data

1. Run "Benefit-Eligible New Hires" report for fiscal quarter
2. Filter by:
   - Hire date within quarter boundaries
   - Assignment category in (F09, F11, F12, PT9, PT10, PT12)
   - Active employee status
3. Export to Excel

### Step 2: Extract myJobs Metrics

1. Access Oracle Recruiting Cloud dashboard
2. Pull pipeline metrics as of quarter end
3. Export application source data
4. Export requisition aging report
5. Calculate derived metrics (hire rates, etc.)

### Step 3: Extract Interfolio Data

1. Access Interfolio admin dashboard
2. Pull faculty search completion data
3. Match against Oracle HCM faculty hires
4. Note searches not resulting in hire

### Step 4: Data Consolidation

1. Update `Recruiting_Metrics_Master.xlsx` sheets
2. Validate totals match across sources:
   - Oracle HCM total = Faculty + Staff
   - Faculty count >= Interfolio hires (some faculty hired outside Interfolio)
   - Staff count = myJobs tracked hires + direct hires
3. Run ETL pipeline: `npm run etl:recruiting`

## Calculation Methods

### Hire Rate Calculation

```
Hire Rate = (Hires / Applications) × 100

Example:
  Applications: 2000
  Hires: 40
  Hire Rate: 40/2000 × 100 = 2.0%
```

### Internal Hire Rate

```
Internal Hire Rate = (Internal Hires / Total Hires) × 100

Example:
  Internal Hires: 13
  Total Hires: 40
  Internal Rate: 13/40 × 100 = 32.5%
```

### Time to Fill

```
Time to Fill = Hire Date - Requisition Post Date

Reported as average across all filled positions in the quarter.
```

### Offer Acceptance Rate

```
Offer Acceptance Rate = (Offers Accepted / Offers Extended) × 100

Example:
  Offers Extended: 43
  Offers Accepted: 42
  Acceptance Rate: 42/43 × 100 = 97.7%
```

### Requisition Aging Buckets

| Bucket | Days Since Posting |
|--------|-------------------|
| 0-30 Days | 0-30 |
| 31-60 Days | 31-60 |
| 61-90 Days | 61-90 |
| 91-120 Days | 91-120 |
| >120 Days | 121+ |

## Assignment Category Codes

| Code | Description | Benefit Eligible |
|------|-------------|------------------|
| F09 | Full-Time 9-Month | Yes |
| F11 | Full-Time 11-Month | Yes |
| F12 | Full-Time 12-Month | Yes |
| PT9 | Part-Time 9-Month | Yes (50%+) |
| PT10 | Part-Time 10-Month | Yes (50%+) |
| PT12 | Part-Time 12-Month | Yes (50%+) |

## Data Quality Notes

### ATS Coverage Gap

Not all hires are captured in applicant tracking systems:

- **Faculty**: ~95% hire through Interfolio (some direct hires)
- **Staff**: ~100% tracked in myJobs/ORC
- **Direct Hires**: Senior executives, special appointments

### Cross-System Validation

For Q1 FY26:
- Oracle HCM Total: 69 benefit-eligible hires
- In Interfolio: 1 hire (faculty tracked)
- In ORC ATS: 38 hires (all staff)
- Not in ATS: 30 hires (primarily faculty direct)

### Demographics Sensitivity

- Gender data available for all hires
- Ethnicity: "Not Disclosed" option available
- Age band: Derived from birth date in Oracle HCM
- All demographics aggregated (no individual reporting)

## Fiscal Calendar Reference

| Quarter | Start | End | Hire Date Range |
|---------|-------|-----|-----------------|
| Q1 | July 1 | Sep 30 | July 1 - Sep 30 |
| Q2 | Oct 1 | Dec 31 | Oct 1 - Dec 31 |
| Q3 | Jan 1 | Mar 31 | Jan 1 - Mar 31 |
| Q4 | Apr 1 | Jun 30 | Apr 1 - Jun 30 |

## Trend Analysis Notes

### Seasonal Patterns

- Q1 shows peak hiring (academic year start)
- Faculty hiring concentrated in Q1 (fall semester)
- Staff hiring more evenly distributed
- Q2-Q4 primarily staff replacements

### Year-over-Year Comparison

- Always compare same quarters (Q1 vs Q1)
- Normalize for headcount changes
- Consider external factors (hiring freezes, growth initiatives)

## Contact

For questions about recruiting metrics methodology:
- **HR Analytics Team**: hr-analytics@creighton.edu
- **Talent Acquisition**: talent-acquisition@creighton.edu
- **Academic Affairs** (Faculty): academic-affairs@creighton.edu

---

*Last Updated: January 2026*
*Version: 1.0*
