# Internal Mobility Data Methodology

## Overview
Internal mobility tracks promotions and transfers for benefit-eligible employees, with calculated reason codes that explain WHY each job change occurred.

## Data Sources

### Primary Source
- **Oracle HCM Report**: "Promotions and Transfers" report
- **Fields Used**:
  - Person Number (unique identifier)
  - Person List Name
  - Eff Start Dt (effective date of change)
  - Action Code (PROMOTION or TRANSFER)
  - Job Name (new job title)
  - Department Name (new department)
  - Grade Code (new grade level)
  - Employment Cat Code
  - Asgmt Chg Reason Code (Oracle's reason - often blank)

### Comparison Source
- **Workforce Snapshot**: Historical workforce data
- **Purpose**: Provides "BEFORE" state for comparison
- **Match Key**: Person Number / Empl num

## Benefit Eligible Filter
Only employees in these categories are included:
- F12 (Full-time, 12-month)
- F09 (Full-time, 9-month)
- F10 (Full-time, 10-month)
- F11 (Full-time, 11-month)

## Reason Code Calculation

### Why Calculate Reason Codes?
Oracle's `Asgmt Chg Reason Code` field is often blank (~72% of records). We calculate custom reason codes based on observable data patterns.

### Dual Code System
We maintain BOTH:
1. **Oracle Reason Code** - preserved where populated
2. **Custom Reason Code** - calculated for all records

---

## PROMOTION Reason Codes

### PROGRESSION (Career Ladder)
**Definition**: Advancement through a defined career track
**Detection**: Title pattern matching

| Before Title | After Title |
|--------------|-------------|
| Assistant Professor | Associate Professor |
| Associate Professor | Professor |
| Assistant Director | Director |
| Director | Senior Director |
| Coordinator | Manager |
| Manager | Director |
| Specialist | Senior Specialist |
| Analyst | Senior Analyst |

**Confidence**: HIGH

### APPLIED (Applied for Position)
**Definition**: Employee competed for a higher-grade position through recruitment
**Detection**: Department changed + grade increased
**Confidence**: MEDIUM

### RECLASS (Position Reclassification)
**Definition**: Job duties evolved and position was re-evaluated to higher grade
**Detection**: Same department + significantly different title
**Confidence**: MEDIUM

### MERIT (Merit/Performance)
**Definition**: Promoted within current role based on performance
**Detection**: Same department + same/similar title
**Confidence**: MEDIUM

---

## TRANSFER Reason Codes

### APPLIED (Applied for Position)
**Definition**: Employee competed for a same/lower-grade position in different department
**Detection**: Department changed
**Confidence**: MEDIUM

### REORG (Reorganization)
**Definition**: Position moved due to organizational restructure
**Detection**: Same department (cost center change)
**Confidence**: MEDIUM

### BUSN_NEED (Business Need)
**Definition**: Employee reassigned to address operational needs
**Detection**: Cannot calculate - requires manual input
**Confidence**: N/A

### ACCOMMODATION
**Definition**: Transfer made to accommodate employee request/need (ADA, schedule, location)
**Detection**: Cannot calculate - requires HR records
**Confidence**: N/A

---

## Limitations

### What We CAN Calculate
- Career ladder progressions (title patterns)
- Department changes (APPLIED)
- Same-department changes (REORG for transfers, MERIT/RECLASS for promotions)

### What We CANNOT Calculate
- Whether employee actually "applied" vs. was placed
- Accommodation-based transfers
- Business need reassignments
- Manager-initiated vs. employee-initiated changes

### Confidence Levels
- **HIGH**: Clear title progression pattern
- **MEDIUM**: Based on department/title comparison
- **LOW**: Insufficient data to determine

---

## Directory Structure
```
source-metrics/internal-mobility/
├── raw/
│   └── FY26_Q1/
│       ├── Promotions and Transfers 7_01_24 to 11_13_25.xlsx
│       └── action_reason_codes.xlsx
├── cleaned/
│   └── FY26_Q1/
│       ├── internal_mobility_cleaned.json
│       ├── internal_mobility_summary.json
│       └── AUDIT_TRAIL.md
└── INTERNAL_MOBILITY_METHODOLOGY.md (this file)
```

## Processing
- **Script**: `scripts/processInternalMobility.py`
- **Output**: `src/data/internalMobilityData.js`
- **Dashboard**: `src/components/dashboards/InternalMobilityQ1FY26Dashboard.jsx`

## Fiscal Year Quarters
| Quarter | Date Range |
|---------|------------|
| Q1 | July 1 - September 30 |
| Q2 | October 1 - December 31 |
| Q3 | January 1 - March 31 |
| Q4 | April 1 - June 30 |
