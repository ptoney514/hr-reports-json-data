# Workforce Data Inventory

## Current Implementation

### Primary Data Source
**File**: `/src/data/staticData.js`
**Structure**: `WORKFORCE_DATA` object with date-based keys

### Data Points per Reporting Period
```javascript
WORKFORCE_DATA = {
  "2024-06-30": { ... },  // Q4 FY24
  "2025-03-31": { ... },  // Q3 FY25
  "2025-06-30": { ... }   // Q4 FY25
}
```

### Key Metrics Stored
1. **Employee Counts**
   - `totalEmployees`: Total headcount
   - `faculty`: Faculty count
   - `staff`: Staff count
   - `hsp`: House Staff Physicians
   - `temp`: Temporary employees

2. **Location Data**
   - `locations`: Campus totals
   - `locationDetails`: Breakdown by category per campus

3. **Demographics**
   - `departments`: Array of department objects with counts
   - `schoolOrgData`: School/Organization breakdown
   - `assignmentTypes`: Employment type distribution
   - `categories`: Employee category codes (F12, TEMP, etc.)

4. **Metrics**
   - `vacancyRate`: Current vacancy percentage
   - `departures`: Number of departures
   - `netChange`: Net employee change
   - `starters`: New hires by location

5. **Student Workers**
   - `studentCount`: Total, student workers, federal work study

## Components Using Workforce Data

### 1. WorkforceDashboard.jsx
**Location**: `/src/components/dashboards/WorkforceDashboard.jsx`
**Data Usage**:
- Calls `getWorkforceData("2025-06-30")` for current data
- Calls `getWorkforceData("2024-06-30")` for YoY comparison
- Displays total employees, faculty/staff breakdown
- Shows location distribution
- Renders department breakdown chart

### 2. HeadcountDetailsDashboard.jsx
**Location**: `/src/components/dashboards/HeadcountDetailsDashboard.jsx`
**Data Usage**:
- Calls `getWorkforceData("2025-06-30")` for current
- Calls `getWorkforceData("2025-03-31")` for previous quarter
- Detailed school/org breakdown
- Assignment type analysis
- Location-based metrics

### 3. Supporting Functions
- `getWorkforceData(date)`: Returns workforce data for specific date
- `getAllSchoolOrgData(date)`: Returns school/org breakdown
- Falls back to latest date if requested date not found

## CSV Data Requirements

### Essential Fields for CSV Import
```csv
reporting_date      # YYYY-MM-DD format
employee_id         # Unique identifier
employee_category   # F12, TEMP, SUE, CWS, etc.
faculty_staff_flag  # Faculty, Staff, HSP
department          # Department name
school_org          # School/Organization
location            # Omaha, Phoenix
assignment_type     # Full-Time, Part-Time, Temporary
start_date          # For calculating new hires
end_date           # For tracking departures (if applicable)
```

### Optional Fields
```csv
job_title
salary_grade
fte_percentage
union_status
tenure_status
```

## Migration Checklist

### Phase 1: Data Processing
- [ ] Create CSV template with required fields
- [ ] Build CSV parser for workforce data
- [ ] Generate JSON structure matching current format
- [ ] Validate totals and calculations

### Phase 2: Validation
- [ ] Compare CSV totals with current static data
- [ ] Verify department sums equal total
- [ ] Check location distributions
- [ ] Validate faculty/staff splits

### Phase 3: Integration
- [ ] Update WorkforceDashboard to use new JSON
- [ ] Update HeadcountDetailsDashboard
- [ ] Modify data access functions
- [ ] Add fallback mechanisms

### Phase 4: Testing
- [ ] Test with Q4 FY25 data
- [ ] Verify YoY comparisons
- [ ] Check all charts render correctly
- [ ] Validate drill-down functionality

## Data Flow After Migration

```
CSV Files (Quarterly)
    ↓
processWorkforceData.js
    ↓
workforceData.json (Source of Truth)
    ↓
syncWorkforceToStaticData.js
    ↓
staticData.js (Backwards Compatibility)
    ↓
Dashboard Components
```

## Expected Benefits

1. **Accuracy**: Single source of truth from HR system
2. **Automation**: No manual data entry required
3. **Validation**: Automated consistency checks
4. **Scalability**: Easy to add new metrics
5. **Auditability**: Clear data lineage

## Risk Areas

1. **Data Format Changes**: CSV structure might vary
2. **Historical Data**: Need to migrate past quarters
3. **Performance**: Large CSV files may need optimization
4. **Dependencies**: Other components may use workforce data

## Success Metrics

- ✅ All workforce dashboards display correct data
- ✅ CSV import completes in < 5 seconds
- ✅ Zero data validation errors
- ✅ Automated monthly updates
- ✅ Historical data preserved

## Next Steps

1. **Get CSV Sample**: Request workforce CSV from HR
2. **Analyze Structure**: Map CSV fields to current data
3. **Build Parser**: Create processing script
4. **Test Import**: Verify with known good data
5. **Deploy**: Roll out to production

## Notes

- Current system has 3 reporting periods hardcoded
- Need to support dynamic date ranges
- Consider caching for performance
- May need to handle partial data updates
- Student worker data might come from separate source