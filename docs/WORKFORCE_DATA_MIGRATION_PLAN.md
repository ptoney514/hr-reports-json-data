# Workforce Data Migration Plan

## Overview
Apply the proven data consistency approach from exit survey data to workforce metrics, establishing CSV as the single source of truth for all workforce dashboards.

## Current State Analysis

### Data Sources
1. **Static Data**: Hardcoded in `/src/data/staticData.js`
   - Multiple date entries (2024-06-30, 2025-03-31, 2025-06-30)
   - Contains employee counts, departments, locations, demographics
   - Manually updated with risk of inconsistencies

2. **Affected Dashboards**:
   - `WorkforceDashboard.jsx` - Main workforce overview
   - `HeadcountDetailsDashboard.jsx` - Detailed headcount metrics
   - Various chart components pulling workforce data

### Problems to Solve
- No automated CSV import process
- Multiple hardcoded values across components
- No validation between CSV source and displayed data
- Manual updates prone to errors

## Migration Strategy

### Phase 1: Data Architecture
```
CSV Source → processWorkforceData.js → workforceData.json → syncWorkforceToStatic.js → staticData.js
                                            ↓
                                    Dashboard Components
```

### Phase 2: Implementation Steps

#### Step 1: Create Workforce Data Processor
**File**: `/scripts/processWorkforceData.js`

**Functionality**:
- Parse CSV file from `/source-metrics/workforce/`
- Extract key metrics:
  - Total employees by category
  - Faculty/Staff breakdown
  - Location distribution
  - Department counts
  - Demographics
- Generate structured JSON output
- Handle multiple reporting periods

**CSV Format Expected**:
```csv
reporting_date,employee_id,category,department,location,faculty_staff,assignment_type
2025-06-30,12345,F12,Medicine,Omaha,Faculty,Full-Time
2025-06-30,12346,TEMP,IT Services,Phoenix,Staff,Temporary
```

#### Step 2: Create Validation Script
**File**: `/scripts/validateWorkforceConsistency.js`

**Validation Points**:
- Total employee counts match
- Faculty/Staff ratios align
- Department totals sum correctly
- Location distributions accurate
- No duplicate employee IDs
- Date formats consistent

#### Step 3: Create Sync Script
**File**: `/scripts/syncWorkforceToStaticData.js`

**Features**:
- Read processed workforce JSON
- Update staticData.js workforce sections
- Maintain data structure compatibility
- Preserve non-workforce data
- Add timestamps for tracking

#### Step 4: Update NPM Scripts
```json
{
  "scripts": {
    "workforce:process": "node scripts/processWorkforceData.js",
    "workforce:sync": "node scripts/syncWorkforceToStaticData.js",
    "workforce:validate": "node scripts/validateWorkforceConsistency.js",
    "workforce:update": "npm run workforce:process && npm run workforce:sync && npm run workforce:validate"
  }
}
```

## File Structure

### Input Files
```
/source-metrics/workforce/
├── FY24/
│   ├── workforce_2024_Q1.csv
│   ├── workforce_2024_Q2.csv
│   ├── workforce_2024_Q3.csv
│   └── workforce_2024_Q4.csv
├── FY25/
│   ├── workforce_2024_Q1.csv  # July-Sept 2024
│   ├── workforce_2024_Q2.csv  # Oct-Dec 2024
│   ├── workforce_2025_Q3.csv  # Jan-Mar 2025
│   └── workforce_2025_Q4.csv  # Apr-Jun 2025
└── templates/
    └── workforce_template.csv
```

### Output Files
```
/src/data/
├── workforceData.json      # Processed workforce data (source of truth)
├── staticData.js           # Updated via sync script
└── workforceHistory.json   # Historical tracking (optional)
```

## Component Updates Required

### 1. WorkforceDashboard.jsx
**Current**: Reads from staticData.js directly
**Update**: 
- Import workforceData.json
- Fall back to staticData for backwards compatibility
- Add data validation warnings

### 2. HeadcountDetailsDashboard.jsx
**Current**: Complex calculations from static data
**Update**:
- Use pre-calculated metrics from JSON
- Simplify component logic
- Add error boundaries

### 3. Chart Components
**Files to Update**:
- `DepartmentBreakdownChart.jsx`
- `LocationDistributionChart.jsx`
- `EmployeeCategoryChart.jsx`
- `WorkforceTrendsChart.jsx`

**Changes**:
- Remove hardcoded values
- Use dynamic data from JSON
- Add loading states

## Data Validation Rules

### Critical Validations
1. **Total Count Integrity**
   ```javascript
   faculty + staff + hsp + temp === totalEmployees
   ```

2. **Location Distribution**
   ```javascript
   omahaCampus + phoenixCampus === totalEmployees
   ```

3. **Department Totals**
   ```javascript
   sum(all_departments) === totalEmployees
   ```

### Warning Validations
- Unusual percentage changes (>20% quarter-over-quarter)
- Missing demographic data
- Duplicate employee IDs
- Invalid date formats

## Implementation Timeline

### Week 1: Foundation
- [ ] Create CSV processing script
- [ ] Define JSON data structure
- [ ] Set up test CSV files
- [ ] Document CSV format requirements

### Week 2: Core Development
- [ ] Implement validation script
- [ ] Create sync functionality
- [ ] Add error handling
- [ ] Write unit tests

### Week 3: Integration
- [ ] Update dashboard components
- [ ] Modify chart components
- [ ] Add fallback mechanisms
- [ ] Performance optimization

### Week 4: Testing & Deployment
- [ ] End-to-end testing
- [ ] Data migration dry run
- [ ] Documentation updates
- [ ] Production deployment

## Success Criteria

### Must Have
- ✅ Zero data inconsistencies
- ✅ Automated CSV import
- ✅ Validation reports
- ✅ All dashboards updated

### Should Have
- ✅ Historical data tracking
- ✅ Audit logs
- ✅ Performance metrics
- ✅ Error recovery

### Nice to Have
- ✅ Real-time updates
- ✅ Data versioning
- ✅ Automated backups
- ✅ Change notifications

## Risk Mitigation

### Data Quality
**Risk**: Inconsistent CSV formats
**Mitigation**: 
- Strict validation rules
- Clear documentation
- Template files
- Error reporting

### Performance
**Risk**: Large CSV files slow processing
**Mitigation**:
- Streaming CSV parser
- Incremental updates
- Caching strategy
- Background processing

### Compatibility
**Risk**: Breaking existing functionality
**Mitigation**:
- Backwards compatibility layer
- Feature flags
- Gradual rollout
- Comprehensive testing

## Monitoring & Maintenance

### Daily Checks
- Validation script runs
- No console errors
- Data freshness

### Weekly Tasks
- Review validation reports
- Check performance metrics
- Update documentation

### Monthly Tasks
- Audit data accuracy
- Review error logs
- Optimize processing

## Commands Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run workforce:update` | Complete update workflow |
| `npm run workforce:validate` | Check data consistency |
| `npm run workforce:process` | Process CSV to JSON |
| `npm run workforce:sync` | Sync to static data |

## Next Steps

1. **Immediate Actions**:
   - Review current workforce data structure
   - Identify all hardcoded values
   - Create CSV template

2. **Development Priorities**:
   - Start with processing script
   - Build validation framework
   - Update one dashboard as proof of concept

3. **Testing Strategy**:
   - Use Q4 FY25 data for initial testing
   - Compare automated vs manual results
   - Stress test with large datasets

## Lessons from Exit Survey Migration

### Do's
- ✅ Start with validation to understand current state
- ✅ Create comprehensive documentation
- ✅ Build automated workflows from the start
- ✅ Test thoroughly before replacing manual process

### Don'ts
- ❌ Don't modify multiple components simultaneously
- ❌ Don't skip validation steps
- ❌ Don't hardcode fallback values
- ❌ Don't forget backwards compatibility

## Support & Resources

- **Documentation**: `/docs/DATA_CONSISTENCY_SOLUTION.md`
- **Exit Survey Example**: `/scripts/processTurnoverData.js`
- **Validation Pattern**: `/scripts/validateDataConsistency.js`
- **Sync Pattern**: `/scripts/syncTurnoverToStaticData.js`