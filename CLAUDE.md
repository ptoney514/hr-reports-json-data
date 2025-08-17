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
- **Docker** development environment with hot reloading

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
```

## Docker Quick Start

```bash
# Start development environment (with hot reloading)
docker-compose up -d

# Stop development environment
docker-compose down

# Rebuild (only needed for dependency changes)
docker-compose build && docker-compose up -d
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

### 🎯 **Production Ready System - Clean JSON Architecture** 

**System Status**: All dashboards operational with pure JSON-based data architecture, comprehensive error handling, and clean modern interfaces.

**Key Achievements:**
- ✅ **Pure JSON Data Architecture** - Migrated from Firebase to efficient JSON-based system
- ✅ **Enhanced Workforce Analytics** - Real-time data processing and visualization
- ✅ **Modern I-9 Risk Assessment** - Visual severity indicators and trend analysis
- ✅ **Docker Production Deployment** - Containerized development environment
- ✅ **Chart Synchronization** - All dashboard visualizations properly coordinated

**Architecture:**
- Multi-dashboard architecture with React Router
- JSON files as primary data source stored in `/public/data/`
- Custom hooks for data fetching (useWorkforceData, useTurnoverData, useComplianceData)
- Context providers for cross-component state sharing

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