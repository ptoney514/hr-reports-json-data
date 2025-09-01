# Exit Survey Analysis Methodology & Calculation Guide

## Overview
This document defines the standardized methodology for calculating and analyzing exit survey metrics across all reporting periods. All exit survey dashboards should follow these calculation methods to ensure consistency.

## Data Structure

### Core Exit Survey Data Fields
```javascript
{
  reportingDate: "6/30/25",         // MM/DD/YY format
  quarter: "Q4 FY25",                // Quarter designation
  totalExits: 62,                    // Total employees who left
  totalResponses: 18,                // Number who completed survey
  responseRate: 29,                  // Calculated percentage
  wouldRecommend: 83.3,              // Percentage who would recommend
  wouldRecommendCount: {             
    positive: 15,                    // Number saying yes
    total: 18                        // Total who answered this question
  },
  concernsReported: {
    percentage: 22.2,                // Percentage reporting concerns
    count: 4,                        // Number reporting concerns
    total: 18,                       // Total responses
    description: "reported improper conduct"
  }
}
```

## Key Metric Calculations

### 1. Response Rate
**Formula:** `(Total Survey Responses / Total Exits) × 100`

**Example Q4 FY25:**
- Total Responses: 18
- Total Exits: 62
- Response Rate = (18 / 62) × 100 = **29%**

**Display Format:** "29% (18 of 62 exits)"

### 2. Would Recommend Rate (Satisfaction)
**Formula:** `(Positive Responses / Total Who Answered Question) × 100`

**Example Q4 FY25:**
- Positive Responses: 15
- Total Who Answered: 18
- Recommend Rate = (15 / 18) × 100 = **83.3%**

**Display Format:** "83.3% would still recommend Creighton as an employer"

### 3. Workplace Concerns Percentage
**Formula:** `(Number Reporting Concerns / Total Survey Responses) × 100`

**Example Q4 FY25:**
- Concerns Reported: 4
- Total Responses: 18
- Concerns % = (4 / 18) × 100 = **22.2%**

**Display Format:** "22.2% of respondents (4 of 18)"

### 4. Satisfaction Ratings (1-5 Scale)
**Categories Measured:**
- Job Satisfaction
- Management Support
- Career Development
- Work-Life Balance
- Compensation
- Benefits

**Calculation:** Average of all responses for each category on 5-point scale

**Example Q4 FY25 Ratings:**
```
Career Development: 2.8/5.0 (Lowest)
Management Support: 3.2/5.0
Job Satisfaction: 3.4/5.0
Work-Life Balance: 3.3/5.0
Compensation: 3.0/5.0
Benefits: 3.6/5.0 (Highest)
```

**Display Guidelines:**
- Always show as X.X/5.0 format
- Highlight lowest (<3.0) in red/yellow
- Highlight highest (>3.5) in green

### 5. Departure Reasons Analysis
**Formula:** `(Count for Each Reason / Total Responses) × 100`

**Example Q4 FY25 Top Reasons:**
```
Relocation: 22.2% (4 of 18)
Lack of career advancement: 16.7% (3 of 18)
Other: 16.7% (3 of 18)
Retirement: 11.1% (2 of 18)
Dissatisfied with supervisor: 11.1% (2 of 18)
```

**Color Coding Thresholds:**
- Red: ≥20% (Critical concern)
- Yellow: 15-19% (Moderate concern)
- Blue: 10-14% (Monitor)
- Green: <10% (Low impact)

### 6. Department Response Analysis
**Metrics to Calculate per Department:**
- Total Exits
- Survey Responses
- Response Rate = (Responses / Exits) × 100

**Important:** Sum of all department exits MUST equal total exits

**Handling Unlisted Departments:**
```javascript
// Calculate missing exits
listedExits = sum of all listed department exits
otherExits = totalExits - listedExits

// Add "Other Departments" row if needed
if (otherExits > 0) {
  add "Other Departments (Combined)" with calculated values
}
```

## Period-over-Period Comparisons

### Improvement Tracking
**Formula:** `((Current Period - Previous Period) / Previous Period) × 100`

**Example Q1 to Q4 FY25:**
```
Exit Volume: 80 → 62 = -22.5% improvement
Response Rate: 0% → 29% = +29 points
Satisfaction: 0% → 83% = New baseline established
```

## Data Validation Rules

### Required Validations
1. **Response Count Check:** `totalResponses ≤ totalExits`
2. **Percentage Sum:** Departure reasons should sum to ~100% (±5% for rounding)
3. **Department Totals:** Sum of department exits = total exits
4. **Rating Range:** All satisfaction ratings between 1.0 and 5.0
5. **Recommend Count:** `wouldRecommendCount.positive ≤ wouldRecommendCount.total`

### Data Completeness Indicators
- **Complete Quarter:** 3 full months of data
- **Partial Quarter:** <3 months (mark as "INCOMPLETE")
- **No Data:** Survey not yet implemented (mark as "Baseline")

## Reporting Standards

### Minimum Viable Analysis Requirements
- **Response Rate:** Minimum 20% for statistically meaningful insights
- **Sample Size:** At least 10 responses for trend analysis
- **Time Period:** Full quarter (3 months) for comparative analysis

### Key Insights Structure
Each report should include:

1. **Overall Picture** (2-3 bullet points)
   - Exit volume and trend
   - Overall satisfaction/recommendation rate
   - Response rate achievement

2. **Key Concerns** (2-3 bullet points)
   - Highest percentage departure reasons
   - Lowest satisfaction categories
   - Conduct/culture issues if >10%

3. **Positive Findings** (2-3 bullet points)
   - Highest satisfaction areas
   - Strong recommendation rate (if >75%)
   - Successful departmental participation

4. **Action Items** (3-4 specific recommendations)
   - Based on data findings
   - Measurable and time-bound
   - Addressing top concerns

## Success Metrics & Targets

### Quarterly Targets
- **Response Rate:** >40% (stretch: >50%)
- **Would Recommend:** >80%
- **Conduct Concerns:** <10%
- **Career Development Score:** >3.5/5.0
- **Management Support Score:** >3.5/5.0

### Year-over-Year Goals
- Reduce total exits by 15%
- Improve response rate to 50%+
- Maintain 80%+ recommendation rate
- All satisfaction categories >3.0/5.0

## Implementation Checklist

### For Each New Quarter:
- [ ] Collect exit data from HRIS
- [ ] Send surveys to all exits within 30 days
- [ ] Allow 2 weeks for responses
- [ ] Calculate all metrics using formulas above
- [ ] Validate data completeness
- [ ] Compare to previous quarters
- [ ] Generate insights and action items
- [ ] Create dashboard visualizations
- [ ] Share findings with leadership

## Visual Display Standards

### Charts to Include:
1. **Key Metrics Cards:** 4 cards showing primary KPIs
2. **Departure Reasons Bar Chart:** Horizontal bars with color coding
3. **Satisfaction Ratings Chart:** Vertical bars with 5.0 scale
4. **Department Response Table:** Shows participation by unit
5. **Trend Line:** Quarter-over-quarter exit volume

### Color Palette:
- **Primary Blue:** #0054A6 (Creighton Blue)
- **Success Green:** #71CC98
- **Warning Yellow:** #FFC72C
- **Alert Red:** #EF4444
- **Info Blue:** #1F74DB

## Common Calculations Reference

```javascript
// Response Rate
responseRate = (totalResponses / totalExits) * 100;

// Would Recommend Percentage
recommendRate = (wouldRecommendCount.positive / wouldRecommendCount.total) * 100;

// Concerns Percentage
concernsPercent = (concernsReported.count / concernsReported.total) * 100;

// Department Response Rate
deptResponseRate = (dept.responses / dept.exits) * 100;

// Quarter-over-Quarter Change
qoqChange = ((currentValue - previousValue) / previousValue) * 100;

// Average Satisfaction Score
avgSatisfaction = (sum of all category scores) / (number of categories);
```

## Notes on Q4 FY25 Specific Calculations

The Q4 FY25 dashboard shows these specific values:
- **62 total exits** (down 22.5% from Q1's 80 exits)
- **18 survey responses** (29% response rate)
- **83.3% recommendation rate** (15 of 18 positive)
- **22.2% reported concerns** (4 of 18)
- **Lowest satisfaction:** Career Development at 2.8/5.0
- **Highest satisfaction:** Benefits at 3.6/5.0

These calculations serve as the model for all future quarters.

---

*Last Updated: September 2025*
*Document Version: 1.0*
*Owner: HR Analytics Team*