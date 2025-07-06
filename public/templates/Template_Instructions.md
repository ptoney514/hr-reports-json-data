# HR Quarterly Data Template Instructions

## Overview
This template allows you to provide **aggregate headcount data** from Oracle HCM and other HR systems directly for quarterly reporting in the HR Dashboard. No individual employee records are needed - just provide the totals for each category.

## Template Files
- **HR_Quarterly_Data_Template.csv** - Sample aggregate data template (can be opened in Excel)
- **Template_Instructions.md** - This instruction file

## Key Benefits of Aggregate Structure
- **No individual employee data needed** - Just provide totals from your HR system reports
- **Benefit eligibility distinction** - Separate tracking for budgetary and compensation planning
- **Faster processing** - Direct aggregates instead of counting individual records
- **Oracle HCM compatible** - Structure matches common HR system reporting formats

## Column Definitions

| Column | Required | Description | Example Values |
|--------|----------|-------------|----------------|
| **Quarter_End_Date** | ✅ | End date of the fiscal quarter | 2024-06-30, 2024-09-30 |
| **Division** | ✅ | Academic/organizational division | Arts & Sciences, Medicine |
| **Location** | ✅ | Campus location | Omaha, Phoenix |
| **BE_Faculty_Headcount** | ✅ | Benefit eligible faculty count | 85, 120 |
| **BE_Staff_Headcount** | ✅ | Benefit eligible staff count | 95, 200 |
| **NBE_Faculty_Headcount** | ✅ | Non-benefit eligible faculty count | 25, 30 |
| **NBE_Staff_Headcount** | ✅ | Non-benefit eligible staff count | 35, 45 |
| **NBE_Student_Worker_Headcount** | ✅ | Non-benefit eligible student workers | 65, 50 |
| **Total_Headcount** | ⚪ | Total for validation (auto-calculated) | 330, 445 |
| **BE_New_Hires** | ⚪ | Benefit eligible new hires for quarter | 5, 7 |
| **BE_Departures** | ⚪ | Benefit eligible departures for quarter | 2, 4 |
| **NBE_New_Hires** | ⚪ | Non-benefit eligible new hires | 8, 10 |
| **NBE_Departures** | ⚪ | Non-benefit eligible departures | 5, 7 |

## Employee Categories Explained

### Benefit Eligible (BE) Employees
- **Full compensation package** including health, retirement, etc.
- **Higher total cost** per employee
- **Budget impact** significant for planning
- **Categories**: Faculty, Staff

### Non-Benefit Eligible (NBE) Employees  
- **Limited or no benefits** provided
- **Lower total cost** per employee
- **Different budget planning** considerations
- **Categories**: Faculty, Staff, Student Workers

## Data Structure

### Required Data Points
Each row represents one **Division + Location combination** for a specific quarter.

**Example Row:**
```
Quarter_End_Date: 2024-06-30
Division: Arts & Sciences  
Location: Omaha
BE_Faculty_Headcount: 85
BE_Staff_Headcount: 120
NBE_Faculty_Headcount: 25
NBE_Staff_Headcount: 35
NBE_Student_Worker_Headcount: 65
```

### Creating Your Excel File

#### Step 1: Convert CSV to Excel
1. Open the CSV template in Excel
2. Save as `.xlsx` format: "HR_Quarterly_Data_Template.xlsx"
3. Keep the same column headers (first row)

#### Step 2: Data Validation (Recommended)
Create dropdown lists for consistent data entry:

**Division Values:**
- Arts & Sciences
- Medicine  
- Pharmacy & Health Professions
- Nursing
- Business
- Education

**Location Values:**
- Omaha
- Phoenix

**Quarter End Dates:**
- 2024-06-30 (Q4 2024)
- 2024-09-30 (Q1 2025) 
- 2024-12-31 (Q2 2025)
- 2025-03-31 (Q3 2025)

## Data Collection from Oracle HCM

### 1. Quarterly Headcount Reports
Generate reports for each quarter showing:
- Employee counts by Division and Location
- Benefit eligibility status
- Employee type (Faculty, Staff, Student Worker)
- Active employee status as of quarter end

### 2. Activity Reports
For each quarter, gather:
- New hires during the quarter (by benefit eligibility)
- Departures during the quarter (by benefit eligibility)
- Broken down by BE/NBE categories

### 3. Data Consolidation Process
1. **Export from Oracle HCM** - Get division/location breakdowns
2. **Group by benefit eligibility** - Separate BE from NBE counts
3. **Create one row per division/location** - Combine all employee types
4. **Include all quarters** - Single file with all quarterly data

## Sample Data Workflow

### From Oracle HCM Report:
```
Division: Arts & Sciences, Location: Omaha
- Faculty (BE): 85 active employees
- Staff (BE): 120 active employees  
- Faculty (NBE): 25 active employees
- Staff (NBE): 35 active employees
- Student Workers (NBE): 65 active employees
- New Hires (BE): 5 this quarter
- Departures (BE): 2 this quarter
- New Hires (NBE): 8 this quarter
- Departures (NBE): 5 this quarter
```

### Becomes This Row:
```
2024-09-30,Arts & Sciences,Omaha,85,120,25,35,65,343,5,2,8,5
```

## Dashboard Metrics Calculated

### Summary Cards
- **Total Headcount**: Sum of all BE + NBE employees
- **Faculty**: Sum of BE_Faculty + NBE_Faculty across all locations
- **Staff**: Sum of BE_Staff + NBE_Staff across all locations  
- **Starters**: Sum of BE_New_Hires + NBE_New_Hires for selected quarter
- **Leavers**: Sum of BE_Departures + NBE_Departures for selected quarter

### Change Percentages
- Automatically calculated by comparing current vs previous quarter
- Shows growth/decline in each category

### Charts
- **Division Breakdown**: Shows BE Faculty/Staff by division
- **Location Breakdown**: Shows total employees by location
- **Trend Analysis**: Shows headcount changes across quarters

## Data Quality Guidelines

### Required Fields
- Every row must have Quarter_End_Date, Division, and Location
- All headcount fields should be numeric (use 0 for empty)

### Date Formats
Use consistent date format: YYYY-MM-DD
- ✅ Good: 2024-06-30
- ❌ Bad: 6/30/24, Jun 30 2024

### Consistent Values
Use exact same values for repeating data:
- ✅ "Arts & Sciences" (always)
- ❌ "Arts and Sciences", "Arts & Sci"

### Data Validation
- Ensure Total_Headcount = sum of all headcount columns
- Check that activity numbers are reasonable for organization size
- Verify no negative numbers in headcount fields

## Upload Process

1. **Complete Excel file** with aggregate data for all quarters
2. **Upload via dashboard** file upload feature
3. **Select quarter** from dropdown to view specific period
4. **Review metrics** ensure totals look correct
5. **Switch quarters** to compare trends

## Troubleshooting

### Common Issues
- **"No valid records found"**: Check Quarter_End_Date, Division, and Location columns
- **Incorrect totals**: Verify all headcount numbers are numeric
- **Missing charts**: Ensure at least one complete quarter of data exists

### Data Validation
- Check column headers match template exactly
- Verify date formats are YYYY-MM-DD
- Ensure Division and Location values are consistent
- Confirm all headcount fields contain numbers (use 0 for empty)

## Benefits of This Structure

### For HR Teams
- **Direct from Oracle HCM** - Use existing reports
- **No individual records** - Maintain privacy
- **Benefit eligibility tracking** - Budget planning support
- **Faster uploads** - Smaller file sizes

### For Dashboard
- **Instant calculations** - No processing delays
- **Accurate totals** - Direct from source systems
- **Change tracking** - Quarter-over-quarter comparisons
- **Multiple views** - Division, location, trend analysis

## Support
For questions about the template or data requirements, refer to the dashboard documentation or contact your system administrator.