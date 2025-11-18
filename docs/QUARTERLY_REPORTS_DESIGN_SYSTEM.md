# Quarterly Reports Design System

**Version:** 1.0
**Last Updated:** November 17, 2025
**Applies To:** All quarterly report dashboards (Exit Survey, Turnover, Recruiting, etc.)

---

## Purpose

This design system ensures visual consistency across all quarterly HR report dashboards (Q1, Q2, Q3, Q4) regardless of report type. All quarterly dashboards should follow these patterns for a cohesive user experience.

---

## Core Design Principles

1. **Consistency**: All quarterly reports use identical layout patterns, spacing, and typography
2. **Clarity**: Data should be easily scannable with clear visual hierarchy
3. **Accessibility**: WCAG 2.1 AA compliance required for all elements
4. **Printability**: All dashboards must be optimized for print/PDF export
5. **Responsiveness**: Mobile-first design with tablet and desktop breakpoints

---

## Page Structure

### Standard Page Layout

All quarterly dashboards follow this structure:

```jsx
<div className="min-h-screen bg-gray-50 py-8">
  <div className="max-w-7xl mx-auto px-6">

    {/* 1. Page Header Card */}
    <div className="mb-8">
      {/* Header content */}
    </div>

    {/* 2. Metric Cards (3-5 cards) */}
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
      {/* Metric cards */}
    </div>

    {/* 3. Executive Summary (optional) */}
    <div className="mb-8">
      {/* Summary content */}
    </div>

    {/* 4. Data Visualizations & Charts */}
    {/* Additional sections with mb-8 spacing */}

  </div>
</div>
```

**Key Layout Rules:**
- Max width: `max-w-7xl` (1280px)
- Page background: `bg-gray-50`
- Padding: `px-6` horizontal, `py-8` vertical
- Section spacing: `mb-8` between major sections

---

## Component Patterns

### 1. Page Header Card

**Standard Pattern:**

```jsx
<div className="mb-8">
  <div className="bg-white rounded-lg shadow-sm border p-8">
    <div className="flex items-center justify-between">
      {/* Left side: Icon + Title */}
      <div className="flex items-center gap-4">
        <IconComponent style={{color: '#0054A6'}} size={32} />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Q1 FY26 [Report Type] Report
          </h1>
          <p className="text-gray-600 text-lg mt-2">
            [Report Description] • July 2025 - September 2025
          </p>
          <p className="text-gray-500 text-sm mt-1">
            [Additional context or subtitle]
          </p>
        </div>
      </div>

      {/* Right side: Large Metric */}
      <div className="text-right">
        <div className="text-5xl font-bold" style={{color: '#0054A6'}}>
          {primaryMetric}
        </div>
        <div className="text-sm text-gray-600 font-medium">
          {metricLabel}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {breakdown}
        </div>
      </div>
    </div>
  </div>
</div>
```

**Header Elements:**
- Icon: 32px, Creighton blue (#0054A6)
- H1: `text-3xl font-bold text-gray-900`
- Subtitle: `text-lg text-gray-600 mt-2`
- Secondary text: `text-sm text-gray-500 mt-1`
- Primary metric: `text-5xl font-bold` in Creighton blue
- Metric label: `text-sm text-gray-600 font-medium`

---

### 2. Metric Cards

**3-Column Layout (Standard):**

```jsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
  {/* Card 1 - Primary metric with border */}
  <div className="bg-white rounded-lg shadow-sm border-2 border-blue-500 p-6">
    <div className="mb-4">
      <div className="text-sm text-gray-600 font-medium uppercase tracking-wide mb-2">
        {cardTitle}
      </div>
      <div className="text-6xl font-bold text-gray-900 mb-2">
        {value}
      </div>
      <div className="text-sm text-gray-600 font-medium">
        {breakdown}
      </div>
    </div>
  </div>

  {/* Cards 2-3 - Secondary metrics */}
  <div className="bg-white rounded-lg shadow-sm border p-6">
    {/* Same structure as Card 1, without blue border */}
  </div>
</div>
```

**5-Column Layout (Detailed Metrics):**

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <div className="flex items-center justify-between mb-4">
      <IconComponent style={{color: iconColor}} size={24} />
      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
        {badge}
      </span>
    </div>
    <div className="text-4xl font-bold text-gray-900 mb-1">{value}</div>
    <div className="text-sm text-gray-600 font-medium">{label}</div>
    <div className="text-xs text-gray-500 mt-2">{detail}</div>
  </div>
</div>
```

**Card Styling Rules:**
- Primary card: `border-2 border-blue-500` (highlighted)
- Secondary cards: Standard `border`
- Padding: `p-6`
- Title: `text-sm uppercase tracking-wide text-gray-600`
- Value: `text-6xl font-bold text-gray-900` (3-col) or `text-4xl` (5-col)
- Breakdown: `text-sm text-gray-600 font-medium`

---

### 3. Executive Summary Card

```jsx
<div className="mb-8">
  <div className="bg-gradient-to-r from-blue-50 to-white rounded-lg shadow-sm border p-8">
    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
      <Activity style={{color: '#0054A6'}} size={24} />
      Executive Summary
    </h2>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left column: Key Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{color: '#0054A6'}}>
          Key Metrics
        </h3>
        <ul className="space-y-3 text-sm">
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-green-600 mt-2"></div>
            <span><strong>{value}</strong> {description}</span>
          </li>
        </ul>
      </div>

      {/* Right column: Additional insights */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{color: '#0054A6'}}>
          {rightColumnTitle}
        </h3>
        {/* Similar list structure */}
      </div>
    </div>

    {/* Data Note */}
    <div className="mt-6 text-xs text-gray-600 text-center bg-blue-50 p-3 rounded border border-blue-200">
      <span className="font-semibold">Note:</span> {dataNote}
    </div>
  </div>
</div>
```

**Summary Elements:**
- Background gradient: `from-blue-50 to-white`
- Two-column grid: `lg:grid-cols-2 gap-8`
- Bullet points: `w-2 h-2 rounded-full` with semantic colors
- Bold inline text for key numbers
- Data note box at bottom with blue background

---

### 4. Section Headers

**With Icon:**

```jsx
<h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
  <IconComponent style={{color: '#0054A6'}} size={20} />
  Section Title
</h2>
```

**Subsection Headers:**

```jsx
<h3 className="text-lg font-semibold mb-4" style={{color: '#0054A6'}}>
  Subsection Title
</h3>
```

---

## Color Palette

### Primary Brand Colors

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

### Usage Guidelines

- **Creighton Blue (#0054A6)**: Primary icons, headings, main metrics
- **Light Blue (#1F74DB)**: Secondary data, interactive elements
- **Green (#71CC98)**: Positive indicators, success states
- **Yellow (#FFC72C)**: Warnings, neutral metrics
- **Red (#EF4444)**: Critical issues, negative trends
- **Purple (#7C3AED)**: Staff data (when contrasting with faculty)

### Semantic Colors

| Usage | Color | Tailwind Class |
|-------|-------|----------------|
| Success | Green (#10B981) | `text-green-600`, `bg-green-100` |
| Warning | Yellow (#F59E0B) | `text-yellow-600`, `bg-yellow-100` |
| Error | Red (#EF4444) | `text-red-600`, `bg-red-100` |
| Info | Blue (#3B82F6) | `text-blue-600`, `bg-blue-100` |

---

## Typography

### Heading Hierarchy

| Level | Classes | Size | Weight | Usage |
|-------|---------|------|--------|-------|
| H1 | `text-3xl font-bold text-gray-900` | 30px | Bold | Page title |
| H2 | `text-2xl font-bold text-gray-900` | 24px | Bold | Major sections |
| H3 | `text-xl font-bold text-gray-900` | 20px | Bold | Subsections |
| H4 | `text-lg font-semibold` | 18px | Semibold | Card headers |

### Body Text

| Element | Classes | Size | Usage |
|---------|---------|------|-------|
| Body | `text-sm text-gray-700` | 14px | Standard content |
| Small | `text-xs text-gray-600` | 12px | Supporting details |
| Tiny | `text-xs text-gray-500` | 12px | Metadata |

### Data Display

| Element | Classes | Usage |
|---------|---------|-------|
| Large Metric | `text-6xl font-bold text-gray-900` | 3-column card primary value |
| Medium Metric | `text-4xl font-bold text-gray-900` | 5-column card value |
| Header Metric | `text-5xl font-bold` (Creighton blue) | Page header primary value |

---

## Spacing & Layout

### Grid Systems

**3-Column (Standard Metrics):**
```jsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
```

**5-Column (Detailed Metrics):**
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
```

**2-Column (Analysis Sections):**
```jsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
```

### Spacing Scale

| Class | Pixels | Usage |
|-------|--------|-------|
| `gap-6` | 24px | Grid gaps between cards |
| `mb-8` | 32px | Sections spacing |
| `p-6` | 24px | Card padding |
| `p-8` | 32px | Large card/header padding |
| `gap-2` | 8px | Icon-text spacing |
| `gap-4` | 16px | Standard element spacing |

---

## Campus Breakdowns

For multi-campus data, use this pattern:

```jsx
<div className="text-sm text-gray-600 font-medium">
  OMA: {omaCount} | PHX: {phxCount}
</div>
```

**Standard abbreviations:**
- OMA = Omaha campus
- PHX = Phoenix campus

**Alternative vertical layout:**
```jsx
<div className="text-xs text-gray-500 mt-1">
  Omaha: {omaCount} ({omaPercent}%)
</div>
<div className="text-xs text-gray-500">
  Phoenix: {phxCount} ({phxPercent}%)
</div>
```

---

## Icon Usage

### Standard Icons by Report Type

- **Turnover Reports**: `TrendingDown` (Creighton blue)
- **Exit Survey**: `FileText` (Creighton blue)
- **Recruiting**: `UserPlus` (Creighton blue)
- **Workforce**: `Users` (Creighton blue)

### Icon Sizes

- Page header: `size={32}`
- Section header: `size={24}`
- Subsection/card header: `size={20}`
- Metric cards: `size={24}`

### Icon Colors

Always use inline styles for Creighton blue:
```jsx
<IconComponent style={{color: '#0054A6'}} size={32} />
```

---

## Responsive Breakpoints

- **Mobile**: < 768px → `grid-cols-1`
- **Tablet**: ≥ 768px → `md:grid-cols-2` or `md:grid-cols-3`
- **Desktop**: ≥ 1024px → `lg:grid-cols-3` or `lg:grid-cols-5`

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance

- **Color contrast**: Minimum 4.5:1 for text, 3:1 for UI components
- **Heading hierarchy**: Proper H1→H2→H3→H4 structure
- **Semantic HTML**: Use appropriate HTML elements
- **Icon labels**: Add `aria-label` for standalone icons

### Compliant Color Combinations

| Text | Background | Ratio | Status |
|------|------------|-------|--------|
| gray-900 | white | 16.6:1 | ✅ AAA |
| gray-700 | white | 8.6:1 | ✅ AAA |
| #0054A6 | white | 7.2:1 | ✅ AAA |
| blue-600 | white | 4.6:1 | ✅ AA |

---

## Data Notes & Disclaimers

Always include a data note box at the bottom of summary sections:

```jsx
<div className="text-xs text-gray-600 mt-6 bg-blue-50 p-3 rounded border border-blue-200">
  <span className="font-semibold">Note:</span> {dataMethodologyNote}
</div>
```

**Color coding:**
- Info/Methodology: `bg-blue-50 border-blue-200`
- Warning: `bg-yellow-50 border-yellow-200`
- Success: `bg-green-50 border-green-200`
- Alert: `bg-red-50 border-red-200`

---

## Quarter Labeling Standards

### Date Ranges

- **Q1**: July - September
- **Q2**: October - December
- **Q3**: January - March
- **Q4**: April - June

### Fiscal Year Notation

- Format: `Q[1-4] FY[YY]`
- Examples: `Q1 FY26`, `Q2 FY25`
- Full format: `Q1 FY26 (July 2025 - September 2025)`

---

## Implementation Checklist

When creating a new quarterly dashboard:

- [ ] Use standard page structure (header → metrics → summary → visualizations)
- [ ] Follow 3-column or 5-column metric card layout
- [ ] Primary metric card has blue border (`border-2 border-blue-500`)
- [ ] All icons are Creighton blue (#0054A6) at correct sizes
- [ ] Proper heading hierarchy (H1 → H2 → H3)
- [ ] Consistent spacing (`mb-8` between sections, `gap-6` in grids)
- [ ] Campus breakdowns use OMA/PHX abbreviations
- [ ] Executive summary has gradient background (`from-blue-50 to-white`)
- [ ] Data notes included with appropriate color coding
- [ ] WCAG 2.1 AA color contrast compliance
- [ ] Responsive breakpoints implemented (mobile, tablet, desktop)

---

## Example Templates

### Minimal Quarterly Dashboard

```jsx
import React from 'react';
import { TrendingDown } from 'lucide-react';

const QuarterlyReportDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">

        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <TrendingDown style={{color: '#0054A6'}} size={32} />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Q1 FY26 Report Title
                  </h1>
                  <p className="text-gray-600 text-lg mt-2">
                    Report Description • July 2025 - September 2025
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Additional context
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold" style={{color: '#0054A6'}}>
                  100
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Primary Metric
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Breakdown info
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Cards here */}
        </div>

        {/* Additional sections */}

      </div>
    </div>
  );
};

export default QuarterlyReportDashboard;
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Nov 17, 2025 | Initial universal quarterly design system |

---

## Related Documentation

- `EXIT_SURVEY_DESIGN_SYSTEM.md` - Exit survey-specific patterns
- `tailwind.config.js` - Creighton brand colors
- `CLAUDE.md` - Project context and business rules
- `WORKFLOW_GUIDE.md` - Development standards

---

**Principle:** All quarterly dashboards should be visually indistinguishable in their layout patterns, typography, and spacing—only differing in content and data-specific visualizations.
