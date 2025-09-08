# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📋 Project Status
**IMPORTANT**: Always check `PROJECT.md` for current project status, active branches, in-progress work, and feature backlog. Keep PROJECT.md updated as you work on tasks.

## Standard Workflow

1. First think through the problem, read the codebase for relevant files, and write a plan to tasks/todo.md.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Finally, add a review section to the todo.md file with a summary of the changes you made and any other relevant information.
8. DO NOT BE LAZY. NEVER BE LAZY. IF THERE IS A BUG FIND THE ROOT CAUSE AND FIX IT. NO TEMPORARY FIXES. YOU ARE A SENIOR DEVELOPER. NEVER BE LAZY
9. MAKE ALL FIXES AND CODE CHANGES AS SIMPLE AS HUMANLY POSSIBLE. THEY SHOULD ONLY IMPACT NECESSARY CODE RELEVANT TO THE TASK AND NOTHING ELSE. IT SHOULD IMPACT AS LITTLE CODE AS POSSIBLE. YOUR GOAL IS TO NOT INTRODUCE ANY BUGS. IT'S ALL ABOUT SIMPLICITY

## TODO Management

**ALWAYS use TodoWrite tools throughout every session:**

- Use TodoWrite for any task requiring 3+ steps or multiple operations
- Create comprehensive todo lists with TodoWrite for complex tasks
- Mark todos as "in_progress" before starting, "completed" immediately after finishing
- Break complex tasks into smaller, specific, actionable items
- Update todo status in real-time as you work, never batch completions
- Limit to ONE task "in_progress" at any time for focus
- ONLY mark as "completed" when task is fully accomplished (tests pass, no errors)
- Use for non-trivial complex tasks requiring careful planning
- Create new todos for discovered subtasks during implementation
- Never mark incomplete tasks as "completed"

## Key Subagents

#### **json-master** - JSON Data Management Specialist
Handle all JSON data operations, validation, transformations, and local file-based data management.

#### **test-runner** - Testing & Quality Assurance Specialist  
Run comprehensive test suites, fix failing tests, execute builds and verify code quality.

#### **react-optimizer** - React Performance Specialist
Optimize React components, fix Hook dependency warnings, and improve component re-render patterns.

## Git Workflow

**Branch Types:**
- `main` - Production-ready stable code
- `feature/*` - New features and major enhancements  
- `fix/*` - Bug fixes and corrections
- `enhancement/*` - UI/UX improvements

**Commit Format:** `type: Brief description`
- `feat:` New features
- `fix:` Bug fixes  
- `enhance:` UI/UX improvements
- `docs:` Documentation updates

**Merge Requirements:**
- ✅ All functionality tested
- ✅ No console errors
- ✅ Docker environment verified
- ✅ Documentation updated

## Project Overview

**HR Reports Project** - A comprehensive React-based JSON dashboard application for I-9 compliance health monitoring and HR analytics.

**Key Technologies:**
- **React 19.1.0** with hooks and routing
- **Tailwind CSS 3.4.17** for responsive design
- **Recharts 3.0.0** for data visualization
- **JSON Data Architecture** with local file-based data management
- **Local Development Server** with hot reloading via react-scripts

## Development Commands

```bash
# Start development server (opens http://localhost:3000)
npm start

# Run tests in interactive watch mode
npm test

# Build for production
npm run build:production

# Analyze bundle size
npm run analyze

# Quick development shortcuts
npm run dev         # Alias for npm start
npm run dev:test    # Run tests once
npm run dev:build   # Build production version

# Data validation commands
node scripts/processTurnoverData.js     # Process Excel turnover data
node scripts/validateExitSurveyData.js  # Validate dashboard data
node scripts/testCalculations.js        # Test all calculations
node scripts/analyzeFY25ExitSurveys.js  # Generate FY25 analysis

# Data management commands (NEW)
npm run data:process    # Process Excel turnover data to JSON
npm run data:sync       # Sync turnover data to staticData.js
npm run data:validate   # Validate data consistency across all components
npm run data:update     # Complete workflow: process → sync → validate
```

**Application available at:** http://localhost:3000

## Code Quality Standards

- **Consistent naming conventions** (PascalCase for components, camelCase for utilities)
- **Clear separation of concerns** between components, logic, and data
- **Comprehensive error handling** at all levels
- **Performance considerations** in component design
- **Accessibility compliance** built into all components (WCAG 2.1 AA)
- **Comprehensive testing** for all new components and workflows

## Current Project Status

### 🎯 **Production Ready System - Pure Local Development** 

**System Status**: All dashboards operational with JSON-based data architecture running on local development server. Docker removed for improved performance.

**Recent Updates (December 2024):**
- ✅ **Data Consistency System Implemented** - Automated validation and sync between turnover and exit survey data
- ✅ **FY25 Exit Survey Data Corrected** - Fixed Q4 (51 exits, not 62) across all dashboards
- ✅ **Comprehensive FY25 Analysis** - 222 total exits, 31.1% response rate, 65.3% avg satisfaction
- ✅ **Automated Data Sync Scripts** - `npm run data:update` ensures consistency across all components
- ✅ **Data Management Documentation** - Created comprehensive guides for data workflow

**Key Achievements:**
- ✅ **Pure JSON Data Architecture** - Efficient local file-based system
- ✅ **Enhanced Workforce Analytics** - Real-time data processing and visualization
- ✅ **Modern Exit Survey Dashboards** - Q1 and Q4 FY25 analysis pages
- ✅ **Optimized Local Development** - Fast, lightweight, no Docker required
- ✅ **Chart Synchronization** - All dashboard visualizations properly coordinated

**Architecture:**
- Multi-dashboard architecture with React Router
- Static data source in `/src/data/staticData.js`
- Source metrics folder at `/source-metrics/` for data imports
- Custom hooks for data fetching (useWorkforceData, useTurnoverData, useComplianceData)
- Context providers for cross-component state sharing

## Source Metrics Data Import

### 📁 Folder Structure for Data Import
The `/source-metrics/` directory is organized for easy data import:

```
source-metrics/
├── exit-surveys/       # Exit survey data by fiscal year
│   ├── fy24/          # Place FY24 exit surveys here
│   ├── fy25/          # Place FY25 exit surveys here  
│   └── fy26/          # Place FY26 exit surveys here
├── workforce/          # Headcount and demographics data
├── turnover/          # Turnover metrics
├── recruiting/        # Hiring and recruiting data
├── compliance/        # I-9 compliance data
├── templates/         # CSV/Excel templates with correct format
└── processed-data/    # System-processed data output
```

### 📊 Adding Exit Survey Data
1. Use template: `source-metrics/templates/exit_survey_template.csv`
2. Save as: `exit_survey_Q4_FY25.csv` (or similar)
3. Place in: `source-metrics/exit-surveys/fy25/`
4. Required fields: exit_date, department, satisfaction ratings (1-5), exit_reason
5. See `EXIT_SURVEY_METHODOLOGY.md` for calculation methods

### 📈 Key Metrics Documents
- **Exit Survey Methodology**: `/EXIT_SURVEY_METHODOLOGY.md` - Exit survey calculation formulas and standards
- **Turnover Methodology**: `/TURNOVER_METHODOLOGY.md` - Turnover data processing and calculations
- **Data Validation Process**: `/docs/DATA_VALIDATION_PROCESS.md` - Validation methodology and data flow
- **Data Import Guide**: `/source-metrics/templates/DATA_IMPORT_GUIDE.md` - Format requirements
- **Source Metrics README**: `/source-metrics/README.md` - Complete folder guide
- **Non-Calculable Data Sources**: `/docs/NON_CALCULABLE_DATA_SOURCES.md` - External PowerPoint slide data that cannot be calculated from raw data

### 📊 Data Processing Scripts
- **Turnover Processing**: `/scripts/processTurnoverData.js` - Extracts and analyzes termination data from Excel
- **Data Consistency Validation**: `/scripts/validateDataConsistency.js` - Ensures alignment between all data sources
- **Automated Data Sync**: `/scripts/syncTurnoverToStaticData.js` - Syncs turnover counts to exit survey data
- **Excel Inspection**: `/scripts/inspectExcelData.js` - Debug tool for Excel file structure
- **Sheet Inspector**: `/scripts/inspectAllSheets.js` - Reviews all sheets in Excel workbook
- **Data Validation**: `/scripts/validateExitSurveyData.js` - Validates all dashboard data points
- **Calculation Testing**: `/scripts/testCalculations.js` - Verifies all mathematical calculations
- **FY25 Analysis**: `/scripts/analyzeFY25ExitSurveys.js` - Comprehensive year-end analysis generator

## Data Consistency Workflow

### 🔄 Automated Data Management
The system ensures data consistency between turnover metrics and exit survey data:

1. **Single Source of Truth**: `fy25TurnoverData.json` contains authoritative turnover counts
2. **Automated Sync**: `npm run data:sync` updates exit survey data with correct turnover counts
3. **Validation**: `npm run data:validate` checks all components for consistency
4. **Complete Workflow**: `npm run data:update` runs the entire process automatically

### 📌 Key Data Points (Validated)
- **Q1 FY25**: 79 exits (5 faculty, 74 staff)
- **Q2 FY25**: 36 exits (3 faculty, 33 staff)
- **Q3 FY25**: 52 exits (9 faculty, 43 staff)
- **Q4 FY25**: 51 exits (15 faculty, 36 staff)
- **Total FY25**: 222 unique employees
- **Q1→Q4 Reduction**: 35.4%

### 🛠️ When to Run Data Updates
- After processing new turnover data from Excel
- Before committing dashboard changes
- When validation reports inconsistencies
- As part of regular data maintenance

## External Data Dependencies

### PowerPoint Slide Data
Some dashboard visualizations display data from HR PowerPoint slides that cannot be calculated programmatically:

- **Faculty Turnover by Division**: Rates from HR department analysis (see staticData.js comments)
- **Voluntary/Involuntary Turnover**: Breakdown from HR slides (to be implemented)
- **Demographic Review**: Multi-year comparisons from HR slides (to be implemented)

When working with this data:
1. Check `/docs/NON_CALCULABLE_DATA_SOURCES.md` for current values
2. Save slide images to `/source-metrics/hr-slides/[fiscal-year]/`
3. Add comments in `staticData.js` marking external data sources
4. Do NOT attempt to calculate these values from raw data - they use HR's specific methodology

## Important Reminders

### Implementation Priorities
1. **Documentation First** - Always update documentation before, during, and after changes
2. **Quality Over Speed** - Ensure robust, maintainable code
3. **Accessibility Always** - Never compromise on accessibility standards
4. **Performance Conscious** - Consider performance impact of all changes
5. **Test Coverage** - Maintain high test coverage for reliability
6. **Data Privacy** - Never commit PII or sensitive employee data

### Never Do
- Create files unless absolutely necessary for achieving goals
- Skip documentation updates
- Compromise on accessibility standards
- Introduce breaking changes without migration strategy
- Add dependencies without thorough evaluation
- Commit actual employee data (use anonymized data only)

## Brand & Design Guidelines

**Reference**: See `/docs/BRAND_GUIDELINES.md` for comprehensive Creighton University brand standards.

**Key Brand Colors for UI Implementation:**
- **Primary**: Creighton Blue `#0054A6`, Creighton Navy `#00245D`
- **Secondary**: Light Blue `#1F74DB`, Sky Blue `#95D2F3`
- **Accent**: Green `#71CC98`, Yellow `#FFC72C`
- **Neutrals**: Warm Gray `#D7D2CB`, Light Gray `#F3F3F0`

**Typography Standards:**
- **Headlines**: Nocturne Serif (fallback: Gentium Book Basic, Georgia)
- **Body Text**: Proxima Nova (fallback: Arial, sans-serif)
- **Accessibility**: Maintain WCAG AA contrast ratios (4.5:1 minimum)

**Design Principles:**
- Use official brand colors consistently across all UI components
- Follow typography hierarchy and spacing guidelines
- Ensure accessibility compliance in all implementations
- Reference brand voice and messaging when creating user-facing content

## Project Management

### 📊 Keeping PROJECT.md Updated
**CRITICAL**: Always update PROJECT.md when:
- Starting work on a new feature or bug
- Completing a task or milestone
- Discovering new bugs or issues
- Adding ideas to the backlog
- Changing project status or focus

### Key Sections to Maintain
1. **Current Status**: Update dates and current focus
2. **In Progress**: Move items as you work on them
3. **Completed Features**: Mark items done with [x]
4. **Bug Tracker**: Log any issues discovered
5. **Feature Backlog**: Add new requirements as discussed

### Quick Update Commands
```bash
# After completing a feature
- Move item from "In Progress" to "Completed Features"
- Update "Last worked on" date
- Add any new bugs discovered to Bug Tracker

# When starting new work
- Update "Current focus" in Current Status
- Add task to "In Progress" section
- Note any blockers encountered
```

### Integration with Todo Management
- Use TodoWrite for session-specific tasks
- Update PROJECT.md for project-level tracking
- Keep both in sync for complete visibility