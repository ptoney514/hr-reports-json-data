# Quarterly Report Dashboard - Product Requirements Document (PRD)

**Version:** 1.1 (Revised)
**Last Updated:** November 14, 2025
**Document Owner:** Product Manager
**Status:** Design Review - Awaiting User Approval
**Changes:** Removed PDF export, print features, and YoY comparison per user feedback

---

## Executive Summary

### Problem Statement
As an HR professional creating quarterly executive reports, I spend significant time manually compiling data from 4+ separate dashboards (Workforce, Turnover, Recruiting, Exit Survey) and taking screenshots to create reports for leadership. This manual process is time-consuming and makes it difficult to maintain consistent quarter-over-quarter comparisons.

### Proposed Solution
Create a dedicated **Quarterly Report Dashboard** that consolidates key HR metrics from all existing dashboards into a single, executive-ready view with quarter selection and browser-based viewing. The user can take screenshots directly from the browser for sharing with leadership.

### Success Criteria
- **Time Savings:** Reduce quarterly report creation time from 2-3 hours to **10-15 minutes**
- **Accuracy:** Eliminate manual data transcription errors by sourcing directly from staticData.js
- **Usability:** User can generate a complete quarterly view with 2 clicks (select quarter, review)
- **Completeness:** Report includes all critical metrics from Workforce, Turnover, Recruiting, and Exit Survey domains
- **Accessibility:** WCAG 2.1 AA compliant with screenshot-friendly styling

### Target Launch Date
**Version 1 (MVP):** 1 week from approval (November 21, 2025)

---

## Background & Context

### Why Now?
- **User Need:** Quarterly reporting to leadership is a recurring, high-priority task
- **Data Availability:** All required data already exists in staticData.js with FY25 Q1-Q4 coverage
- **Component Reusability:** Existing KPI cards, charts, and layouts can be leveraged (60% code reuse)
- **Strategic Timing:** FY26 Q1 data will be available soon - perfect timing to test with real data

### Who Requested This?
- **Primary User:** You (HR professional) based on documented pain point of manual report compilation
- **Secondary Stakeholders:** HR Leadership who receive quarterly reports via screenshots/PDFs

### What Happens If We Don't Build This?
- Manual report creation continues to consume 8-12 hours per year
- Risk of data inconsistencies between dashboards and reports
- Missed opportunity to provide quarter-over-quarter trend insights
- Leadership reports may lack visual consistency

---

## Goals & Success Metrics

### Primary Goal
**Enable single-user creation of comprehensive quarterly HR reports in under 15 minutes using browser screenshots**

**Success Metric:** Report generation time < 15 minutes (measured from quarter selection to screenshots captured)

### Secondary Goals
1. **Data Accuracy:** 100% alignment between dashboard metrics and staticData.js source
2. **Visual Consistency:** Report follows Creighton branding (existing dashboard styles)
3. **Screenshot Quality:** Dashboard layout optimized for browser screenshot capture
4. **Accessibility:** WCAG 2.1 AA compliance maintained

### Leading Indicators
- Frequency of dashboard usage (target: 4+ times per year, once per quarter)
- User satisfaction with report completeness (qualitative feedback)
- Time saved per quarter (self-reported)

---

## User Personas & Target Audience

### Primary Persona: HR Report Creator (You)
**Role:** HR Professional / Analyst
**Technical Proficiency:** High (comfortable with dashboards, data analysis)
**Frequency of Use:** Quarterly (4 times per year)
**Primary Goal:** Create comprehensive, accurate HR reports for leadership efficiently

**Pain Points:**
- Manually switching between 4+ dashboards to collect data
- Taking screenshots from multiple pages
- Ensuring consistency across quarters
- Time pressure to deliver reports quickly

**Needs:**
- Single view with all critical metrics
- Quarter selection with prior quarter comparison
- Clean layout optimized for browser screenshots
- Clear visual hierarchy for executive consumption

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

---

## User Stories & Use Cases

### Epic: Quarterly Report Generation

#### User Story 1: Select Fiscal Quarter
**As an** HR report creator
**I want to** select a fiscal quarter from available quarters with valid data
**So that** I can view consolidated HR metrics for that specific period

**Acceptance Criteria:**
- [ ] Dropdown selector displays **only quarters with valid data** (no future/empty quarters)
- [ ] Default selection is the **most recently completed quarter with data**
- [ ] Selecting a quarter updates all dashboard sections automatically
- [ ] Quarter selector is prominently displayed at the top of the page
- [ ] Quarter label shows date range: "Q4 FY25 (April - June 2025)"
- [ ] Selection persists during the session

**Priority:** P0 (Must have for v1)

---

#### User Story 2: View Executive Summary KPIs
**As an** HR report creator
**I want to** see high-level KPIs from all HR domains in one section
**So that** I can quickly understand the quarter's overall performance

**Acceptance Criteria:**
- [ ] Executive Summary section displays 8-10 KPI cards in a responsive grid
- [ ] Each KPI card shows:
  - Metric name
  - Current value
  - Prior quarter value (if available)
  - % change with trend indicator (↑/↓/→)
  - Color coding (green = positive trend, red = negative, gray = stable)
- [ ] KPIs include:
  - **Workforce:** Total Headcount, Faculty Count, Staff Count
  - **Turnover:** Total Terminations, Turnover Rate %
  - **Recruiting:** New Hires, Open Positions
  - **Exit Survey:** Response Rate %, Would Recommend %
- [ ] If prior quarter data unavailable, show "N/A" for comparison
- [ ] Cards use existing `SummaryCard` component for consistency

**Priority:** P0 (Must have for v1)

---

#### User Story 3: Review Workforce Section
**As an** HR report creator
**I want to** see workforce composition and demographics for the quarter
**So that** I can understand headcount trends and workforce mix

**Acceptance Criteria:**
- [ ] Section titled "Workforce Summary - Q[X] FY[YY]"
- [ ] Contains 2-3 visualizations:
  - Headcount trend chart (line chart, last 4 quarters if available)
  - Location distribution (OMA vs PHX) - donut chart or bar chart
  - Workforce mix by category (Faculty, Staff, House Staff, Students, Non-Benefit)
- [ ] Reuses existing charts from WorkforceDashboard component
- [ ] All charts sized appropriately for screenshot capture
- [ ] Section has clear visual divider from Executive Summary

**Priority:** P0 (Must have for v1)

---

#### User Story 4: Review Turnover Section
**As an** HR report creator
**I want to** see turnover analysis and exit patterns
**So that** I can report on employee retention and departures

**Acceptance Criteria:**
- [ ] Section titled "Turnover Summary - Q[X] FY[YY]"
- [ ] Contains 2-3 visualizations:
  - Turnover types breakdown (Voluntary, Involuntary, Retirement, etc.) - pie chart
  - Top exit reasons - horizontal bar chart
  - Early turnover (<1 year) percentage - stat card or mini chart
- [ ] Reuses existing charts from TurnoverDashboard component
- [ ] Shows quarter-over-quarter turnover rate comparison if prior quarter available
- [ ] Section visually distinct with divider

**Priority:** P0 (Must have for v1)

---

#### User Story 5: Review Recruiting Section
**As an** HR report creator
**I want to** see recruiting metrics and hiring activity
**So that** I can report on talent acquisition performance

**Acceptance Criteria:**
- [ ] Section titled "Recruiting Summary - Q[X] FY[YY]"
- [ ] Contains 2 visualizations:
  - New hires (starters/leavers) - bar chart or line chart
  - Open positions by status - donut chart or stat cards
- [ ] Shows key recruiting metrics:
  - Total new hires for quarter
  - Open positions as of quarter end
  - Average time to fill (if available)
- [ ] Reuses existing charts from RecruitingDashboard component
- [ ] Section visually distinct with divider

**Priority:** P0 (Must have for v1)

---

#### User Story 6: Review Exit Survey Section
**As an** HR report creator
**I want to** see exit survey responses and satisfaction trends
**So that** I can report on employee feedback and sentiment

**Acceptance Criteria:**
- [ ] Section titled "Exit Survey Summary - Q[X] FY[YY]"
- [ ] Contains 2-3 visualizations:
  - Response rate over time - line chart (last 4 quarters)
  - Satisfaction ratings summary - horizontal bar chart or table
  - Top exit reasons from survey - horizontal bar chart
- [ ] Shows key exit survey metrics:
  - Total responses for quarter
  - Response rate %
  - "Would Recommend" percentage
  - Average satisfaction score
- [ ] If no exit survey data for quarter, show "No exit survey data available"
- [ ] Section visually distinct with divider

**Priority:** P0 (Must have for v1)

---

#### User Story 7: Compare Quarters
**As an** HR report creator
**I want to** see quarter-over-quarter changes in key metrics
**So that** I can identify trends and communicate progress

**Acceptance Criteria:**
- [ ] All KPI cards in Executive Summary show prior quarter comparison
- [ ] Trend indicators use intuitive symbols and colors:
  - ↑ Green: Positive increase (headcount growth, new hires)
  - ↓ Red: Negative decrease (turnover rate decline is good - reverse color)
  - → Gray: Stable (change < 1%)
- [ ] Percentage changes calculated as: `((Current - Prior) / Prior) * 100`
- [ ] If prior quarter data unavailable, show "N/A" instead of crashing
- [ ] Comparison shows quarter labels: "Q4 FY25 vs Q3 FY25"

**Priority:** P0 (Must have for v1)

---

#### User Story 8: Add Narrative Summary (Optional)
**As an** HR report creator
**I want to** optionally add a brief narrative summary
**So that** I can provide context and interpretation for leadership

**Acceptance Criteria:**
- [ ] Optional text area below Executive Summary panel
- [ ] Placeholder text: "Add executive notes here (optional)"
- [ ] Text area supports plain text (500 character limit)
- [ ] Text saved to browser localStorage (persists across sessions)
- [ ] Can be cleared with "Reset" button
- [ ] Not included in screenshots (collapsible section)

**Priority:** P2 (Nice to have - future enhancement)

---

## Functional Requirements

### P0 - Must Have for v1 (MVP)

**Core Features:**
1. ✅ Select fiscal quarter from dropdown (**only quarters with valid data**)
2. ✅ View executive summary panel (8-10 KPI cards with QoQ indicators)
3. ✅ View workforce summary section (2-3 charts)
4. ✅ View turnover summary section (2-3 charts)
5. ✅ View recruiting summary section (2 charts)
6. ✅ View exit survey summary section (2-3 charts)
7. ✅ Quarter-over-quarter comparison in KPI cards
8. ✅ Loading states and error handling
9. ✅ WCAG 2.1 AA accessibility compliance
10. ✅ Screenshot-optimized layout (clean, professional)

**Estimated Effort:** 1 week (800-1,000 lines of code)

### P1 - Should Have Soon (v1.1)

**Enhanced Features:**
1. Multi-quarter trend charts (4-8 quarter line charts for key metrics)
2. Enhanced comparison view (side-by-side quarter comparison)
3. Department-level drill-downs (expandable sections)
4. Mobile-responsive layout optimization

**Estimated Effort:** +1 week (additional 400 lines)

### P2 - Nice to Have (Future)

**Advanced Features:**
1. Narrative summary text area with localStorage persistence
2. Custom KPI selection (user chooses which metrics to display)
3. Year-over-Year comparison (if multi-year data added)
4. Deep linking with URL parameters (`?quarter=FY25-Q4`)
5. Dark mode support for screenshots

**Estimated Effort:** +1-2 weeks (future roadmap)

---

## Non-Functional Requirements

### Performance
- **Page Load:** < 1 second (lazy loaded component)
- **Quarter Selection Change:** < 200ms (memoized calculations)
- **Screenshot Readiness:** Instant (no export processing needed)

### Browser Compatibility
- **Primary:** Chrome 120+ (latest)
- **Secondary:** Safari 17+, Firefox 120+, Edge 120+
- **Screenshot Tools:** Compatible with browser built-in screenshot, macOS screenshot (Cmd+Shift+4), Windows Snipping Tool

### Accessibility
- **WCAG 2.1 AA Compliance:** Required
- **Keyboard Navigation:** All interactive elements accessible via keyboard
- **Screen Reader:** Semantic HTML with proper ARIA labels
- **Color Contrast:** Minimum 4.5:1 ratio for all text

### Responsive Design
- **Desktop:** Optimized for 1920x1080 and 1440x900 displays
- **Tablet:** Functional but not primary use case
- **Mobile:** View-only (not optimized for screenshots)

---

## User Experience & Design

### Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│ [NAVIGATION]                                                │
├─────────────────────────────────────────────────────────────┤
│ QUARTERLY REPORT                                            │
│ [Quarter Selector: Q4 FY25 ▼] April - June 2025            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ EXECUTIVE SUMMARY (vs Q3 FY25)                              │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐               │
│ │  5,037 │ │  12.3% │ │   142  │ │  42.9% │               │
│ │Employees│ │Turnover│ │New Hires│ │ Survey │               │
│ │  ↑ 2.1%│ │ ↓ 0.8% │ │  ↑ 18  │ │ ↑ 5.2% │               │
│ └────────┘ └────────┘ └────────┘ └────────┘               │
│                                                             │
│ [4-6 more KPI cards...]                                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ WORKFORCE SUMMARY - Q4 FY25                                 │
│ ┌─────────────────┐  ┌─────────────────┐                  │
│ │ Headcount Trend │  │ Location Mix    │                  │
│ │   Line Chart    │  │   Donut Chart   │                  │
│ └─────────────────┘  └─────────────────┘                  │
├─────────────────────────────────────────────────────────────┤
│ TURNOVER SUMMARY - Q4 FY25                                  │
│ ┌─────────────────┐  ┌─────────────────┐                  │
│ │ Turnover Types  │  │ Top Exit Reasons│                  │
│ │   Pie Chart     │  │   Bar Chart     │                  │
│ └─────────────────┘  └─────────────────┘                  │
├─────────────────────────────────────────────────────────────┤
│ RECRUITING SUMMARY - Q4 FY25                                │
│ ┌─────────────────┐  ┌─────────────────┐                  │
│ │ New Hires       │  │ Open Positions  │                  │
│ │   Bar Chart     │  │   Stat Cards    │                  │
│ └─────────────────┘  └─────────────────┘                  │
├─────────────────────────────────────────────────────────────┤
│ EXIT SURVEY SUMMARY - Q4 FY25                               │
│ ┌─────────────────┐  ┌─────────────────┐                  │
│ │ Response Rate   │  │ Satisfaction    │                  │
│ │   Line Chart    │  │   Bar Chart     │                  │
│ └─────────────────┘  └─────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### Screenshot Workflow
1. User selects quarter
2. Dashboard renders all sections
3. User uses browser screenshot tool (Cmd+Shift+4 on Mac, Snipping Tool on Windows)
4. User captures each section or full page scroll
5. User pastes screenshots into PowerPoint/Word/Email

### Information Architecture
- **Page Title:** "Quarterly Report"
- **Breadcrumb:** Home > Dashboards > Quarterly Report
- **Hierarchy:**
  1. Quarter Selector (always visible at top)
  2. Executive Summary (KPIs with comparisons)
  3. Workforce Summary (headcount, demographics)
  4. Turnover Summary (exits, reasons, trends)
  5. Recruiting Summary (hires, positions)
  6. Exit Survey Summary (responses, satisfaction)

---

## Technical Considerations

### Data Sources
**All data from staticData.js (no new data sources needed):**
- WORKFORCE_DATA (quarterly snapshots)
- TURNOVER_DATA (quarterly terminations)
- RECRUITING_DATA (quarterly hiring)
- EXIT_SURVEY_DATA (quarterly responses)

### New Data Structures Needed

**Add to staticData.js:**
```javascript
// Fiscal period mapping (~50 lines)
export const FISCAL_PERIODS = {
  "FY25-Q1": {
    fiscalYear: "FY25",
    quarter: "Q1",
    label: "Q1 FY25",
    start: "2024-07-01",
    end: "2024-09-30",
    reportDate: "2024-09-30",
    displayName: "July - September 2024",
    hasData: true  // Flag for data availability
  },
  "FY25-Q2": { /* ... */ hasData: true },
  "FY25-Q3": { /* ... */ hasData: true },
  "FY25-Q4": { /* ... */ hasData: true }
};

// Helper function
export const getAvailableQuarters = () => {
  return Object.entries(FISCAL_PERIODS)
    .filter(([_, period]) => period.hasData)
    .map(([key, period]) => ({
      value: key,
      label: period.label,
      displayName: period.displayName
    }));
};
```

### New Services Needed

**quarterlyReportService.js (~300 lines):**
```javascript
// Core aggregation functions
export const getQuarterlyReport = (fiscalQuarter) => { /* ... */ };
export const calculateQoQComparison = (current, previous) => { /* ... */ };
export const getAvailableQuarters = () => { /* ... */ };
export const getPreviousQuarter = (fiscalQuarter) => { /* ... */ };
export const getMostRecentQuarter = () => { /* ... */ };
```

### New Components Needed

**Components (~700 lines total):**
1. **QuarterlyReportDashboard.jsx** (300 lines) - Main container
2. **QuarterSelector.jsx** (50 lines) - Dropdown for quarter selection
3. **ExecutiveSummaryPanel.jsx** (120 lines) - KPI cards grid
4. **WorkforceSummarySection.jsx** (80 lines) - Workforce charts wrapper
5. **TurnoverSummarySection.jsx** (80 lines) - Turnover charts wrapper
6. **RecruitingSummarySection.jsx** (70 lines) - Recruiting charts wrapper
7. **ExitSurveySummarySection.jsx** (70 lines) - Exit survey charts wrapper
8. **TrendIndicator.jsx** (30 lines) - QoQ change arrow component

**Reused Components (14 existing):**
- SummaryCard (for KPI cards)
- HeadcountChart, LocationDistributionChart (from WorkforceDashboard)
- TurnoverPieChart, TopExitReasonsChart (from TurnoverDashboard)
- StartersLeaversChart (from RecruitingDashboard)
- Various existing chart components

**Code Reuse:** ~65%

### Dependencies
**No new dependencies needed!** ✅

All required libraries already installed:
- ✅ react-router-dom (routing)
- ✅ recharts (charts)
- ✅ @tanstack/react-query (caching)
- ✅ lucide-react (icons)
- ✅ date-fns (date handling)

~~Removed from scope:~~
- ❌ ~~jspdf~~ (already installed but not needed for this feature)
- ❌ ~~html2canvas~~ (already installed but not needed)
- ❌ ~~react-to-print~~ (already installed but not needed)

### Technical Constraints
- **Browser Screenshot Compatibility:** Layout must work with all major screenshot tools
- **Horizontal Scrolling:** Avoid (breaks screenshot flow)
- **Viewport Size:** Optimize for 1920x1080 full-screen browser
- **Color Scheme:** High contrast for screenshot clarity

---

## Edge Cases & Error Handling

### Scenario 1: Selected Quarter Has No Data
**Trigger:** User selects quarter, but data is missing for one domain (e.g., no exit survey data)

**Behavior:**
- Show section header: "Exit Survey Summary - Q2 FY25"
- Display message: "No exit survey data available for this quarter"
- Show placeholder chart with "N/A" state
- Don't crash or hide entire section

### Scenario 2: No Prior Quarter Available (First Quarter)
**Trigger:** User selects Q1 FY25 (first quarter in dataset)

**Behavior:**
- Show KPI cards without comparison values
- Display "First quarter - no comparison available"
- Trend indicators show "→" (neutral/baseline)
- Multi-quarter trend charts show single data point

### Scenario 3: Future Quarter Selected
**Trigger:** User somehow accesses future quarter (shouldn't happen with filter, but edge case)

**Behavior:**
- Display message: "Data not yet available for Q3 FY26"
- Show placeholder content
- Provide link to most recent quarter

### Scenario 4: Data Validation Errors
**Trigger:** Headcount totals don't match across dashboards

**Behavior:**
- Display warning banner: "Data validation issue detected"
- Link to Data Validation dashboard for details
- Still show data but with warning indicator

---

## Out of Scope (Not Included in v1)

### Explicitly NOT Included:
- ❌ **PDF Export** - User will use browser screenshots instead
- ❌ **Print Optimization** - Browser screenshot workflow is sufficient
- ❌ **Year-over-Year Comparison** - Only QoQ comparison in v1
- ❌ **Email Integration** - User will manually share screenshots
- ❌ **Custom Date Ranges** - Only standard fiscal quarters
- ❌ **AI-Generated Insights** - User provides narrative context manually
- ❌ **Multi-Year Analysis** - Focus on single fiscal year (FY25)
- ❌ **User Customization** - Fixed layout, no personalization
- ❌ **Data Export to Excel/CSV** - Screenshots provide sufficient sharing mechanism
- ❌ **Annotations or Comments** - Not needed for personal use

### Future Phases (If Needed):
- **Phase 2 (Optional):** Multi-year support (FY24-FY26), YoY comparison
- **Phase 3 (Optional):** PDF export if screenshot workflow proves insufficient
- **Phase 4 (Optional):** Advanced features (custom KPIs, drill-downs)

---

## Open Questions & Decisions

### ✅ RESOLVED (Per User Feedback):

**Q1: Should we include PDF export in v1?**
- **Answer:** ❌ No - Browser screenshots are sufficient

**Q2: Should we optimize for printing?**
- **Answer:** ❌ No - Not needed

**Q3: Should future quarters appear in dropdown?**
- **Answer:** ❌ No - Only show quarters with valid data, default to most recent

**Q4: Should we support Year-over-Year comparison?**
- **Answer:** ❌ No - Not at this point, focus on QoQ

### ⏳ PENDING USER DECISION:

**Q5: Historical Data Depth**
- **Question:** Should we support FY24 data for YoY comparison in the future?
- **Options:**
  - A) FY25 only (4 quarters) - Simplest
  - B) FY24 + FY25 (8 quarters) - Enables YoY if needed later
- **Recommendation:** Start with FY25 only, add FY24 if/when needed

**Q6: Narrative Summary Feature**
- **Question:** Should we include optional text area for executive notes?
- **Priority:** P2 (nice to have)
- **Effort:** 2 hours (low complexity)
- **Recommendation:** Include if timeline allows, otherwise defer

---

## Launch Plan

### Release Strategy

**Phase: Alpha Testing (Internal)**
- **Duration:** 1 day
- **Tester:** You (user/developer)
- **Test Data:** FY25 Q4 (most recent quarter)
- **Focus:** Core functionality, data accuracy, screenshot quality
- **Exit Criteria:** All P0 acceptance criteria met

**Phase: Production Launch**
- **Date:** Immediately after alpha testing passes
- **Rollout:** Add navigation link to dashboard
- **Communication:** None needed (single user)
- **Training:** Self-documented via UI design

### Feature Flags
**Not needed** - Single user, can launch directly to production

### Rollback Plan
- Remove navigation link if critical bugs found
- Fix issues, re-launch
- Low risk (view-only feature, no data modifications)

---

## Documentation Needs

### User Documentation
- [ ] Add section to USER_GUIDE.md:
  - How to use Quarterly Report Dashboard
  - How to take browser screenshots
  - Tips for creating PowerPoint reports from screenshots

### Developer Documentation
- [ ] Add to WORKFLOW_GUIDE.md:
  - How to add new fiscal quarters to FISCAL_PERIODS
  - How to modify KPIs in Executive Summary
  - How to add new charts to summary sections

### Technical Documentation
- [ ] quarterlyReportService.js function documentation (JSDoc comments)
- [ ] Component prop documentation
- [ ] Update TECHNICAL_ARCHITECTURE_REVIEW.md with new components

---

## Success Metrics

### Quantitative Metrics
- ✅ **Development Time:** < 1 week (40 hours)
- ✅ **Code Size:** ~800-1,000 lines (target)
- ✅ **Page Load Time:** < 1 second
- ✅ **Quarter Change Time:** < 200ms
- ✅ **Code Reuse:** > 60% (reuse existing components)

### Qualitative Metrics
- ✅ **User Satisfaction:** Reduces report creation time by 80%+
- ✅ **Screenshot Quality:** Professional appearance, suitable for leadership
- ✅ **Data Accuracy:** Matches existing dashboards 100%
- ✅ **Accessibility:** WCAG 2.1 AA compliant

---

## Timeline & Milestones

### Revised Timeline (Simplified Scope)

**Week 1: MVP Development**

**Days 1-2: Foundation**
- Create quarterlyReportService.js
- Add FISCAL_PERIODS to staticData.js
- Build QuarterlyReportDashboard.jsx shell
- Add routing and navigation

**Days 3-4: Executive Summary & Sections**
- Build ExecutiveSummaryPanel with 8-10 KPI cards
- Implement QoQ comparison logic
- Create 4 summary section wrapper components
- Integrate existing chart components

**Day 5: Polish & Testing**
- Add loading states and error handling
- Screenshot layout optimization
- Accessibility testing
- Data validation

**Deliverable:** Working quarterly report dashboard optimized for browser screenshots

---

## Dependencies & Assumptions

### Dependencies
- **Data:** FY25 Q1-Q4 data in staticData.js (already exists)
- **Components:** Existing SummaryCard, chart components (already exist)
- **Infrastructure:** React Router, React Query (already configured)

### Assumptions
- ✅ User has access to browser screenshot tools (macOS screenshot, browser DevTools)
- ✅ Screenshots are acceptable format for sharing with leadership
- ✅ Current data in staticData.js is accurate and complete
- ✅ Fiscal year calendar remains July 1 - June 30
- ✅ Single user access (no permissions/authentication needed)

---

## Appendix

### Fiscal Calendar Reference

**Fiscal Year:** July 1 - June 30
- **Q1:** July - September (ends Sept 30)
- **Q2:** October - December (ends Dec 31)
- **Q3:** January - March (ends Mar 31)
- **Q4:** April - June (ends Jun 30)

**Example:**
- FY25 = July 1, 2024 - June 30, 2025
- FY25 Q1 = July 1, 2024 - September 30, 2024
- FY25 Q4 = April 1, 2025 - June 30, 2025

### Comparison to Flask Dashboard

This React implementation mirrors the Flask dashboard at `/Users/pernelltoney/My Projects/02-development/hr-reports-workspace/` but:
- ✅ Uses JSON instead of CSV files
- ✅ Client-side aggregation instead of Flask API
- ✅ React components instead of Jinja templates
- ✅ Browser screenshots instead of PDF export
- ✅ Simpler architecture (no backend, no authentication)

---

## Approval Checklist

### For User Sign-Off:

- [ ] **Problem Statement Accurate:** Does this solve your quarterly reporting pain point?
- [ ] **User Stories Complete:** Do these cover your workflow (Stories 1-7)?
- [ ] **Scope Appropriate:** Are PDF/print features correctly removed?
- [ ] **Timeline Acceptable:** Is 1 week reasonable for MVP?
- [ ] **Screenshot Workflow:** Is browser screenshot approach acceptable?
- [ ] **Quarter Selector:** Only showing quarters with data is correct?
- [ ] **No YoY Comparison:** QoQ only is sufficient for v1?

### Ready to Proceed:
- [ ] **APPROVED** - Proceed with UI/UX wireframes and implementation
- [ ] **REVISIONS NEEDED** - Specify changes below
- [ ] **QUESTIONS** - Need clarification on specific sections

---

**Version History:**
- **v1.0** (Nov 14, 2025) - Initial PRD with PDF export, print features, YoY comparison
- **v1.1** (Nov 14, 2025) - Removed PDF export, print features, YoY comparison per user feedback. Simplified quarter selector to valid data only.

---

*This PRD is ready for UI/UX wireframe development and implementation upon approval.*
