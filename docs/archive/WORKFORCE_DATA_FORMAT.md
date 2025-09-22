# Workforce Data Format Requirements (Aggregate Data Only)

This document outlines the required data format for importing **aggregate quarterly workforce data** into the Enhanced Workforce Analytics dashboard.

## ⚠️ PRIVACY AND SECURITY NOTICE

**This system only accepts aggregate quarterly data by division and location.**

**Individual employee records are NOT supported** for privacy and security reasons. All data must be pre-aggregated before upload.

## File Format Support

The system accepts the following file formats:
- **Excel files**: `.xlsx`, `.xls`
- **CSV files**: `.csv`
- **Maximum file size**: 10MB

## Required Data Structure

### Data Aggregation Level
Each row in your data file should represent:
- **One Division** + **One Location** + **One Quarter**

### Core Required Fields
These fields are essential for basic dashboard functionality:

| Column Name | Description | Example | Required |
|------------|-------------|---------|----------|
| `Quarter_End_Date` | Last day of the quarter (YYYY-MM-DD) | 2024-12-31 | ✅ Required |
| `Division` | Academic or administrative division | Arts & Sciences | ✅ Required |
| `Location` | Campus or facility location | Omaha Campus | ✅ Required |
| `BE_Faculty_Headcount` | Benefit-eligible faculty count | 125 | ✅ Required |
| `BE_Staff_Headcount` | Benefit-eligible staff count | 85 | ✅ Required |

### Recommended Fields
These fields enhance the analytics and reporting capabilities:

| Column Name | Description | Example | Impact |
|------------|-------------|---------|--------|
| `NBE_Faculty_Headcount` | Non-benefit eligible faculty | 15 | Full workforce composition |
| `NBE_Staff_Headcount` | Non-benefit eligible staff | 25 | Complete staffing picture |
| `NBE_Student_Worker_Headcount` | Student workers | 30 | Student employment tracking |
| `Total_Headcount` | Total employees (can be calculated) | 280 | Overall workforce size |
| `BE_New_Hires` | Benefit-eligible new hires this quarter | 8 | Hiring trend analysis |
| `BE_Departures` | Benefit-eligible departures this quarter | 5 | Turnover tracking |
| `NBE_New_Hires` | Non-benefit eligible new hires | 12 | Complete hiring picture |
| `NBE_Departures` | Non-benefit eligible departures | 9 | Full turnover analysis |

## Column Name Flexibility

The system automatically maps common column name variations:

### Quarter Date Fields
- `Quarter_End_Date`, `quarter_date`, `end_date`, `date`

### Division Fields  
- `Division`, `div`, `division_name`, `college`, `school`

### Location Fields
- `Location`, `campus`, `site`, `office`

### Headcount Fields
- `BE_Faculty_Headcount`, `faculty_be`, `faculty_benefit_eligible`
- `BE_Staff_Headcount`, `staff_be`, `staff_benefit_eligible`
- `NBE_Student_Worker_Headcount`, `student_workers`, `students`
- `Total_Headcount`, `total`, `headcount_total`

### Activity Fields
- `BE_New_Hires`, `new_hires_be`, `be_hires`
- `BE_Departures`, `departures_be`, `be_separations`

## Data Quality Requirements

### Date Format
- **Quarter End Date**: Use YYYY-MM-DD format (e.g., 2024-12-31 for Q4 2024)
- Must be the actual last day of the quarter

### Numeric Fields
- All headcount and activity numbers must be **non-negative integers**
- Use `0` for empty/missing values, not blank cells

### Text Fields
- **Division names**: Use consistent naming (e.g., always "Arts & Sciences", not "A&S")
- **Location names**: Use full, standardized names (e.g., "Omaha Campus", not just "Omaha")

### Data Validation
- Total_Headcount should equal sum of all individual headcount fields
- Activity numbers should be reasonable for organization size
- No duplicate Division + Location + Quarter combinations

## Sample Data Structure

### Example CSV Format:
```csv
Quarter_End_Date,Division,Location,BE_Faculty_Headcount,BE_Staff_Headcount,NBE_Faculty_Headcount,NBE_Staff_Headcount,NBE_Student_Worker_Headcount,Total_Headcount,BE_New_Hires,BE_Departures,NBE_New_Hires,NBE_Departures
2024-12-31,Arts & Sciences,Omaha Campus,125,85,15,25,30,280,8,5,12,9
2024-12-31,Arts & Sciences,Phoenix Campus,35,25,5,8,10,83,2,1,4,3
2024-12-31,School of Medicine,Omaha Campus,95,110,0,5,15,225,3,2,6,4
2024-12-31,Business,Omaha Campus,45,55,10,15,20,145,4,3,8,5
```

### Example Data Sources

#### From Oracle HCM or Similar Systems:
1. **Generate quarterly reports** by Division and Location
2. **Separate by benefit eligibility** (BE vs NBE)
3. **Count by employee type** (Faculty, Staff, Student Workers)
4. **Include hiring and departure activity** for the quarter
5. **Export as Excel or CSV** using the required column format

#### From Manual Aggregation:
1. **Group employee data** by Division, Location, and Quarter
2. **Count totals** for each category (BE Faculty, BE Staff, etc.)
3. **Calculate activity numbers** (new hires and departures for the quarter)
4. **Create one row per Division/Location/Quarter combination**

## Benefits of Aggregate Structure

### For Organizations:
- **No individual employee data** stored or transmitted
- **GDPR/Privacy compliant** - no personal information
- **Faster processing** - pre-calculated totals
- **Smaller file sizes** - fewer rows than individual records

### For Analytics:
- **Instant dashboard updates** - no aggregation processing needed
- **Historical trending** - quarter-over-quarter comparisons
- **Division and location analysis** - built-in organizational breakdown
- **Budget planning support** - benefit eligibility distinctions

## Upload Process

1. **Prepare your aggregate data** using the required format
2. **Validate data quality** (correct dates, consistent names, valid numbers)
3. **Upload via Excel Integration Dashboard** 
4. **Review data preview** to ensure correct mapping
5. **Confirm import** to update dashboard metrics

## Troubleshooting Common Issues

### Upload Failures:
- **"No valid records found"**: Check Quarter_End_Date, Division, and Location columns
- **"Invalid data format"**: Ensure you're uploading aggregate data, not individual records
- **"Missing required columns"**: Verify BE_Faculty_Headcount and BE_Staff_Headcount are present

### Data Quality Issues:
- **Inconsistent totals**: Verify Total_Headcount equals sum of individual counts
- **Date format errors**: Use YYYY-MM-DD format for all dates
- **Duplicate records**: Remove duplicate Division/Location/Quarter combinations

### Performance Issues:
- **Large files**: Consider splitting multi-year data into separate files
- **Complex calculations**: Pre-calculate totals before upload rather than using formulas

## Support and Documentation

For additional help with data format requirements:
- Review the downloadable template from the Excel Integration Dashboard
- Check the Template Instructions included with sample files
- Refer to the dashboard's built-in help sections

## Version History

- **v2.0** (January 2025): Complete refactor to aggregate-only data structure for enhanced privacy and security
- **v1.0** (2024): Initial documentation for mixed individual/aggregate data (deprecated)