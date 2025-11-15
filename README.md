# HR Reports Project

A comprehensive React-based dashboard application for I-9 compliance health monitoring and HR analytics. Features multiple dashboards, comprehensive testing infrastructure, WCAG 2.1 AA accessibility compliance, JSON-based data architecture, automated data import pipeline, and enterprise-level performance optimization.

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone <repository-url>
cd hr-reports-json-data

# 2. Install dependencies
npm install

# 3. Start development server
npm start

# 4. Open the application
# Navigate to: http://localhost:3000
```

**📖 Need help getting started?** See **[QUICK_START.md](QUICK_START.md)** for the complete guide including:
- Running dashboards
- Using the interactive data import wizard
- Common workflows
- Troubleshooting

**🎯 Import data in 2 minutes:** `npm run import:wizard`

**Access Dashboards:**
- **Dashboard Index:** http://localhost:3000/dashboards
- **Workforce Dashboard:** http://localhost:3000/dashboards/workforce
- **Exit Survey FY25:** http://localhost:3000/dashboards/exit-survey-fy25
- **Turnover Dashboard:** http://localhost:3000/dashboards/turnover

## 🛠️ Development Setup

### Prerequisites
- **Node.js** 18+ and **npm**
- **Git**

### Session Start Checklist

**Run this at the beginning of each coding session:**

```bash
# Navigate to project
cd hr-reports-json-data

# Pull latest changes
git pull

# Install/update dependencies
npm install

# Start development server
npm start
```

## 🔄 Development Workflow

```bash
# Start development server with hot reload
npm start  # http://localhost:3000

# Run tests in watch mode
npm test

# Build for production
npm run build:production

# Analyze bundle size
npm run analyze
```

## 📋 Available Commands

### Dashboard Commands
```bash
# Development
npm start              # Start development server (port 3000)
npm test               # Run tests in watch mode
npm run dev:test       # Run tests once
npm run dev:build      # Build production version

# Build & Optimization
npm run build          # Build for production
npm run build:production  # Build without source maps
npm run analyze        # Analyze bundle size
npm run optimize       # Build and analyze

# Shortcuts
npm run dev            # Alias for npm start
```

### Data Import Commands (New!)
```bash
# Interactive Wizard (Recommended)
npm run import:wizard        # Guided import process

# Clean Data (Remove PII, Validate)
npm run clean:workforce      # Clean workforce Excel files
npm run clean:terminations   # Clean terminations data

# Validate Data
npm run validate:all         # Cross-source validation

# Advanced (Manual Import)
node scripts/data-import.js workforce file.xlsx --quarter FY25_Q2
node scripts/merge-to-static-data.js workforce --date 2024-12-31 --input summary.json
```

**💡 Tip:** Use `npm run import:wizard` for the easiest data import experience!

## 🔧 When to Rebuild Docker

**Always rebuild the Docker container when:**
- Starting a new coding session
- Switching branches
- Dependencies change (package.json modified)
- Docker configuration changes
- After major code changes
- Before demos or presentations

## 🏗️ Project Structure

```
src/
├── components/
│   ├── charts/           # Chart components
│   ├── dashboards/       # Dashboard pages
│   └── ui/              # Reusable UI components
├── contexts/            # React Context providers
├── data/               # Data files and API layer
├── hooks/              # Custom React hooks
├── services/           # Service layer (JSON data management)
├── styles/             # CSS files
└── utils/              # Utility functions
```

## 📊 Available Dashboards

- **Workforce Dashboard** - Enhanced workforce analytics with division breakdowns
- **Combined Workforce Analytics** - Comprehensive workforce metrics
- **Turnover Dashboard** - Employee turnover analysis
- **I-9 Health Dashboard** - Compliance monitoring
- **Recruiting Dashboard** - Recruitment metrics
- **Exit Survey Dashboard** - Exit interview analytics

## 🌐 Technology Stack

- **React 19.1.0** - Frontend framework
- **Tailwind CSS 3.4.17** - Styling
- **Recharts 3.0.0** - Data visualization
- **JSON Data Architecture** - Local file-based data management
- **Docker** - Containerization
- **React Router DOM** - Navigation
- **Jest & React Testing Library** - Testing

## 📁 Data Architecture

**JSON-Based Data Management:**
- **Local JSON Files** - All data stored in `/public/data/` directory
- **File Organization** - Organized by data type (workforce, compliance, turnover, etc.)
- **Quarter-Based Structure** - Data organized by reporting periods (e.g., `2024-06-30.json`)
- **No External Dependencies** - Self-contained, no cloud database required
- **Easy Data Management** - JSON file-based data operations with validation
- **Version Control Friendly** - JSON files can be tracked and versioned with Git

**Data Location:**
```
public/data/
├── workforce/     # Workforce analytics data
├── compliance/    # I-9 compliance data  
├── turnover/      # Employee turnover data
├── recruiting/    # Recruitment metrics
└── exit-survey/   # Exit interview data
```

## 🤝 Contributing

1. **Start session**: Rebuild Docker container
2. **Development**: Use `npm start` for fast iteration
3. **Testing**: Use Docker for production testing
4. **Commit**: Ensure Docker build succeeds before committing

## 📝 Development Notes

- **Cross-platform**: Always test in Docker before committing
- **Hot reload**: Use `npm start` for active development
- **Production testing**: Use Docker for final validation
- **Demos**: Always use Docker for presentations

## 🐛 Troubleshooting

### Docker Issues
```bash
# Clean rebuild
docker-compose down
docker system prune -f
docker-compose build --no-cache
docker-compose up -d
```

### Port Conflicts
- Development server: http://localhost:3000
- Ensure no other services are using port 3000

### Build Failures
- Run `npm install` to update dependencies
- Check Docker daemon is running
- Verify all files are saved before building

---

**For detailed development workflows and best practices, see [CLAUDE.md](./CLAUDE.md)**