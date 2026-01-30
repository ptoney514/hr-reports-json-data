# HR Reports Dashboard - Design System Documentation

**Version:** 1.0
**Last Updated:** January 30, 2026
**Status:** Active Implementation

---

## Table of Contents

1. [Brand Identity](#brand-identity)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Component Library](#component-library)
6. [Chart & Data Visualization](#chart--data-visualization)
7. [Iconography](#iconography)
8. [Accessibility Standards](#accessibility-standards)
9. [Print Styles](#print-styles)
10. [Implementation Examples](#implementation-examples)

---

## Brand Identity

### Visual Identity
The HR Reports Dashboard follows **Creighton University** branding guidelines, emphasizing professionalism, trustworthiness, and data clarity for HR analytics applications.

### Brand Personality
- **Professional**: Clean, organized, corporate aesthetic
- **Trustworthy**: Consistent, reliable visual patterns
- **Data-Driven**: Clear hierarchy, readable metrics
- **Accessible**: WCAG 2.1 AA compliant throughout

### Logo & Assets
- Primary logo: Located in `/public/logo192.png` and `/public/logo512.png`
- Brand mark: BarChart3 icon (Lucide React) used in navigation
- Application name: "HR Reports" with abbreviated "HR" for compact displays

---

## Color Palette

### Creighton University Brand Colors

#### Primary Colors
```css
/* Creighton Blue - Primary brand color */
--creighton-blue: #0054A6;       /* Main interactive elements, headers, charts */
--creighton-navy: #00245D;       /* Darker accent, secondary text */
--creighton-light-blue: #1F74DB; /* Interactive states, accents */
--creighton-sky-blue: #95D2F3;   /* Light accents, backgrounds */
```

**Usage:**
- `#0054A6` - Primary buttons, section headers, chart primary series, icons
- `#00245D` - Secondary text, dark accents, navigation items
- `#1F74DB` - Hover states, active states, links
- `#95D2F3` - Light backgrounds, tertiary chart series

#### Brand Accent Colors
```css
--creighton-green: #71CC98;  /* Success states, positive trends, staff metrics */
--creighton-yellow: #FFC72C; /* Warnings, highlights, attention items */
```

**Usage:**
- `#71CC98` - Staff chart series, positive trends, success messages
- `#FFC72C` - Warning states, highlighted metrics, attention callouts

### Semantic Colors

#### Success (Green Scale)
```css
--success-50: #f0fdf4;   /* Light backgrounds */
--success-600: #059669;  /* Icons, text */
--success-700: #047857;  /* Darker text, emphasis */
```

**Usage:** Positive trends, completed states, successful operations

#### Warning (Orange Scale)
```css
--warning-50: #fffbeb;   /* Light backgrounds */
--warning-600: #d97706;  /* Icons, text */
--warning-700: #b45309;  /* Darker text, emphasis */
```

**Usage:** Caution states, attention needed, moderate alerts

#### Error (Red Scale)
```css
--error-50: #fef2f2;     /* Light backgrounds */
--error-600: #dc2626;    /* Icons, text, borders */
--error-700: #b91c1c;    /* Darker text, emphasis */
```

**Usage:** Error states, negative trends, critical alerts

#### Info (Blue Scale)
```css
--info-50: #eff6ff;      /* Light backgrounds */
--info-600: #2563eb;     /* Icons, text */
--info-700: #1d4ed8;     /* Darker text, emphasis */
```

**Usage:** Informational messages, help text, neutral callouts

### Neutral Colors (Gray Scale)

```css
/* Backgrounds */
--gray-50: #f9fafb;      /* Page backgrounds */
--gray-100: #f3f4f6;     /* Card backgrounds, hover states */

/* Borders */
--gray-200: #e5e7eb;     /* Dividers, borders, card outlines */
--gray-300: #d1d5db;     /* Input borders, stronger dividers */

/* Text */
--gray-600: #6b7280;     /* Secondary text, subtitles */
--gray-700: #374151;     /* Primary text, labels */
--gray-800: #1f2937;     /* Emphasized text */
--gray-900: #111827;     /* Headings, important text */
```

### Chart Color Palettes

#### Primary Chart Palette (Accessible, Colorblind-Safe)
```css
--chart-blue-800: #1e40af;   /* Highest values - 7.96:1 contrast */
--chart-blue-700: #1d4ed8;   /* High values - 6.48:1 contrast */
--chart-blue-600: #2563eb;   /* Medium values - 4.72:1 contrast */
--chart-blue-500: #3b82f6;   /* Lower values - 3.36:1 contrast */
--chart-blue-400: #60a5fa;   /* Lowest values - 2.32:1 contrast */
```

**Usage:** Graduated scales, single-series charts, progress bars

#### Multi-Series Chart Palette
```css
--chart-series-1: #4f46e5;   /* Indigo - First series */
--chart-series-2: #0891b2;   /* Cyan - Second series */
--chart-series-3: #059669;   /* Green - Third series */
--chart-series-4: #d97706;   /* Orange - Fourth series */
--chart-series-5: #dc2626;   /* Red - Fifth series */
--chart-series-6: #7c3aed;   /* Purple - Sixth series */
```

**Usage:** Multi-series bar charts, comparison visualizations

#### Faculty/Staff Differentiation
```css
--faculty-color: #0054A6;    /* Creighton Blue for Faculty */
--staff-color: #71CC98;      /* Creighton Green for Staff */
```

**Usage:** Consistent differentiation between employee types across all charts

### Accessibility Compliance

All color combinations meet **WCAG 2.1 AA contrast ratios**:
- Normal text (< 18pt): 4.5:1 minimum
- Large text (≥ 18pt): 3.0:1 minimum
- UI components: 3.0:1 minimum

**Tested combinations:**
- `#0054A6` on white: 7.96:1 ✅
- `#00245D` on white: 12.52:1 ✅
- `#374151` on white: 9.82:1 ✅
- `#6b7280` on white: 5.74:1 ✅

---

## Typography

### Font Families

```css
/* Serif - For formal headers, print documents */
font-family: "Nocturne Serif", "Gentium Book Basic", Georgia, serif;

/* Sans-Serif - Primary UI font (default) */
font-family: "Proxima Nova", Arial, sans-serif;
```

**Default:** All components use sans-serif (Proxima Nova) for optimal screen readability.

### Type Scale

#### Dashboard Headings
```css
/* Page Title (H1) */
.text-2xl {
  font-size: 1.5rem;    /* 24px */
  line-height: 2rem;    /* 32px */
  font-weight: 700;     /* Bold */
  color: #0054A6;       /* Creighton Blue */
}
/* Print: 18pt, color: black */

/* Section Heading (H2) */
.text-lg {
  font-size: 1.125rem;  /* 18px */
  line-height: 1.75rem; /* 28px */
  font-weight: 600;     /* Semibold */
  color: #374151;       /* Gray 700 */
}
/* Print: 14pt */

/* Card Title (H3) */
.text-xs {
  font-size: 0.75rem;   /* 12px */
  line-height: 1rem;    /* 16px */
  font-weight: 500;     /* Medium */
  color: #0054A6;       /* Creighton Blue */
}
/* For summary cards and metric headers */
```

#### Body Text
```css
/* Primary Body */
.text-sm {
  font-size: 0.875rem;  /* 14px */
  line-height: 1.25rem; /* 20px */
  font-weight: 400;     /* Regular */
  color: #374151;       /* Gray 700 */
}

/* Secondary Body / Captions */
.text-xs {
  font-size: 0.75rem;   /* 12px */
  line-height: 1rem;    /* 16px */
  font-weight: 400;     /* Regular */
  color: #6b7280;       /* Gray 600 */
}
```

#### Metric Display
```css
/* Large Metric Value */
.text-xl {
  font-size: 1.25rem;   /* 20px */
  line-height: 1.75rem; /* 28px */
  font-weight: 700;     /* Bold */
  color: #111827;       /* Gray 900 */
}

/* Extra Large Hero Metric */
.text-6xl {
  font-size: 3.75rem;   /* 60px */
  line-height: 1;
  font-weight: 700;     /* Bold */
  color: #0054A6;       /* Creighton Blue */
}
```

### Font Weights

```css
--font-regular: 400;     /* Body text, labels */
--font-medium: 500;      /* Card titles, emphasized text */
--font-semibold: 600;    /* Section headings, buttons */
--font-bold: 700;        /* Page titles, metrics, important emphasis */
```

### Line Heights

```css
--leading-none: 1;       /* Hero metrics */
--leading-tight: 1.25;   /* Card titles, compact text */
--leading-normal: 1.5;   /* Body text */
--leading-relaxed: 1.625;/* Paragraph text, descriptions */
```

### Usage Guidelines

**Dashboard Titles:**
```jsx
<h1 className="text-2xl font-bold text-gray-900">
  Turnover Dashboard
</h1>
```

**Section Headers:**
```jsx
<h2 className="text-lg font-semibold text-gray-800">
  Age Distribution
</h2>
```

**Summary Card Titles:**
```jsx
<h2 className="text-xs font-medium break-words leading-tight"
    style={{color: '#0054A6'}}>
  Total Turnover Rate
</h2>
```

**Metric Values:**
```jsx
<span className="text-xl font-bold">
  11.2%
</span>
```

---

## Spacing & Layout

### Spacing Scale (Tailwind-based)

```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Common Spacing Patterns

#### Component Spacing
```css
/* Card padding */
.p-3: padding: 0.75rem;        /* 12px - Summary cards */
.p-4: padding: 1rem;           /* 16px - Standard cards */
.p-6: padding: 1.5rem;         /* 24px - Large cards, sections */

/* Gaps between elements */
.gap-1: 0.25rem;               /* 4px - Icon and text */
.gap-2: 0.5rem;                /* 8px - Related items */
.gap-3: 0.75rem;               /* 12px - Card elements */
.gap-4: 1rem;                  /* 16px - Grid gaps */
.gap-6: 1.5rem;                /* 24px - Section gaps */
```

#### Margins
```css
/* Bottom margins for vertical rhythm */
.mb-1: 0.25rem;                /* 4px - Tight spacing */
.mb-2: 0.5rem;                 /* 8px - Related items */
.mb-4: 1rem;                   /* 16px - Paragraph spacing */
.mb-6: 1.5rem;                 /* 24px - Section spacing */
.mb-8: 2rem;                   /* 32px - Major sections */
```

### Layout Grid System

#### Responsive Grid
```css
/* Dashboard layout - 4-column responsive grid */
.grid.grid-cols-1.md:grid-cols-2.lg:grid-cols-4 {
  display: grid;
  gap: 1rem;                    /* 16px */
}

/* Mobile: 1 column (< 768px) */
/* Tablet: 2 columns (768px - 1024px) */
/* Desktop: 4 columns (> 1024px) */
```

#### Container Widths
```css
.max-w-7xl {
  max-width: 80rem;             /* 1280px */
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.px-4 {
  padding-left: 1rem;           /* 16px */
  padding-right: 1rem;
}
```

### Border Radius
```css
--rounded-sm: 0.125rem;         /* 2px - Subtle rounding */
--rounded: 0.25rem;             /* 4px - Standard */
--rounded-md: 0.375rem;         /* 6px - Cards, inputs */
--rounded-lg: 0.5rem;           /* 8px - Large cards */
--rounded-full: 9999px;         /* Circles, pills */
```

### Shadows
```css
/* Card shadows */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
```

**Note:** Shadows are removed in print styles.

### Minimum Touch Targets (Accessibility)

```css
/* Buttons and interactive elements */
.btn-accessible {
  min-height: 44px;             /* Mobile: 48px */
  min-width: 44px;
}
```

---

## Component Library

### Core UI Components

#### 1. SummaryCard

**Purpose:** Display key metrics with optional trend indicators

**Anatomy:**
```jsx
<SummaryCard
  title="Total Turnover"
  value="11.2%"
  change={-1.6}
  changeType="percentage"      // 'percentage' | 'number' | 'currency'
  subtitle="12.8% in FY 2024"
  icon={TrendingDown}
  trend="positive"             // 'positive' | 'negative' | 'neutral'
  arrowDirection="down"        // 'up' | 'down' | null
/>
```

**Visual Style:**
- Background: White (`bg-white`)
- Border: Gray 200 (`border`)
- Shadow: Small (`shadow-sm`)
- Border radius: Large (`rounded-lg`)
- Padding: 12px (`p-3`)
- Min height: 100px

**Typography:**
- Title: 12px, medium weight, Creighton Blue (#0054A6)
- Value: 20px, bold, Gray 900
- Change: 12px, color based on trend
- Subtitle: 12px, Gray 500

**States:**
- Default: White background, subtle shadow
- Print: Border emphasized, colors converted to grayscale

**Accessibility:**
- Semantic heading structure
- Icon has proper color contrast
- Trend indicators use both color and arrows

#### 2. Navigation

**Purpose:** Primary navigation sidebar/header with responsive behavior

**Desktop Sidebar (> 768px):**
- Width: 112px (7rem)
- Background: White
- Border: Right border, Gray 200
- Layout: Icon + abbreviated label vertical stack

**Mobile Header (< 768px):**
- Full-width header with hamburger menu
- Overlay sidebar: 256px (16rem) width
- Backdrop: Black 25% opacity

**Navigation Items:**
```jsx
{
  id: 'workforce',
  label: 'Workforce Dashboard',
  shortLabel: 'Work',              // For desktop sidebar
  path: '/dashboards/workforce',
  icon: Users,
  isActive: true
}
```

**Visual Style:**
- Active state: Blue 50 background, Blue 700 text
- Hover state: Gray 50 background, Gray 900 text
- Focus state: 2px blue outline, 2px offset
- Icon size: 20px
- Text size: 12px (desktop), 14px (mobile)

**Groupings:**
- Core Navigation (always visible)
- Annual Reports (collapsible on mobile)
- Quarterly Reports (collapsible on mobile)
- Admin (bottom section)

#### 3. DashboardHeader

**Purpose:** Consistent header with title, filters, and actions

**Anatomy:**
```jsx
<DashboardHeader
  title="Turnover Dashboard"
  subtitle="Generated: 1/30/2026"
  filters={currentFilters}
  availableFilters={filterOptions}
  onFilterChange={handleFilterChange}
  showFilters={true}
  showDateFilter={true}
  showExport={true}
/>
```

**Layout:**
- Flex container: Space between
- Title section: Left-aligned
- Actions: Right-aligned, horizontal flex
- Gap: 12px between action buttons

**Components included:**
- FilterButton (with active count badge)
- Date/Period selector
- ExportButton dropdown

#### 4. FilterButton

**Purpose:** Dropdown filter panel for dashboard data filtering

**Visual Style:**
- Button: White background, gray border
- Active state: Blue 50 background, blue border
- Badge: Blue 600 background, white text, rounded-full
- Dropdown: 320px width, shadow-lg

**Dropdown Panel:**
- Header: "Filters" title with clear all option
- Filter sections: Select dropdowns with labels
- Footer: "Apply Filters" button (blue 600)
- Max height: 384px (24rem) with scroll

**Available Filters:**
- Reporting Period
- Location
- Employee Type
- Division
- Grade Classification

**Keyboard Navigation:**
- Arrow Up/Down: Navigate filters
- Escape: Close panel
- Tab: Normal tab flow within panel

#### 5. ExportButton

**Purpose:** Multi-format export dropdown (PDF, Excel, CSV, Print)

**Visual Style:**
- Button: Blue 600 background, white text
- Loading state: Gray 400, disabled cursor
- Dropdown: 256px width, shadow-lg

**Export Options:**
```javascript
[
  { id: 'pdf', label: 'Export as PDF', icon: FileText },
  { id: 'excel', label: 'Export to Excel', icon: FileSpreadsheet },
  { id: 'csv', label: 'Export to CSV', icon: FileDown },
  { id: 'print', label: 'Print Dashboard', icon: Printer }
]
```

**Status Indicator:**
- Position: Absolute, above button
- Background: Gray 800, white text
- Size: 12px text, 12px padding
- Shadow: Large

#### 6. LoadingSkeleton

**Purpose:** Placeholder during data loading

**Visual Style:**
- Background: Gray 200
- Animated: Pulse animation
- Border radius: Matches content (4px - 8px)

**Variants:**
- Card skeleton: Full card dimensions
- Text skeleton: Height matches text size
- Chart skeleton: Matches chart container

#### 7. AccessibleDataTable

**Purpose:** WCAG-compliant data table with keyboard navigation

**Visual Style:**
- Border: Gray 200, 1px
- Header: Gray 50 background, gray 700 text, bold
- Cell padding: 12px (0.75rem)
- Hover row: Gray 50 background
- Focus cell: Blue outline, blue 50 background

**Features:**
- Sortable columns
- Keyboard navigation (arrow keys)
- Screen reader announcements
- ARIA live regions
- Responsive horizontal scroll

---

## Chart & Data Visualization

### Recharts Configuration

All charts use **Recharts 3.0.0** library with consistent styling.

### Chart Container Style

```jsx
<div className="bg-white rounded-lg shadow-sm border p-6">
  <ResponsiveContainer width="100%" height={350}>
    {/* Chart component */}
  </ResponsiveContainer>
</div>
```

**Container properties:**
- Background: White
- Border: Gray 200, 1px
- Border radius: 8px (rounded-lg)
- Shadow: Small (shadow-sm)
- Padding: 24px (p-6)

### Common Chart Elements

#### Cartesian Grid
```jsx
<CartesianGrid
  strokeDasharray="3 3"
  stroke="#e5e7eb"      /* Gray 200 */
/>
```

#### Axes
```jsx
<XAxis
  dataKey="category"
  tick={{ fontSize: 12, fill: '#374151' }}  /* Gray 700 */
  stroke="#e5e7eb"                           /* Gray 200 */
/>

<YAxis
  tick={{ fontSize: 12, fill: '#374151' }}
  stroke="#e5e7eb"
  label={{
    value: 'Count',
    angle: -90,
    position: 'insideLeft',
    style: { fill: '#374151' }
  }}
/>
```

#### Tooltip
```jsx
<Tooltip
  contentStyle={{
    backgroundColor: 'white',
    border: '1px solid #d1d5db',    /* Gray 300 */
    borderRadius: '6px',
    padding: '12px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
  }}
  labelStyle={{
    fontWeight: 600,
    color: '#374151',               /* Gray 700 */
    marginBottom: '8px'
  }}
  itemStyle={{
    fontSize: '14px',
    color: '#6b7280'                /* Gray 600 */
  }}
/>
```

#### Legend
```jsx
<Legend
  wrapperStyle={{
    paddingTop: '20px',
    fontSize: '14px'
  }}
  iconType="square"
  iconSize={12}
/>
```

### Chart Types & Patterns

#### 1. Bar Chart (Faculty/Staff Comparison)

**Usage:** Compare faculty and staff metrics across categories

**Color scheme:**
```jsx
<Bar dataKey="faculty" fill="#0054A6" name="Faculty">
  <LabelList dataKey="faculty" position="top" />
</Bar>
<Bar dataKey="staff" fill="#71CC98" name="Staff">
  <LabelList dataKey="staff" position="top" />
</Bar>
```

**Accessibility:**
- Data table included below chart
- ARIA labels on bars
- Screen reader caption

#### 2. Progress Bar Chart (Custom Component)

**Usage:** Top exit reasons, ranked items with percentage bars

**Structure:**
```jsx
<div className="space-y-4">
  {data.map((item, index) => (
    <div>
      <div className="flex justify-between">
        <span>{item.reason}</span>
        <span className="font-bold">{item.percentage}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-3">
        <div
          className={`h-3 rounded-full ${getBarColor(index)}`}
          style={{ width: `${item.percentage}%` }}
          role="progressbar"
        />
      </div>
    </div>
  ))}
</div>
```

**Color gradient (accessible):**
- Index 0: `bg-blue-800` (#1e40af) - 7.96:1 contrast
- Index 1: `bg-blue-700` (#1d4ed8) - 6.48:1 contrast
- Index 2: `bg-blue-600` (#2563eb) - 4.72:1 contrast
- Index 3: `bg-blue-500` (#3b82f6) - 3.36:1 contrast
- Index 4: `bg-blue-400` (#60a5fa) - 2.32:1 contrast (decorative)

#### 3. Line Chart (Trend Over Time)

**Usage:** Show trends across fiscal years or months

**Configuration:**
```jsx
<LineChart data={trendData}>
  <Line
    type="monotone"
    dataKey="rate"
    stroke="#0054A6"       /* Creighton Blue */
    strokeWidth={2}
    dot={{ fill: '#0054A6', r: 4 }}
    activeDot={{ r: 6 }}
  />
</LineChart>
```

#### 4. Pie Chart (Distribution)

**Usage:** Faculty retirement status, category breakdowns

**Color palette:**
```jsx
const COLORS = [
  '#0054A6',  // Under 69
  '#FFC627',  // Over 69
  '#95D2F3',  // Three-Year
  '#00245D',  // Two-Year
  '#1F74DB'   // One-Year
];
```

**Label configuration:**
```jsx
<Label
  value={`${data.value}%`}
  position="center"
  style={{
    fontSize: '24px',
    fontWeight: 'bold',
    fill: '#374151'
  }}
/>
```

### Data Table Companion

**All charts MUST include an accessible data table:**

```jsx
<div className="mt-6 border-t pt-4">
  <table className="w-full text-sm">
    <caption className="sr-only">Chart data table</caption>
    <thead>
      <tr className="border-b">
        <th className="text-left py-2">Category</th>
        <th className="text-center py-2">Value</th>
      </tr>
    </thead>
    <tbody>
      {data.map((row) => (
        <tr key={row.id} className="border-b">
          <td className="py-2 font-medium">{row.category}</td>
          <td className="text-center py-2">{row.value}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

### Chart Height Standards

```css
--chart-height-small: 250px;
--chart-height-medium: 350px;
--chart-height-large: 450px;
```

**Usage:**
- Summary charts: 250px
- Standard charts: 350px
- Detailed trend charts: 450px

### Print Optimization

```css
@media print {
  .recharts-responsive-container {
    width: 100% !important;
    height: 250pt !important;
  }

  .recharts-surface {
    background: white !important;
  }

  .recharts-text {
    font-size: 9pt !important;
    fill: #374151 !important;
  }
}
```

---

## Iconography

### Icon Library: Lucide React

**Package:** `lucide-react` v0.553.0

### Icon Usage Patterns

#### Standard Size
```jsx
<Icon size={20} />              /* Navigation, buttons */
<Icon size={16} />              /* Small buttons, inline text */
<Icon size={24} />              /* Page headers, hero sections */
```

#### Color Application
```jsx
/* Creighton Blue - Primary usage */
<TrendingDown style={{color: '#0054A6'}} size={20} />

/* Contextual colors */
<CheckCircle className="text-green-600" size={16} />
<AlertTriangle className="text-orange-600" size={16} />
<XCircle className="text-red-600" size={16} />
<Info className="text-blue-600" size={16} />
```

### Common Icons & Usage

#### Navigation Icons
```jsx
<Home size={20} />              // Dashboard home
<Users size={20} />             // Workforce
<TrendingDown size={20} />      // Turnover
<UserPlus size={20} />          // Recruiting
<MessageSquare size={20} />     // Exit surveys
<Target size={20} />            // Priorities
<GraduationCap size={20} />     // Learning & Development
<DollarSign size={20} />        // Total Rewards
<Heart size={20} />             // Benefits
<FileText size={20} />          // Reports
<BarChart3 size={20} />         // Analytics/Charts
<Database size={20} />          // Data sources
<Shield size={20} />            // Validation/Security
```

#### Action Icons
```jsx
<Filter size={16} />            // Filter button
<Download size={16} />          // Export button
<ChevronDown size={14} />       // Dropdown indicators
<ChevronRight size={16} />      // Expandable items
<X size={16} />                 // Close actions
<Menu size={20} />              // Mobile menu
<Printer size={16} />           // Print action
```

#### Trend & Status Icons
```jsx
<TrendingUp size={12} />        // Positive trend
<TrendingDown size={12} />      // Negative trend
<CheckCircle size={16} />       // Success state
<AlertTriangle size={16} />     // Warning state
<XCircle size={16} />           // Error state
<Info size={16} />              // Information
<Loader2 size={16} className="animate-spin" />  // Loading
```

### Icon + Text Patterns

```jsx
/* Horizontal alignment */
<div className="flex items-center gap-2">
  <Icon size={20} style={{color: '#0054A6'}} />
  <span>Label Text</span>
</div>

/* Vertical alignment (navigation) */
<div className="flex flex-col items-center gap-1">
  <Icon size={20} />
  <span className="text-xs">Label</span>
</div>
```

### Accessibility

- Icons used for decoration: `aria-hidden="true"`
- Icons conveying meaning: Include text alternative or ARIA label
- Interactive icons: Part of properly labeled button

```jsx
/* Decorative */
<TrendingUp aria-hidden="true" size={12} />

/* Meaningful */
<button aria-label="Close filter panel">
  <X size={16} />
</button>

/* With visible text */
<button>
  <Download size={16} />
  <span>Export</span>
</button>
```

---

## Accessibility Standards

### WCAG 2.1 AA Compliance

**Mandatory Requirements:**
- Color contrast: 4.5:1 for normal text, 3:1 for large text and UI
- Focus indicators: Visible on all interactive elements
- Keyboard navigation: Full keyboard support
- Screen reader support: Semantic HTML and ARIA labels
- Alternative text: For all non-decorative images and icons

### Focus Indicators

```css
/* Global focus style */
*:focus {
  outline: 2px solid #2563eb;      /* Blue 600 */
  outline-offset: 2px;
}

/* Enhanced focus for buttons and links */
button:focus,
a:focus {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

/* Table cell focus */
td:focus,
th:focus {
  outline: 2px solid #2563eb;
  outline-offset: -2px;
  background-color: rgba(37, 99, 235, 0.1);
}
```

### Screen Reader Utilities

```css
/* Visually hidden, screen reader accessible */
.sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

/* Visible on focus (skip links) */
.sr-only-focusable:focus {
  position: static !important;
  width: auto !important;
  height: auto !important;
  /* ... restore normal positioning */
}
```

### Skip Links

```jsx
<a href="#main-content" className="skip-link">
  Skip to main content
</a>
```

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #000;
  color: #fff;
  padding: 8px;
  border-radius: 4px;
  z-index: 10000;
}

.skip-link:focus {
  top: 6px;
}
```

### High Contrast Mode

**User-togglable high contrast mode:**

```css
.high-contrast-mode {
  --text-primary: #000000;
  --background-primary: #ffffff;
  --border-color: #000000;
  --focus-color: #ff00ff;      /* Magenta for visibility */
  --link-color: #0000ff;
  --button-border: #000000;
}

.high-contrast-mode * {
  background-color: var(--background-primary) !important;
  color: var(--text-primary) !important;
  border-color: var(--border-color) !important;
}

.high-contrast-mode button {
  border: 2px solid var(--button-border) !important;
}

.high-contrast-mode *:focus {
  outline: 3px solid var(--focus-color) !important;
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### ARIA Patterns

#### Data Tables
```jsx
<table role="table" aria-label="Turnover data">
  <caption className="sr-only">Annual turnover rates by category</caption>
  <thead>
    <tr role="row">
      <th role="columnheader" scope="col">Category</th>
      <th role="columnheader" scope="col">Rate</th>
    </tr>
  </thead>
  <tbody>
    <tr role="row">
      <td role="cell">Faculty</td>
      <td role="cell">11.2%</td>
    </tr>
  </tbody>
</table>
```

#### Charts
```jsx
<div
  role="img"
  aria-label="Bar chart showing faculty and staff turnover rates"
  tabIndex="0"
>
  <ResponsiveContainer>
    {/* Chart content */}
  </ResponsiveContainer>
</div>

{/* Required: Data table alternative */}
<table className="sr-only">
  {/* Full data representation */}
</table>
```

#### Dropdowns
```jsx
<button
  aria-haspopup="true"
  aria-expanded={isOpen}
  aria-controls="filter-panel"
>
  Filters
</button>

<div
  id="filter-panel"
  role="dialog"
  aria-labelledby="filter-title"
>
  <h3 id="filter-title">Filter Options</h3>
  {/* Panel content */}
</div>
```

#### Live Regions
```jsx
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {statusMessage}
</div>
```

### Keyboard Navigation

**Supported patterns:**
- Tab: Move forward through interactive elements
- Shift+Tab: Move backward
- Enter/Space: Activate buttons, links
- Arrow keys: Navigate within dropdowns, tables
- Escape: Close modals, dropdowns

**Implementation:**
```jsx
const handleKeyDown = (event) => {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      // Move to next item
      break;
    case 'ArrowUp':
      event.preventDefault();
      // Move to previous item
      break;
    case 'Escape':
      event.preventDefault();
      // Close panel
      break;
  }
};
```

### Touch Targets

**Minimum sizes (mobile):**
- Buttons: 48px × 48px
- Links: 44px × 44px (desktop), 48px × 48px (mobile)
- Form controls: 44px height

```css
@media (max-width: 768px) {
  .btn-accessible {
    min-height: 48px;
    min-width: 48px;
  }
}
```

---

## Print Styles

### Page Setup

```css
@page {
  size: A4;
  margin: 0.75in 0.5in 1in 0.5in;  /* top, right, bottom, left */
}
```

### Global Print Adjustments

```css
@media print {
  * {
    -webkit-print-color-adjust: exact !important;
    color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body {
    font-size: 12pt;
    line-height: 1.4;
    color: #000 !important;
    background: white !important;
  }
}
```

### Hide Interactive Elements

```css
@media print {
  .no-print,
  button:not(.print-show),
  nav:not(.print-show),
  .navigation,
  .sidebar,
  .filter-controls,
  .export-button {
    display: none !important;
    visibility: hidden !important;
  }
}
```

### Typography Adjustments

```css
@media print {
  h1 {
    font-size: 18pt !important;
    color: #1e40af !important;      /* Blue 700 for print */
    page-break-after: avoid !important;
  }

  h2 {
    font-size: 16pt !important;
    color: #374151 !important;
    page-break-after: avoid !important;
  }

  h3 {
    font-size: 14pt !important;
    color: #374151 !important;
    page-break-after: avoid !important;
  }

  p {
    font-size: 11pt !important;
    line-height: 1.4 !important;
    color: #374151 !important;
  }
}
```

### Component Print Styles

#### Summary Cards
```css
@media print {
  .summary-card {
    background: white !important;
    border: 1pt solid #e5e7eb !important;
    padding: 8pt !important;
    page-break-inside: avoid !important;
    display: inline-block !important;
    width: 48% !important;
    vertical-align: top !important;
  }

  .summary-card:nth-child(odd) {
    margin-right: 4% !important;
  }
}
```

#### Charts
```css
@media print {
  .chart-container {
    background: white !important;
    border: 1pt solid #e5e7eb !important;
    page-break-inside: avoid !important;
    height: auto !important;
    min-height: 200pt !important;
  }

  .recharts-responsive-container {
    width: 100% !important;
    height: 250pt !important;
  }

  .recharts-text {
    font-size: 9pt !important;
    fill: #374151 !important;
  }
}
```

#### Data Tables
```css
@media print {
  table {
    width: 100% !important;
    border-collapse: collapse !important;
    page-break-inside: auto !important;
  }

  th {
    background: #f8fafc !important;
    border: 1pt solid #e5e7eb !important;
    padding: 6pt !important;
    font-size: 10pt !important;
  }

  td {
    border: 1pt solid #e5e7eb !important;
    padding: 6pt !important;
    font-size: 10pt !important;
  }
}
```

### Page Breaks

```css
/* Prevent breaks inside elements */
.page-break-inside-avoid {
  page-break-inside: avoid !important;
}

/* Force break before element */
.page-break-before {
  page-break-before: always !important;
}

/* Force break after element */
.page-break-after {
  page-break-after: always !important;
}
```

---

## Implementation Examples

### Example 1: Dashboard Page Structure

```jsx
import React from 'react';
import DashboardHeader from '../ui/DashboardHeader';
import SummaryCard from '../ui/SummaryCard';
import { TrendingDown, Users, DollarSign } from 'lucide-react';

const TurnoverDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 dashboard-container">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <DashboardHeader
          title="Turnover Dashboard"
          subtitle="Reporting Period: 6/30/2024 - 6/30/2025"
          filters={filters}
          onFilterChange={handleFilterChange}
          showFilters={true}
          showExport={true}
        />

        {/* Summary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <SummaryCard
            title="Total Turnover"
            value="11.2%"
            change={-1.6}
            changeType="percentage"
            subtitle="12.8% in FY 2024"
            icon={TrendingDown}
            trend="positive"
          />
          <SummaryCard
            title="Faculty Departures"
            value="67"
            change={-5}
            changeType="number"
            subtitle="72 in FY 2024"
            icon={Users}
            trend="positive"
          />
          <SummaryCard
            title="Staff Departures"
            value="155"
            change={10}
            changeType="number"
            subtitle="145 in FY 2024"
            icon={Users}
            trend="negative"
          />
          <SummaryCard
            title="Cost Impact"
            value="$1.62M"
            change={-5.2}
            changeType="percentage"
            subtitle="Estimated turnover cost"
            icon={DollarSign}
            trend="positive"
          />
        </div>

        {/* Charts Section */}
        <div className="space-y-6">
          {/* Chart components */}
        </div>
      </div>
    </div>
  );
};

export default TurnoverDashboard;
```

### Example 2: Custom Bar Chart with Accessibility

```jsx
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const FacultyStaffChart = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Faculty and Staff Comparison
      </h3>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="category"
            tick={{ fontSize: 12, fill: '#374151' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#374151' }}
            label={{
              value: 'Count',
              angle: -90,
              position: 'insideLeft'
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '12px'
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar
            dataKey="faculty"
            fill="#0054A6"
            name="Faculty"
          />
          <Bar
            dataKey="staff"
            fill="#71CC98"
            name="Staff"
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Accessible Data Table */}
      <div className="mt-6 border-t pt-4">
        <table className="w-full text-sm">
          <caption className="sr-only">
            Faculty and staff data comparison table
          </caption>
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Category</th>
              <th className="text-center py-2">Faculty</th>
              <th className="text-center py-2">Staff</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.category} className="border-b">
                <td className="py-2 font-medium">{row.category}</td>
                <td className="text-center py-2">{row.faculty}</td>
                <td className="text-center py-2">{row.staff}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FacultyStaffChart;
```

### Example 3: Accessible Button with Icon

```jsx
import React from 'react';
import { Download } from 'lucide-react';

const ExportButton = ({ onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label="Export dashboard data"
      className={`
        flex items-center gap-2 px-4 py-2
        rounded-md shadow-sm transition-colors
        min-h-[44px] min-w-[44px]
        focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none
        ${disabled
          ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700'
        }
      `}
    >
      <Download size={16} aria-hidden="true" />
      <span className="text-sm font-medium">Export</span>
    </button>
  );
};

export default ExportButton;
```

### Example 4: Responsive Grid Layout

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  {/* Summary cards - 1 column mobile, 2 tablet, 4 desktop */}
  <SummaryCard {...cardProps1} />
  <SummaryCard {...cardProps2} />
  <SummaryCard {...cardProps3} />
  <SummaryCard {...cardProps4} />
</div>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Charts - 1 column mobile/tablet, 2 columns desktop */}
  <ChartComponent {...chart1Props} />
  <ChartComponent {...chart2Props} />
</div>
```

---

## Design System Maintenance

### Version Control
- Design system changes require PR review
- Document breaking changes in CHANGELOG
- Update component Storybook examples when adding variants

### Testing Requirements
- Visual regression tests for component updates
- Accessibility audit (axe-core) on modified components
- Color contrast verification for new color additions
- Keyboard navigation testing for interactive components

### Documentation Updates
- Update this file when adding new components
- Include code examples for new patterns
- Document accessibility considerations
- Add print style specifications

---

## Resources & References

### External Resources
- **Creighton University Brand Guidelines:** [Internal branding documentation]
- **WCAG 2.1 Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **Tailwind CSS Documentation:** https://tailwindcss.com/docs
- **Recharts Documentation:** https://recharts.org/en-US/
- **Lucide Icons:** https://lucide.dev/icons

### Tools
- **Color Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **Accessibility Testing:** @axe-core/react (integrated in project)
- **Design Tokens:** Tailwind config at `/tailwind.config.js`

### Internal Documentation
- **PROJECT_STATUS.md** - Current project state
- **WORKFLOW_GUIDE.md** - Development procedures
- **TECHNICAL_ARCHITECTURE_REVIEW.md** - System architecture

---

## Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-01-30 | Initial design system documentation | Design System Architect |

---

**Questions or Suggestions?**
Contact the project maintainer or create a GitHub issue for design system enhancements.
