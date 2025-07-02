# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **HR Reports Project** - a comprehensive React-based dashboard application for I-9 compliance health monitoring and HR analytics. The application has evolved into a production-ready, scalable platform featuring multiple dashboards, comprehensive testing infrastructure, accessibility compliance, database integration, and advanced data visualization capabilities.

The application is built with:

- **React 19.1.0** - Modern React with hooks and concurrent features
- **React Router DOM 6.26.1** - Client-side routing with lazy loading
- **Tailwind CSS 3.4.17** - Utility-first CSS framework for styling
- **Recharts 3.0.0** - Data visualization library for charts
- **Lucide React 0.523.0** - Icon library
- **LowDB 7.0.1** - Local JSON database for data persistence
- **Create React App 5.0.1** - Build toolchain and development server
- **Comprehensive testing infrastructure** with React Testing Library

## Development Commands

```bash
# Start development server (opens http://localhost:3000)
npm start

# Run tests in interactive watch mode
npm test

# Build for production
npm run build

# Analyze bundle size
npm run analyze

# Eject from Create React App (irreversible)
npm run eject
```

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
│   ├── dashboards/       # Dashboard page components
│   └── ui/              # Reusable UI components
├── contexts/            # React Context providers
├── data/               # Data files and API layer
├── database/           # Local database setup
├── hooks/              # Custom React hooks
├── styles/             # CSS files
└── utils/              # Utility functions
```

### Key Features
- **Multiple Dashboard Types** - Workforce, Turnover, I9 Compliance, Recruiting, Exit Survey
- **Advanced Data Visualization** - Interactive charts with Recharts
- **Comprehensive Export Functionality** - Excel, PDF, CSV, Print
- **Accessibility Compliance** - WCAG 2.1 AA standards
- **Performance Optimization** - Lazy loading, code splitting, caching
- **Error Handling** - Multi-layered error boundaries
- **Testing Infrastructure** - Unit, integration, and E2E testing
- **Database Integration** - Local database with schema management

### Data Architecture
- **LowDB** for local data persistence
- **Schema validation** with AJV
- **Custom hooks** for data fetching (useTurnoverData, useWorkforceData)
- **API abstraction layer** for data operations
- **Context state management** for cross-component data sharing
- **Caching strategies** for performance optimization

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
- **Accessibility tests** for WCAG compliance
- **Performance tests** for optimization validation
- **Error handling tests** for robustness

### Performance Standards
- **Bundle size** optimization with code splitting
- **Core Web Vitals** compliance (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- **Lazy loading** for all major components
- **Caching strategies** for frequently accessed data
- **Responsive design** across all device types

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