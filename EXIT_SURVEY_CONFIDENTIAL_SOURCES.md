# CONFIDENTIAL: Exit Survey Source Documentation
## FY25 Exit Survey Feedback Analysis

---
**CONFIDENTIAL - FOR HR LEADERSHIP ONLY**
---

## 📍 Source Data Locations

### Primary Data Files
- **Exit Survey Analysis:** `/src/data/fy25ExitSurveyAnalysis.json`
- **Turnover Raw Data:** `/src/data/fy25TurnoverData.json`
- **Static Dashboard Data:** `/src/data/staticData.js`
- **Excel Source:** `/source-metrics/terms/fy25/Terms Since 2017 Detail PT.xlsx`

### Dashboard Components
- **Q1 Dashboard:** `/src/components/dashboards/ExitSurveyQ1Dashboard.jsx:73-75`
- **Q2 Dashboard:** `/src/components/dashboards/ExitSurveyQ2Dashboard.jsx`
- **Q3 Dashboard:** `/src/components/dashboards/ExitSurveyQ3Dashboard.jsx`
- **Q4 Dashboard:** `/src/components/dashboards/ExitSurveyQ4Dashboard.jsx`

---

## 🚨 Workplace Conduct Concerns Analysis

### Q1 FY25 (15% reporting concerns)
**Source:** `fy25ExitSurveyAnalysis.json:112`
- 3 of 20 respondents reported improper conduct
- **Location:** Q1 dashboard shows this at line 73-75
- **Context:** Initial baseline measurement, establishing tracking system

### Q2 FY25 (18% reporting concerns)
**Source:** `fy25ExitSurveyAnalysis.json:144`
- 2 of 11 respondents reported issues
- **Trend:** 3 percentage point increase from Q1
- **Small sample size** may amplify percentages

### Q3 FY25 (20% reporting concerns)
**Source:** `fy25ExitSurveyAnalysis.json:176`
- 4 of 20 respondents reported concerns
- **Trend:** Continued upward trajectory
- **Equal sample size to Q1** makes comparison valid

### Q4 FY25 (22.2% reporting concerns) ⚠️
**Source:** `fy25ExitSurveyAnalysis.json:208`
- 4 of 18 respondents reported improper conduct
- **Highest rate of fiscal year**
- **7.2 percentage point increase** from Q1 baseline

**Action Required:** Rising trend from 15% → 22.2% indicates systemic issues requiring immediate intervention

---

## 👥 Supervisor/Management Issues

### Consistent Top 3 Exit Reason
**Sources by Quarter:**
- **Q1:** 30% cited supervisor issues (`fy25ExitSurveyAnalysis.json:99-101`)
- **Q2:** 18% cited supervisor issues (`fy25ExitSurveyAnalysis.json:135-137`)
- **Q3:** 35% cited supervisor issues (`fy25ExitSurveyAnalysis.json:159-161`) ⚠️ **PEAK**
- **Q4:** Data shows improvement but still present

### Management Support Satisfaction Scores
**Source:** `fy25ExitSurveyAnalysis.json:10`
- **Average:** 2.9/5.0 (Below target of 3.5)
- **Quarterly progression:**
  - Q1: 2.8/5.0
  - Q2: 3.0/5.0
  - Q3: 2.7/5.0 (lowest point)
  - Q4: 3.2/5.0 (improvement)

---

## 📈 Career Development Crisis

### Lowest Satisfaction Category
**Source:** `fy25ExitSurveyAnalysis.json:9`
- **FY25 Average:** 2.5/5.0 (Critical - far below 3.5 target)
- **Quarterly breakdown:**
  - Q1: 2.2/5.0 ⚠️
  - Q2: 2.5/5.0
  - Q3: 2.3/5.0
  - Q4: 2.8/5.0 (still critical)

### Career Advancement as Exit Reason
**Source:** `fy25ExitSurveyAnalysis.json:28-30`
- Present in all 4 quarters
- Average 26% across fiscal year
- **Top reason in Q1** at 35%

---

## 📊 Supporting Metrics

### Response Rates by Quarter
**Sources:** `fy25ExitSurveyAnalysis.json:82-85, 114-117, 146-149, 178-181`
- Q1: 25.3% (20 of 79 exits)
- Q2: 30.6% (11 of 36 exits)
- Q3: 38.5% (20 of 52 exits)
- Q4: 35.3% (18 of 51 exits)

### Would Recommend Rates
**Sources:** Same locations as above
- Q1: 60%
- Q2: 72.7%
- Q3: 45% ⚠️ **Lowest point**
- Q4: 83.3% ✅ **Recovery**

---

## 🔍 Data Validation Points

### Turnover Data Alignment
**Source:** `fy25TurnoverData.json`
- Q1: 78 terminations (line 19-102)
- Q2: 36 terminations (line 104-145)
- Q3: 52 terminations (line 147-204)
- Q4: 51 terminations (line 206-262)
- **Total FY25:** 222 unique employees

### HR System Term Reasons
**Source:** `fy25TurnoverData.json:266-282`
- Resigned: 50% (111 employees)
- Retirement: 12.2% (27 employees)
- End Assignment: 10.4% (23 employees)
- Better Opportunity: 9.5% (21 employees)

---

## 🎯 Specific Action Items Based on Data

1. **Workplace Conduct Investigation**
   - Review Q3-Q4 period for specific incidents
   - 22.2% reporting rate requires formal review
   - Source: Dashboard warnings at Q4Dashboard.jsx

2. **Management Training Priority**
   - 35% in Q3 cited supervisor issues
   - Focus on departments with highest turnover
   - Source: Q3Dashboard.jsx satisfaction metrics

3. **Career Development Program**
   - 2.5/5.0 average is lowest of all categories
   - Implement clear advancement paths
   - Source: All quarterly dashboards show this as critical

4. **Exit Survey Enhancement**
   - Current system lacks verbatim comments
   - Add qualitative feedback collection
   - Source: No comment fields in current data structure

---

## 📝 Notes on Data Collection

**Current Limitations:**
1. No actual employee comments captured in system
2. Only quantitative ratings and multiple choice responses
3. Department-level data not available in current structure
4. Individual employee IDs present but no narrative feedback

**Recommendation:** Implement comment collection system to capture specific examples and context for the statistical findings shown above.

---

*Document Created: September 2025*
*Classification: CONFIDENTIAL - HR Leadership Only*
*Next Review: Q1 FY26*