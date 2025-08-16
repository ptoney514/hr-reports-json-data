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
8. DO NOT BE LAZY. NEVER BE LAZY. IF THERE IS A BUG FIND THE ROOT CAUSE AND FIX IT. NO TEMPORARY FIXES. YOU ARE A SENIOR DEVELOPER. NEVER BE LAZY
9. MAKE ALL FIXES AND CODE CHANGES AS SIMPLE AS HUMANLY POSSIBLE. THEY SHOULD ONLY IMPACT NECESSARY CODE RELEVANT TO THE TASK AND NOTHING ELSE. IT SHOULD IMPACT AS LITTLE CODE AS POSSIBLE. YOUR GOAL IS TO NOT INTRODUCE ANY BUGS. IT'S ALL ABOUT SIMPLICITY

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

## Specialized Subagents

The HR Reports application includes custom Claude Code subagents for enhanced development efficiency and code quality. These specialized agents handle specific domain tasks with expert-level knowledge.

### Available Subagents

#### 1. **json-master** - JSON Data Management Specialist
- **Purpose**: Handle all JSON data operations, validation, and transformations
- **Use Cases**: 
  - JSON data structure design and optimization
  - JSON data operations, validation, transformations
  - Data validation and schema management
  - Local file-based data operations
- **Auto-triggered**: JSON file operations, data migrations, data validation

#### 2. **firebase-remover** - Firebase Removal Specialist (COMPLETED)
- **Purpose**: ✅ Successfully removed Firebase dependencies and migrated to JSON architecture
- **Completed Tasks**:
  - Removed all Firebase imports and configurations
  - Converted all Firebase operations to JSON-based alternatives
  - Migrated all Firebase data structures to JSON files
  - Updated all hooks and services to use JSON data
- **Status**: Migration complete - system now runs on pure JSON architecture

#### 3. **test-runner** - Testing & Quality Assurance Specialist
- **Purpose**: Automated testing, quality checks, and build verification
- **Use Cases**:
  - Run comprehensive test suites (unit, integration, accessibility)
  - Fix failing tests while preserving test intent
  - Execute builds and verify code quality
  - Generate test coverage reports
- **Auto-triggered**: Code changes, before commits, quality gate checks

#### 4. **react-optimizer** - React Performance Specialist
- **Purpose**: Optimize React components and fix performance issues
- **Use Cases**:
  - Fix React Hook dependency warnings
  - Implement proper memoization strategies
  - Clean up unused imports and variables
  - Optimize component re-render patterns
- **Auto-triggered**: React Hook warnings, performance issues, build optimization

#### 5. **chart-debugger** - Chart & Visualization Specialist
- **Purpose**: Debug and optimize Recharts visualizations
- **Use Cases**:
  - Fix chart rendering and synchronization issues
  - Debug chart data flow and updates
  - Optimize chart performance and responsiveness
  - Handle chart animation and interaction problems
- **Auto-triggered**: Chart rendering issues, data visualization problems

#### 6. **data-transformer** - Data Processing Specialist
- **Purpose**: Handle complex data transformations and processing
- **Use Cases**:
  - Process Excel/CSV file imports
  - Transform data between different formats
  - Aggregate quarterly and periodic data
  - Calculate complex metrics and KPIs
- **Auto-triggered**: Data import/export, format conversions, metric calculations

#### 7. **accessibility-guardian** - Accessibility Compliance Specialist
- **Purpose**: Ensure WCAG 2.1 AA accessibility compliance
- **Use Cases**:
  - Run accessibility tests and fix violations
  - Implement proper ARIA attributes and semantics
  - Ensure keyboard navigation and focus management
  - Validate color contrast and visual accessibility
- **Auto-triggered**: Accessibility violations, compliance testing, WCAG validation

#### 8. **pdf-generator** - PDF & Printing Specialist
- **Purpose**: PDF generation and printing optimization for HR reports and dashboards
- **Use Cases**:
  - Create PDF exports of dashboards and reports
  - Implement browser printing functionality with optimized layouts
  - Generate professional multi-page reports with proper formatting
  - Handle chart and data visualization printing
  - Optimize print performance for large datasets
- **Auto-triggered**: PDF export requests, print functionality, report generation

### Using Subagents Effectively

#### Automatic Delegation
Claude Code will automatically delegate tasks to appropriate subagents based on:
- Task context and requirements
- Code patterns and file types being modified
- Build warnings and error types
- Quality gate requirements

#### Explicit Invocation
You can specifically request subagent assistance:
```
> Use the json-master agent to design the JSON data structure
> Have the test-runner agent fix failing tests
> Ask the accessibility-guardian to check WCAG compliance
```

#### Subagent Integration
Subagents work together on complex tasks:
- **firebase-remover** + **json-master**: ✅ Completed Firebase to JSON migration successfully
- **test-runner** + **react-optimizer**: Fix performance while maintaining quality
- **chart-debugger** + **accessibility-guardian**: Accessible chart implementations
- **pdf-generator** + **chart-debugger**: Print-optimized visualizations and reports
- **pdf-generator** + **data-transformer**: Professional data reports with complex formatting

### Benefits

- **Specialized Expertise**: Each agent has deep domain knowledge
- **Context Preservation**: Agents work in isolated contexts to prevent pollution
- **Consistent Quality**: Standardized approaches to common tasks
- **Faster Development**: Automated handling of routine but complex tasks
- **Knowledge Retention**: Best practices encoded in each agent


## Git Workflow and Branching Strategy

**IMPORTANT: Main branch protection ensures code quality and project stability.**

### Core Principles

1. **Main Branch Protection** - The `main` branch contains only stable, tested, production-ready code
2. **Feature-Based Development** - All new features, enhancements, and bug fixes are developed in dedicated branches
3. **Quality Assurance** - Code must be tested and reviewed before merging to main
4. **Clear Documentation** - All changes require descriptive commit messages and documentation updates

### Branch Types and Workflow

**Branch Types:**
- `main` - Production-ready stable code
- `feature/*` - New features and major enhancements  
- `fix/*` - Bug fixes and corrections
- `enhancement/*` - UI/UX improvements

**Basic Workflow:**
1. Start from latest main: `git checkout main && git pull`
2. Create feature branch: `git checkout -b feature/your-feature-name`
3. Develop with regular commits using clear messages
4. Test thoroughly in Docker environment
5. Create Pull Request with full testing and documentation updates

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

This is the **HR Reports Project** - a comprehensive React-based dashboard application for I-9 compliance health monitoring and HR analytics. The application has evolved into a production-ready, enterprise-grade platform featuring multiple dashboards, comprehensive testing infrastructure, WCAG 2.1 AA accessibility compliance, database integration, advanced data visualization, automated quality assurance, and enterprise-level security and performance optimization.

**Current Version**: Development-focused enterprise platform with comprehensive dashboard analytics, JSON data architecture, and Docker-based development environment.

**Key Technologies:**
- **React 19.1.0** with hooks and routing
- **Tailwind CSS 3.4.17** for responsive design
- **Recharts 3.0.0** for data visualization
- **JSON Data Architecture** with local file-based data management
- **File-based Data Management** with JSON import/export capabilities

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

### Development Environment Approach

**Development-First with Hot Reloading**

We use Docker with hot reloading enabled for fast development iterations. The default configuration runs React's development server with live reload, so changes are immediately visible without rebuilds.

**Note**: PocketBase database service is currently disabled in docker-compose.yml. The application runs entirely on JSON-based data architecture with static data files in `/public/data/`.

### Available Docker Configurations

1. **Development (default)**: `docker-compose.yml` - Hot reloading, development server
2. **Development (explicit)**: `docker-compose.dev.yml` - Same as default
3. **Production**: `docker-compose.prod.yml` - Optimized production builds

### Session Start Checklist

**Run at the beginning of each coding session:**

```bash
# 1. Navigate to project directory
cd "/Users/pernelltoney/Projects/dev/hr-reports-json-data"

# 2. Pull latest changes (if team project)
git pull

# 3. Start development environment (with hot reloading)
docker-compose up -d

# Application available at: http://localhost:3000
```

### Development Workflow

#### For Code Changes (Hot Reloading)
1. **Make your code changes** - Edit files normally in your IDE
2. **Changes appear automatically** - Hot reloading shows updates instantly
3. **No rebuild required** - Development server watches for file changes
4. **Test in browser** - Visit http://localhost:3000 to see live updates

#### For New Components/Features
1. **Create/modify files** - Changes appear automatically with hot reload
2. **Add routes and navigation** - Updates reflect immediately
3. **Test functionality** - All changes visible at http://localhost:3000 instantly

#### For Dependency Changes Only
When adding new npm packages, rebuild is required:
```bash
# Stop container
docker-compose down

# Rebuild with new dependencies
docker-compose build

# Start with new dependencies
docker-compose up -d
```

### Development Best Practices

**Daily Workflow:**
1. **Morning**: Start development environment with `docker-compose up -d`
2. **Development**: Make code changes - see updates instantly with hot reload
3. **Testing**: All testing done in Docker environment (http://localhost:3000)
4. **Demos**: Development server always ready for presentations
5. **End of day**: Commit changes to git, optionally stop container

**Container Management Commands:**
```bash
# Start development environment (hot reloading)
docker-compose up -d

# Check container status and logs
docker ps
docker logs hr-reports-json-dev

# Restart development container (if needed)
docker-compose restart

# Stop development environment
docker-compose down

# Full rebuild (only needed for dependency changes)
docker-compose build --no-cache && docker-compose up -d

# For production testing (when needed)
docker-compose -f docker-compose.prod.yml up -d
```

**Key Benefits:**
- **Instant feedback**: Hot reloading shows changes immediately
- **No rebuild cycles**: Code changes don't require container rebuilds
- **Fast development**: React development server with full debugging
- **Consistent environment**: Docker ensures same environment across all machines
- **Production testing**: Separate production configuration when needed

## Architecture

### Architecture Overview

**Application Structure:**
- Multi-dashboard architecture with React Router
- Context-based state management  
- Component-based design with reusable UI components
- Service layer for data operations
- JSON-based data architecture with local file management

**Key Features:**
- **Dashboard Types**: Workforce, Turnover, I-9 Compliance, Recruiting, Exit Survey
- **Data Visualization**: Interactive Recharts with export functionality
- **JSON Data Management**: Local file-based data architecture with validation
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Lazy loading, code splitting, caching strategies

**Data Flow:**
- JSON files as primary data source stored in `/public/data/`
- Direct file loading with efficient caching strategies
- Custom hooks for data fetching (useWorkforceData, useTurnoverData, useComplianceData)
- Context providers for cross-component state sharing
- Excel/CSV import system for data management

## Documentation Requirements

**Essential Documentation Tasks:**
1. **Update CLAUDE.md** after major changes
2. **Maintain CHANGELOG.md** with detailed change logs  
3. **Update KNOWLEDGE_BASE.md** for architectural changes

**For Each Code Change:**
- Update relevant documentation sections
- Add CHANGELOG entry with date, type, and description
- Explain architectural decisions and implementation details

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

**Common Issue**: Charts not updating when data or filters change despite correct data flow.

**Diagnostic Strategies**:
1. **Debug Panels**: Add visual data panels with timestamps to verify data flow
2. **Alternative Rendering**: Create simple HTML/CSS versions to isolate Recharts issues  
3. **Force Re-rendering**: Use component keys with data dependencies and disable animations (`isAnimationActive={false}`)

**Key Debugging Approaches**:
- Add container keys: `key={chart-container-${selectedQuarter}-${Date.now()}}`
- Disable chart animations for update issues
- Create simple HTML bar alternatives to verify data changes
- Log data structures at each processing step

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

## Current Project Status

### 🎯 **Production Ready System - Clean JSON Architecture** 

**System Status**: All dashboards operational with pure JSON-based data architecture, comprehensive error handling, and clean modern interfaces.

**Key Achievements:**
- ✅ **Pure JSON Data Architecture** - Migrated from Firebase to efficient JSON-based system
- ✅ **Excel Integration Removal** - Eliminated broken Excel functionality, reduced bundle size
- ✅ **Enhanced Workforce Analytics** - Real-time data processing and visualization
- ✅ **Modern I-9 Risk Assessment** - Visual severity indicators and trend analysis
- ✅ **Docker Production Deployment** - Containerized development environment
- ✅ **Chart Synchronization** - All dashboard visualizations properly coordinated

**Recent Major Updates:**
- **✅ Firebase → JSON Migration**: Complete migration from Firebase to JSON-based data architecture
- **✅ Excel Integration Removal**: Eliminated broken Excel functionality and React errors
- **✅ Bundle Size Optimization**: Reduced bundle size by ~800+ bytes through dependency cleanup
- **✅ Architecture Simplification**: Cleaner codebase with pure JSON data management
- **I-9 Risk Assessment Dashboard**: Modern visualization with severity progress bars, risk badges, and trend indicators
- **Workforce Analytics Refactoring**: Streamlined interface with professional header design and simplified controls
- **Chart Data Consistency**: Fixed synchronization issues across all dashboard charts

## \ud83d\ude80 **Completed Migrations & Cleanups**

### **Phase 1: Firebase \u2192 JSON Migration (\u2705 Complete)**
- **Firebase Removal**: All Firebase dependencies and references eliminated
- **JSON Data Architecture**: Local file-based data management implemented  
- **Hook Migration**: All data hooks converted from Firebase to JSON patterns
- **Service Layer**: DataService updated for JSON operations
- **Bundle Impact**: Reduced dependencies and improved performance

### **Phase 2: Excel Integration Removal (\u2705 Complete)**
- **Component Removal**: Eliminated ExcelIntegrationDashboard, EmployeeImportDashboard, DataSourceManager
- **Navigation Cleanup**: Removed broken Excel integration routes and links
- **Dependency Cleanup**: Removed react-dropzone and xlsx packages
- **Error Resolution**: Fixed React errors shown in user screenshots
- **Bundle Optimization**: Additional ~300+ bytes reduction
- **Codebase Simplification**: Cleaner architecture ready for JSON import tool development

### **Next Phase: JSON Import Tool Development**
The codebase is now clean and optimized for building a proper JSON import tool in the next development phase.