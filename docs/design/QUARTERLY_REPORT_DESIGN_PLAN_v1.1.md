# Quarterly Report Dashboard - Design Plan for Sign-Off (v1.1 Revised)

**Project:** HR Reports JSON Data
**Feature:** Quarterly Report Dashboard
**Date:** November 14, 2025
**Status:** ⏸️ Awaiting Approval
**Version:** 1.1 (Revised per user feedback)
**Prepared By:** Product Manager + Technical Architect

**Changes from v1.0:**
- ❌ Removed PDF export features
- ❌ Removed print optimization requirements
- ❌ Removed Year-over-Year comparison
- ✅ Simplified quarter selector (only quarters with valid data)
- ✅ Reduced timeline: 2 weeks → **1 week**

---

## Executive Summary

### What We're Building
A consolidated **Quarterly Report Dashboard** that aggregates data from your 4 existing dashboards (Workforce, Turnover, Recruiting, Exit Survey) into a single executive summary view optimized for **browser screenshots**.

### The Problem
Currently, creating a quarterly HR report requires:
- Opening 4+ separate dashboards
- Taking screenshots from each page
- Manually arranging screenshots in PowerPoint/Word
- **Total time: 2-3 hours per quarter**

### The Solution
One-page quarterly report view:
- Select quarter from dropdown (only valid data quarters shown)
- View consolidated executive summary (8-10 KPIs with QoQ indicators)
- Review 4 summary sections with key charts
- Take browser screenshots for sharing
- **Target time: 10-15 minutes per quarter**

### Success Criteria
✅ Reduce report creation time by **85%** (2-3 hours → 10-15 minutes)
✅ Single source of truth for quarterly HR metrics
✅ Screenshot quality suitable for leadership presentations
✅ WCAG 2.1 AA accessibility compliance maintained

---

## 📊 Simplified Design Overview

### Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│ [HEADER]                                                    │
│ Quarterly Report        [Quarter Selector: Q4 FY25 ▼]      │
│ April - June 2025       (vs Q3 FY25)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ EXECUTIVE SUMMARY                                           │
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
│ │  (Last 4 Qtrs)  │  │   OMA vs PHX    │                  │
│ └─────────────────┘  └─────────────────┘                  │
├─────────────────────────────────────────────────────────────┤
│ TURNOVER SUMMARY - Q4 FY25                                  │
│ ┌─────────────────┐  ┌─────────────────┐                  │
│ │ Turnover Types  │  │ Top Exit Reasons│                  │
│ │  (Pie Chart)    │  │   (Bar Chart)   │                  │
│ └─────────────────┘  └─────────────────┘                  │
├─────────────────────────────────────────────────────────────┤
│ RECRUITING SUMMARY - Q4 FY25                                │
│ ┌─────────────────┐  ┌─────────────────┐                  │
│ │ New Hires       │  │ Open Positions  │                  │
│ │  (Bar Chart)    │  │  (Stat Cards)   │                  │
│ └─────────────────┘  └─────────────────┘                  │
├─────────────────────────────────────────────────────────────┤
│ EXIT SURVEY SUMMARY - Q4 FY25                               │
│ ┌─────────────────┐  ┌─────────────────┐                  │
│ │ Response Trend  │  │ Satisfaction    │                  │
│ │ (Last 4 Qtrs)   │  │   Ratings       │                  │
│ └─────────────────┘  └─────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### Screenshot Workflow (Simplified)

1. **Navigate** to `/dashboards/quarterly-report`
2. **Select** quarter from dropdown (e.g., "Q4 FY25")
3. **Review** all sections on single scrollable page
4. **Screenshot** using browser tool:
   - **Option A:** Full page screenshot (Chrome DevTools: Cmd+Shift+P → "Capture full size screenshot")
   - **Option B:** Section-by-section screenshots (macOS: Cmd+Shift+4)
5. **Paste** screenshots into PowerPoint/Word/Email
6. **Share** with leadership

**Total Time:** **10-15 minutes** (vs. 2-3 hours currently)

---

## 🏗️ Simplified Technical Architecture

### ✅ APPROVED: Client-Side View Only

**No Backend, No Export, No Print CSS** - Significantly simpler!

### Data Framework

**Current State:**
- ✅ staticData.js supports quarterly aggregation
- ✅ All required data available (workforce, turnover, recruiting, exit survey)
- ✅ Fiscal quarter structure already in place

**Required Additions:**
1. `FISCAL_PERIODS` configuration with `hasData` flags (60 lines)
2. `quarterlyReportService.js` for aggregation logic (250 lines - simplified)
3. `useQuarterlyReport` hook for React Query caching (50 lines)

**Total New Data Code:** ~360 lines (vs 500 lines with PDF export)

### Component Architecture

**Simplified Component Tree:**

```
QuarterlyReportDashboard.jsx (250 lines)
├── QuarterSelector.jsx (50 lines) - Only shows quarters with valid data
├── ExecutiveSummaryPanel.jsx (120 lines) - 8-10 KPI cards
├── WorkforceSummarySection.jsx (80 lines) - Reuses existing charts
├── TurnoverSummarySection.jsx (80 lines) - Reuses existing charts
├── RecruitingSummarySection.jsx (70 lines) - Reuses existing charts
└── ExitSurveySummarySection.jsx (70 lines) - Reuses existing charts
```

**Total New Code:** ~720 lines (vs 1,400 lines with PDF export)

**Code Reuse:** ~65% (14 existing components)

### Removed Complexity

~~pdfExportService.js~~ - **NOT NEEDED** ❌
~~Print CSS optimization~~ - **NOT NEEDED** ❌
~~Multi-page PDF logic~~ - **NOT NEEDED** ❌
~~YoY comparison service~~ - **NOT NEEDED** ❌

**Simplified Dependencies:**
- ✅ No new npm packages needed
- ✅ jspdf/html2canvas already installed (unused for this feature)

### Performance Targets

| Metric | Target | Expected | Status |
|--------|--------|----------|--------|
| Initial Load | <1s | ~600ms | ✅ Achievable |
| Quarter Change | <200ms | ~80ms | ✅ Fast |
| Screenshot Ready | Instant | Instant | ✅ Perfect |
| Bundle Size | <40KB | ~35KB | ✅ Small |

**Much faster than PDF export approach!**

---

## 📋 Simplified Implementation Plan

### 1 Week Timeline (5 days)

#### Day 1: Service Layer
```bash
# Create service file
touch src/services/quarterlyReportService.js

# Implement:
- FISCAL_PERIODS with hasData flags
- getQuarterlyReport() function
- calculateQoQComparison() function
- getMostRecentQuarterWithData() function
- getAvailableQuarters() function (filters by hasData)

# Add to staticData.js:
- Export FISCAL_PERIODS configuration

# Test:
- Verify Q4 FY25 data aggregates correctly
- Test QoQ comparison (Q4 vs Q3)
```

#### Day 2: Dashboard Shell & Quarter Selector
```bash
# Create components
mkdir src/components/quarterly
touch src/components/dashboards/QuarterlyReportDashboard.jsx
touch src/components/quarterly/QuarterSelector.jsx

# Implement:
- Basic dashboard layout
- Quarter selector dropdown (only valid data quarters)
- Default to most recent quarter with data
- Add routing in App.js
- Update navigation

# Test:
- Quarter selector shows only FY25 Q1-Q4
- Defaults to Q4 FY25 (most recent)
- Changing quarter updates URL parameter
```

#### Day 3: Executive Summary Panel
```bash
# Create component
touch src/components/quarterly/ExecutiveSummaryPanel.jsx
touch src/components/quarterly/TrendIndicator.jsx

# Implement:
- 8-10 KPI cards using existing SummaryCard
- QoQ comparison values and indicators
- Trend arrows (↑ ↓ →) with colors
- Responsive grid layout (2-3 columns)

# Test:
- All KPIs display correctly
- QoQ deltas calculate accurately
- Colors/arrows show correct direction
```

#### Day 4: Summary Sections (4 sections)
```bash
# Create section components
touch src/components/quarterly/WorkforceSummarySection.jsx
touch src/components/quarterly/TurnoverSummarySection.jsx
touch src/components/quarterly/RecruitingSummarySection.jsx
touch src/components/quarterly/ExitSurveySummarySection.jsx

# Implement:
- Integrate existing chart components
- Section headers with quarter labels
- 2-3 charts per section
- Graceful handling of missing data

# Test:
- All 4 sections render correctly
- Charts display accurate data
- No console errors
```

#### Day 5: Polish & Testing
```bash
# Implement:
- Loading skeletons (QuarterlyReportSkeleton.jsx)
- Error boundaries
- Empty state messaging ("No data for Q1 FY24")
- Accessibility testing (WCAG 2.1 AA)
- Screenshot layout optimization (padding, spacing)

# Test:
- Full workflow (select quarter → view → screenshot)
- Edge cases (first quarter, missing data)
- Accessibility audit
- Cross-browser testing (Chrome, Safari, Firefox)
- Screenshot quality review

# Documentation:
- Add to USER_GUIDE.md
- Update WORKFLOW_GUIDE.md
```

**Deliverable:** Production-ready Quarterly Report Dashboard

---

## 🎯 Functional Requirements (Revised)

### P0 - Must Have for v1 (MVP)

**Core Features:**
1. ✅ Select fiscal quarter from dropdown (**only quarters with valid data**)
2. ✅ Default to most recent quarter with data
3. ✅ View executive summary panel (8-10 KPI cards with QoQ indicators)
4. ✅ View workforce summary section (2-3 charts)
5. ✅ View turnover summary section (2-3 charts)
6. ✅ View recruiting summary section (2 charts)
7. ✅ View exit survey summary section (2-3 charts)
8. ✅ Quarter-over-Quarter comparison in KPI cards
9. ✅ Loading states and error handling
10. ✅ WCAG 2.1 AA accessibility compliance
11. ✅ Screenshot-optimized layout (professional, clean)

**Estimated Effort:** 1 week (~720 lines of code)

### P1 - Should Have Soon (v1.1)

**Enhanced Features:**
1. Multi-quarter trend charts (4-8 quarter line charts for key metrics)
2. Enhanced comparison view (side-by-side quarter table)
3. Department-level drill-downs (expandable sections)
4. Mobile-responsive layout optimization

**Estimated Effort:** +3-5 days (additional 300 lines)

### P2 - Nice to Have (Future)

**Advanced Features:**
1. Narrative summary text area with localStorage persistence
2. Custom KPI selection (user chooses which metrics to display)
3. Deep linking with URL parameters (`?quarter=FY25-Q4`)
4. Dark mode support for screenshots
5. PDF export (if screenshot workflow proves insufficient)

**Estimated Effort:** +1-2 weeks (if needed in future)

---

## 🚫 Out of Scope (Removed Per User Feedback)

### Explicitly NOT Building:
- ❌ **PDF Export** - Browser screenshots are sufficient
- ❌ **Print Optimization** - Not needed for screenshot workflow
- ❌ **Year-over-Year Comparison** - Focus on QoQ only for v1
- ❌ **Future Quarter Selector** - Only show quarters with valid data
- ❌ **Email Integration** - User manually shares screenshots
- ❌ **Custom Date Ranges** - Standard fiscal quarters only
- ❌ **AI-Generated Insights** - User provides context manually

---

## 🎨 Design Specifications

### Quarter Selector Behavior (Updated)

**Requirements:**
- Only show quarters where `hasData: true` in FISCAL_PERIODS
- Default to most recent quarter with data
- Dropdown sorted chronologically (newest first)
- Clear labeling: "Q4 FY25 - April to June 2025"

**Implementation:**
```javascript
// In QuarterSelector.jsx
const availableQuarters = getAvailableQuarters(); // Filters by hasData
const defaultQuarter = getMostRecentQuarterWithData();

const [selectedQuarter, setSelectedQuarter] = useState(defaultQuarter);
```

**Example Dropdown:**
```
┌────────────────────────────────┐
│ Q4 FY25 - April to June 2025  ▼│ ← Default (most recent)
├────────────────────────────────┤
│ Q4 FY25 - April to June 2025   │
│ Q3 FY25 - January to March 2025│
│ Q2 FY25 - October to December 2024│
│ Q1 FY25 - July to September 2024│
└────────────────────────────────┘
```

### Executive Summary Panel Design

```
┌───────────────────────────────────────────────────────┐
│         EXECUTIVE SUMMARY - Q4 FY25 vs Q3 FY25        │
├───────────┬───────────┬───────────┬───────────────────┤
│  5,037    │   12.3%   │   142     │      42.9%        │
│ Employees │  Turnover │ New Hires │  Survey Response  │
│  ↑ 2.1%   │  ↓ 0.8%   │  ↑ 18     │      ↑ 5.2%       │
├───────────┼───────────┼───────────┼───────────────────┤
│   1,234   │   2,456   │    45     │       28          │
│  Faculty  │   Staff   │   Open    │  Avg Days to Fill │
│  ↑ 1.2%   │  ↑ 2.5%   │  ↓ 3      │      → 0          │
└───────────┴───────────┴───────────┴───────────────────┘
```

**Screenshot Tips:**
- Full-width layout (no horizontal scroll)
- High-contrast colors
- Large font sizes (readable at 100% zoom)
- White background for clean screenshots

### Section Layout Pattern

Each of 4 sections follows same pattern:

```
┌─────────────────────────────────────────────────────┐
│  [SECTION TITLE] SUMMARY - Q4 FY25                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [2-3 Charts in Responsive Grid]                    │
│                                                     │
│  ┌──────────────────┐  ┌──────────────────┐        │
│  │  Chart 1         │  │  Chart 2         │        │
│  │                  │  │                  │        │
│  └──────────────────┘  └──────────────────┘        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Section Dividers:**
- Clear visual separation (border or margin)
- Section title with quarter label
- Consistent spacing (24px padding)

---

## 🔧 Technical Architecture (Simplified)

### Stack Changes

**New Files:**
- `src/services/quarterlyReportService.js` (250 lines)
- `src/components/dashboards/QuarterlyReportDashboard.jsx` (250 lines)
- `src/components/quarterly/` (6 components, 470 lines total)
- `src/hooks/useQuarterlyReport.js` (50 lines)

**Modified Files:**
- `src/data/staticData.js` (+60 lines for FISCAL_PERIODS)
- `src/App.js` (+10 lines for routing)
- `src/components/ui/Navigation.jsx` (+5 lines for nav link)

**Total New Code:** ~1,095 lines (vs 2,180 with PDF export)
**Code Reduction:** 50% simpler!

### Data Service Architecture

**quarterlyReportService.js Functions:**

```javascript
// Core functions (NO PDF export logic)
export const FISCAL_PERIODS = { /* 4 quarters with hasData flags */ };

export const getQuarterlyReport = (fiscalQuarter) => {
  // Aggregate all data for quarter
  // Returns: { period, workforce, turnover, recruiting, exitSurvey, summary }
};

export const calculateQoQComparison = (current, previous) => {
  // Calculate deltas between quarters
  // Returns: { metric: { value, previousValue, change, percentChange, trend } }
};

export const getAvailableQuarters = () => {
  // Filter FISCAL_PERIODS by hasData: true
  // Returns: [{ value: "FY25-Q4", label: "Q4 FY25", displayName: "..." }]
};

export const getMostRecentQuarterWithData = () => {
  // Find most recent quarter where hasData = true
  // Returns: "FY25-Q4" (or latest available)
};

export const getPreviousQuarter = (fiscalQuarter) => {
  // Get prior quarter for QoQ comparison
  // Returns: "FY25-Q3" (or null if first quarter)
};
```

**Removed Functions (Not Needed):**
- ~~exportToPDF()~~ ❌
- ~~generatePrintLayout()~~ ❌
- ~~calculateYoYComparison()~~ ❌
- ~~getPriorYearQuarter()~~ ❌

### Component Structure (Simplified)

```
src/components/
├── dashboards/
│   └── QuarterlyReportDashboard.jsx (250 lines)
│       - Main container
│       - Quarter selection state
│       - Section orchestration
│
└── quarterly/ (NEW FOLDER)
    ├── QuarterSelector.jsx (50 lines)
    │   - Dropdown with valid quarters only
    │   - Defaults to most recent
    │
    ├── ExecutiveSummaryPanel.jsx (120 lines)
    │   - Grid of KPI cards
    │   - QoQ comparison display
    │
    ├── TrendIndicator.jsx (30 lines)
    │   - Arrow + percentage display
    │   - Color coding logic
    │
    ├── WorkforceSummarySection.jsx (80 lines)
    │   - Wraps existing HeadcountChart, LocationChart
    │
    ├── TurnoverSummarySection.jsx (80 lines)
    │   - Wraps existing TurnoverPieChart, ExitReasonsChart
    │
    ├── RecruitingSummarySection.jsx (70 lines)
    │   - Wraps existing StartersLeaversChart
    │
    └── ExitSurveySummarySection.jsx (70 lines)
        - Wraps existing charts or creates simple new ones
```

### Performance Impact

| Metric | Impact |
|--------|--------|
| Bundle Size | +35KB (vs +53KB with PDF) ✅ 33% smaller |
| Dependencies | 0 new (vs 2 with PDF) ✅ No bloat |
| Load Time | ~600ms (vs ~800ms with PDF) ✅ 25% faster |
| Complexity | 720 LOC (vs 1,400 LOC) ✅ 48% simpler |

---

## 📅 Revised Development Timeline

### 1 Week Sprint (vs 2 weeks with PDF)

```
Day 1: Service Layer Foundation
├── quarterlyReportService.js (core aggregation)
├── FISCAL_PERIODS configuration in staticData.js
├── useQuarterlyReport hook
└── Unit tests for service functions

Day 2: Dashboard Shell & Quarter Selector
├── QuarterlyReportDashboard.jsx container
├── QuarterSelector component (valid data only)
├── Routing in App.js
├── Navigation link
└── Basic layout structure

Day 3: Executive Summary Panel
├── ExecutiveSummaryPanel component
├── TrendIndicator component
├── 8-10 KPI cards with QoQ comparisons
├── Grid layout responsive
└── Screenshot-optimized styling

Day 4: Four Summary Sections
├── WorkforceSummarySection (reuse HeadcountChart, etc.)
├── TurnoverSummarySection (reuse TurnoverPieChart, etc.)
├── RecruitingSummarySection (reuse StartersLeaversChart)
├── ExitSurveySummarySection (reuse existing charts)
└── Section dividers and titles

Day 5: Polish, Testing & Launch
├── Loading skeletons
├── Error handling (missing data, first quarter)
├── Accessibility testing (WCAG 2.1 AA)
├── Screenshot layout review
├── Documentation updates
└── Production launch (add to navigation)
```

**Time Savings:** 50% faster than PDF export approach (1 week vs 2 weeks)

---

## ✅ Approval Checklist (Simplified)

### Scope Confirmation

**✅ CONFIRMED (Per User Feedback):**
- ❌ No PDF export needed - Browser screenshots are sufficient
- ❌ No print optimization needed - Screenshot workflow works well
- ❌ No YoY comparison in v1 - QoQ comparison only
- ✅ Quarter selector shows only valid data quarters
- ✅ Default to most recent quarter with data
- ✅ Timeline reduced to 1 week (vs 2 weeks)

### User Decisions Needed

**Decision 1: Historical Data Depth**
- [ ] Option A: FY25 only (4 quarters) ← Recommended for v1
- [ ] Option B: FY24 + FY25 (8 quarters) - For future YoY comparison

**Decision 2: Narrative Summary (P2 Feature)**
- [ ] Include optional text area for notes (adds 2 hours)
- [ ] Skip for v1, add later if needed ← Recommended

**Decision 3: Multi-Quarter Trend Charts**
- [ ] Include 4-quarter trend lines in each section (adds 1 day)
- [ ] Skip for v1, show single quarter only ← Simplest

### Final Approval

- [ ] **APPROVED - Proceed with implementation** (1 week timeline)
- [ ] **REVISIONS NEEDED - Specify changes**
- [ ] **QUESTIONS - Need clarification**

---

## 📊 Comparison: Before vs After Simplification

| Aspect | v1.0 (With PDF) | v1.1 (Screenshots Only) | Improvement |
|--------|-----------------|-------------------------|-------------|
| **Timeline** | 2-4 weeks | **1 week** | **50-75% faster** |
| **Code Size** | 1,400 lines | **720 lines** | **48% simpler** |
| **Dependencies** | +2 packages | **0 new** | **No bloat** |
| **Complexity** | High (PDF logic) | **Low** | **Much easier** |
| **Maintenance** | Medium | **Low** | **Less tech debt** |
| **User Workflow** | Click export, wait 5s | **Screenshot instantly** | **Faster UX** |

**User Benefit:** Simpler, faster, easier to maintain!

---

## 🎯 Next Steps

### If Approved:

1. **Day 1 (Tomorrow):**
   - Start implementation (service layer)
   - You'll see progress in real-time

2. **Day 5 (Friday):**
   - Feature complete and ready to use
   - You can test with FY25 Q4 data

3. **Week 2:**
   - Use for creating next quarterly report
   - Gather feedback for P1 enhancements

### If Revisions Needed:

Please specify:
- Which sections need changes?
- What's missing from user stories?
- Any technical concerns?

---

## 📖 Documentation Ready

**Files Created:**
1. [docs/prd/QUARTERLY_REPORT_DASHBOARD_PRD_v1.1.md](../prd/QUARTERLY_REPORT_DASHBOARD_PRD_v1.1.md) - This PRD
2. [docs/design/QUARTERLY_REPORT_DESIGN_PLAN_v1.1.md](QUARTERLY_REPORT_DESIGN_PLAN_v1.1.md) - This design plan

**Ready for:**
- UI/UX wireframes (next step after approval)
- Implementation kickoff
- Sprint planning

---

**Status:** ⏸️ Ready for Your Approval

**Your Action:** Review and approve to proceed with 1-week implementation sprint!

---

*Version 1.1 - Simplified scope focusing on browser screenshot workflow. No PDF export, no print features, no YoY comparison. Faster delivery, simpler codebase, easier maintenance.*
