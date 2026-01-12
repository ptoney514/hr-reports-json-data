# Internal Mobility Data - FY26 Q1 Audit Trail

## Data Source
- **File**: `Promotions and Transfers 7_01_24 to 11_13_25.xlsx`
- **Location**: `source-metrics/internal-mobility/raw/FY26_Q1/`
- **Oracle Report**: Promotions and Transfers report from Oracle HCM

## Filters Applied
- **Date Range**: July 1, 2025 - September 30, 2025 (Q1 FY26)
- **Benefit Eligible Only**: Yes
- **Employment Categories**: F12, F09, F10, F11

## Record Counts
| Metric | Count |
|--------|-------|
| Total Records (unfiltered) | 324 |
| FY26 Q1 Records | 106 |
| Promotions | 65 |
| Transfers | 41 |

## Reason Code Calculation Methodology

### Source Fields Used
- `Action Code` - PROMOTION or TRANSFER (from Oracle)
- `Job Name` - Current job title
- `Department Name` - Current department
- `Grade Code` - Current grade level
- `Employment Cat Code` - Employment category

### Comparison Data
- **Workforce History File**: `source-metrics/workforce/raw/FY26_Q1/New Emp List since FY20 to Q1FY25 1031 PT.xlsx`
- **Match Field**: Person Number (Empl num)
- **Match Rate**: 100% (106/106 records matched)

### Custom Reason Code Logic

#### PROMOTION Reason Codes
| Code | Logic | Confidence |
|------|-------|------------|
| PROGRESSION | Title shows career ladder pattern (Assistant→Associate, etc.) | HIGH |
| APPLIED | Department changed | MEDIUM |
| RECLASS | Same dept + significantly different title | MEDIUM |
| MERIT | Same dept + same/similar title | MEDIUM |

#### TRANSFER Reason Codes
| Code | Logic | Confidence |
|------|-------|------------|
| APPLIED | Department changed | MEDIUM |
| REORG | Same department (cost center change) | MEDIUM |

### Career Ladder Patterns Detected
```
Assistant Professor → Associate Professor
Associate Professor → Professor
Assistant Director → Director
Director → Senior Director
Coordinator → Manager
Manager → Director
```

## Reason Code Distribution

### Promotions (65 total)
| Reason Code | Count | % |
|-------------|-------|---|
| PROGRESSION | 35 | 54% |
| RECLASS | 13 | 20% |
| APPLIED | 11 | 17% |
| MERIT | 6 | 9% |

### Transfers (41 total)
| Reason Code | Count | % |
|-------------|-------|---|
| REORG | 32 | 78% |
| APPLIED | 9 | 22% |

## Oracle HCM Reason Codes Reference
- Reference file: `action_reason_codes.xlsx`
- Oracle codes preserved in `oracleReasonCode` field where populated
- Custom codes calculated in `customReasonCode` field

## Processing Script
- **Script**: `scripts/processInternalMobility.py`
- **Output**: `src/data/internalMobilityData.js`

## Validation
- [x] Total counts match source file filter
- [x] All records matched with workforce history
- [x] Career ladder patterns validated manually
- [x] Department change logic verified

## Generated
- **Date**: 2026-01-11
- **By**: processInternalMobility.py
