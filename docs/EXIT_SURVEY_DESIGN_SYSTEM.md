# Exit Survey Dashboard Design System - FY25 Reference

**Version:** 1.0
**Last Updated:** November 17, 2025
**Reference File:** `src/components/dashboards/ExitSurveyFY25Dashboard.jsx`

---

## Table of Contents
1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Spacing & Layout](#spacing--layout)
4. [Component Patterns](#component-patterns)
5. [Chart Visualizations](#chart-visualizations)
6. [Interactive Elements](#interactive-elements)
7. [Accessibility Compliance](#accessibility-compliance)
8. [Print Styles](#print-styles)

---

## Color Palette

### Primary Brand Colors (Creighton University)

Defined in `tailwind.config.js`:

```javascript
colors: {
  'creighton': {
    'blue': '#0054A6',        // Primary brand color
    'navy': '#00245D',        // Dark brand accent
    'light-blue': '#1F74DB',  // Interactive elements
    'sky-blue': '#95D2F3',    // Light accents
    'green': '#71CC98',       // Positive metrics
    'yellow': '#FFC72C'       // Warning/attention
  }
}
```

**Usage Guidelines:**
- **Primary Blue (`#0054A6`)**: Page headers, primary icons, main headings, faculty data
- **Light Blue (`#1F74DB`)**: Survey response metrics, interactive charts, secondary data
- **Green (`#71CC98`)**: Satisfaction scores, positive trends, success indicators
- **Yellow (`#FFC72C`)**: Years of service, neutral metrics

### Semantic Colors

| Color | Hex Code | Purpose | Usage Examples |
|-------|----------|---------|----------------|
| **Success Green** | `#10B981` | Positive indicators, checkmarks | Survey responses, completion rates |
| **Success Dark** | `#2E7D32` | Strong success states | Recommendation headers |
| **Warning Yellow** | `#F59E0B` | Caution, attention needed | Average tenure, moderate risks |
| **Warning Light** | `#FFC72C` | Soft warnings | Advisory notes |
| **Error Red** | `#EF4444` | Critical issues, high risks | Critical risk levels, negative trends |
| **Info Blue** | `#3B82F6` | Informational, moderate priority | Moderate risk levels |

### Data Visualization Colors

**Faculty vs Staff Palette:**
```javascript
{
  faculty: '#0054A6',  // Creighton blue
  staff: '#7C3AED'     // Purple (distinct from faculty)
}
```

**Risk Level Colors (Termination Reasons):**
```javascript
function getReasonColor(percentage) {
  if (percentage >= 25) return '#EF4444';  // Critical (Red)
  if (percentage >= 15) return '#F59E0B';  // High (Orange)
  if (percentage >= 10) return '#3B82F6';  // Moderate (Blue)
  if (percentage >= 5) return '#10B981';   // Low (Green)
  return '#6B7280';                        // Minimal (Gray)
}
```

**Chart Gradient:**
```css
background: linear-gradient(to top, #2563EB, #60A5FA);
/* Use for bar charts and visual data displays */
```

### Neutral Colors (Tailwind Defaults)

| Color | Usage |
|-------|-------|
| `gray-50` | Page background (`bg-gray-50`) |
| `gray-100` | Hover states, alternating rows |
| `gray-200` | Borders, progress bar backgrounds |
| `gray-400` | Dividers, disabled text |
| `gray-500` | Secondary text |
| `gray-600` | Body text, labels |
| `gray-700` | Emphasized text |
| `gray-900` | Primary headings, high-contrast text |

### Background Gradients

**Blue Gradient (Executive Summary):**
```jsx
className="bg-gradient-to-r from-blue-50 to-white"
```

**Green-Blue Gradient (Recommendations):**
```jsx
className="bg-gradient-to-r from-green-50 to-blue-50"
```

**Colored Backgrounds:**
```jsx
// Warning/Alert boxes
className="bg-yellow-50 border border-yellow-200"

// Info boxes
className="bg-blue-50 border border-blue-200"

// Alternating table rows
className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
```

---

## Typography

### Font Families

Defined in `tailwind.config.js`:

```javascript
fontFamily: {
  'serif': ['"Nocturne Serif"', '"Gentium Book Basic"', 'Georgia', 'serif'],
  'sans': ['"Proxima Nova"', 'Arial', 'sans-serif']
}
```

**Default:** Sans-serif (Proxima Nova) for all dashboard content

### Heading Hierarchy

| Element | Tailwind Classes | Size | Weight | Use Case |
|---------|------------------|------|--------|----------|
| **H1** | `text-3xl font-bold text-gray-900` | 30px | Bold (700) | Page title |
| **H2** | `text-2xl font-bold text-gray-900` | 24px | Bold (700) | Major section headers |
| **H3** | `text-xl font-bold text-gray-900` | 20px | Bold (700) | Subsection headers |
| **H4** | `text-lg font-semibold` | 18px | Semibold (600) | Card headers |
| **Subtitle** | `text-lg text-gray-600 mt-2` | 18px | Regular (400) | Page subtitle |
| **Caption** | `text-sm text-gray-600` | 14px | Regular (400) | Card subtitles |

**Code Examples:**

```jsx
{/* Page Header */}
<h1 className="text-3xl font-bold text-gray-900">
  FY25 Exit Analysis Report
</h1>
<p className="text-gray-600 text-lg mt-2">
  Comprehensive Turnover & Exit Survey Analysis • July 2024 - June 2025
</p>

{/* Section Header with Icon */}
<h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
  <Activity style={{color: '#0054A6'}} size={24} />
  Executive Summary
</h2>

{/* Card Header */}
<h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
  <TrendingDown style={{color: '#0054A6'}} size={20} />
  Quarterly Termination Trends
</h2>

{/* Subsection Header */}
<h3 className="text-lg font-semibold mb-4" style={{color: '#0054A6'}}>
  Key Metrics
</h3>
```

### Body Text & Labels

| Element | Tailwind Classes | Size | Use Case |
|---------|------------------|------|----------|
| **Body Text** | `text-sm text-gray-700` | 14px | Standard content, list items |
| **Small Text** | `text-xs text-gray-600` | 12px | Supporting details, legends |
| **Tiny Text** | `text-xs text-gray-500` | 12px | Metadata, fine print |
| **Bold Emphasis** | `font-semibold` or `font-bold` | — | Key numbers, emphasis |

**Data Display Typography:**

```jsx
{/* Large Metric Display */}
<div className="text-4xl font-bold" style={{color: '#0054A6'}}>
  222
</div>
<div className="text-sm text-gray-600">Total FY25 Terminations</div>

{/* Card Metric */}
<div className="text-3xl font-bold text-gray-900">31.1%</div>
<div className="text-sm text-gray-600">Survey Response Rate</div>
<div className="text-xs text-gray-500 mt-1">69 total responses</div>

{/* Table Text */}
<div className="text-lg font-bold text-gray-900">78</div>
<div className="text-xs text-red-600">+42 vs prev</div>
```

### Font Weight Scale

- **Regular (400)**: Default body text
- **Medium (500)**: Emphasized text, table headers
- **Semibold (600)**: Subsection headers, important labels
- **Bold (700)**: Main headings, primary metrics

---

## Spacing & Layout

### Container System

```jsx
{/* Page Container */}
<div className="min-h-screen bg-gray-50 py-8">
  <div className="max-w-7xl mx-auto px-6">
    {/* Content */}
  </div>
</div>
```

**Guidelines:**
- **Max Width:** `max-w-7xl` (1280px) for all dashboard pages
- **Horizontal Padding:** `px-6` (24px)
- **Vertical Padding:** `py-8` (32px)

### Spacing Scale

| Tailwind Class | Pixels | Usage |
|----------------|--------|-------|
| `gap-2` / `mb-2` | 8px | Tight spacing (inline icons, badges) |
| `gap-3` / `mb-3` | 12px | Icon-text spacing, small gaps |
| `gap-4` / `mb-4` | 16px | Standard card spacing, list items |
| `gap-6` / `mb-6` | 24px | Section spacing, card padding |
| `gap-8` / `mb-8` | 32px | Major section spacing |
| `p-6` | 24px | Standard card padding |
| `p-8` | 32px | Large card/section padding |

**Common Patterns:**

```jsx
{/* Section Spacing */}
<div className="mb-8">...</div>  // Between major sections

{/* Card Padding */}
<div className="bg-white rounded-lg shadow-sm border p-8">...</div>

{/* Grid Gaps */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">...</div>
```

### Grid Systems

**Metric Cards (5-column):**
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
  {/* 5 metric cards */}
</div>
```

**Two-Column Layout:**
```jsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  {/* 2 equal-width sections */}
</div>
```

**Three-Column Layout:**
```jsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  <div className="lg:col-span-2">
    {/* Main content: 2/3 width */}
  </div>
  <div>
    {/* Sidebar: 1/3 width */}
  </div>
</div>
```

**Responsive Breakpoints:**
- **Mobile:** `grid-cols-1` (default, <768px)
- **Tablet:** `md:grid-cols-2` (≥768px)
- **Desktop:** `lg:grid-cols-3`, `lg:grid-cols-5` (≥1024px)

### Borders & Shadows

```jsx
{/* Standard Card */}
className="rounded-lg shadow-sm border"

{/* Rounded Corners */}
className="rounded-lg"      // 8px radius (standard)
className="rounded"         // 4px radius (small elements)
className="rounded-full"    // Fully rounded (badges, progress bars)

{/* Shadows */}
className="shadow-sm"       // Subtle card shadow (default)
```

---

## Component Patterns

### 1. Header Cards

**Primary Page Header:**

```jsx
<div className="mb-8">
  <div className="bg-white rounded-lg shadow-sm border p-8">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <FileText style={{color: '#0054A6'}} size={32} />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            FY25 Exit Analysis Report
          </h1>
          <p className="text-gray-600 text-lg mt-2">
            Comprehensive Turnover & Exit Survey Analysis • July 2024 - June 2025
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Combining HR turnover data with employee exit survey feedback
          </p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-4xl font-bold" style={{color: '#0054A6'}}>
          222
        </div>
        <div className="text-sm text-gray-600">Total FY25 Terminations</div>
      </div>
    </div>
  </div>
</div>
```

**Pattern Elements:**
- White background card with border and shadow
- Flex layout: icon + text on left, metric on right
- Icon color: Creighton blue (#0054A6)
- Large metric display (text-4xl, Creighton blue)

---

### 2. Executive Summary Card

```jsx
<div className="bg-gradient-to-r from-blue-50 to-white rounded-lg shadow-sm border p-8">
  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
    <Activity style={{color: '#0054A6'}} size={24} />
    Executive Summary
  </h2>

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div>
      <h3 className="text-lg font-semibold mb-4" style={{color: '#0054A6'}}>
        Key Metrics
      </h3>
      <ul className="space-y-3 text-sm">
        <li className="flex items-start gap-2">
          <CheckCircle size={16} className="text-green-600 mt-0.5" />
          <span><strong>222 unique terminations</strong> in FY25</span>
        </li>
        {/* More list items */}
      </ul>
    </div>
    {/* Second column */}
  </div>
</div>
```

**Pattern Elements:**
- Gradient background: `from-blue-50 to-white`
- Two-column grid on large screens
- Icon bullets (CheckCircle, XCircle, AlertCircle)
- Bold inline text for key numbers

---

### 3. Metric Cards (Summary Stats)

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <Users style={{color: '#0054A6'}} size={20} className="mb-3" />
    <div className="text-3xl font-bold text-gray-900">222</div>
    <div className="text-sm text-gray-600">Total Terminations</div>
    <div className="text-xs text-gray-500 mt-1">
      16.2% Faculty | 83.8% Staff
    </div>
  </div>
  {/* Additional metric cards */}
</div>
```

**Pattern Elements:**
- White background, padding-6
- Icon at top (20px, colored by metric type)
- Large metric (text-3xl, bold)
- Label text (text-sm, gray-600)
- Optional supporting detail (text-xs, gray-500)

**Icon Colors by Metric Type:**
- Primary metric: `#0054A6` (Creighton blue)
- Survey/Response: `#1F74DB` (Light blue)
- Satisfaction: `#71CC98` (Green)
- Time/Tenure: `#FFC72C` (Yellow)
- Critical/Alert: `#EF4444` (Red)

---

### 4. Data Tables

```jsx
<div className="overflow-x-auto">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Quarter
        </th>
        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
          Total Exits
        </th>
        {/* More headers */}
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          Q1 FY25
        </td>
        <td className="px-4 py-4 whitespace-nowrap text-center">
          <div className="text-lg font-bold text-gray-900">78</div>
          <div className="text-xs text-red-600">+42 vs prev</div>
        </td>
        {/* More cells */}
      </tr>
    </tbody>
  </table>
</div>
```

**Pattern Elements:**
- Wrapper: `overflow-x-auto` for responsive scrolling
- Table: `min-w-full` with dividers
- Header: `bg-gray-50`, uppercase text-xs
- Rows: Alternating white/gray-50 backgrounds
- Cell padding: `px-4 py-4`
- Text alignment: `text-left` (labels), `text-center` (data)

**Table Cell Content Patterns:**

```jsx
{/* Primary Value */}
<div className="text-lg font-bold text-gray-900">78</div>

{/* Change Indicator */}
<div className={`text-xs ${exitChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
  {exitChange > 0 ? '+' : ''}{exitChange} vs prev
</div>

{/* Faculty/Staff Counts */}
<div className="text-sm text-center text-blue-600 font-semibold">5</div>
<div className="text-sm text-center text-purple-600 font-semibold">73</div>
```

---

### 5. Progress Bars

**Inline Progress Bar (Response Rates):**

```jsx
<div className="w-full bg-gray-200 rounded-full h-2 mt-1">
  <div
    className="bg-green-500 h-2 rounded-full"
    style={{width: `${Math.min(responseRate, 100)}%`}}
  />
</div>
```

**Large Progress Bar (Quarterly Trends):**

```jsx
<div className="w-full bg-blue-200 rounded-full h-3">
  <div
    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
    style={{width: `${Math.min(quarter.responseRate, 100)}%`}}
  />
</div>
```

**Pattern Elements:**
- Container: Gray background, rounded-full, fixed height
- Bar: Colored fill, rounded-full, width based on percentage
- Heights: `h-2` (small), `h-3` (medium), `h-8` (large with label)

**Color Coding:**
- Response rates: Green (`bg-green-500`)
- Satisfaction: Green (`bg-green-600`)
- Faculty/Staff: Blue/Purple (`bg-blue-600`, `bg-purple-600`)

---

### 6. Horizontal Bar Charts (In-Table)

```jsx
<div className="relative">
  <div className="w-full bg-gray-200 rounded-full h-8">
    <div
      className="h-8 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-500"
      style={{
        width: `${widthPercent}%`,
        backgroundColor: '#7C3AED',
        minWidth: '120px'
      }}
    >
      186 employees
    </div>
  </div>
</div>
```

**Pattern Elements:**
- Height: `h-8` for labeled bars
- Text embedded inside bar (white, semibold)
- Min-width ensures label visibility
- Transition animation: `duration-500`

---

### 7. List Items with Icons

```jsx
<ul className="space-y-3 text-sm">
  <li className="flex items-start gap-2">
    <CheckCircle size={16} className="text-green-600 mt-0.5" />
    <span><strong>222 unique terminations</strong> in FY25</span>
  </li>
  <li className="flex items-start gap-2">
    <XCircle size={16} className="text-red-600 mt-0.5" />
    <span><strong>Career development concerns:</strong> Lowest satisfaction</span>
  </li>
  <li className="flex items-start gap-2">
    <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
    <span><strong>Top reasons:</strong> Resigned (50%), Retirement (12%)</span>
  </li>
</ul>
```

**Icon Semantic Colors:**
- Success/Positive: `text-green-600` (CheckCircle)
- Error/Negative: `text-red-600` (XCircle)
- Warning/Attention: `text-yellow-600` (AlertCircle)
- Info/Neutral: `text-blue-600` (Activity)

---

### 8. Badge/Status Indicators

```jsx
<span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
  percentage >= 25
    ? 'bg-red-100 text-red-800'
    : percentage >= 15
    ? 'bg-yellow-100 text-yellow-800'
    : percentage >= 10
    ? 'bg-blue-100 text-blue-800'
    : 'bg-green-100 text-green-800'
}`}>
  {percentage >= 25 ? 'Critical' : percentage >= 15 ? 'High' : 'Moderate'}
</span>
```

**Badge Color Scheme:**

| Risk Level | Background | Text Color | Use Case |
|------------|------------|------------|----------|
| Critical | `bg-red-100` | `text-red-800` | ≥25% (High risk) |
| High | `bg-yellow-100` | `text-yellow-800` | 15-24% (Moderate risk) |
| Moderate | `bg-blue-100` | `text-blue-800` | 10-14% (Low-medium risk) |
| Low | `bg-green-100` | `text-green-800` | <10% (Minimal risk) |

---

### 9. Info/Alert Boxes

**Warning Box:**
```jsx
<div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
  <div className="flex items-start gap-3">
    <AlertCircle className="text-yellow-600 mt-1" size={20} />
    <div>
      <h3 className="font-semibold text-yellow-900 mb-2">
        Data Quality & Methodology Notes
      </h3>
      <ul className="text-sm text-yellow-800 space-y-1">
        <li>• Turnover data extracted from HR system</li>
        {/* More list items */}
      </ul>
    </div>
  </div>
</div>
```

**Info Box:**
```jsx
<div className="text-xs text-gray-600 text-center bg-blue-50 p-2 rounded">
  <span className="font-semibold">Note:</span> Staff terminations significantly exceed faculty (5.8x ratio).
</div>
```

**Color Schemes:**
- **Warning:** `bg-yellow-50`, `border-yellow-200`, `text-yellow-800`
- **Info:** `bg-blue-50`, `border-blue-200`, `text-blue-800`
- **Success:** `bg-green-50`, `border-green-200`, `text-green-800`
- **Error:** `bg-red-50`, `border-red-200`, `text-red-800`

---

### 10. Legend Items

```jsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs bg-gray-50 p-3 rounded">
  <div className="flex items-center gap-2">
    <div className="w-3 h-3 bg-blue-600 rounded"></div>
    <span>Faculty Terminations</span>
  </div>
  <div className="flex items-center gap-2">
    <div className="w-3 h-3 bg-purple-600 rounded"></div>
    <span>Staff Terminations</span>
  </div>
  <div className="flex items-center gap-2">
    <div className="w-3 h-3 bg-green-600 rounded"></div>
    <span>Survey Responses</span>
  </div>
</div>
```

**Pattern Elements:**
- Container: `bg-gray-50`, `p-3`, `rounded`
- Color swatch: `w-3 h-3`, `rounded` (4px)
- Text: `text-xs`, default gray

---

## Chart Visualizations

### Chart Container Pattern

```jsx
<div className="bg-white rounded-lg border p-6">
  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
    <BarChart3 style={{color: '#0054A6'}} size={20} />
    Chart Title
  </h2>

  {/* Chart or data display */}

  {/* Legend (if applicable) */}
  <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
    {/* Legend items */}
  </div>
</div>
```

---

### Bar Chart (Years of Service)

**Vertical Bar Chart Pattern:**

```jsx
<div className="grid grid-cols-7 gap-4">
  {yearsOfServiceData.map((item, index) => (
    <div key={index} className="text-center">
      <div className="h-24 flex flex-col justify-end mb-2">
        <div
          className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t"
          style={{ height: `${(item.count / maxValue) * 100}%` }}
        />
      </div>
      <div className="text-2xl font-bold text-gray-900">{item.count}</div>
      <div className="text-xs text-gray-600">{item.range} years</div>
      <div className="text-xs text-gray-500">{item.percentage}%</div>
    </div>
  ))}
</div>
```

**Pattern Elements:**
- Fixed container height: `h-24`
- Gradient fill: `bg-gradient-to-t from-blue-600 to-blue-400`
- Rounded top: `rounded-t`
- Label below bar: count (text-2xl bold), category (text-xs), percentage (text-xs gray)

---

### Horizontal Progress Comparison (Quarterly Progress)

```jsx
<div className="space-y-4">
  {quarterlyData.map((quarter, index) => (
    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
      <div className="flex-shrink-0 w-16">
        <div className="text-sm font-medium text-gray-900">Q1</div>
      </div>
      <div className="flex-1 mx-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-semibold text-blue-700">25.6%</span>
          <span className="text-xs text-green-600">+5.1pp</span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{width: `${quarter.responseRate}%`}}
          />
        </div>
        <div className="text-xs text-gray-600 mt-1">
          20 of 78 exits
        </div>
      </div>
      <div className="flex-shrink-0 text-right">
        <div className="text-lg text-green-500">↗</div>
      </div>
    </div>
  ))}
</div>
```

**Pattern Elements:**
- Container: `bg-blue-50` (or `bg-green-50` for satisfaction)
- Three-column flex: label, progress bar, trend icon
- Progress bar: `h-3`, blue colors
- Trend arrows: ↗ (green), ↘ (red), → (gray)

---

### Summary Statistics Grid

```jsx
<div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
  <div className="text-center">
    <div className="text-2xl font-bold text-blue-600">31.1%</div>
    <div className="text-xs text-gray-600">Overall Response Rate</div>
  </div>
  <div className="text-center">
    <div className="text-2xl font-bold text-green-600">65.3%</div>
    <div className="text-xs text-gray-600">Avg Satisfaction</div>
  </div>
  {/* More stats */}
</div>
```

**Pattern Elements:**
- Container: `bg-gray-50`, `p-4`, `rounded-lg`
- Metric: `text-2xl font-bold` with semantic color
- Label: `text-xs text-gray-600`

---

### Chart Color Palette Reference

**Primary Data Colors:**
```javascript
const chartColors = {
  faculty: '#0054A6',      // Creighton blue
  staff: '#7C3AED',        // Purple
  responses: '#10B981',    // Green
  satisfaction: '#71CC98', // Creighton green
  warning: '#F59E0B',      // Orange
  critical: '#EF4444',     // Red
  neutral: '#6B7280'       // Gray
};
```

**Gradient Patterns:**
- Bar charts: `from-blue-600 to-blue-400` (vertical gradient)
- Background cards: `from-blue-50 to-white` (horizontal gradient)

---

## Interactive Elements

### Trend Indicators

**Arrow Icons:**
```jsx
<div className={`text-lg ${change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-gray-400'}`}>
  {change > 0 ? '↗' : change < 0 ? '↘' : '→'}
</div>
```

**Percentage Point Change:**
```jsx
<span className={`text-xs ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
  {change > 0 ? '+' : ''}{change.toFixed(1)}pp
</span>
```

---

### Hover States

**Table Rows:**
```jsx
// Note: Add hover:bg-gray-100 for interactive tables
className="hover:bg-gray-100 transition-colors"
```

**Buttons/Interactive Elements:**
```jsx
className="hover:bg-blue-50 transition-colors duration-200"
```

---

### Transitions

**Smooth Animations:**
```jsx
{/* Progress bar grow */}
className="transition-all duration-300"

{/* Horizontal bar chart */}
className="transition-all duration-500"

{/* Color change */}
className="transition-colors duration-200"
```

---

## Accessibility Compliance

### WCAG 2.1 AA Standards

**Color Contrast Requirements:**
- **Text (14px+):** 4.5:1 minimum contrast ratio
- **Large text (18px+ or 14px+ bold):** 3:0:1 minimum
- **UI components:** 3:1 minimum

**Compliant Color Combinations:**

| Text Color | Background | Contrast Ratio | Compliant? |
|------------|------------|----------------|------------|
| `gray-900` | `white` | 16.6:1 | ✅ AAA |
| `gray-700` | `white` | 8.6:1 | ✅ AAA |
| `gray-600` | `white` | 5.7:1 | ✅ AA |
| `#0054A6` | `white` | 7.2:1 | ✅ AAA |
| `white` | `#0054A6` | 7.2:1 | ✅ AAA |
| `blue-600` | `white` | 4.6:1 | ✅ AA |
| `green-600` | `white` | 4.1:1 | ✅ AA |

### Semantic HTML

**Use proper heading hierarchy:**
```jsx
<h1>Page Title</h1>
  <h2>Major Section</h2>
    <h3>Subsection</h3>
      <h4>Card Header</h4>
```

**Icon Accessibility:**
```jsx
{/* Decorative icons (already paired with text) */}
<FileText style={{color: '#0054A6'}} size={32} aria-hidden="true" />

{/* Standalone icons require labels */}
<CheckCircle size={16} className="text-green-600" aria-label="Completed" />
```

**Table Accessibility:**
```jsx
<table role="table" aria-label="Quarterly Termination Data">
  <thead>
    <tr>
      <th scope="col">Quarter</th>
      <th scope="col">Total Exits</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Q1 FY25</td>
      <td>78</td>
    </tr>
  </tbody>
</table>
```

---

## Print Styles

### Print-Specific CSS

The dashboard includes extensive print optimization in a `<style jsx>` block:

**Key Print Rules:**

```css
@media print {
  /* Hide interactive elements */
  .no-print {
    display: none !important;
  }

  /* Table page breaks */
  table { break-inside: auto; }
  tr { break-inside: avoid; break-after: auto; }
  thead { display: table-header-group; }

  /* Optimize spacing */
  .space-y-4 > * + * { margin-top: 1rem !important; }
  .gap-8 { gap: 2rem !important; }

  /* Ensure color visibility */
  .text-blue-600, .text-blue-700 { color: #000 !important; }
  .bg-blue-600, .bg-green-600 { background-color: #333 !important; }

  /* Preserve progress bars */
  .bg-blue-200, .bg-green-200 {
    background-color: #e5e5e5 !important;
    border: 1px solid #ccc !important;
  }

  /* Optimize font sizes */
  .text-xs { font-size: 10px !important; }
  .text-sm { font-size: 12px !important; }

  /* Page breaks */
  h2 { page-break-after: avoid; }
}
```

**Print-Friendly Design Principles:**
1. Use tables instead of complex charts
2. Embed data labels directly in visualizations
3. Ensure high contrast for grayscale printing
4. Avoid page breaks within data tables
5. Optimize font sizes for 8.5x11" paper

---

## Implementation Guidelines

### Creating New Quarterly Modules

When building Q1, Q2, Q3, or Q4 exit survey pages:

1. **Copy the base structure** from ExitSurveyFY25Dashboard.jsx
2. **Maintain consistent spacing**: Use the same `mb-8` between sections
3. **Use the same grid layouts**: 5-column metric cards, 2-column analysis sections
4. **Follow the icon color scheme**: Creighton blue for primary, semantic colors for metrics
5. **Preserve table patterns**: Same header styles, alternating row colors
6. **Keep progress bars consistent**: Same heights, colors, and transitions
7. **Maintain typography hierarchy**: H1 for page title, H2 for sections, H3 for subsections
8. **Use the same badge color coding**: Red (critical), yellow (high), blue (moderate), green (low)

### Code Reusability

**Extract Common Components:**

Consider creating reusable components for:
- Metric cards (`<MetricCard icon={} value={} label={} detail={} color={} />`)
- Progress bars (`<ProgressBar percentage={} color={} height={} />`)
- Badges (`<RiskBadge percentage={} />`)
- Section headers (`<SectionHeader icon={} title={} />`)
- Alert boxes (`<AlertBox type="warning" title={} items={} />`)

**Shared Constants:**

```javascript
// colors.js
export const CHART_COLORS = {
  faculty: '#0054A6',
  staff: '#7C3AED',
  satisfaction: '#71CC98',
  // ...
};

export const RISK_THRESHOLDS = {
  critical: 25,
  high: 15,
  moderate: 10,
  low: 5
};
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Nov 17, 2025 | Initial design system documentation based on FY25 dashboard |

---

## Related Documentation

- `tailwind.config.js` - Creighton brand color definitions
- `src/index.css` - Global CSS imports
- `src/styles/print.css` - Print-specific styles
- `src/styles/accessibility.css` - Accessibility utilities
- `CLAUDE.md` - Project context and business rules
- `WORKFLOW_GUIDE.md` - Development standards

---

## Questions & Support

For design system questions or clarification:
- Review this document first for existing patterns
- Check ExitSurveyFY25Dashboard.jsx for implementation examples
- Consult CLAUDE.md for business rules and brand guidelines
- Ensure all new designs maintain WCAG 2.1 AA compliance

**Principle:** Consistency across quarterly modules is critical for user experience and maintainability.
