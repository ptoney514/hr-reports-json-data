# Error Log

## December 2024 - Q4 FY25 Exit Count Mismatch
**Error**: Exit survey showed 62 exits but turnover data showed 51
**Context**: Validating Q4 FY25 dashboard data
**Root Cause**: Hardcoded test value not updated after data sync
**Solution**:
1. Ran `node scripts/syncTurnoverToStaticData.js`
2. Updated all references to use synced data
3. Added validation script to prevent future mismatches
**Prevention**: Always run `npm run data:validate` after updates

## December 2024 - Response Rate Calculation Error
**Error**: Response rate showing as 29% instead of 35.3%
**Context**: Exit survey dashboard calculations
**Root Cause**: Using wrong denominator (total surveys vs total exits)
**Solution**: Fixed calculation to use actual exit counts
**Prevention**: Document calculation methodology in EXIT_SURVEY_METHODOLOGY.md

## December 2024 - Webpack Dev Server Warnings
**Error**: DeprecationWarning for onAfterSetupMiddleware
**Context**: Starting development server with npm start
**Root Cause**: Webpack config using deprecated options
**Solution**: Need to update to use setupMiddlewares option
**Prevention**: Keep dependencies updated, monitor deprecation warnings

## Common Errors

### Data Sync Issues
**Symptoms**:
- Dashboard shows different numbers than expected
- Charts not matching data tables
- Validation script reports mismatches

**Root Causes**:
- Excel file not processed after update
- Sync script not run after processing
- Manual edits to staticData.js

**Quick Fix**:
```bash
npm run data:update
```

**Proper Fix**:
1. Process latest Excel: `node scripts/processTurnoverData.js`
2. Sync to static: `node scripts/syncTurnoverToStaticData.js`
3. Validate: `node scripts/validateExitSurveyData.js`

### Chart Not Rendering
**Symptoms**:
- Empty chart container
- Console errors about data format
- Charts showing but no data points

**Root Causes**:
- Data is null/undefined
- Wrong data structure for Recharts
- Container has no dimensions

**Quick Fix**:
Check data exists and format matches:
```javascript
// Recharts expects array of objects
const chartData = [
  { name: 'Q1', value: 100 },
  { name: 'Q2', value: 150 }
];
```

**Proper Fix**:
1. Add null checks in component
2. Validate data structure matches chart requirements
3. Ensure ResponsiveContainer has proper parent dimensions

### ESLint Unused Variable Warnings
**Symptoms**:
- Build shows warnings about unused imports
- Variables defined but never used
- Anonymous default export warnings

**Root Causes**:
- Leftover imports from refactoring
- Commented out code leaving variables unused
- Missing variable name for default exports

**Quick Fix**:
```bash
# Auto-fix some issues
npx eslint --fix src/
```

**Proper Fix**:
1. Remove unused imports manually
2. Delete or use declared variables
3. Name default exports properly

### Build Size Too Large
**Symptoms**:
- Slow initial page load
- Large bundle size warnings
- Poor Lighthouse scores

**Root Causes**:
- Unoptimized images in public folder
- Importing entire libraries
- No code splitting

**Quick Fix**:
```bash
# Analyze bundle
npm run analyze
```

**Proper Fix**:
1. Compress images: Use WebP format, resize appropriately
2. Use specific imports: `import { specific } from 'library'`
3. Implement lazy loading for routes

### Excel Processing Errors
**Symptoms**:
- Script crashes when processing Excel
- Wrong data extracted
- Missing sheets or columns

**Root Causes**:
- Excel format changed
- Wrong sheet name
- Column headers modified

**Quick Fix**:
```bash
# Inspect Excel structure
node scripts/inspectAllSheets.js
```

**Proper Fix**:
1. Update column mappings in processing script
2. Handle missing columns gracefully
3. Add validation for required fields

### Mobile Layout Issues
**Symptoms**:
- Charts overflow on mobile
- Text too small to read
- Navigation menu broken

**Root Causes**:
- Fixed widths instead of responsive
- Missing mobile breakpoints
- Chart legends too large

**Quick Fix**:
Add responsive classes:
```jsx
className="w-full md:w-1/2 lg:w-1/3"
```

**Proper Fix**:
1. Use Tailwind responsive utilities
2. Test all breakpoints
3. Consider mobile-first design

## Error Prevention Checklist

### Before Committing
- [ ] Run `npm run data:validate`
- [ ] Check for console errors
- [ ] Fix ESLint warnings
- [ ] Test on mobile viewport
- [ ] Verify data accuracy

### After Data Updates
- [ ] Process new Excel files
- [ ] Run sync scripts
- [ ] Validate all dashboards
- [ ] Document any external data
- [ ] Update PROJECT_STATUS.md

### During Development
- [ ] Use TypeScript for type safety
- [ ] Add error boundaries to components
- [ ] Include loading and error states
- [ ] Write defensive code (null checks)
- [ ] Test edge cases

## Useful Debugging Commands

```bash
# Check data consistency
npm run data:validate

# Inspect Excel structure
node scripts/inspectExcelData.js

# Test calculations
node scripts/testCalculations.js

# Analyze bundle size
npm run analyze

# Run ESLint
npx eslint src/

# Check for outdated packages
npm outdated

# Clean install dependencies
rm -rf node_modules package-lock.json && npm install
```

## Support Resources

### Documentation
- EXIT_SURVEY_METHODOLOGY.md - Calculation methods
- TURNOVER_METHODOLOGY.md - Data processing logic
- WORKFLOW_GUIDE.md - Standard procedures
- TECHNICAL_DEBT.md - Known issues

### Key Files for Debugging
- `/src/data/staticData.js` - Main data source
- `/scripts/` - All processing scripts
- `/source-metrics/` - Raw data files
- Browser DevTools - Network and Console tabs

---

*Log new errors as they occur. Include full error messages, context, and solutions.*