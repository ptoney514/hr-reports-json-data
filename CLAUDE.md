# CLAUDE.md

## Project Type
HR Reports Dashboard - A comprehensive React-based JSON dashboard application for I-9 compliance health monitoring and HR analytics.

## Project Vision & Goals
- **Mission**: Provide real-time HR analytics and insights through modern, accessible dashboards
- **Core Principles**: Simplicity, data accuracy, accessibility compliance, performance
- **Current Priorities**: Data consistency, visualization quality, user experience

## Project Structure
```
hr-reports-json-data/
├── src/
│   ├── components/      # React components
│   │   ├── charts/     # Visualization components
│   │   ├── dashboards/ # Dashboard pages
│   │   └── ui/         # UI components
│   ├── data/           # JSON data files
│   ├── hooks/          # Custom React hooks
│   └── services/       # Data services
├── scripts/            # Data processing scripts
├── source-metrics/     # Excel data imports
└── docs/              # Documentation
```

## Architecture Overview
- **Tech Stack**: React 19.1.0, Tailwind CSS 3.4.17, Recharts 3.0.0
- **Data Architecture**: Pure JSON-based local file system
- **Key Decisions**:
  - Removed Firebase/Docker for simplicity
  - Local development server only
  - Static data in `/src/data/staticData.js`
- **Architecture Patterns**:
  - Multi-dashboard routing with React Router
  - Custom hooks for data fetching
  - Context providers for state sharing

## Development Commands
```bash
# Essential commands
npm start                # Start dev server (http://localhost:3000)
npm test                # Run tests
npm run build           # Build for production

# Data management
npm run data:process    # Process Excel to JSON
npm run data:sync       # Sync data sources
npm run data:validate   # Validate consistency
npm run data:update     # Complete data workflow
```

## Important Context

### Business Rules
- Exit survey data must match turnover counts
- FY25 validated totals: 222 unique exits
- Maintain Creighton University branding
- WCAG 2.1 AA accessibility compliance required

### Design Decisions
- Component-based architecture for reusability
- JSON data for simplicity and portability
- Local development for fast iteration
- Excel imports for HR data compatibility

### What NOT to Do
- Never commit PII or sensitive employee data
- Don't calculate HR slide metrics (use provided values)
- Avoid complex architectural changes
- Don't add unnecessary dependencies
- Never compromise on accessibility

## Current Focus
- Maintaining data consistency across dashboards
- Improving visualization responsiveness
- Enhancing user experience and navigation

## Pull Request Requirements

**CRITICAL**: Always use pr-prep agent before creating PRs
- Run: "Use pr-prep agent to verify I'm ready for a PR"
- DO NOT create PR until pr-prep gives ✅ all checks passed
- See [PR_WORKFLOW.md](PR_WORKFLOW.md) for complete process

## Available Sub-Agents

The project has 12 specialized agents in `.claude/agents/`:

### Quality & Review Agents
- **pr-prep** (⭐ Use before EVERY PR): Pre-PR quality checks, prevents CI failures
- **code-reviewer**: Code quality analysis and best practices review
- **accessibility-guardian**: WCAG 2.1 AA compliance verification
- **test-runner**: Testing and quality assurance specialist

### Product & Strategy Agents
- **product-manager**: PRDs, roadmaps, user stories, prioritization (RICE, MoSCoW)
- **technical-architect**: System design, architecture review, scalability analysis
- **data-analytics-engineer**: BI solutions, data pipelines, HR analytics

### Development Agents
- **react-optimizer**: React Hook dependencies, performance optimization
- **chart-debugger**: Recharts visualization debugging
- **data-transformer**: Excel/CSV imports, data format conversions
- **json-master**: JSON data management and validation
- **ui-ux-designer**: UI/UX design guidance and accessibility

### How to Use Agents

**Automatic:** Claude Code recognizes tasks matching agent expertise
**Explicit:** Request specific agent: "Use pr-prep to check if I'm ready for PR"
**Proactive:** Some agents activate automatically (pr-prep before PRs, code-reviewer after writing code)

## Key Documentation
- **PROJECT_STATUS.md** - Current project state and progress
- **WORKFLOW_GUIDE.md** - Development procedures and standards
- **PR_WORKFLOW.md** - Pull request process and quality checklist
- **TECHNICAL_DEBT.md** - Known issues and improvements
- **ERROR_LOG.md** - Common errors and solutions
- **docs/assessments/TECHNICAL_ARCHITECTURE_REVIEW.md** - Comprehensive architecture assessment (B+ grade)