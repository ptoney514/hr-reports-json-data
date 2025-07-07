# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Standard Workflow

1. First think through the problem, read the codebase for relevant files, and write a plan to tasks/todo.md.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Finally, add a review section to the todo.md file with a summary of the changes you made and any other relevant information.

## TODO List Management (CRITICAL)

**ALWAYS use TodoWrite and TodoRead tools throughout every session:**

1. **At Session Start** - Use TodoRead to check existing todos and TodoWrite to add new tasks
2. **During Planning** - Create comprehensive todo lists with TodoWrite for complex tasks (3+ steps)
3. **Throughout Implementation** - Mark todos as "in_progress" before starting, "completed" immediately after finishing
4. **Task Breakdown** - Break complex tasks into smaller, specific, actionable items
5. **Real-time Updates** - Update todo status in real-time as you work, never batch completions
6. **Only One In-Progress** - Limit to ONE task "in_progress" at any time for focus
7. **Completion Requirements** - ONLY mark as "completed" when task is fully accomplished (tests pass, no errors)

**Todo List Usage Rules:**
- Use for any task requiring 3+ steps or multiple operations
- Use when user provides multiple tasks (numbered lists, comma-separated)
- Use for non-trivial complex tasks requiring careful planning
- Update immediately after each task completion
- Create new todos for discovered subtasks during implementation
- Never mark incomplete tasks as "completed"

**When NOT to use todos:**
- Single straightforward tasks
- Trivial tasks completing in <3 steps
- Purely conversational/informational requests

**AUTOMATIC TODO.md SYNC (REQUIRED):**
- **ALWAYS automatically update TODO.md** when using TodoWrite tools
- **Add new todos** to appropriate priority sections in TODO.md
- **Mark completed todos** with [x] and move to "Completed Tasks" section with date
- **Never require explicit instruction** to sync TODO.md - do it automatically
- **Maintain both systems** - TodoWrite for session management, TODO.md for cross-machine sharing
- **Update TODO.md immediately** after any TodoWrite operation

This ensures consistent task tracking, demonstrates progress to users, and prevents missing critical steps in complex implementations.

## Project Overview

This is the **HR Reports Project** - a comprehensive React-based dashboard application for I-9 compliance health monitoring and HR analytics. The application has evolved into a production-ready, enterprise-grade platform featuring multiple dashboards, comprehensive testing infrastructure, WCAG 2.1 AA accessibility compliance, database integration, advanced data visualization, automated quality assurance, and enterprise-level security and performance optimization.

**Phase 9 Complete**: Firebase/Firestore Integration with real-time data synchronization, enterprise-grade cloud database architecture, comprehensive testing infrastructure, and seamless migration from LowDB to Firebase with zero downtime.

**Phase 10 Complete**: Workforce Data Import System with comprehensive file upload capabilities, real-time data processing, Enhanced Workforce Analytics dashboard, and production-ready Docker deployment with functional UI components.

The application is built with:

- **React 19.1.0** - Modern React with hooks and concurrent features
- **React Router DOM 6.26.1** - Client-side routing with lazy loading
- **Tailwind CSS 3.4.17** - Utility-first CSS framework for styling
- **Recharts 3.0.0** - Data visualization library for charts
- **Lucide React 0.523.0** - Icon library
- **Firebase 11.2.0** - Cloud database with real-time synchronization
- **LowDB 7.0.1** - Local JSON database for fallback support
- **Create React App 5.0.1** - Build toolchain and development server
- **Comprehensive testing infrastructure** with React Testing Library, Jest, axe-core
- **Performance monitoring** with Core Web Vitals tracking and automatic optimization
- **Accessibility testing framework** with automated regression testing
- **Enterprise security system** with real-time threat detection and vulnerability assessment
- **Advanced bundle optimization** with intelligent preloading and caching
- **Service Worker implementation** for offline capability and advanced caching
- **Load testing framework** supporting 1000+ concurrent users
- **Memory leak detection** and automated prevention systems
- **Firebase/Firestore integration** with real-time data synchronization
- **Comprehensive testing suite** for Firebase operations and data integrity
- **Seamless data migration** from LowDB to Firebase with intelligent fallbacks
- **React Dropzone 14.3.8** - File upload with drag-and-drop functionality
- **XLSX 0.18.5** - Excel and CSV file parsing and processing
- **File Import System** - Comprehensive CSV/Excel upload with validation and preview
- **Data Aggregation Engine** - Transform individual employee records into dashboard metrics

## Development Commands

```bash
# Start development server (opens http://localhost:3000)
npm start

# Run tests in interactive watch mode
npm test

# Run accessibility tests
npm test -- --testNamePattern="accessibility"

# Run performance tests
npm test -- --testNamePattern="performance"

# Build for production
npm run build

# Analyze bundle size
npm run analyze

# Eject from Create React App (irreversible)
npm run eject
```

## Docker Development Workflow

### Efficient Development Approach

**Docker-Only Development with Smart Rebuilding Strategy**

We use Docker exclusively for all development work to ensure maximum consistency and production parity, but we optimize the workflow to avoid unnecessary rebuilds.

### Session Start Checklist

**Run at the beginning of each coding session:**

```bash
# 1. Navigate to project directory
cd "/Users/pernelltoney/My Projects/dev/hr-trio-reports"

# 2. Pull latest changes (if team project)
git pull

# 3. Check if container is running
docker ps

# 4. Start container if not running (builds automatically if needed)
docker-compose up -d

# Application available at: http://localhost:3000
```

### Development Workflow by Change Type

#### For Code Changes (Most Common)
```bash
# Method 1: Hot reload (if volumes are properly configured)
# Just save your files - changes should appear automatically

# Method 2: If hot reload doesn't work, restart container
docker-compose restart hr-reports-app

# Method 3: If restart doesn't work, recreate container without rebuild
docker-compose up --force-recreate --no-deps hr-reports-app
```

#### For Dependency Changes
```bash
# When package.json or package-lock.json changes
docker-compose down
docker-compose build --no-cache hr-reports-app
docker-compose up -d
```

#### For Docker Configuration Changes
```bash
# When Dockerfile or docker-compose.yml changes
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### When to Rebuild vs Restart

| Scenario | Action Required | Fast? | Command |
|----------|----------------|-------|---------|
| **Code changes** (JS, CSS, etc.) | Restart container | ✅ Yes | `docker-compose restart hr-reports-app` |
| **Dependency changes** (package.json) | Rebuild container | ❌ No | `docker-compose build --no-cache hr-reports-app` |
| **Docker config changes** (Dockerfile) | Rebuild container | ❌ No | `docker-compose build --no-cache` |
| **Environment issues** | Recreate container | ✅ Yes | `docker-compose up --force-recreate --no-deps hr-reports-app` |

### Recommended Daily Workflow

1. **Morning**: Check container status with `docker ps`
2. **Development**: Make code changes and save files (hot reload should work)
3. **If changes don't appear**: Restart container with `docker-compose restart hr-reports-app`
4. **If dependencies change**: Rebuild with `docker-compose build --no-cache hr-reports-app`
5. **End of day**: Leave container running for next session

### Docker Commands Reference

```bash
# Check container status
docker ps

# Start services (builds if needed)
docker-compose up -d

# Restart specific service (fast)
docker-compose restart hr-reports-app

# Rebuild specific service only
docker-compose build --no-cache hr-reports-app

# Recreate container without rebuild (medium speed)
docker-compose up --force-recreate --no-deps hr-reports-app

# Full rebuild (slow - only when necessary)
docker-compose down && docker-compose build --no-cache && docker-compose up -d

# View container logs
docker-compose logs -f hr-reports-app

# Stop all containers
docker-compose down

# Clean up Docker system (weekly maintenance)
docker system prune -f
```

### Troubleshooting

**If changes don't appear after restart:**
1. Check if volumes are properly mounted in docker-compose.yml
2. Try recreating container: `docker-compose up --force-recreate --no-deps hr-reports-app`
3. As last resort, rebuild: `docker-compose build --no-cache hr-reports-app`

**If npm server fails to start:**
1. Check container logs: `docker-compose logs hr-reports-app`
2. Verify node_modules aren't corrupted (rebuild if needed)
3. Ensure proper volume mounts in docker-compose.yml

### Cross-Platform Development (Mac/PC)

**Best Practices:**
- Always work exclusively in Docker for all development
- Use efficient restart/recreate commands for code changes
- Only rebuild when dependencies or Docker configs change
- Use Docker for all testing, demos, and presentations
- Never use npm start or local development servers

**Optimized Daily Workflow:**
1. **Morning**: Check container status with `docker ps`, start if needed
2. **Development**: Work exclusively in Docker (http://localhost:3000)
3. **Code Changes**: Save files and restart container if needed
4. **Testing**: All testing done in Docker environment
5. **Demos**: Docker is always ready for presentations
6. **End of day**: Commit changes, leave container running for next session

## Architecture

### Application Structure
- **App.js** - Main application entry point with React Router and lazy loading
- **Multi-dashboard architecture** with route-based navigation
- **Context-based state management** using React Context + Reducer pattern
- **Component-based design** with reusable UI components
- **Service layer** for data operations and API abstraction
- **Utility layer** for helper functions and common logic

### Component Organization
```
src/
├── components/
│   ├── charts/           # Chart-specific components
│   │   └── __tests__/    # Chart accessibility tests
│   ├── dashboards/       # Dashboard page components
│   └── ui/              # Reusable UI components
│       └── __tests__/    # UI component tests
├── contexts/            # React Context providers
├── data/               # Data files and API layer
├── database/           # Local database setup
├── hooks/              # Custom React hooks
├── styles/             # CSS files
└── utils/              # Utility functions
    └── __tests__/       # Utility function tests
```

### Key Features
- **Multiple Dashboard Types** - Workforce, Turnover, I9 Compliance, Recruiting, Exit Survey
- **Advanced Data Visualization** - Interactive charts with Recharts
- **Comprehensive Export Functionality** - Excel, PDF, CSV, Print
- **Accessibility Compliance** - WCAG 2.1 AA standards
- **Performance Optimization** - Lazy loading, code splitting, intelligent caching
- **Error Handling** - Multi-layered error boundaries
- **Testing Infrastructure** - Unit, integration, accessibility, performance, and load testing
- **Quality Assurance** - Automated regression testing with baseline comparison
- **Database Integration** - Local database with schema management
- **Enterprise Security** - Real-time threat detection, vulnerability assessment, data encryption
- **Offline Capability** - Service Worker with advanced caching strategies
- **Load Testing** - Support for 1000+ concurrent users with realistic traffic simulation
- **Performance Monitoring** - Core Web Vitals optimization with automatic intervention

### Data Architecture
- **Firebase/Firestore** for primary cloud data storage with real-time synchronization
- **LowDB** for local fallback data persistence and offline support
- **Schema validation** with AJV for data integrity
- **Firebase hooks** for real-time data fetching (useFirebaseWorkforceData, useFirebaseTurnoverData)
- **Service layer abstraction** for Firebase operations (FirebaseService.js)
- **Data migration utilities** for seamless LowDB to Firebase transition
- **Context state management** for cross-component data sharing
- **Intelligent caching strategies** with globalCache for performance optimization
- **Real-time subscriptions** for live dashboard updates across users

### Styling Approach
- **Tailwind CSS** utility-first approach for responsive design
- **Component-based styling** with clear separation of concerns
- **Accessibility-first design** with proper contrast and focus management
- **Print-optimized styles** for PDF generation
- **Responsive grid layouts** that adapt to all screen sizes
- **Dark/light theme support** (infrastructure ready)

## Documentation Requirements

### Critical Documentation Tasks
**These tasks must be completed with every phase and maintained throughout the project:**

1. **Update CLAUDE.MD** - Update this project guidance file after each major change
2. **Maintain CHANGELOG.md** - Document every change, addition, and modification made to the codebase
3. **Create & Maintain KNOWLEDGE_BASE.md** - Comprehensive technical documentation written as if a senior engineer is explaining the application architecture, data flow, and implementation details

### Documentation Maintenance Rules

**For Every Code Change:**
1. Update relevant sections in KNOWLEDGE_BASE.md
2. Add entry to CHANGELOG.md with:
   - Date and version
   - Type of change (Added, Changed, Deprecated, Removed, Fixed, Security)
   - Detailed description of what was changed and why
3. Update CLAUDE.MD if development processes change

**KNOWLEDGE_BASE.md Requirements:**
- Executive Summary
- Architecture Overview  
- Technology Stack
- Component Architecture
- Data Flow & State Management
- Service Layer
- UI/UX Patterns
- Testing Strategy
- Build & Deployment
- Performance Considerations
- Security Implementation
- Troubleshooting Guide

**Writing Style**: Write as a senior engineer explaining complex concepts to a colleague. Be thorough but accessible, include code examples, and explain the "why" behind architectural decisions.

## Project Implementation Guidelines

### Development Workflow
1. **Plan Phase**: Create todos and break down tasks
2. **Research Phase**: Understand existing codebase and patterns
3. **Implementation Phase**: Follow established patterns and conventions
4. **Testing Phase**: Ensure comprehensive test coverage
5. **Documentation Phase**: Update all relevant documentation
6. **Review Phase**: Check code quality and performance

### Code Quality Standards
- **Consistent naming conventions** (PascalCase for components, camelCase for utilities)
- **Clear separation of concerns** between components, logic, and data
- **Comprehensive error handling** at all levels
- **Performance considerations** in component design
- **Accessibility compliance** built into all components
- **TypeScript migration ready** (maintain type-safe patterns)

### Testing Requirements
- **Unit tests** for all new components and utilities
- **Integration tests** for complete user workflows
- **Accessibility tests** for WCAG 2.1 AA compliance (required, zero-violations)
- **Performance tests** for Core Web Vitals compliance
- **Regression tests** for preventing accessibility and performance degradation
- **Cross-browser tests** for compatibility verification
- **Error handling tests** for robustness

### Performance Standards
- **Bundle size** optimization with intelligent code splitting and preloading
- **Core Web Vitals** optimization (LCP < 1.5s, FID < 50ms, CLS < 0.05) - exceeding standard requirements
- **Lazy loading** for all major components with progressive enhancement
- **Advanced caching strategies** with Service Worker and offline capability
- **Responsive design** across all device types
- **Memory leak prevention** with automated detection and cleanup
- **Load testing capability** for 1000+ concurrent users
- **Real-time performance monitoring** with automatic optimization

## Chart Debugging Techniques

### Complex Chart Update Issues
**Problem**: Charts (especially Recharts) not updating when data or filters change despite correct data flow.

**Diagnostic Approach**:
1. **Visual Data Debugging**: Add debug panels showing exact data values with timestamps
2. **Alternative Rendering**: Create simple HTML/CSS versions of charts to isolate Recharts issues
3. **Multi-layer Force Re-rendering**: Apply multiple strategies simultaneously:
   - Component-level keys with data dependencies
   - Container-level keys with timestamps
   - Disabled animations (`isAnimationActive={false}`)
   - Enhanced data source validation

**Example Debug Panel Implementation**:
```jsx
{/* DEBUG PANEL - Shows exact data values */}
<div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
  <div className="font-bold text-yellow-800 mb-2">
    🐛 DEBUG DATA (Quarter: {selectedQuarter}) - Last Update: {new Date().toLocaleTimeString()}
  </div>
  <div className="grid grid-cols-1 gap-1 text-yellow-700">
    <div>Array Length: {chartData.length}</div>
    <div>Data Source: {dataSource}</div>
    {chartData.map((item, index) => (
      <div key={index} className="flex justify-between">
        <span>{item.name}:</span>
        <span>Value={item.value}</span>
      </div>
    ))}
  </div>
</div>

{/* SIMPLE HTML BARS TEST */}
<div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
  <div className="font-bold text-green-800 mb-2">
    🧪 SIMPLE HTML BARS TEST (Should definitely update)
  </div>
  {chartData.map((item, index) => (
    <div key={`${selectedQuarter}-${index}`} className="flex items-center gap-2">
      <span className="w-32">{item.name}</span>
      <div 
        className="bg-blue-600 h-4 transition-all duration-300" 
        style={{ width: `${(item.value / maxValue) * 100}%` }}
      />
      <span>{item.value}</span>
    </div>
  ))}
</div>
```

**Force Re-render Strategies**:
```jsx
{/* Container with timestamp key */}
<div key={`chart-container-${selectedQuarter}-${Date.now()}`}>
  <ResponsiveContainer width="100%" height={300}>
    <BarChart 
      key={`chart-${selectedQuarter}-${chartData.length}-${Date.now()}`}
      data={chartData}
    >
      <Bar 
        dataKey="value" 
        fill="#1e40af"
        isAnimationActive={false}  // Critical for update issues
      />
    </BarChart>
  </ResponsiveContainer>
</div>
```

**When to Use**: Chart display issues where data appears correct but visual updates don't occur. This technique helps isolate whether the issue is data flow, React rendering, or chart library-specific.

## Important Reminders

### Implementation Priorities
1. **Documentation First** - Always update documentation before, during, and after changes
2. **Quality Over Speed** - Ensure robust, maintainable code
3. **Accessibility Always** - Never compromise on accessibility standards
4. **Performance Conscious** - Consider performance impact of all changes
5. **Test Coverage** - Maintain high test coverage for reliability

### Never Do
- Create files unless absolutely necessary for achieving goals
- Skip documentation updates
- Compromise on accessibility standards
- Introduce breaking changes without migration strategy
- Add dependencies without thorough evaluation

## Phase 10 Completion Summary (January 2025)

### 🎯 **PHASE 10 COMPLETE: Workforce Data Import & Analytics System**

**Major Achievements:**
- ✅ **Complete File Import System** - Drag-and-drop CSV/Excel upload with validation and preview
- ✅ **Enhanced Workforce Analytics Dashboard** - Real-time data processing from imported files
- ✅ **Data Aggregation Engine** - Transform individual employee records into dashboard metrics
- ✅ **Fixed Combined Workforce Dashboard** - Functional filter, date, and export buttons
- ✅ **Docker Production Deployment** - Resolved static asset serving issues
- ✅ **Comprehensive Documentation** - WORKFORCE_DATA_FORMAT.md with complete data requirements

**Technical Implementation:**
- **FileUploader Component** (`src/components/ui/FileUploader.jsx`) - Full-featured file upload with:
  - Drag-and-drop interface with visual feedback
  - CSV/Excel parsing (.csv, .xlsx, .xls support)
  - Data validation and quality checks
  - Preview functionality (first 5 rows)
  - Error handling and user feedback
  - Downloadable template generation

- **Data Processing Engine** (`src/utils/workforceDataProcessor.js`) - Complete data transformation:
  - Flexible column mapping for various naming conventions
  - Data normalization and cleaning
  - Individual record to aggregate metric generation
  - Demographic calculations and trend analysis
  - Location/division/department breakdowns

- **Enhanced Workforce Dashboard** (`src/components/dashboards/EnhancedWorkforceDashboard.jsx`):
  - Seamless import workflow integration
  - Real-time metric generation from uploaded data
  - Smart data source management (Import → Firebase → Fallback)
  - Data reset functionality for testing

**User Experience Improvements:**
- Fixed duplicate button issue in Combined Workforce Analytics
- Functional filter system with location, division, employee type options
- Working export buttons (PDF, Excel, CSV)
- Clean, intuitive interface with proper state management

### 🚀 **TOMORROW'S PLAN: User Testing & Dashboard Refinement**

**Phase 11 Objectives:**
1. **User Testing Session**
   - Start with Enhanced Workforce Analytics dashboard
   - Test file import with real/sample employee data
   - Gather feedback on visualizations and layout
   - Identify missing or unnecessary data visualizations

2. **Dashboard Refinement Based on Feedback**
   - Add/remove visualizations per user requirements
   - Adjust data structure requirements based on actual data format
   - Enhance filter functionality if needed
   - Improve data aggregation logic based on business needs

3. **Additional Dashboard Testing**
   - Move through other dashboards (Turnover, I-9, Recruiting, Exit Survey)
   - Test export functionality across all dashboards
   - Verify consistent UI/UX patterns

4. **Data Format Optimization**
   - Refine CSV/Excel column requirements based on user's actual data
   - Update WORKFORCE_DATA_FORMAT.md with any changes
   - Enhance data validation rules if needed

**Testing Approach:**
- **Start Point**: Enhanced Workforce Analytics at `/dashboards/enhanced-workforce`
- **Test Data**: User will provide sample data or use generated template
- **Focus Areas**: Visual clarity, data accuracy, missing insights, UI/UX flow
- **Iteration**: Quick fixes and adjustments based on immediate feedback

**Technical Readiness:**
- ✅ Docker container running at localhost:3000
- ✅ All dashboards accessible and functional
- ✅ File import system ready for real data
- ✅ Export functionality working
- ✅ Error handling and validation in place

**Key Files for Tomorrow:**
- `/dashboards/enhanced-workforce` - Primary testing dashboard
- `WORKFORCE_DATA_FORMAT.md` - Data requirements reference
- `FileUploader.jsx` - Upload component for adjustments
- `workforceDataProcessor.js` - Data processing logic for refinements

### 🔄 **EXCEL INTEGRATION DASHBOARD REBUILD (January 2025)**

**Major Improvement:** Rebuilt Excel Integration Dashboard with simplified, maintainable architecture

**What Was Fixed:**
- ✅ **Removed Complex Buggy Code** - Eliminated overly complex quarterly-specific processing logic
- ✅ **Smart Data Detection** - Automatically detects and processes both individual employee records and quarterly aggregates
- ✅ **Improved User Experience** - Added Quick Actions section with direct navigation to Enhanced Workforce Dashboard
- ✅ **Better Error Handling** - Enhanced status indicators, validation, and user feedback
- ✅ **Streamlined Interface** - Clean, intuitive design without confusing complex options
- ✅ **Preserved Working Components** - Maintained robust FileUploader component and Firebase integration

**Technical Improvements:**
- **Simplified Architecture**: Replaced complex processing logic with clean, maintainable functions
- **Flexible Data Processing**: `processUploadedData()` with smart detection for different data types
- **Enhanced Navigation**: Direct integration between upload page and Enhanced Workforce Dashboard
- **Better Documentation**: Comprehensive help section with clear data format requirements
- **Maintained Compatibility**: Backward compatible with existing aggregate data formats

**User Benefits:**
- **Faster Workflow**: Quick Actions section for immediate dashboard navigation
- **Less Confusion**: Removed buggy complex options that caused user issues
- **Better Feedback**: Clear status indicators and helpful error messages
- **Smart Processing**: System automatically detects and handles different data formats

**Files Updated:**
- `src/components/dashboards/ExcelIntegrationDashboard.jsx` - Complete rebuild with simplified architecture
- Docker development workflow - Updated to Docker-only approach for consistency

### 🎯 **Current Status: PRODUCTION READY - CHARTS FULLY SYNCHRONIZED**

The system is now fully functional with all critical chart synchronization issues resolved:
- ✅ Docker deployment working  
- ✅ Static assets loading correctly
- ✅ File import system operational
- ✅ Dashboard buttons functional
- ✅ Data processing pipeline complete
- ✅ Documentation comprehensive
- ✅ **Excel Integration Dashboard rebuilt** - Clean, bug-free upload experience
- ✅ **Combined Workforce Dashboard fixed** - Charts and cards properly synchronized
- ✅ **Chart data consistency** - Both charts show same 5 quarters chronologically
- ✅ **Initial load issues resolved** - Cards show correct data on page load
- ✅ **Quarter selection working** - Charts maintain data when changing quarters

**Recent Fixes (July 7, 2025):**
- Fixed initial load cards showing zeros (invalid default quarter issue)
- Resolved New Hires vs Leavers chart going blank after quarter changes (circular dependency)
- Ensured Historical Headcount Trend chart matches Total Headcount card values
- Implemented chronological ordering for both charts (oldest to newest)
- Synchronized both charts to display same 5 quarters for visual consistency

**Ready for Production Use**: All dashboards are fully functional with comprehensive error handling, fallback data, and synchronized visualizations.