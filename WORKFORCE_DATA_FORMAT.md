# Workforce Data Format Requirements

This document outlines the required data format for importing employee data into the Enhanced Workforce Analytics dashboard.

## File Format Support

The system accepts the following file formats:
- **Excel files**: `.xlsx`, `.xls`
- **CSV files**: `.csv`
- **Maximum file size**: 10MB

## Required Data Columns

### Core Required Fields
These fields are essential for basic dashboard functionality:

| Column Name | Description | Example | Required |
|------------|-------------|---------|----------|
| `Employee_ID` | Unique employee identifier | EMP001, 12345 | ✅ Recommended |
| `Name` OR `First_Name` + `Last_Name` | Employee full name | John Doe | ✅ Required |
| `Department` | Employee department | Academic Affairs | ✅ Required |

### Recommended Fields
These fields enhance the analytics and reporting capabilities:

| Column Name | Description | Example | Impact |
|------------|-------------|---------|--------|
| `Division` | Division or college | Arts & Sciences | Division-level analytics |
| `Position` | Job title or role | Professor, Manager | Position analysis |
| `Location` | Campus or office location | Omaha Campus | Location distribution |
| `Employee_Type` | Type of employee | Faculty, Staff, Student | Workforce composition |
| `Employment_Status` | Employment status | Full-time, Part-time | Status breakdown |
| `Hire_Date` | Start date of employment | 2020-08-15 | Tenure calculations |
| `Salary` | Annual salary | 75000 | Compensation analysis |
| `Manager` | Supervisor name | Jane Smith | Reporting structure |

### Optional Fields
These fields provide additional insights:

| Column Name | Description | Example |
|------------|-------------|---------|
| `Termination_Date` | End date (if applicable) | 2024-05-30 |
| `Grade` | Pay grade or level | Grade 12 |
| `Email` | Work email address | john.doe@university.edu |
| `Phone` | Work phone number | (555) 123-4567 |

## Column Name Flexibility

The system automatically maps common column name variations:

### Employee ID Variations
- `Employee_ID`, `EmployeeID`, `ID`, `Emp_ID`, `Employee_Number`

### Name Variations
- `Name`, `Full_Name`, `Employee_Name`
- `First_Name`, `FirstName`, `FName`, `Given_Name`
- `Last_Name`, `LastName`, `LName`, `Surname`, `Family_Name`

### Department Variations
- `Department`, `Dept`, `Department_Name`

### Division Variations
- `Division`, `Div`, `Division_Name`, `College`, `School`

### Employee Type Variations
- `Employee_Type`, `Type`, `Classification`, `Category`
- Auto-detects: Faculty, Staff, Student, Administration

### Date Format Support
- ISO format: `2024-01-15`
- US format: `1/15/2024`
- Excel serial dates (automatic conversion)

## Data Quality Requirements

### Required Data Quality
- ✅ **At least one name field** (Name OR First_Name + Last_Name)
- ✅ **No completely empty rows**
- ✅ **Consistent data types** within columns

### Data Quality Warnings
The system will flag but accept:
- ⚠️ Duplicate Employee IDs
- ⚠️ Missing department information
- ⚠️ Missing hire dates
- ⚠️ Inconsistent location names

### Data Processing
- **Automatic cleanup**: Trims whitespace, standardizes formats
- **Type normalization**: Converts employee types to standard categories
- **Date parsing**: Handles multiple date formats automatically
- **Duplicate handling**: Flags duplicates but processes all records

## Sample Data Template

Here's an example of properly formatted workforce data:

```csv
Employee_ID,First_Name,Last_Name,Department,Division,Position,Location,Employee_Type,Employment_Status,Hire_Date,Salary
EMP001,John,Doe,Academic Affairs,Arts & Sciences,Professor,Omaha Campus,Faculty,Full-time,2020-08-15,75000
EMP002,Jane,Smith,Student Affairs,Student Services,Advisor,Omaha Campus,Staff,Full-time,2019-06-01,45000
EMP003,Mike,Johnson,IT Services,Administration,Developer,Phoenix Campus,Staff,Full-time,2021-03-10,55000
EMP004,Sarah,Wilson,Library,Academic Support,Librarian,Omaha Campus,Faculty,Part-time,2022-01-20,35000
```

## Dashboard Metrics Generated

From your employee data, the system automatically calculates:

### Summary Metrics
- Total employee count by type (Faculty, Staff, Students)
- Vacancy rates and open positions
- Employee composition percentages
- Recent hiring trends

### Distribution Analysis
- **By Division**: Headcount and composition by division/college
- **By Location**: Campus distribution and percentages
- **By Department**: Departmental breakdown and analytics

### Trend Analysis
- **Historical trends**: Simulated quarterly growth patterns
- **Hiring activity**: Monthly starters vs leavers
- **Demographics**: Average tenure, age estimates, diversity metrics

### Real-time Insights
- Recent hires (last 30 days)
- Campus highlights and growth rates
- Executive summary with key findings

## Best Practices

### Data Preparation
1. **Clean your data** before import:
   - Remove test records or inactive employees
   - Standardize department/division names
   - Ensure consistent date formats

2. **Validate completeness**:
   - Check for missing names or key identifiers
   - Verify department assignments
   - Confirm employee type classifications

3. **Test with sample data**:
   - Use the downloadable template
   - Start with a small dataset to verify formatting
   - Review the preview before final import

### Troubleshooting Common Issues

| Issue | Solution |
|-------|----------|
| File upload fails | Check file size (<10MB) and format (.xlsx, .csv) |
| "Missing required columns" error | Ensure Name/First_Name+Last_Name columns exist |
| Duplicate ID warnings | Review employee IDs for uniqueness |
| Date parsing errors | Use YYYY-MM-DD format or Excel date cells |
| Department not showing | Check spelling and consistency of department names |

## Getting Help

If you encounter issues with data import:

1. **Download the template** - Use the provided Excel template as a starting point
2. **Check the preview** - Review the data preview before final import
3. **Review validation messages** - The system provides detailed error and warning messages
4. **Start small** - Test with a subset of your data first

## Security and Privacy

- All data processing happens locally in your browser
- No employee data is stored on external servers
- Files are processed in memory and discarded after import
- Dashboard data remains local to your session

---

*For technical support or questions about data formatting, please refer to the application's built-in help system or contact your system administrator.*