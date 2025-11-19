# Career Lifecycle Insights - Termination Data Analysis

## Overview

By tracking employee numbers across termination records, we can extract valuable workforce lifecycle insights beyond basic turnover metrics.

**Generated:** 2025-11-18
**Source:** terminations_cleaned.csv (5,612 records, 5,470 unique employees)
**Key Finding:** 137 boomerang employees (2.5%) with multiple termination records

---

## 🔑 **Key Discovery: "TEMP + Cobra" Pattern Explained**

### What We Thought Was a Data Error

TEMP workers showing "Cobra Eligible" benefit program initially appeared to be data quality errors.

### The Reality

**These are RETURN HIRES!**

Employees who:
1. Originally worked in regular F12/F11/F10 roles (benefit-eligible)
2. Left the university (retired, resigned, or end of assignment)
3. Returned in TEMP capacity months/years later
4. **Retain Cobra eligibility from their previous regular employment**

**This is correct system behavior, not a data error.**

---

## 📊 **Boomerang Employee Patterns**

### Summary Statistics

- **Total Boomerang Employees:** 137 (2.5% of workforce)
- **Total Termination Records:** 279 (average 2.0 terminations per boomerang)
- **Career Patterns Identified:**
  - Regular → TEMP (Return Hires): **15 employees**
  - TEMP → Regular (Career Progression): **4 employees**
  - Retirement → Return: **4 employees** (subset of Regular → TEMP)
  - Multiple Regular Roles: **24 employees**

### Return Hire Timing

**Average Time Between Stints:** 1.2 years

**Distribution:**
- Quick Returns (<6 months): Common for retirees returning part-time
- Medium Returns (6-18 months): Career breaks, sabbaticals
- Long Returns (2-5 years): Career pivots, returning after external experience

---

## 💡 **Potential Analyses & Insights**

### 1. **Return Hire Rate Analysis**

**Questions We Can Answer:**
- What percentage of terminated employees return?
- Which departments have highest return hire rates?
- Do retirement returns differ from voluntary resignation returns?
- What's the average tenure of return hires vs. first-time hires?

**Business Value:**
- Identify alumni talent pool
- Understand department-specific return patterns
- Optimize rehire strategies

---

### 2. **Career Progression Tracking**

**Questions We Can Answer:**
- How many employees started as students (CWS/SUE) → became regular staff?
- What's the typical career path? (TEMP → PT → FT?)
- Which entry points (student, temp) lead to regular employment?
- Do internal progressions have better retention?

**Business Value:**
- Understand talent development pipelines
- Identify effective entry pathways
- Improve internal mobility programs

---

### 3. **Retirement Engagement Analysis**

**Questions We Can Answer:**
- How many retirees return in TEMP/PT roles?
- What's the average time between retirement and return?
- Which departments leverage retired talent?
- What types of work do returning retirees perform?

**Business Value:**
- Leverage institutional knowledge
- Create emeritus/phased retirement programs
- Retain critical expertise

---

### 4. **Regrettable vs. Non-Regrettable Turnover**

**Using Multiple Records:**
- Employees who return → Were they regrettable losses?
- Quick returns (<3 months) → Signal of hiring mistakes or fit issues?
- Career progressions → Did we develop talent successfully?

**Business Value:**
- Identify true talent loss vs. natural career cycles
- Improve retention strategies for high-value returns
- Understand which roles are stepping stones vs. destinations

---

### 5. **Tenure Analysis Across Multiple Stints**

**Questions We Can Answer:**
- What's cumulative tenure across all employment periods?
- Do return hires have longer combined tenure?
- Which employees have the most loyalty/connection to institution?

**Business Value:**
- Recognition programs for cumulative service
- Understanding true institutional commitment
- Long-term workforce planning

---

### 6. **Department-Specific Return Patterns**

**Questions We Can Answer:**
- Which departments have revolving door patterns?
- Which departments successfully retain talent across career changes?
- Are there seasonal patterns (academic calendar)?

**Business Value:**
- Department-specific retention strategies
- Understanding academic vs. administrative patterns
- Identifying departments with flexible workforce models

---

## 🔍 **Sample Return Hire Patterns Found**

### Example 1: Quick Retirement Return (Empl_Num 278)
- **First:** F12 (Regular) → Retirement
- **Returned:** TEMP role 36 days later (0.1 years)
- **Pattern:** Phased retirement or continued project work

### Example 2: Career Break Return (Empl_Num 32574)
- **First:** F11 (Regular) → Voluntary
- **Returned:** TEMP role 630 days later (1.7 years)
- **Pattern:** Career exploration, returned for specific project

### Example 3: Long-Term Alumni Return (Empl_Num 31829)
- **First:** F12 (Regular) → Voluntary
- **Returned:** TEMP role 1,686 days later (4.6 years)
- **Pattern:** Alumni engagement, leveraging external experience

---

## 📈 **Recommended Dashboard Additions**

### 1. **Return Hire Dashboard**
- Return hire count by quarter
- Time-to-return distribution
- Department return hire rates
- Original vs. return role comparison

### 2. **Career Progression Dashboard**
- Student → Staff conversion rates
- TEMP → Regular promotion paths
- Internal mobility trends
- Tenure by career path

### 3. **Boomerang Employee Tracker**
- Active employees with previous terminations
- Cumulative tenure calculations
- Department alumni pools
- Retirement return programs

---

## 🎯 **Business Impact**

### Immediate Applications

1. **Talent Acquisition:** Prioritize alumni/former employees for TEMP positions
2. **Retention:** Understand that some turnover is temporary (they return!)
3. **Succession Planning:** Identify retirees willing to return for knowledge transfer
4. **Internal Mobility:** Track career development success stories

### Strategic Planning

1. **Alumni Network:** Former employees are a talent reservoir
2. **Phased Retirement:** Data supports structured programs
3. **Project-Based Hiring:** TEMP roles can engage former regular employees
4. **Career Pathways:** Document and promote successful progression patterns

---

## 🔧 **Technical Implementation**

### Data Requirements

**Already Have:**
- ✅ Empl_Num (unique identifier across records)
- ✅ Term_Date (for calculating time between stints)
- ✅ Assignment_Category (track role changes)
- ✅ Benefit_Program_Description (explains Cobra for returns)

**Could Add:**
- Hire_Date for each stint (to calculate stint-specific tenure)
- Department changes between stints
- Job title progression tracking

### Calculation Examples

```python
# Find return hires
boomerangs = df.groupby('Empl_Num').filter(lambda x: len(x) > 1)

# Calculate time between stints
def calc_time_between(group):
    group = group.sort_values('Term_Date')
    if len(group) > 1:
        return (group.iloc[1]['Term_Date'] - group.iloc[0]['Term_Date']).days
    return None

# Track career progression
def get_career_path(group):
    return ' → '.join(group.sort_values('Term_Date')['Assignment_Category'].tolist())
```

---

## ✅ **Validation of Current Approach**

This analysis **confirms our Assignment Category filter is correct:**

1. **Benefit_Program_Description is point-in-time** ✅
   - TEMP workers with "Cobra" are former regular employees
   - System correctly shows their continued benefit eligibility

2. **Assignment Category is reliable** ✅
   - Accurately reflects employment type at termination
   - Doesn't change based on past employment

3. **No true "data errors"** ✅
   - What appeared as inconsistencies are valid career patterns
   - System is working as designed

---

## 📝 **Next Steps**

### Immediate (Already Done)
- ✅ Use Assignment Category for benefit-eligible filtering
- ✅ Document in TERMINATION_METHODOLOGY.md
- ✅ Update quarterly turnover dashboards

### Future Enhancements
- [ ] Create Return Hire Analysis Dashboard
- [ ] Track cumulative tenure across multiple stints
- [ ] Identify high-value alumni for targeted recruitment
- [ ] Monitor retirement return programs
- [ ] Analyze career progression success rates

---

## 📚 **Related Documentation**

- **TERMINATION_METHODOLOGY.md** - Section 4: Benefit Eligibility (Assignment Category filter)
- **career_lifecycle_insights.json** - Full analysis results
- **analyze_career_lifecycle.py** - Analysis script

---

*Generated: 2025-11-18*
*Last Updated: 2025-11-18*
