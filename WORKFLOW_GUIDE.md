# Workflow Guide

## Development Workflow

### Starting a New Feature
1. Update PROJECT_STATUS.md with the new goal
2. Create feature branch: `git checkout -b feature/feature-name`
3. Use TodoWrite tool to plan tasks
4. Implement feature with simplicity focus
5. Test thoroughly before marking complete
6. Update documentation as you go
7. Clean up any ESLint warnings

### Testing Checklist
- [ ] Component renders without errors
- [ ] Data displays correctly
- [ ] Charts update with data changes
- [ ] No console errors or warnings
- [ ] Accessibility standards met (WCAG 2.1 AA)
- [ ] Mobile responsive layout works
- [ ] Print layout displays properly

### Deployment Process
1. Ensure all tests pass: `npm test`
2. Build production bundle: `npm run build`
3. Check bundle size: `npm run analyze`
4. Test production build locally
5. Commit changes with proper format
6. Create pull request to main

### Common Tasks

#### Adding a New Dashboard
```bash
# 1. Create component file
src/components/dashboards/NewDashboard.jsx

# 2. Add route in App.js
<Route path="/new-dashboard" element={<NewDashboard />} />

# 3. Add navigation link in Navigation.jsx
{ path: '/new-dashboard', label: 'New Dashboard', icon: IconName }

# 4. Create data hook if needed
src/hooks/useNewDashboardData.js
```

#### Processing New Data from Excel
```bash
# 1. Place Excel file in source-metrics folder
source-metrics/[category]/data.xlsx

# 2. Run processing script
node scripts/processNewData.js

# 3. Sync to static data
npm run data:sync

# 4. Validate consistency
npm run data:validate

# 5. Test dashboards locally
npm start
```

#### Updating Exit Survey Data
```bash
# Complete workflow in one command
npm run data:update

# Or run individually:
node scripts/processTurnoverData.js
node scripts/syncTurnoverToStaticData.js
node scripts/validateExitSurveyData.js
```

#### Debugging Data Issues
1. Check source files: `ls source-metrics/`
2. Inspect Excel structure: `node scripts/inspectExcelData.js`
3. Validate calculations: `node scripts/testCalculations.js`
4. Check consistency: `npm run data:validate`
5. Review logs in console output

## Code Standards

### Component Structure
```jsx
// Standard React component structure
import React from 'react';
import { useCustomHook } from '../../hooks/useCustomHook';
import ChartComponent from '../charts/ChartComponent';

const DashboardComponent = () => {
  const { data, loading, error } = useCustomHook();

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="dashboard-container">
      {/* Component content */}
    </div>
  );
};

export default DashboardComponent;
```

### Naming Conventions
- **Components**: PascalCase (e.g., `WorkforceDashboard.jsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useWorkforceData.js`)
- **Utilities**: camelCase (e.g., `calculateTurnoverRate.js`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_CHART_OPTIONS`)
- **CSS Classes**: kebab-case (e.g., `dashboard-header`)

### File Organization
```
src/
├── components/
│   ├── charts/        # Reusable chart components
│   ├── dashboards/    # Dashboard page components
│   └── ui/           # UI components (nav, cards, etc.)
├── hooks/            # Custom React hooks
├── services/         # Data services and utilities
├── data/            # Static JSON data files
└── styles/          # Global styles (if any)
```

### Data Management Rules
1. **Single Source of Truth**: All data in `/src/data/staticData.js`
2. **No Direct Mutations**: Always create new objects/arrays
3. **Validate External Data**: Check HR slide data comments
4. **Document Data Sources**: Add comments for external data
5. **Maintain Consistency**: Use data sync scripts

### Git Commit Messages
```bash
# Format: type: description

feat: Add workforce CSV processing
fix: Correct exit survey calculations
enhance: Improve dashboard performance
docs: Update workflow documentation
refactor: Simplify data processing logic
test: Add component unit tests
chore: Update dependencies
```

## Data Processing Workflows

### Monthly Data Update Process
1. **Receive Data from HR**
   - Exit survey PDFs (quarterly)
   - Turnover Excel (monthly)
   - Workforce metrics (pending CSV)

2. **Process Raw Data**
   ```bash
   # Process turnover data
   node scripts/processTurnoverData.js

   # Generate analysis
   node scripts/analyzeFY25ExitSurveys.js
   ```

3. **Sync and Validate**
   ```bash
   # Run complete update workflow
   npm run data:update
   ```

4. **Review Changes**
   - Check Data Validation dashboard
   - Verify metrics accuracy
   - Test all affected dashboards

5. **Commit and Document**
   - Update PROJECT_STATUS.md
   - Commit with descriptive message
   - Note any data anomalies

### Adding External Data (HR Slides)
1. Save slide image: `source-metrics/hr-slides/fy25/slide-name.png`
2. Update values in `staticData.js` with comment:
   ```javascript
   // External data from HR slide (Dec 2024)
   facultyTurnoverByDivision: { /* values */ }
   ```
3. Document in `/docs/NON_CALCULABLE_DATA_SOURCES.md`
4. Test affected dashboards

## Quality Assurance

### Pre-Commit Checklist
- [ ] No ESLint errors or warnings
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Data validated
- [ ] Console free of errors
- [ ] Bundle size checked

### Code Review Focus Areas
1. **Simplicity**: Is the solution as simple as possible?
2. **Performance**: Are there unnecessary re-renders?
3. **Accessibility**: WCAG 2.1 AA compliance?
4. **Data Accuracy**: Are calculations correct?
5. **Error Handling**: Are edge cases covered?
6. **Documentation**: Is the code self-documenting?

## Troubleshooting

### Common Issues and Solutions

#### Dashboard Not Loading
- Check console for errors
- Verify data exists in staticData.js
- Ensure route is configured in App.js
- Check navigation link is present

#### Data Mismatch
- Run `npm run data:validate`
- Check source Excel files
- Verify processing scripts
- Review calculation logic

#### Chart Not Rendering
- Verify data format matches Recharts requirements
- Check for null/undefined values
- Ensure container has dimensions
- Review responsive container setup

#### Build Failures
- Clear node_modules: `rm -rf node_modules && npm install`
- Check for TypeScript errors
- Verify all imports are correct
- Review webpack configuration

## Performance Optimization

### Best Practices
1. **Use React.memo** for expensive components
2. **Implement useMemo** for complex calculations
3. **Lazy load** dashboard components
4. **Optimize images** before adding to project
5. **Minimize bundle size** with tree shaking
6. **Cache data** where appropriate

### Monitoring Performance
```bash
# Analyze bundle size
npm run analyze

# Check React DevTools Profiler
# Use Chrome Performance tab
# Monitor Network tab for slow requests
```

## Accessibility Guidelines

### Required Standards
- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Proper ARIA labels
- Sufficient color contrast (4.5:1 minimum)

### Testing Accessibility
1. Use keyboard-only navigation
2. Test with screen reader (NVDA/JAWS)
3. Check color contrast ratios
4. Verify focus indicators
5. Test at different zoom levels

---

*This guide covers standard procedures. For project context, see CLAUDE.md. For current status, see PROJECT_STATUS.md.*