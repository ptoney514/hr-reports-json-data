# Technical Debt Register

## High Priority (Address Soon)

### ESLint Warning Cleanup
- **Issue**: 30+ unused variable warnings across components
- **Impact**: Code quality, potential bugs, build warnings
- **Solution**: Remove unused imports and variables, fix anonymous exports
- **Estimate**: 2-3 hours
- **Files Affected**:
  - `src/components/dashboards/DataValidation.jsx`
  - `src/components/dashboards/DashboardIndex.jsx`
  - `src/components/dashboards/WorkforceDashboard.jsx`
  - `src/services/dataValidationService.js`
  - Multiple chart components

### Bundle Size Optimization
- **Issue**: Large image files (25MB+) in public folder
- **Impact**: Slow initial load, poor performance on mobile
- **Solution**: Compress images, implement lazy loading, use WebP format
- **Estimate**: 3-4 hours
- **Files Affected**:
  - `public/images/employee-experience.jpg` (27MB)
  - `public/images/total-reward-bg.jpg` (25MB)
  - `public/images/hero-bg.jpg` (12MB)

### Test Coverage Gap
- **Issue**: No automated tests for components or data processing
- **Impact**: Risk of regressions, manual testing burden
- **Solution**: Add Jest tests for critical components and data functions
- **Estimate**: 2-3 days
- **Priority Components**:
  - Data processing scripts
  - Dashboard components
  - Chart components

## Medium Priority

### Webpack Dev Server Deprecation Warnings
- **Issue**: Using deprecated middleware options
- **Impact**: Console warnings, future compatibility issues
- **Solution**: Update webpack configuration to use new setupMiddlewares
- **Estimate**: 1-2 hours

### Mobile Responsive Issues
- **Issue**: Charts and legends overlap on small screens
- **Impact**: Poor mobile user experience
- **Solution**: Implement responsive chart sizing, mobile-specific layouts
- **Estimate**: 4-5 hours

### Data Loading States
- **Issue**: Inconsistent loading states across dashboards
- **Impact**: User confusion, perceived performance issues
- **Solution**: Create standardized loading component
- **Estimate**: 2-3 hours

### Error Handling Improvements
- **Issue**: Generic error messages, no recovery options
- **Impact**: Poor user experience when errors occur
- **Solution**: Implement detailed error boundaries with retry logic
- **Estimate**: 3-4 hours

## Low Priority

### Code Duplication
- **Issue**: Similar data processing logic repeated across hooks
- **Impact**: Maintenance burden, potential inconsistencies
- **Solution**: Extract common logic to utility functions
- **Estimate**: 4-5 hours

### Print Layout Issues
- **Issue**: Charts cut off, labels missing in print view
- **Impact**: Reports not printer-friendly
- **Solution**: Create print-specific CSS, test all dashboards
- **Estimate**: 3-4 hours

### Performance Monitoring
- **Issue**: No performance metrics or monitoring
- **Impact**: Can't identify performance degradation
- **Solution**: Implement performance monitoring, add metrics
- **Estimate**: 1 day

### Documentation Gaps
- **Issue**: Missing component documentation
- **Impact**: Onboarding difficulty, maintenance challenges
- **Solution**: Add JSDoc comments, create component library docs
- **Estimate**: 2-3 days

## Security Vulnerabilities (npm audit)

**Last Updated**: January 2025
**Status**: 12 vulnerabilities (reduced from 21 after `npm audit fix`)

### Remaining Vulnerabilities

| Package | Severity | Issue | Status |
|---------|----------|-------|--------|
| **xlsx** | HIGH | Prototype Pollution, ReDoS | **NO FIX AVAILABLE** |
| **jspdf** | CRITICAL | Path Traversal (CVE) | Requires breaking change (v4.0.0) |
| eslint | Moderate | Stack Overflow | Nested in react-scripts |
| nth-check/svgo | High | ReDoS | Nested in react-scripts |
| postcss | Moderate | Parsing error | Nested in react-scripts |
| webpack-dev-server | Moderate | Source code exposure | Nested in react-scripts |

### Risk Assessment & Mitigations

#### xlsx (HIGH - No Fix Available)
- **Usage**: Excel export/import in data processing scripts
- **Risk**: Prototype pollution when parsing untrusted XLSX files
- **Mitigation**: Only parse trusted internal HR data files (not user uploads)
- **Future**: Consider migrating to `exceljs` package (GitHub Issue needed)

#### jspdf (CRITICAL)
- **Usage**: PDF report generation
- **Risk**: Local file inclusion/path traversal vulnerability
- **Mitigation**: Only generates PDFs client-side from controlled data, no file path inputs
- **Future**: Evaluate jspdf v4.0.0 for breaking changes compatibility

#### react-scripts Dependencies (Moderate/High)
- **Usage**: Development tooling only
- **Risk**: Limited to dev environment, NOT shipped to production
- **Mitigation**: Dev-only dependencies don't affect end users
- **Future**: Consider migrating to Vite (would eliminate these)

### Packages Successfully Updated (Jan 2025)
- glob: 10.4.5 → 10.5.0
- react-router-dom: 6.30.2 → 6.30.3
- react-router: 6.30.2 → 6.30.3
- @remix-run/router: 1.23.1 → 1.23.2
- qs: 6.13.0 → 6.14.1
- node-forge: 1.3.1 → 1.3.3
- lodash: 4.17.21 → 4.17.23
- express: 4.21.2 → 4.22.1
- body-parser: 1.20.3 → 1.20.4

## Accepted Debt

### External Data Dependencies
- **Reason**: HR slide data cannot be calculated from raw data
- **Acceptance**: Manual process acceptable for quarterly updates
- **Mitigation**: Clear documentation in NON_CALCULABLE_DATA_SOURCES.md

### No Backend API
- **Reason**: Simple JSON files sufficient for current needs
- **Acceptance**: Trade-off for simplicity and deployment ease
- **Future**: Consider API when user auth or real-time updates needed

### Manual Data Updates
- **Reason**: HR provides data in various formats quarterly/monthly
- **Acceptance**: Automated scripts reduce manual work to minimum
- **Future**: Work with HR to standardize data formats

### Limited Browser Support
- **Reason**: Modern React features require recent browsers
- **Acceptance**: Internal tool, controlled environment
- **Mitigation**: Document minimum browser requirements

## Debt Metrics

### Current State
- **High Priority Items**: 3
- **Medium Priority Items**: 4
- **Low Priority Items**: 4
- **Estimated Total Work**: 10-12 days

### Debt Ratio
- **New Features vs Debt Work**: 70/30
- **Target Ratio**: 80/20
- **Debt Payment Rate**: 1-2 items per sprint

## Prevention Strategies

### Code Quality
1. Run ESLint before commits
2. Regular code reviews
3. Maintain consistent patterns
4. Document as you code

### Performance
1. Monitor bundle size on each build
2. Lazy load heavy components
3. Optimize images before adding
4. Profile React components regularly

### Testing
1. Write tests for new features
2. Maintain minimum coverage threshold
3. Test on mobile devices
4. Accessibility testing required

### Documentation
1. Update docs with code changes
2. Document decisions in PROJECT_STATUS.md
3. Keep WORKFLOW_GUIDE.md current
4. Log errors in ERROR_LOG.md

## Next Debt Payment Sprint

### Target: Q1 2025
1. Clean up all ESLint warnings
2. Optimize image assets
3. Add basic test coverage
4. Fix mobile responsive issues

### Success Criteria
- Zero ESLint warnings
- Bundle size < 2MB
- 50% test coverage
- Mobile-friendly all dashboards

---

*Review this document quarterly. Update priorities based on user feedback and development needs.*