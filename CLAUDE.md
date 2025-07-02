# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React dashboard application called "TrioReports-DEMO" that displays I-9 compliance health monitoring data. The application is built with:

- **React 19.1.0** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Recharts** - Data visualization library for charts
- **Lucide React** - Icon library
- **Create React App** - Build toolchain and development server

## Development Commands

```bash
# Start development server (opens http://localhost:3000)
npm start

# Run tests in interactive watch mode
npm test

# Build for production
npm run build

# Eject from Create React App (irreversible)
npm run eject
```

## Architecture

### Component Structure
- **App.js** - Main application entry point that renders the I9HealthDashboard
- **I9HealthDashboard.jsx** - Primary dashboard component containing all metrics, charts, and data visualization
- **I9Dashboard.css** - Component-specific styles

### Key Features
- **Metrics Dashboard** - Displays compliance rates, form processing counts, and audit readiness
- **Data Visualization** - Bar charts for compliance by employee type, line charts for quarterly trends
- **Risk Assessment** - Risk indicators with color-coded severity levels
- **Print Functionality** - Print-optimized CSS for PDF generation
- **Process Improvements Tracking** - Status tracking for various improvement initiatives

### Data Architecture
The dashboard uses mock data defined directly in the component:
- `currentMetrics` - Current quarter compliance statistics
- `complianceByType` - Breakdown by employee categories (Faculty/Staff, Students, Phoenix Campus)
- `trendData` - Historical quarterly compliance data
- `riskMetrics` - Risk assessment categories with severity levels
- `improvements` - Process improvement initiatives and their status

### Styling Approach
- Tailwind CSS classes for responsive design
- Print-specific styles using `print:` modifiers
- Color-coded metrics (green for good, red for alerts, orange for warnings)
- Responsive grid layouts that adapt to different screen sizes