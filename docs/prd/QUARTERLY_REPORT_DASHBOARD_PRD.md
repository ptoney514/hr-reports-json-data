# Quarterly Report Dashboard - Product Requirements Document (PRD)

**Version:** 1.0
**Last Updated:** November 14, 2025
**Document Owner:** Product Manager
**Status:** Design Review - Awaiting User Approval

---

## Executive Summary

### Problem Statement
As an HR professional creating quarterly executive reports, I spend significant time manually compiling data from 4+ separate dashboards (Workforce, Turnover, Recruiting, Exit Survey) into PowerPoint presentations for leadership. This manual process is time-consuming, error-prone, and makes it difficult to maintain consistent quarter-over-quarter comparisons.

### Proposed Solution
Create a dedicated **Quarterly Report Dashboard** that consolidates key HR metrics from all existing dashboards into a single, executive-ready view with quarter selection, period comparisons, and PDF export capability. This dashboard will serve as a "one-stop shop" for generating comprehensive quarterly HR reports.

### Success Criteria
- **Time Savings:** Reduce quarterly report creation time from 2-3 hours to 15-20 minutes
- **Accuracy:** Eliminate manual data transcription errors by sourcing directly from staticData.js
- **Usability:** User can generate a complete quarterly report with 3 clicks (select quarter, review, export PDF)
- **Completeness:** Report includes all critical metrics from Workforce, Turnover, Recruiting, and Exit Survey domains
- **Accessibility:** WCAG 2.1 AA compliant with print-ready styling

### Target Launch Date
**Version 1 (MVP):** 2 weeks from approval (December 1, 2025)

---

## Background & Context

### Why Now?
- **User Need:** Quarterly reporting to leadership is a recurring, high-priority task
- **Data Availability:** All required data already exists in staticData.js with FY25 Q1-Q4 coverage
- **Component Reusability:** Existing KPI cards, charts, and layouts can be leveraged
- **Strategic Timing:** FY26 Q1 just started (July 1, 2025) - perfect timing to launch before Q1 report is due

### Who Requested This?
- **Primary User:** You (HR professional) based on documented pain point of manual report compilation
- **Secondary Stakeholders:** HR Leadership who receive quarterly reports

### What Happens If We Don't Build This?
- Manual report creation continues to consume 8-12 hours per year
- Risk of data inconsistencies between dashboards and reports
- Missed opportunity to provide quarter-over-quarter trend insights
- Leadership reports may lack visual consistency

---

## Goals & Success Metrics

### Primary Goal
**Enable single-user creation of comprehensive quarterly HR reports in under 20 minutes**

**Success Metric:** Report generation time < 20 minutes (measured from quarter selection to PDF export)

### Secondary Goals
1. **Data Accuracy:** 100% alignment between dashboard metrics and staticData.js source
2. **Visual Consistency:** Report follows Creighton branding (existing dashboard styles)
3. **Print Quality:** PDF export is presentation-ready without additional editing
4. **Accessibility:** WCAG 2.1 AA compliance maintained

### Leading Indicators
- Frequency of dashboard usage (target: 4+ times per year, once per quarter)
- PDF export success rate (target: 95%+ successful exports)
- User satisfaction with report completeness (qualitative feedback)

---

## User Personas & Target Audience

### Primary Persona: HR Report Creator (You)
**Role:** HR Professional / Analyst
**Technical Proficiency:** High (comfortable with dashboards, data analysis)
**Frequency of Use:** Quarterly (4 times per year)
**Primary Goal:** Create comprehensive, accurate HR reports for leadership efficiently

**Pain Points:**
- Manually switching between 4+ dashboards to collect data
- Copy-pasting metrics into PowerPoint/Excel
- Ensuring consistency across quarters
- Time pressure to deliver reports quickly

**Needs:**
- Single view with all critical metrics
- Quarter selection with prior quarter comparison
- Export to PDF for distribution
- Print-ready formatting

### Secondary Persona: HR Leadership (Report Consumer)
**Role:** VP HR, CHRO, University Leadership
**Technical Proficiency:** Medium (consumers of reports, not creators)
**Frequency of Use:** Quarterly (receive and review reports)
**Primary Goal:** Understand HR trends, make informed decisions

**Needs:**
- Executive summary format (KPIs first, details below)
- Visual charts for quick pattern recognition
- Quarter-over-quarter comparisons
- Actionable insights

### Tertiary Persona: University Executive Leadership
**Role:** President, Provost, VPs
**Technical Proficiency:** Low-Medium (high-level report consumers)
**Frequency of Use:** Quarterly (board meetings, strategic planning)
**Primary Goal:** Monitor university HR health at a glance

**Needs:**
- High-level summary (KPIs only)
- Minimal text, maximum visual impact
- Clear trend indicators (up/down/stable)

---

## User Stories & Use Cases

### Epic: Quarterly Report Generation

#### User Story 1: Select Fiscal Quarter
**As an** HR report creator
**I want to** select a fiscal quarter (Q1-Q4 FY25 or FY26)
**So that** I can view consolidated HR metrics for that specific period

**Acceptance Criteria:**
- [ ] Dropdown selector displays all available fiscal quarters (Q1 FY25 - Q4 FY25, future quarters as data becomes available)
- [ ] Selecting a quarter updates all dashboard sections automatically
- [ ] Default selection is the most recently completed quarter
- [ ] Quarter selector is prominently displayed at the top of the page
- [ ] Selection persists during the session (does not reset on page navigation)

**Priority:** P0 (Must have for v1)

---

#### User Story 2: View Executive Summary KPIs
**As an** HR report creator
**I want to** see high-level KPIs from all HR domains in one section
**So that** I can quickly understand the quarter's overall performance

**Acceptance Criteria:**
- [ ] Executive Summary section displays 8-12 KPI cards in a responsive grid
- [ ] Each KPI card shows:
  - Metric name
  - Current value
  - Prior quarter value
  - % change with trend indicator (↑/↓/→)
  - Color coding (green = positive trend, red = negative, gray = stable)
- [ ] KPIs include:
  - **Workforce:** Total Headcount, Faculty Count, Staff Count
  - **Turnover:** Total Terminations, Turnover Rate %
  - **Recruiting:** New Hires, Time to Fill
  - **Exit Survey:** Response Rate, Avg Satisfaction, Would Recommend %
- [ ] All metrics source from staticData.js for selected quarter
- [ ] Comparison logic uses prior quarter (e.g., Q2 compares to Q1)

**Priority:** P0 (Must have for v1)

---

#### User Story 3: Review Workforce Section
**As an** HR report creator
**I want to** see detailed workforce metrics and visualizations
**So that** I can report on headcount composition and trends

**Acceptance Criteria:**
- [ ] Section titled "Workforce Summary" with clear visual separation
- [ ] Includes 4-6 KPI cards (Total, Faculty, Staff, HSP, Students, Non-Benefit)
- [ ] Includes 2-3 charts:
  - Location distribution (OMA vs PHX) - Stacked bar or donut
  - Assignment type breakdown - Donut chart
  - School/Org headcount (top 10) - Horizontal bar chart
- [ ] All data sources from WORKFORCE_DATA[selectedDate] in staticData.js
- [ ] Charts use existing Recharts components for consistency

**Priority:** P0 (Must have for v1)

---

#### User Story 4: Review Turnover Section
**As an** HR report creator
**I want to** see turnover metrics and exit trends
**So that** I can report on employee retention and departure patterns

**Acceptance Criteria:**
- [ ] Section titled "Turnover Analysis" with clear visual separation
- [ ] Includes 3-4 KPI cards:
  - Total Terminations
  - Faculty Turnover Rate
  - Staff Turnover Rate
  - Voluntary vs Involuntary breakdown
- [ ] Includes 2-3 charts:
  - Exit reasons (top 5) - Horizontal bar chart
  - Faculty vs Staff turnover comparison - Grouped bar chart
  - Terminations by school (top 10) - Horizontal bar chart
- [ ] All data sources from TURNOVER_DATA[selectedDate] in staticData.js
- [ ] Excludes students and house staff (as per existing business rules)

**Priority:** P0 (Must have for v1)

---

#### User Story 5: Review Recruiting Section
**As an** HR report creator
**I want to** see hiring metrics and pipeline insights
**So that** I can report on talent acquisition performance

**Acceptance Criteria:**
- [ ] Section titled "Recruiting Metrics" with clear visual separation
- [ ] Includes 4-5 KPI cards:
  - New Hires (YTD)
  - Open Positions
  - Time to Fill (days)
  - Offer Acceptance Rate
  - Cost Per Hire
- [ ] Includes 2-3 charts:
  - Starters vs Leavers trend (line chart)
  - Diversity metrics (donut chart: % Female, % Minority)
  - Faculty vs Staff hiring (grouped bar chart)
- [ ] All data sources from RECRUITING_DATA[selectedDate] in staticData.js
- [ ] Charts show quarter trend if multiple quarters selected

**Priority:** P0 (Must have for v1)

---

#### User Story 6: Review Exit Survey Section
**As an** HR report creator
**I want to** see exit survey insights and satisfaction trends
**So that** I can report on employee sentiment and retention risks

**Acceptance Criteria:**
- [ ] Section titled "Exit Survey Insights" with clear visual separation
- [ ] Includes 4-5 KPI cards:
  - Total Responses
  - Response Rate %
  - Avg Satisfaction Score (1-5 scale)
  - % Would Recommend
  - Concerns Reported %
- [ ] Includes 2-3 visualizations:
  - Top exit reasons (horizontal bar chart)
  - Satisfaction ratings breakdown (stacked bar or heatmap)
  - Key insights callout boxes (Areas of Concern, Positive Feedback)
- [ ] All data sources from EXIT_SURVEY_DATA[selectedDate] in staticData.js
- [ ] If no survey data exists for quarter, display "No survey data available"

**Priority:** P0 (Must have for v1)

---

#### User Story 7: Compare Quarters
**As an** HR report creator
**I want to** see quarter-over-quarter comparisons automatically
**So that** I can identify trends and changes without manual calculation

**Acceptance Criteria:**
- [ ] All KPI cards display prior quarter comparison automatically
- [ ] Comparison shows:
  - Previous quarter value (e.g., "Q1: 5,234")
  - Absolute change (+50, -10)
  - Percentage change (+1.2%, -3.5%)
  - Trend indicator (↑ ↓ →)
- [ ] Comparison logic handles fiscal year rollover (Q4 FY25 → Q1 FY25)
- [ ] If prior quarter data doesn't exist, show "N/A" instead of error

**Priority:** P0 (Must have for v1)

---

#### User Story 8: Export to PDF
**As an** HR report creator
**I want to** export the quarterly report to PDF
**So that** I can distribute it to leadership via email or presentations

**Acceptance Criteria:**
- [ ] "Export to PDF" button prominently displayed at top of dashboard
- [ ] PDF includes all sections (Executive Summary, Workforce, Turnover, Recruiting, Exit Survey)
- [ ] PDF formatting:
  - Letter size (8.5" x 11")
  - Portrait orientation
  - Page breaks between major sections
  - Creighton branding (logo, colors)
  - Header with quarter label and generation date
  - Footer with page numbers
- [ ] Charts render clearly in PDF (no blurriness or cutoff)
- [ ] PDF filename format: `Creighton_HR_Quarterly_Report_Q[X]_FY[YY]_[Date].pdf`
- [ ] PDF generation completes within 10 seconds
- [ ] User receives download prompt (no page navigation)

**Priority:** P0 (Must have for v1)

**Technical Notes:**
- Consider react-pdf or jsPDF with html2canvas for PDF generation
- Ensure print CSS is defined for clean page breaks
- Test PDF rendering on Chrome, Safari, Firefox

---

#### User Story 9: Print Report
**As an** HR report creator
**I want to** print the quarterly report directly from the browser
**So that** I can have a physical copy for meetings

**Acceptance Criteria:**
- [ ] "Print" button displayed next to Export PDF button
- [ ] Clicking Print triggers browser print dialog
- [ ] Print preview shows:
  - Clean page breaks between sections
  - Charts sized appropriately for print
  - No navigation sidebar or buttons
  - Creighton logo in header
- [ ] Print CSS hides interactive elements (buttons, dropdowns)
- [ ] Print-friendly colors (high contrast, no dark backgrounds)

**Priority:** P1 (Should have soon)

---

#### User Story 10: View Year-over-Year Comparison
**As an** HR report creator
**I want to** compare current quarter to same quarter last year
**So that** I can identify annual trends and seasonal patterns

**Acceptance Criteria:**
- [ ] Toggle option to switch comparison mode:
  - "Compare to Prior Quarter" (default)
  - "Compare to Same Quarter Last Year"
- [ ] YoY comparison shows:
  - Prior year same quarter value (e.g., "Q2 FY24: 5,100")
  - Annual change (+ 134 / +2.6%)
  - Trend indicator
- [ ] If prior year data doesn't exist, show "No prior year data"
- [ ] Toggle state persists during session

**Priority:** P1 (Should have soon)

---

#### User Story 11: Add Narrative Summary
**As an** HR report creator
**I want to** add a brief executive narrative summary
**So that** I can provide context and interpretation for leadership

**Acceptance Criteria:**
- [ ] Editable text area at top of Executive Summary section
- [ ] Placeholder text: "Enter executive summary notes here (optional)"
- [ ] Text area supports:
  - Plain text (500 character limit)
  - Basic formatting (bold, italic, bullet points)
  - Auto-save to browser localStorage
- [ ] Narrative included in PDF export
- [ ] Narrative NOT included in print view by default (opt-in checkbox)

**Priority:** P2 (Nice to have)

---

### Additional Use Cases

#### Use Case: First-Time User Experience
**Scenario:** User navigates to Quarterly Report Dashboard for the first time

**Flow:**
1. User clicks "Quarterly Report" in navigation menu
2. Dashboard loads with default selection (most recent completed quarter)
3. Executive Summary KPIs load first (fast)
4. Sections load progressively (Workforce → Turnover → Recruiting → Exit Survey)
5. Loading skeletons show while data fetches
6. User sees fully populated dashboard within 2-3 seconds

**Success Criteria:**
- No empty states or error messages
- Clear visual hierarchy guides user's eye
- Tooltips on KPI cards explain metrics

---

#### Use Case: Data Not Available
**Scenario:** User selects a future quarter with no data yet

**Flow:**
1. User selects "Q1 FY26" from dropdown
2. Dashboard detects no data in staticData.js for that date
3. Empty state message displays: "No data available for Q1 FY26 yet. Please select a different quarter."
4. All sections show placeholder cards with "N/A"
5. Export and Print buttons are disabled

**Success Criteria:**
- Clear messaging about why data is unavailable
- User can still navigate to other quarters
- No console errors or broken charts

---

## Functional Requirements

### P0: Must Have for v1

#### FR-1: Quarter Selection
- Dropdown selector with fiscal quarter options (Q1 FY25, Q2 FY25, Q3 FY25, Q4 FY25)
- Default selection: Most recent quarter with data
- Dropdown positioned in dashboard header
- Selection updates all dashboard sections via React state management

#### FR-2: Executive Summary Section
- 10-12 KPI cards in responsive grid (3-4 columns on desktop, 1 column on mobile)
- Each card displays:
  - Metric name
  - Current value
  - Prior quarter value
  - % change with trend indicator
  - Color coding for positive/negative trends
- Metrics sourced from staticData.js (WORKFORCE_DATA, TURNOVER_DATA, RECRUITING_DATA, EXIT_SURVEY_DATA)
- Quarter-over-quarter comparison logic

#### FR-3: Workforce Summary Section
- Section header: "Workforce Summary - Q[X] FY[YY]"
- 6 KPI cards (Total, Faculty, Staff, HSP, Students, Non-Benefit)
- 3 charts:
  - Location distribution (OMA vs PHX)
  - Assignment type breakdown
  - Top 10 schools by headcount
- Data source: WORKFORCE_DATA[selectedDate]

#### FR-4: Turnover Analysis Section
- Section header: "Turnover Analysis - Q[X] FY[YY]"
- 4 KPI cards (Total Terminations, Faculty Rate, Staff Rate, Voluntary %)
- 3 charts:
  - Top 5 exit reasons
  - Faculty vs Staff turnover comparison
  - Top 10 schools by terminations
- Data source: TURNOVER_DATA[selectedDate]
- Exclude students and house staff from all calculations

#### FR-5: Recruiting Metrics Section
- Section header: "Recruiting Metrics - Q[X] FY[YY]"
- 5 KPI cards (New Hires, Open Positions, Time to Fill, Offer Acceptance Rate, Cost Per Hire)
- 3 charts:
  - Starters vs Leavers trend
  - Diversity metrics (donut chart)
  - Faculty vs Staff hiring
- Data source: RECRUITING_DATA[selectedDate]

#### FR-6: Exit Survey Insights Section
- Section header: "Exit Survey Insights - Q[X] FY[YY]"
- 5 KPI cards (Responses, Response Rate, Avg Satisfaction, Would Recommend, Concerns Reported)
- 3 visualizations:
  - Top exit reasons
  - Satisfaction ratings breakdown
  - Key insights callout boxes
- Data source: EXIT_SURVEY_DATA[selectedDate]
- Handle missing data gracefully ("No survey data available")

#### FR-7: PDF Export
- "Export to PDF" button in dashboard header
- PDF includes all sections with print-friendly styling
- Filename format: `Creighton_HR_Quarterly_Report_Q[X]_FY[YY]_[Date].pdf`
- PDF generation < 10 seconds
- Uses react-pdf or similar library

#### FR-8: Responsive Design
- Dashboard fully responsive on desktop (1920px), tablet (768px), mobile (375px)
- Charts resize gracefully
- KPI cards stack on mobile
- Print layout optimized for Letter size (8.5" x 11")

#### FR-9: Accessibility (WCAG 2.1 AA)
- All charts have accessible labels and legends
- Color contrast ratio ≥ 4.5:1
- Keyboard navigation supported
- Screen reader compatible
- Focus indicators visible

#### FR-10: Performance
- Initial page load < 2 seconds
- Section data loads progressively (Executive Summary → Workforce → Turnover → Recruiting → Exit Survey)
- Loading skeletons displayed while fetching data
- No blocking operations

---

### P1: Should Have Soon (v1.1)

#### FR-11: Print Function
- "Print" button in dashboard header
- Print preview with clean page breaks
- Print CSS hides interactive elements
- Print-friendly color scheme

#### FR-12: Year-over-Year Comparison
- Toggle to switch between "Compare to Prior Quarter" and "Compare to Same Quarter Last Year"
- YoY comparison logic for all KPI cards
- Handles missing prior year data gracefully

#### FR-13: Chart Interactivity
- Hover tooltips on all charts
- Click on chart segments to view details
- Zoom on line charts (optional)

#### FR-14: Export to Excel
- "Export to Excel" button (in addition to PDF)
- Excel file includes:
  - Summary sheet with KPIs
  - Workforce data sheet
  - Turnover data sheet
  - Recruiting data sheet
  - Exit survey data sheet
- Uses xlsx or similar library

---

### P2: Nice to Have (Future)

#### FR-15: Editable Narrative Summary
- Text area for user-entered narrative
- Auto-save to browser localStorage
- Include in PDF export (optional checkbox)

#### FR-16: Custom Date Range
- Allow user to select custom date range (e.g., "July 2024 - March 2025")
- Aggregate data across multiple quarters

#### FR-17: Shareable Links
- Generate shareable URL with quarter pre-selected
- URL format: `/dashboards/quarterly-report?quarter=Q2FY25`

#### FR-18: Email Distribution
- "Email Report" button
- Generate PDF and attach to email
- Pre-fill recipient list (leadership email addresses)

#### FR-19: Scheduled Reports
- Schedule automatic quarterly report generation
- Email PDF to distribution list on first Monday after quarter end

#### FR-20: Multi-Quarter Comparison
- Compare 2-4 quarters side-by-side
- Stacked KPI cards showing trend across quarters
- Line charts showing quarterly progression

---

## Page Structure & Layout

### Overall Layout

```
┌─────────────────────────────────────────────────────────┐
│                    DASHBOARD HEADER                     │
│  [Creighton Logo]  Quarterly HR Report                 │
│  [Quarter Selector ▼] [Export PDF] [Print] [Compare]   │
└─────────────────────────────────────────────────────────┘
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │         EXECUTIVE SUMMARY - Q2 FY25              │ │
│  ├───────────────────────────────────────────────────┤ │
│  │  [KPI Card] [KPI Card] [KPI Card] [KPI Card]     │ │
│  │  [KPI Card] [KPI Card] [KPI Card] [KPI Card]     │ │
│  │  [KPI Card] [KPI Card]                           │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │         WORKFORCE SUMMARY                        │ │
│  ├───────────────────────────────────────────────────┤ │
│  │  [6 KPI Cards in responsive grid]                │ │
│  │                                                   │ │
│  │  [Location Chart]  [Assignment Type Chart]       │ │
│  │                                                   │ │
│  │  [Top 10 Schools Bar Chart]                      │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │         TURNOVER ANALYSIS                        │ │
│  ├───────────────────────────────────────────────────┤ │
│  │  [4 KPI Cards in responsive grid]                │ │
│  │                                                   │ │
│  │  [Exit Reasons Chart]  [Faculty vs Staff Chart]  │ │
│  │                                                   │ │
│  │  [Top 10 Schools Bar Chart]                      │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │         RECRUITING METRICS                       │ │
│  ├───────────────────────────────────────────────────┤ │
│  │  [5 KPI Cards in responsive grid]                │ │
│  │                                                   │ │
│  │  [Starters vs Leavers Line Chart]                │ │
│  │                                                   │ │
│  │  [Diversity Donut]  [Faculty vs Staff Chart]     │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │         EXIT SURVEY INSIGHTS                     │ │
│  ├───────────────────────────────────────────────────┤ │
│  │  [5 KPI Cards in responsive grid]                │ │
│  │                                                   │ │
│  │  [Areas of Concern]  [Positive Feedback]         │ │
│  │                                                   │ │
│  │  [Top Exit Reasons Chart]                        │ │
│  │                                                   │ │
│  │  [Satisfaction Ratings Table]                    │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### KPI Card Structure

```
┌─────────────────────────────────┐
│ Total Headcount           [↑]  │  ← Metric Name + Trend Indicator
├─────────────────────────────────┤
│        5,037                    │  ← Current Value (Large, Bold)
├─────────────────────────────────┤
│ Q1: 5,415 | -7.0% (-378)       │  ← Prior Quarter Comparison
├─────────────────────────────────┤
│ OMA: 4,287 | PHX: 750          │  ← Campus Breakdown
└─────────────────────────────────┘
```

### Section Header Structure

```
┌─────────────────────────────────────────────────┐
│  WORKFORCE SUMMARY - Q2 FY25                   │
│  As of June 30, 2025                            │
└─────────────────────────────────────────────────┘
```

---

## Data Requirements

### Data Sources

All data comes from `/src/data/staticData.js`:

1. **WORKFORCE_DATA** - Quarterly workforce snapshots
   - Keys: "2024-06-30", "2025-03-31", "2025-06-30"
   - Used for: Workforce Summary section

2. **TURNOVER_DATA** - Quarterly turnover metrics
   - Keys: "2025-03-31", "2025-06-30"
   - Used for: Turnover Analysis section

3. **RECRUITING_DATA** - Quarterly recruiting metrics
   - Keys: "2024-06-30", "2024-12-31", "2025-03-31", "2025-06-30"
   - Used for: Recruiting Metrics section

4. **EXIT_SURVEY_DATA** - Quarterly exit survey responses
   - Keys: "2024-09-30", "2024-12-31", "2025-03-31", "2025-06-30"
   - Used for: Exit Survey Insights section

### Data Aggregation Logic

#### Executive Summary KPI Aggregation

```javascript
const executiveSummary = {
  // Workforce KPIs
  totalHeadcount: WORKFORCE_DATA[selectedDate].totalEmployees,
  faculty: WORKFORCE_DATA[selectedDate].faculty,
  staff: WORKFORCE_DATA[selectedDate].staff,

  // Turnover KPIs
  totalTerminations: TURNOVER_DATA[selectedDate].terminations,
  totalTurnoverRate: TURNOVER_DATA[selectedDate].totalTurnoverRate,

  // Recruiting KPIs
  newHires: RECRUITING_DATA[selectedDate].newHiresYTD,
  timeToFill: RECRUITING_DATA[selectedDate].timeToFill,

  // Exit Survey KPIs
  surveyResponses: EXIT_SURVEY_DATA[selectedDate].totalResponses,
  responseRate: EXIT_SURVEY_DATA[selectedDate].responseRate,
  avgSatisfaction: EXIT_SURVEY_DATA[selectedDate].overallSatisfaction,
  wouldRecommend: EXIT_SURVEY_DATA[selectedDate].wouldRecommend
};
```

#### Quarter Comparison Logic

```javascript
function getQuarterComparison(currentDate, metricValue) {
  const priorDate = getPriorQuarterDate(currentDate);
  const priorValue = getPriorQuarterValue(priorDate, metricName);

  if (!priorValue) return { display: "N/A", trend: "none" };

  const change = currentValue - priorValue;
  const percentChange = ((change / priorValue) * 100).toFixed(1);
  const trend = change > 0 ? "up" : change < 0 ? "down" : "stable";

  return {
    priorValue,
    change,
    percentChange,
    trend,
    display: `Q[X]: ${priorValue} | ${percentChange}% (${change > 0 ? '+' : ''}${change})`
  };
}
```

#### Fiscal Quarter Date Mapping

```javascript
const fiscalQuarterMap = {
  "Q1 FY25": "2024-09-30", // Sept 30, 2024
  "Q2 FY25": "2024-12-31", // Dec 31, 2024
  "Q3 FY25": "2025-03-31", // Mar 31, 2025
  "Q4 FY25": "2025-06-30", // Jun 30, 2025
  "Q1 FY26": "2025-09-30", // Sept 30, 2025 (future)
};
```

### Data Validation Rules

1. **Required Fields:** All KPI values must exist in staticData.js
2. **Null Handling:** If data missing, display "N/A" instead of error
3. **Calculation Consistency:** Use same calculation logic as existing dashboards
4. **Date Validation:** Ensure selected date exists in all 4 data objects
5. **Trend Calculation:** Handle division by zero (prior value = 0)

---

## User Experience & Design

### Information Architecture

**Hierarchy (Top to Bottom):**
1. **Dashboard Header** - Navigation, controls (quarter selector, export buttons)
2. **Executive Summary** - High-level KPIs (most important)
3. **Workforce Summary** - Employee composition
4. **Turnover Analysis** - Exit patterns
5. **Recruiting Metrics** - Hiring performance
6. **Exit Survey Insights** - Employee sentiment

**Rationale:**
- Executive summary first (leadership wants KPIs immediately)
- Workforce → Turnover → Recruiting → Exit Survey follows employee lifecycle
- Each section self-contained (can be read independently)

### Key User Flows

#### Flow 1: Generate Quarterly Report (Happy Path)

```
1. User navigates to /dashboards/quarterly-report
   ↓
2. Dashboard loads with default quarter (Q4 FY25)
   ↓
3. Executive Summary loads (10 KPI cards with comparisons)
   ↓
4. User scrolls to review each section
   ↓
5. User clicks "Export to PDF"
   ↓
6. PDF generates and downloads
   ↓
7. User distributes PDF to leadership
```

**Time Estimate:** 3-5 minutes
**Success Criteria:** User can complete flow without errors or confusion

---

#### Flow 2: Compare Quarters

```
1. User is viewing Q4 FY25 report
   ↓
2. User clicks quarter dropdown
   ↓
3. User selects "Q3 FY25"
   ↓
4. Dashboard re-renders with Q3 data
   ↓
5. KPI cards update to show Q2 comparison (Q3 vs Q2)
   ↓
6. User compares trends between quarters
```

**Time Estimate:** 30 seconds
**Success Criteria:** Data updates smoothly, no page reload

---

### Visual Design Principles

1. **Consistency:** Reuse existing dashboard styles (colors, fonts, spacing)
2. **Hierarchy:** Clear section breaks with headers and dividers
3. **Scannability:** KPIs at top, charts below, details at bottom
4. **White Space:** Generous padding between sections for readability
5. **Print-Friendly:** High contrast, no dark backgrounds, clear labels

### Color Coding

**Trend Indicators:**
- **Green:** Positive trend (↑)
- **Red:** Negative trend (↓)
- **Gray:** Stable/Neutral (→)

**Positive Trends (Green):**
- Headcount increase
- New hires increase
- Offer acceptance rate increase
- Satisfaction increase
- Would recommend increase

**Negative Trends (Red):**
- Turnover rate increase
- Terminations increase
- Time to fill increase
- Response rate decrease
- Satisfaction decrease

### Accessibility Considerations

1. **Keyboard Navigation:**
   - Quarter dropdown accessible via Tab key
   - Export/Print buttons accessible via Tab + Enter
   - Section focus order: Header → Executive Summary → Workforce → Turnover → Recruiting → Exit Survey

2. **Screen Reader Support:**
   - Section headers use semantic HTML (h2, h3)
   - KPI cards have aria-labels: "Total Headcount: 5037, up 1.2% from prior quarter"
   - Charts have descriptive titles and legends
   - Data tables have proper th/td structure

3. **Color Contrast:**
   - Text contrast ratio ≥ 4.5:1
   - Chart colors meet WCAG AA standards
   - Trend indicators use symbols (↑/↓) in addition to color

4. **Focus Indicators:**
   - All interactive elements have visible focus outlines
   - Focus outlines use 2px blue border

---

## Technical Considerations

### Integration with Existing Architecture

**Component Reuse:**
- **KPI Cards:** Leverage existing dashboard KPI card components
- **Charts:** Use Recharts components from Workforce/Turnover/Recruiting dashboards
- **Layout:** Use DashboardLayout component with custom sections
- **Navigation:** Add "Quarterly Report" link to Navigation.jsx

**Data Flow:**
```
staticData.js (source of truth)
  ↓
QuarterlyReportDashboard.jsx (component)
  ↓
getWorkforceData(selectedDate) (helper functions)
getTurnoverData(selectedDate)
getRecruitingData(selectedDate)
getExitSurveyData(selectedDate)
  ↓
Render KPI cards and charts
```

**State Management:**
```javascript
const [selectedQuarter, setSelectedQuarter] = useState("2025-06-30"); // Default: Q4 FY25
const [comparisonMode, setComparisonMode] = useState("prior-quarter"); // or "year-over-year"

// Fetch data on quarter change
useEffect(() => {
  const workforceData = getWorkforceData(selectedQuarter);
  const turnoverData = getTurnoverData(selectedQuarter);
  const recruitingData = getRecruitingData(selectedQuarter);
  const exitSurveyData = getExitSurveyData(selectedQuarter);

  // Update state
  setDashboardData({ workforce, turnover, recruiting, exitSurvey });
}, [selectedQuarter]);
```

### Routing

**URL:** `/dashboards/quarterly-report`

**Route Definition (App.js):**
```javascript
import QuarterlyReportDashboard from './components/dashboards/QuarterlyReportDashboard';

<Route path="/dashboards/quarterly-report" element={<QuarterlyReportDashboard />} />
```

**Navigation Link (Navigation.jsx):**
```javascript
<Link to="/dashboards/quarterly-report">
  Quarterly Report
</Link>
```

### Dependencies

**Existing Dependencies (No New Installs Needed):**
- React 19.1.0
- React Router (routing)
- Recharts 3.0.0 (charts)
- Tailwind CSS 3.4.17 (styling)

**New Dependencies (P0):**
- **react-to-print** (^2.15.1) - Print functionality
- **jsPDF** (^2.5.1) - PDF generation
- **html2canvas** (^1.4.1) - Chart rendering for PDF

**New Dependencies (P1):**
- **xlsx** (^0.18.5) - Excel export (if FR-14 implemented)

### Performance Considerations

**Initial Load Optimization:**
- Lazy load QuarterlyReportDashboard component
- Use React.memo() for KPI cards to prevent unnecessary re-renders
- Progressive loading: Executive Summary → Sections load in order

**Data Fetching:**
- All data from local staticData.js (no API calls)
- No caching needed (data already in memory)
- Data access via helper functions (getWorkforceData, etc.)

**Chart Rendering:**
- Recharts renders charts on-demand
- Use ResponsiveContainer for responsive charts
- Debounce window resize events (300ms)

**PDF Generation:**
- Generate PDF in background (non-blocking)
- Show loading spinner during generation
- Compress images in PDF (90% quality)

**Target Performance:**
- Initial page load: < 2 seconds
- Quarter selection change: < 500ms
- PDF generation: < 10 seconds

### Error Handling

**Scenarios:**

1. **Missing Quarter Data:**
   - Display: "No data available for Q[X] FY[YY]. Please select a different quarter."
   - Disable Export/Print buttons
   - Show placeholder KPI cards with "N/A"

2. **Partial Data (e.g., Exit Survey missing):**
   - Load available sections normally
   - Exit Survey section shows: "No exit survey data available for this quarter"
   - Export/Print includes sections with data only

3. **PDF Generation Failure:**
   - Show error toast: "PDF generation failed. Please try again."
   - Log error to console for debugging
   - Offer fallback: "Use Print function instead"

4. **Chart Rendering Error:**
   - Use ChartErrorBoundary component (existing)
   - Show: "Chart unavailable. Data may be incomplete."
   - Continue rendering other charts

### Accessibility Implementation

**ARIA Labels:**
```jsx
<div
  className="kpi-card"
  role="region"
  aria-label="Total Headcount: 5037, up 1.2% from prior quarter"
>
  <h3>Total Headcount</h3>
  <p className="value">5,037</p>
  <p className="comparison">Q3: 5,415 | -7.0% (-378)</p>
</div>
```

**Keyboard Navigation:**
```jsx
<button
  onClick={handleExportPDF}
  onKeyPress={(e) => e.key === 'Enter' && handleExportPDF()}
  aria-label="Export quarterly report to PDF"
>
  Export to PDF
</button>
```

**Screen Reader Announcements:**
```jsx
// When quarter changes
<div role="status" aria-live="polite" className="sr-only">
  Quarterly report updated to Q2 FY25
</div>
```

---

## Export Requirements

### PDF Export Specification

#### PDF Structure

**Page 1: Cover Page**
```
┌─────────────────────────────────────┐
│  [Creighton University Logo]       │
│                                     │
│  Quarterly HR Report                │
│  Q2 FY25 (October - December 2024) │
│                                     │
│  Generated: November 14, 2025       │
│                                     │
│  Office of Human Resources          │
└─────────────────────────────────────┘
```

**Page 2: Executive Summary**
- 10-12 KPI cards in grid
- Page header: "Executive Summary | Q2 FY25"
- Page footer: "Page 2 of 12 | Generated: [Date]"

**Page 3-4: Workforce Summary**
- 6 KPI cards
- 3 charts (each on separate page if large)
- Page header: "Workforce Summary | Q2 FY25"

**Page 5-6: Turnover Analysis**
- 4 KPI cards
- 3 charts
- Page header: "Turnover Analysis | Q2 FY25"

**Page 7-8: Recruiting Metrics**
- 5 KPI cards
- 3 charts
- Page header: "Recruiting Metrics | Q2 FY25"

**Page 9-10: Exit Survey Insights**
- 5 KPI cards
- 3 visualizations
- Page header: "Exit Survey Insights | Q2 FY25"

**Total Pages:** 10-12 pages (depending on chart sizes)

#### PDF Styling

**Page Setup:**
- Size: Letter (8.5" x 11")
- Orientation: Portrait
- Margins: 0.75" all sides

**Fonts:**
- Headers: Inter Bold, 18pt
- Subheaders: Inter SemiBold, 14pt
- Body: Inter Regular, 11pt
- KPI Values: Inter Bold, 24pt

**Colors:**
- Headers: Creighton Blue (#003865)
- Background: White (#FFFFFF)
- Text: Dark Gray (#333333)
- Accent: Creighton Gold (#FFAA3B)

**Page Breaks:**
- Before each major section (Workforce, Turnover, Recruiting, Exit Survey)
- Avoid breaking KPI card grids across pages
- Avoid breaking charts across pages

#### PDF Generation Approach

**Option 1: jsPDF + html2canvas (Recommended)**
```javascript
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const generatePDF = async () => {
  const pdf = new jsPDF('p', 'mm', 'letter');

  // Capture each section as image
  const sections = ['executive-summary', 'workforce', 'turnover', 'recruiting', 'exit-survey'];

  for (let i = 0; i < sections.length; i++) {
    const section = document.getElementById(sections[i]);
    const canvas = await html2canvas(section, {
      scale: 2, // High quality
      useCORS: true,
      logging: false
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.9);
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
  }

  pdf.save('Creighton_HR_Quarterly_Report_Q2_FY25.pdf');
};
```

**Option 2: react-pdf (Alternative)**
```javascript
import { PDFDownloadLink, Document, Page, Text, View } from '@react-pdf/renderer';

const QuarterlyReportPDF = ({ data }) => (
  <Document>
    <Page size="LETTER" style={styles.page}>
      {/* Render sections */}
    </Page>
  </Document>
);

<PDFDownloadLink document={<QuarterlyReportPDF data={dashboardData} />} fileName="report.pdf">
  {({ loading }) => loading ? 'Generating PDF...' : 'Export to PDF'}
</PDFDownloadLink>
```

**Recommended:** jsPDF + html2canvas (easier to style, matches dashboard exactly)

### Print Styling

**Print CSS (`@media print`):**

```css
@media print {
  /* Hide interactive elements */
  .navbar, .sidebar, .export-button, .print-button, .quarter-selector {
    display: none !important;
  }

  /* Page breaks */
  .section-header {
    page-break-before: always;
  }

  .kpi-card, .chart-container {
    page-break-inside: avoid;
  }

  /* Print-friendly colors */
  body {
    background: white !important;
    color: black !important;
  }

  .kpi-card {
    border: 1px solid #ccc;
    box-shadow: none;
  }

  /* High contrast charts */
  .recharts-cartesian-axis-tick,
  .recharts-legend-item-text {
    fill: black !important;
  }
}
```

---

## Out of Scope

The following features are **NOT** included in v1:

### Data Management
- **Real-time data refresh:** Report uses static snapshots from staticData.js only
- **Custom date ranges:** User cannot select arbitrary date ranges (quarterly snapshots only)
- **Historical data beyond FY25:** Only FY25 Q1-Q4 data included in v1

### Advanced Features
- **AI-generated insights:** No Claude-powered narrative summaries in v1
- **Predictive analytics:** No forecasting or trend projections
- **Benchmarking:** No external benchmarking data (e.g., CUPA-HR, SHRM)
- **Multi-user collaboration:** This is a single-user tool (no sharing, comments, or version control)

### Export Features
- **PowerPoint export:** PDF and Excel only (no .pptx)
- **Email integration:** No direct email sending from dashboard
- **Scheduled reports:** No automated report generation or distribution

### Customization
- **Dashboard customization:** User cannot reorder sections or hide/show KPIs
- **Custom KPIs:** User cannot add custom metrics (limited to predefined KPIs)
- **Branding customization:** Creighton branding only (no multi-tenant support)

### Technical Limitations
- **Mobile app:** Browser-based only (no native iOS/Android app)
- **Offline mode:** Requires internet connection to load dashboard
- **API integration:** No integration with external HR systems (Workday, PeopleSoft, etc.)

---

## Open Questions & Risks

### Open Questions

#### Q1: PDF Cover Page Design
**Question:** Should PDF include a cover page with Creighton logo and quarter label?
**Impact:** Adds 1 page to PDF, more professional appearance
**Recommendation:** Yes, include cover page (standard for executive reports)
**Decision Needed By:** Before v1 implementation

---

#### Q2: Year-over-Year Comparison Default
**Question:** Should YoY comparison be default mode instead of prior quarter comparison?
**Impact:** Changes user workflow, may be more intuitive for annual planning
**Recommendation:** Keep prior quarter as default, add YoY toggle (P1)
**Decision Needed By:** Before v1 implementation

---

#### Q3: Empty State for Future Quarters
**Question:** Should future quarters (e.g., Q1 FY26) appear in dropdown before data is available?
**Impact:** User experience - prevents confusion vs. shows roadmap
**Recommendation:** Show future quarters grayed out with tooltip "Data available after [date]"
**Decision Needed By:** Before v1 implementation

---

#### Q4: Chart Export Resolution
**Question:** What resolution should charts render at in PDF? (1x, 2x, 3x)
**Impact:** File size vs. print quality trade-off
**Recommendation:** 2x resolution (balance between quality and file size)
**Decision Needed By:** During PDF implementation

---

#### Q5: Narrative Summary Inclusion
**Question:** Should editable narrative summary be P0 or P2?
**Impact:** If P0, adds 2-3 days to development timeline
**Recommendation:** Keep as P2 (nice to have) - user can add narrative in PowerPoint after export
**Decision Needed By:** Before sprint planning

---

### Risks & Mitigation

#### Risk 1: PDF Generation Performance
**Risk:** PDF generation may take >10 seconds for large reports with many charts
**Likelihood:** Medium
**Impact:** High (user frustration, perceived slowness)
**Mitigation:**
- Use web workers to generate PDF in background (non-blocking)
- Show progress bar during generation
- Compress charts to 90% quality (reduces file size)
- Test with real data to identify bottlenecks

---

#### Risk 2: Chart Rendering in PDF
**Risk:** Charts may render poorly in PDF (blurry, cutoff, wrong colors)
**Likelihood:** Medium
**Impact:** High (unprofessional report appearance)
**Mitigation:**
- Test html2canvas with Recharts extensively
- Use 2x scale for high-quality rendering
- Define explicit chart dimensions for PDF view
- Create print-specific CSS styles

---

#### Risk 3: Data Availability for Future Quarters
**Risk:** User expects Q1 FY26 data, but it doesn't exist yet in staticData.js
**Likelihood:** High
**Impact:** Low (expected behavior, not a bug)
**Mitigation:**
- Clear messaging: "Data available after quarter end + 2 weeks"
- Gray out future quarters in dropdown
- Show empty state with helpful message
- Document data update process in WORKFLOW_GUIDE.md

---

#### Risk 4: Browser Compatibility
**Risk:** PDF generation may not work in Safari or older browsers
**Likelihood:** Medium
**Impact:** Medium (limits user base)
**Mitigation:**
- Test on Chrome, Safari, Firefox, Edge
- Provide fallback: "Use Print function and save as PDF"
- Document browser requirements in README
- Consider server-side PDF generation if client-side fails

---

#### Risk 5: Mobile Responsiveness
**Risk:** Dashboard may be difficult to navigate on mobile devices
**Likelihood:** Low (user stated this is for desktop use)
**Impact:** Low (not primary use case)
**Mitigation:**
- Ensure responsive design for tablet (iPad)
- Test on mobile as secondary priority
- Focus on desktop/print experience first

---

## Launch Plan

### Release Phases

#### Phase 1: Alpha (Internal Testing) - Week 1
**Scope:** Core functionality (P0 features only)
**Testing:**
- User (you) tests with real FY25 data
- Validate KPI accuracy vs. existing dashboards
- Test PDF export with 5+ quarters

**Success Criteria:**
- All KPI values match existing dashboards (100% accuracy)
- PDF export succeeds without errors
- No console errors or warnings

---

#### Phase 2: Beta (Soft Launch) - Week 2
**Scope:** Add P1 features (Print, YoY comparison)
**Testing:**
- User tests with leadership stakeholders (optional)
- Gather feedback on report format and layout
- Test print functionality on multiple browsers

**Success Criteria:**
- User completes quarterly report in <20 minutes
- PDF is presentation-ready without edits
- Positive feedback from leadership (if shared)

---

#### Phase 3: General Availability (GA) - Week 3
**Scope:** Full v1 release with all P0 + P1 features
**Launch Activities:**
- Add "Quarterly Report" link to Navigation menu
- Update CLAUDE.md with usage instructions
- Document in WORKFLOW_GUIDE.md
- Commit to main branch

**Success Criteria:**
- Dashboard accessible at `/dashboards/quarterly-report`
- User adopts dashboard for Q1 FY26 report
- No critical bugs reported

---

### Rollout Strategy

**Deployment:** Local development only (no production deployment)
**Feature Flags:** Not needed (single user, no gradual rollout)
**Communication:** Internal documentation update only

### Training/Documentation Needs

**User Documentation (WORKFLOW_GUIDE.md):**
```markdown
## Quarterly Report Dashboard

### Purpose
Generate comprehensive quarterly HR reports for leadership in under 20 minutes.

### How to Use
1. Navigate to Dashboards > Quarterly Report
2. Select fiscal quarter from dropdown (Q1-Q4 FY25)
3. Review Executive Summary KPIs
4. Scroll through sections (Workforce, Turnover, Recruiting, Exit Survey)
5. Click "Export to PDF" to generate report
6. Distribute PDF to leadership

### Tips
- Default selection is most recent quarter
- KPI cards show prior quarter comparison automatically
- Use "Print" for quick hard copies
- PDF filename includes quarter and date for easy organization
```

**Technical Documentation (CLAUDE.md):**
```markdown
## Quarterly Report Dashboard

### Component Location
`/src/components/dashboards/QuarterlyReportDashboard.jsx`

### Route
`/dashboards/quarterly-report`

### Data Sources
- WORKFORCE_DATA (staticData.js)
- TURNOVER_DATA (staticData.js)
- RECRUITING_DATA (staticData.js)
- EXIT_SURVEY_DATA (staticData.js)

### Key Features
- Quarter selection with automatic comparison
- Executive summary with 10-12 KPIs
- 4 domain sections (Workforce, Turnover, Recruiting, Exit Survey)
- PDF export with print-ready styling
```

---

## Appendix

### A. Competitive Analysis

**Internal Alternatives:**
1. **Manual PowerPoint Creation** (Current State)
   - Pros: Full control, custom narrative
   - Cons: Time-consuming (2-3 hours), error-prone, inconsistent formatting

2. **Separate Dashboards** (Current State)
   - Pros: Detailed views, interactive
   - Cons: Requires switching between 4+ dashboards, manual compilation

**External Tools:**
- **Tableau/PowerBI:** Overkill for single-user personal use
- **Google Data Studio:** Requires cloud data source (not JSON)
- **Excel Pivot Tables:** Limited visualizations, not web-based

**Conclusion:** Custom Quarterly Report Dashboard is best fit for this use case (single user, JSON data, existing React codebase)

---

### B. User Research Insights

**Context:** User (you) identified this need during conversation

**Key Insights:**
1. **Pain Point:** "Manually compiling data from multiple dashboards is time-consuming"
2. **Frequency:** "Quarterly reports are required every 3 months"
3. **Audience:** "Reports go to HR leadership and university executives"
4. **Format:** "PDF export is critical for distribution"
5. **Priority:** "High priority - recurring task with business impact"

**User Goals:**
1. **Efficiency:** "Reduce report creation time from hours to minutes"
2. **Accuracy:** "Ensure metrics match source data (no transcription errors)"
3. **Consistency:** "Maintain consistent formatting quarter-over-quarter"
4. **Professionalism:** "Generate presentation-ready reports"

---

### C. Technical Reference

**Flask Dashboard Reference:**
User has existing Flask/Python dashboard at `/Users/pernelltoney/My Projects/02-development/hr-reports-workspace/TECHNICAL_DOCUMENTATION.md` with similar structure.

**Key Learnings from Flask Dashboard:**
- 3 main modules (Workforce, Termination, Exit Survey) align with this PRD
- KPI card structure documented (useful for replication)
- Fiscal period logic (FY starts July 1) matches existing app
- Chart types (donut, stacked bar, line) proven effective

**Reuse Opportunities:**
- Same KPI metrics can be reused
- Same chart types and layouts
- Same fiscal period logic
- Same business rules (exclude students/house staff from turnover)

---

### D. Wireframes (Conceptual)

**Executive Summary Section:**
```
┌────────────────────────────────────────────────────────────┐
│  EXECUTIVE SUMMARY - Q2 FY25                               │
│  Key HR Metrics Overview                                   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐│
│  │ Total     │ │ Faculty   │ │ Staff     │ │ Turnover  ││
│  │ Headcount │ │ Count     │ │ Count     │ │ Rate      ││
│  │           │ │           │ │           │ │           ││
│  │  5,037    │ │    689    │ │  1,448    │ │   8.1%    ││
│  │  ↓ -7.0%  │ │  ↓ -3.2%  │ │  ↑ +1.2%  │ │  ↑ +0.2%  ││
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘│
│                                                            │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐│
│  │ New Hires │ │ Time to   │ │ Survey    │ │ Avg       ││
│  │ (YTD)     │ │ Fill      │ │ Response  │ │ Satisfac. ││
│  │           │ │           │ │ Rate      │ │           ││
│  │    262    │ │  45 days  │ │  35.3%    │ │   3.4     ││
│  │  ↑ +16.3% │ │  → +0.0%  │ │  ↓ -3.2%  │ │  ↑ +0.6   ││
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘│
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Workforce Section:**
```
┌────────────────────────────────────────────────────────────┐
│  WORKFORCE SUMMARY - Q2 FY25                               │
│  Employee Composition as of June 30, 2025                  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  [6 KPI Cards: Total, Faculty, Staff, HSP, Students, NBE] │
│                                                            │
│  ┌──────────────────────┐   ┌──────────────────────┐     │
│  │ Location Distribution│   │ Assignment Types     │     │
│  │                      │   │                      │     │
│  │  [Stacked Bar Chart] │   │  [Donut Chart]       │     │
│  │  OMA vs PHX          │   │  Full-Time, Part-Time│     │
│  └──────────────────────┘   └──────────────────────┘     │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Top 10 Schools by Headcount                          │ │
│  │                                                      │ │
│  │  [Horizontal Bar Chart]                              │ │
│  │  Medicine, Arts & Sciences, Student Life, etc.      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

### E. Data Schema Reference

**staticData.js Structure:**

```javascript
// WORKFORCE_DATA
{
  "2025-06-30": {
    reportingDate: "6/30/25",
    totalEmployees: 5037,
    faculty: 689,
    staff: 1448,
    hsp: 612,
    temp: 574,
    locations: {
      "Omaha Campus": 4287,
      "Phoenix Campus": 750
    },
    assignmentTypes: [...],
    schoolOrgData: [...],
    demographics: {...}
  }
}

// TURNOVER_DATA
{
  "2025-06-30": {
    reportingDate: "6/30/25",
    totalTurnoverRate: 8.1,
    facultyTurnoverRate: 6.4,
    staffTurnoverRate: 8.7,
    terminations: 62,
    exitReasons: [...],
    schoolTurnover: [...]
  }
}

// RECRUITING_DATA
{
  "2025-06-30": {
    reportingDate: "6/30/25",
    newHiresYTD: 262,
    openPositions: 127,
    timeToFill: 45,
    offerAcceptanceRate: 81.2,
    costPerHire: 4200,
    diversityMetrics: {...}
  }
}

// EXIT_SURVEY_DATA
{
  "2025-06-30": {
    reportingDate: "6/30/25",
    totalResponses: 18,
    responseRate: 35.3,
    overallSatisfaction: 3.4,
    wouldRecommend: 83.3,
    departureReasons: [...]
  }
}
```

---

## Version History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2025-11-14 | 1.0 | Product Manager | Initial PRD created based on user requirements |

---

## Approval Sign-Off

**Product Owner (User):** _________________________ Date: ___________

**Technical Lead (Engineer):** _________________________ Date: ___________

---

**Next Steps:**
1. User reviews and approves PRD
2. Technical feasibility assessment (estimate: 2 weeks for v1)
3. Sprint planning and task breakdown
4. Development begins

---

*This PRD is a living document and will be updated as requirements evolve. All changes require approval from Product Owner.*
