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

### Session Start Checklist

**Always run at the beginning of each coding session:**

```bash
# 1. Navigate to project directory
cd "/Users/pernelltoney/My Projects/dev/hr-trio-reports"

# 2. Pull latest changes (if team project)
git pull

# 3. Install any new dependencies
npm install

# 4. Rebuild Docker container with latest changes
docker-compose down && docker-compose build --no-cache && docker-compose up -d
```

### Development Workflow Options

#### Option 1: Development-First Approach (Recommended)
```bash
# 1. Start with development server for active coding
npm start  # Port 3000 - hot reload, instant changes

# 2. When ready to test production build
docker-compose down
docker-compose build --no-cache  
docker-compose up -d

# 3. Switch between as needed for development vs testing
```

#### Option 2: Docker-First Approach  
```bash
# Always work in Docker for maximum consistency
docker-compose down && docker-compose build --no-cache && docker-compose up -d

# Rebuild after changes (slower but more consistent)
```

### When to Rebuild Docker Container

**Always rebuild when:**
- Starting a new coding session
- Switching branches or pulling changes
- Dependencies change (package.json modified)
- Docker/config files change (Dockerfile, docker-compose.yml)
- After major code changes or new features
- Before demos or testing sessions

### Docker Commands

```bash
# Quick rebuild and restart
docker-compose down && docker-compose build --no-cache && docker-compose up -d

# Check container status
docker ps

# View container logs
docker-compose logs -f

# Stop containers
docker-compose down

# Clean up Docker system
docker system prune -f

# Build without cache (always use for development)
docker-compose build --no-cache
```

### Cross-Platform Development (Mac/PC)

**Best Practices:**
- Always test changes in Docker before committing
- Use Docker for demos and presentations
- Rebuild Docker container at start of each session
- Commit code only after Docker build succeeds
- Use npm start for fast iteration, Docker for validation

**Recommended Daily Workflow:**
1. **Morning**: Rebuild Docker container with latest changes
2. **Development**: Use `npm start` for fast iteration and hot reload  
3. **Testing**: Switch to Docker when testing production features
4. **Demos**: Always use Docker for consistent presentations
5. **End of day**: Commit changes, test Docker build before closing

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

### 🎯 **Current Status: READY FOR USER TESTING**

The system is now fully functional and technically sound. All major issues have been resolved:
- ✅ Docker deployment working
- ✅ Static assets loading correctly  
- ✅ File import system operational
- ✅ Dashboard buttons functional
- ✅ Data processing pipeline complete
- ✅ Documentation comprehensive

**Next Session Goal**: Complete user testing of Enhanced Workforce Analytics and begin iterative improvements based on real-world usage and feedback.