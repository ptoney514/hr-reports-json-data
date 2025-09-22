# Employee Type Filter Test Plan

## Overview
This document outlines the test scenarios for the new employee type filtering feature in the Workforce Analytics dashboard.

## Test Environment
- URL: http://localhost:3000/dashboards/combined-workforce
- Docker container: hr-reports-dev (running on port 3000)

## Filter Options Available
1. **All Employees** - Shows all employee types combined
2. **Benefit Eligible** - Shows only benefit-eligible faculty and staff
3. **Non-Benefit Eligible** - Shows non-benefit eligible faculty, staff, and all student workers
4. **All Faculty** - Shows both benefit-eligible and non-benefit eligible faculty
5. **All Staff** - Shows both benefit-eligible and non-benefit eligible staff
6. **Student Workers** - Shows only student workers (always non-benefit eligible)
7. **Benefit Eligible Faculty** - Shows only benefit-eligible faculty
8. **Non-Benefit Eligible Faculty** - Shows only non-benefit eligible faculty
9. **Benefit Eligible Staff** - Shows only benefit-eligible staff
10. **Non-Benefit Eligible Staff** - Shows only non-benefit eligible staff

## Test Scenarios

### 1. Default State
- **Action**: Load the dashboard
- **Expected**: 
  - Filter shows "All Employees"
  - All metrics display total counts across all employee types
  - Note text shows "Currently viewing All Employees"

### 2. Benefit Eligible Filter
- **Action**: Select "Benefit Eligible" from filter
- **Expected**:
  - Total Headcount = BE Faculty + BE Staff only
  - Faculty card shows only BE Faculty count
  - Staff card shows only BE Staff count
  - Students card shows 0
  - Note updates to "Currently viewing Benefit Eligible"

### 3. Non-Benefit Eligible Filter
- **Action**: Select "Non-Benefit Eligible" from filter
- **Expected**:
  - Total Headcount = NBE Faculty + NBE Staff + Students
  - Faculty card shows only NBE Faculty count
  - Staff card shows only NBE Staff count
  - Students card shows full student count
  - Note updates to "Currently viewing Non-Benefit Eligible"

### 4. Faculty Filters
- **Action**: Test each faculty filter option
- **Expected**:
  - "All Faculty": Shows BE + NBE Faculty, Staff = 0, Students = 0
  - "Benefit Eligible Faculty": Shows only BE Faculty
  - "Non-Benefit Eligible Faculty": Shows only NBE Faculty

### 5. Staff Filters
- **Action**: Test each staff filter option
- **Expected**:
  - "All Staff": Shows BE + NBE Staff, Faculty = 0, Students = 0
  - "Benefit Eligible Staff": Shows only BE Staff
  - "Non-Benefit Eligible Staff": Shows only NBE Staff

### 6. Student Workers Filter
- **Action**: Select "Student Workers" from filter
- **Expected**:
  - Shows only student workers count
  - Faculty = 0, Staff = 0
  - Total equals student count

### 7. Chart Updates
- **Action**: Change filters and observe charts
- **Expected**:
  - 5-Quarter Headcount Trend updates to show filtered data
  - New Hires vs Leavers chart updates accordingly
  - Top Divisions chart shows filtered counts
  - Location distribution reflects filtered data

### 8. Quarter + Filter Combination
- **Action**: Change both quarter and employee type filter
- **Expected**:
  - Data updates correctly for both dimensions
  - Percentage changes recalculate based on filtered data

### 9. Filter Persistence
- **Action**: Set a filter, navigate away, return
- **Expected**:
  - Filter state should reset to "All Employees" (default behavior)

### 10. Data Source Indicators
- **Action**: Apply filters with different data sources
- **Expected**:
  - Firebase data: Filters apply to Firebase data
  - Sample data: Filters apply to sample data
  - Empty state: Shows 0 for all filtered views

## Validation Checklist
- [ ] Filter dropdown displays all 10 options correctly
- [ ] Active filter count badge shows correctly (0 for "All", 1 for others)
- [ ] Note text updates to reflect current filter
- [ ] Summary cards update values based on filter
- [ ] Charts update to show filtered data
- [ ] New hires and departures respect filter
- [ ] Division breakdowns show filtered counts
- [ ] Location percentages recalculate based on filtered totals
- [ ] No console errors when switching filters
- [ ] Filter UI is accessible and keyboard navigable

## Known Limitations
- Student workers are always non-benefit eligible by definition
- Percentage changes are calculated quarter-over-quarter for the filtered subset
- Some combinations may result in 0 values (e.g., "Benefit Eligible" + "Students")