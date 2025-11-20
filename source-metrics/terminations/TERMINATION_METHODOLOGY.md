# Termination Data Methodology

## Purpose

This document defines the business rules, calculations, and classifications used to process termination data. All transformations must follow this methodology to ensure consistency and accuracy.

---

## Data Scope and Filtering

### Fiscal Year Filter
**Rule**: Include only terminations from FY2020 onwards

**Logic**:
```python
Term_Date >= '2020-07-01'  # FY2020 starts July 1, 2020
```

**Rationale**:
- Aligns with workforce headcount methodology (FY20+)
- Ensures comparable datasets
- Focuses on recent, relevant termination patterns

**Impact**: Excludes ~5,000-6,000 pre-FY20 terminations from 11,418 total records

---

## Calculated Fields

### 1. Tenure Calculation

**Field**: `Tenure` (Float - years of service)

**Formula**:
```python
Tenure = (Term_Date - Hire_Date).days / 365.25
```

**Example**:
- Hire_Date: 2022-07-30
- Term_Date: 2023-05-19
- Tenure: 0.81 years

**Edge Cases**:
- If Hire_Date is NULL → Tenure = NULL
- If Term_Date < Hire_Date → Flag as data error, set Tenure = NULL
- Negative tenure → Invalid data, exclude or flag

---

### 2. Tenure Band Classification

**Field**: `Tenure_Band` (Text - categorical)

**Logic**:
```python
if Tenure < 1:
    Tenure_Band = "<1 Year"
elif 1 <= Tenure < 3:
    Tenure_Band = "1-3 Years"
elif 3 <= Tenure < 5:
    Tenure_Band = "3-5 Years"
elif 5 <= Tenure < 10:
    Tenure_Band = "5-10 Years"
else:  # Tenure >= 10
    Tenure_Band = "10+ Years"
```

**Categories** (Ordered):
1. "<1 Year"
2. "1-3 Years"
3. "3-5 Years"
4. "5-10 Years"
5. "10+ Years"

**Null Handling**: If Tenure is NULL → Tenure_Band = "Unknown"

---

### 3. Employee Category Classification

**Field**: `Employee_Category` (Text)

**Purpose**: Standardize employee classification to match workforce data categories

**Logic** (Priority Order):
```python
# Step 1: Check for Faculty
if "Faculty" in User_Person_Type or "Faculty" in Faxc_Staff:
    Employee_Category = "Faculty"

# Step 2: Check for House Staff
elif Assignment_Category == "HSR":
    Employee_Category = "House Staff"

# Step 3: Check for Students
elif Assignment_Category in ["CWS", "SUE"]:
    Employee_Category = "Students"

# Step 4: Check Exempt vs Non-Exempt Staff
elif Hourly_Salaried == "Salaried":
    Employee_Category = "Staff Exempt"
elif Hourly_Salaried == "Hourly":
    Employee_Category = "Staff Non-Exempt"

# Step 5: Fallback
else:
    Employee_Category = "Other"
```

**Categories** (Final):
1. **Faculty** - All faculty members
2. **Staff Exempt** - Salaried/exempt staff (managers, professionals)
3. **Staff Non-Exempt** - Hourly/non-exempt staff
4. **House Staff** - House staff physicians (HSR)
5. **Students** - Student workers (CWS, SUE)
6. **Other** - Other employment types

**Validation**: Cross-check with Grade codes
- Grades J-K should be Staff Exempt
- Grades A-D typically Staff Non-Exempt
- Grade Y often Faculty

---

### 4. Benefit Eligibility Determination

**Purpose**: Define which employees are benefit-eligible for turnover reporting

**Two-Step Filter Process**:

#### Step 1: Assignment Category Filter
**Include**:
- F12, F11, F10, F09 (Full-time regular)
- PT12, PT11, PT10, PT9 (Part-time regular)

**Exclude**:
- HSR (House Staff Residents - tracked separately)
- TEMP, NBE, PRN (Temporary/non-benefit)
- SUE, CWS (Student workers)

#### Step 2: Grade Code Exclusion (CRITICAL)
**Exclude Grade R** - Even if Assignment Category is F12/PT12:

**Rule**: `Grade Code NOT LIKE 'R%'`

**Rationale**:
- Grade R = Residents/Fellows (PT, OT, Pharmacy)
- These positions are:
  - **NOT benefits-eligible** despite F12/PT12 assignment
  - Training programs (1-2 year rotations)
  - Different compensation structure
  - Excluded from benefit-eligible reporting

**Examples of Grade R Job Titles**:
- Physical Therapy Resident
- Occupational Therapy Fellow
- Pharmacy Resident
- Pharmacy Fellow

**Implementation**:
```python
BENEFIT_ELIGIBLE_CODES = ['F12', 'F11', 'F10', 'F09', 'PT12', 'PT11', 'PT10', 'PT9']

benefit_eligible = df[
    (df['Assignment_Category'].isin(BENEFIT_ELIGIBLE_CODES)) &
    (~df['Grade'].str.startswith('R', na=False))  # EXCLUDE Grade R
]
```

**Q1 FY26 Impact**:
- Without Grade R exclusion: 73 terminations
- Grade R employees to exclude: 15
- Corrected benefit-eligible: **58 terminations**

**Data Quality Note**: Grade R exclusion applies to both terminations AND workforce headcount

---

### 5. Termination Type Classification

**Field**: `Termination_Type` (Text)

**Purpose**: Classify terminations as Voluntary, Involuntary, or Retirement

**Logic** (check both Term_Reason_1 and Term_Reason_2):

```python
# Check for Retirement first
if any(keyword in [Term_Reason_1, Term_Reason_2] for keyword in
       ["Retire", "RETIREMENT", "Retired"]):
    Termination_Type = "Retirement"

# Check for Involuntary
elif any(keyword in [Term_Reason_1, Term_Reason_2] for keyword in
         ["Terminated", "Termination", "PERFORMANCE", "CONDUCT", "Laid Off"]):
    Termination_Type = "Involuntary"

# Check for Voluntary
elif any(keyword in [Term_Reason_1, Term_Reason_2] for keyword in
         ["Resign", "BETTER_OP", "RELOCATION", "PERSONAL", "RETURN_SCHOOL"]):
    Termination_Type = "Voluntary"

# Fallback
else:
    Termination_Type = "Other"
```

**Categories**:
1. **Voluntary** - Employee chose to leave
2. **Involuntary** - Employer-initiated termination
3. **Retirement** - Retirement (may be voluntary or planned)
4. **Other** - Cannot determine from reason codes

**Validation**: Manual review of "Other" classifications

---

### 5. Campus Standardization

**Field**: `Campus` (Text)

**Logic**:
```python
if pd.isna(Location) or Location.strip() == "":
    Campus = "Unknown"
elif "Omaha" in Location or "omaha" in Location.lower():
    Campus = "OMA"
elif "Phoenix" in Location or "phoenix" in Location.lower():
    Campus = "PHX"
else:
    Campus = "Unknown"
```

**Values**:
- "OMA" - Omaha Campus
- "PHX" - Phoenix Campus
- "Unknown" - Location not specified or unclear

---

### 6. Fiscal Period Calculations

**Fields**: `Termination_Fiscal_Year`, `Termination_Fiscal_Quarter`, `Termination_Fiscal_Period`

**Logic** (based on Term_Date):

```python
def get_fiscal_year(date):
    """Fiscal year starts July 1"""
    if date.month >= 7:  # July onwards
        return f"FY{str(date.year + 1)[-2:]}"
    else:  # January-June
        return f"FY{str(date.year)[-2:]}"

def get_fiscal_quarter(date):
    """Q1=Jul-Sep, Q2=Oct-Dec, Q3=Jan-Mar, Q4=Apr-Jun"""
    month = date.month
    if 7 <= month <= 9:
        return "Q1"
    elif 10 <= month <= 12:
        return "Q2"
    elif 1 <= month <= 3:
        return "Q3"
    else:  # 4-6
        return "Q4"

def get_fiscal_period(date):
    """Combined period identifier"""
    return f"{get_fiscal_quarter(date)} {get_fiscal_year(date)}"
```

**Examples**:
- Term_Date: 2024-10-04 → FY25, Q2, "Q2 FY25"
- Term_Date: 2025-05-19 → FY25, Q4, "Q4 FY25"
- Term_Date: 2024-07-15 → FY25, Q1, "Q1 FY25"

---

## Data Privacy and Anonymization

### Fields REMOVED for Privacy
- ❌ Last_Name
- ❌ First_Name
- ❌ Middle_Name
- ❌ Display_Name

**Rationale**: Protect employee privacy while maintaining analytical capability

### Fields KEPT for Analysis
- ✅ Empl_num (required for joining with workforce data)
- ✅ Person_Date_of_Birth (for age calculations and validation)
- ✅ Gender, Ethnicity (for diversity analytics)
- ✅ Disabled, Vet_Status (for protected class analytics)

**Note**: Empl_num is an anonymized identifier, not a name

---

## Alignment with Workforce Headcount Data

### Shared Fields for Joining
| Field in Terminations | Field in Workforce | Purpose |
|-----------------------|-------------------|---------|
| Empl_num | Empl num | Primary join key |
| Assignment_Category | Assignment Category Code | Employment classification |
| Hire_Date | Current Hire Date | Tenure validation |
| Dept_Name | Organization Name | Department analysis |
| School | New School | School-level analysis |
| VP_Area | New VP | VP area analysis |
| Location/Campus | Campus | Campus analysis |
| Gender | Gender | Demographic analysis |
| Ethnicity | Employee Ethnicity | Diversity analysis |

### Calculation Consistency
- **Tenure Bands**: Must match LOS Bands from workforce data
- **Fiscal Calendar**: Must use same FY start date (July 1)
- **Campus Mapping**: Must use same OMA/PHX logic
- **Employee Category**: Align with workforce categorization

---

## Turnover Rate Calculation (Requires Both Datasets)

### Standard Formula
```
Turnover Rate = (Terminations in Period / Average Headcount in Period) × 100
```

### By Employee Category
```
Faculty Turnover Rate =
  (COUNT terminations WHERE Employee_Category = "Faculty") /
  (AVG headcount WHERE Employee_Category = "Faculty") × 100
```

### By Department
```
Department Turnover Rate =
  (COUNT terminations WHERE Dept_Name = "X") /
  (AVG headcount WHERE Organization_Name = "X") × 100
```

### By Tenure Band
```
<1 Year Turnover Rate =
  (COUNT terminations WHERE Tenure_Band = "<1 Year") /
  (COUNT workforce WHERE LOS_Band = "0-1 years") × 100
```

**Note**: Average headcount typically uses:
- Beginning headcount + Ending headcount) / 2
- Or snapshot headcount at end of period

---

## Data Quality Checks

### Pre-Cleaning Validation
- [ ] File exists and is readable
- [ ] Expected columns are present
- [ ] Date fields are valid dates
- [ ] No completely empty records

### Post-Cleaning Validation
- [ ] No duplicate terminations per employee per quarter
- [ ] All Term_Date >= Hire_Date
- [ ] All Tenure >= 0
- [ ] Employee_Category is not NULL
- [ ] Termination_Type is not NULL
- [ ] Fiscal_Period is valid format
- [ ] Record count matches expectations

### Cross-Dataset Validation (with Workforce)
- [ ] Terminated employees exist in workforce snapshot before term date
- [ ] Departments in termination data exist in workforce data
- [ ] Schools match between datasets
- [ ] Total terminations + current headcount = previous headcount (approximately)

---

## Business Rules

### Rule 1: Fiscal Year Alignment
**All fiscal calculations must start July 1**

Termination data and workforce data MUST use the same fiscal calendar for accurate turnover rate calculations.

### Rule 2: Tenure Calculation Precision
**Use 365.25 days per year** to account for leap years

This ensures accurate multi-year tenure calculations.

### Rule 3: Employee Category Consistency
**Must match workforce headcount categorization**

If categorization differs, turnover rates will be inaccurate. Regular validation required.

### Rule 4: Quarterly Snapshots
**Each quarter is archived independently**

Never overwrite previous quarters. Each quarterly export is a separate, immutable archive.

### Rule 5: Audit Trail Required
**Every cleaning operation must generate audit documentation**

DATA_CLEANING_AUDIT.md must document every transformation for reproducibility.

---

## Error Handling

### Missing Required Fields
**If Term_Date or Empl_num is missing:**
- Log the issue
- Exclude record from cleaned data
- Document in audit file

### Invalid Dates
**If Term_Date < Hire_Date:**
- Flag as data quality issue
- Set Tenure = NULL
- Keep record but mark for review

### Unknown Classifications
**If cannot determine Employee_Category:**
- Set to "Other"
- Log for manual review
- Document in audit file

---

## Future Enhancements

### Planned Additions
1. **Exit Survey Join**: Link terminations to exit survey responses
2. **Regrettable vs Non-Regrettable**: Classification of termination impact
3. **Time to Replace**: Calculate time to backfill position
4. **Cost of Turnover**: Estimate replacement costs

### Data Source Expansions
1. **Promotion Data**: Distinguish promotions from lateral moves
2. **Return Hires**: Track employees who leave and return
3. **Transfer Data**: Internal movements vs actual terminations

---

## Related Documentation

- **DATA_DICTIONARY.md**: Field definitions and codes
- **DATA_GOVERNANCE_STANDARDS.md**: Quarterly archive structure
- **Workforce METHODOLOGY.md**: Headcount calculation rules (for turnover rates)

---

## Revision History

| Date | Version | Changes |
|------|---------|---------|
| 2025-10-29 | 1.0 | Initial TERMINATION_METHODOLOGY.md created |

---

*This methodology ensures consistent, accurate, and auditable termination data processing.*
