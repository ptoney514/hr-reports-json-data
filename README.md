# HR Reports Project

A comprehensive React-based dashboard application for I-9 compliance health monitoring and HR analytics. Features multiple dashboards, comprehensive testing infrastructure, WCAG 2.1 AA accessibility compliance, database integration, and enterprise-level performance optimization.

## 🚀 Quick Start (Docker - Recommended)

**For consistent cross-platform development (Mac/PC):**

```bash
# 1. Clone the repository
git clone <repository-url>
cd hr-trio-reports

# 2. Build and start Docker container
docker-compose build --no-cache
docker-compose up -d

# 3. Open the application
# Navigate to: http://localhost:3000
```

**Access the Enhanced Workforce Dashboard:**
- URL: http://localhost:3000/dashboards/enhanced-workforce

## 🛠️ Development Setup

### Prerequisites
- **Docker** and **Docker Compose** (recommended)
- **Node.js** 18+ and **npm** (for local development)
- **Git**

### Session Start Checklist

**Run this at the beginning of each coding session:**

```bash
# Navigate to project
cd hr-trio-reports

# Pull latest changes (if team project)
git pull

# Install dependencies
npm install

# Rebuild Docker with latest changes
docker-compose down && docker-compose build --no-cache && docker-compose up -d
```

## 🔄 Development Workflows

### Option 1: Development-First (Recommended)
```bash
# Fast development with hot reload
npm start  # http://localhost:3000

# When ready to test production build
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Option 2: Docker-First (Maximum Consistency)
```bash
# Always use Docker for development
docker-compose down && docker-compose build --no-cache && docker-compose up -d
```

## 📋 Available Commands

### Development
```bash
# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

### Docker
```bash
# Build and start container
docker-compose build --no-cache && docker-compose up -d

# View running containers
docker ps

# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Clean up Docker system
docker system prune -f
```

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
├── services/           # Service layer (Firebase, etc.)
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
- **Firebase 11.2.0** - Cloud database
- **Docker** - Containerization
- **React Router DOM** - Navigation
- **Jest & React Testing Library** - Testing

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