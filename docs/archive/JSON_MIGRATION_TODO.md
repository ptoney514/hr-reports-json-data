# JSON Migration - Remove Firebase Complexity

## Overview
This comprehensive migration plan transforms the HR Reports application from Firebase-based data management to a simplified JSON file approach. The goal is to reduce codebase complexity by ~80% while maintaining all dashboard functionality.

**Migration Scope**: Remove Firebase dependencies, simplify data hooks, create JSON-based data storage, and streamline the application architecture.

## Phase 1: Data Setup (Day 1 Morning)
- [ ] Create /public/data/workforce/ directory structure
- [ ] Create /public/data/turnover/ directory structure  
- [ ] Create /public/data/compliance/ directory structure
- [ ] Create /public/data/recruiting/ directory structure
- [ ] Create /public/data/exit-survey/ directory structure
- [ ] Generate JSON files for 5 reporting dates:
  - [ ] 2025-06-30.json (Q2 2025)
  - [ ] 2025-03-31.json (Q1 2025)
  - [ ] 2024-12-31.json (Q4 2024)
  - [ ] 2024-09-30.json (Q3 2024)
  - [ ] 2024-06-30.json (Q2 2024)
- [ ] Test JSON loading in browser console
- [ ] Validate JSON structure matches Firebase data format

## Phase 2: Create Simple Hooks (Day 1 Afternoon) 
- [ ] Create new useWorkforceData.js (~100 lines)
  - [ ] Replace useFirebaseWorkforceData.js functionality
  - [ ] Add JSON file loading logic
  - [ ] Include comparison logic for YoY and QoQ
  - [ ] Add error handling for missing files
- [ ] Create new useTurnoverData.js (~100 lines)
  - [ ] Replace useFirebaseTurnoverData.js functionality
  - [ ] Add JSON file loading and processing
  - [ ] Include turnover calculation logic
- [ ] Create new useComplianceData.js (~100 lines)
  - [ ] Replace useFirebaseComplianceData.js functionality
  - [ ] Add I-9 compliance data processing
  - [ ] Include risk assessment calculations
- [ ] Create new useRecruitingData.js (~100 lines)
  - [ ] Replace useFirebaseRecruitingData.js functionality
  - [ ] Add recruiting metrics processing
- [ ] Create new useExitSurveyData.js (~100 lines)
  - [ ] Replace useFirebaseExitSurveyData.js functionality
  - [ ] Add exit survey data processing
- [ ] Test data loading and calculations for all hooks

## Phase 3: Remove Firebase Dependencies (Day 2 Morning)
- [ ] Delete Firebase service files:
  - [ ] Delete src/services/FirebaseService.js
  - [ ] Delete src/config/firebase.js
  - [ ] Delete src/utils/firebaseDiagnostic.js
  - [ ] Delete src/utils/firebaseMigration.js
  - [ ] Delete src/utils/simpleFirebaseTest.js
- [ ] Delete Firebase hooks:
  - [ ] Delete src/hooks/useFirebaseWorkforceData.js
  - [ ] Delete src/hooks/useFirebaseTurnoverData.js
  - [ ] Delete src/hooks/useFirebaseComplianceData.js
  - [ ] Delete src/hooks/useFirebaseRecruitingData.js
  - [ ] Delete src/hooks/useFirebaseExitSurveyData.js
  - [ ] Delete src/hooks/useFirebaseEmployeeData.js
- [ ] Remove firebase from package.json dependencies
- [ ] Run npm install to clean dependencies
- [ ] Remove Firebase test components:
  - [ ] Delete src/components/testing/FirebaseTestComponent.jsx

## Phase 4: Update Dashboard Components (Day 2 Afternoon)
- [ ] Update CombinedWorkforceDashboard.jsx:
  - [ ] Replace useFirebaseWorkforceData with useWorkforceData
  - [ ] Remove real-time indicators and Firebase status
  - [ ] Remove Firebase-related state management
  - [ ] Test all charts render correctly with JSON data
- [ ] Update TurnoverDashboard.jsx:
  - [ ] Replace Firebase hook with new JSON hook
  - [ ] Update data processing logic
  - [ ] Verify calculations work with JSON data
- [ ] Update I9HealthDashboard.tsx:
  - [ ] Replace Firebase hook with JSON hook
  - [ ] Update compliance calculations
  - [ ] Test risk assessment functionality
- [ ] Update RecruitingDashboard.jsx:
  - [ ] Replace Firebase hook with JSON hook
  - [ ] Update recruiting metrics display
- [ ] Update ExitSurveyDashboard.jsx:
  - [ ] Replace Firebase hook with JSON hook
  - [ ] Update survey data processing
- [ ] Update EmployeeImportDashboard.jsx:
  - [ ] Remove Firebase import functionality
  - [ ] Replace with JSON file generation
  - [ ] Update import confirmation logic

## Phase 5: Simplify Context Management (Day 3 Morning)
- [ ] Simplify DataSourceContext.js:
  - [ ] Remove all Firebase-related state
  - [ ] Keep only current reporting date tracking
  - [ ] Remove real-time synchronization logic
  - [ ] Remove caching logic from context
- [ ] Update DashboardContext.jsx:
  - [ ] Remove Firebase dependencies
  - [ ] Simplify state management
  - [ ] Update data loading logic
- [ ] Remove Firebase context references from components

## Phase 6: Create JSON Data Management (Day 3 Afternoon)
- [ ] Create simple JSON data editor component:
  - [ ] Build JsonDataEditor.jsx for inline editing
  - [ ] Add upload/edit functionality for JSON files
  - [ ] Add validation for JSON structure
  - [ ] Create save functionality to public/data/ directories
- [ ] Replace admin dashboard functionality:
  - [ ] Remove Firebase admin components
  - [ ] Replace with JSON file management
  - [ ] Update QuarterlyDataTable for JSON operations
  - [ ] Update EditModal for JSON data editing
- [ ] Test JSON file operations:
  - [ ] Test file upload and validation
  - [ ] Test inline editing and saving
  - [ ] Test data integrity after edits

## Phase 7: Remove Unused Services (Day 4 Morning)
- [ ] Delete services no longer needed:
  - [ ] Delete src/services/DataMigrationService.js
  - [ ] Review and clean src/services/DataService.js (remove Firebase parts)
  - [ ] Delete src/services/QuarterComparisonService.js (if Firebase-dependent)
- [ ] Delete database-related files:
  - [ ] Delete src/database/ directory entirely
  - [ ] Remove database references from components
- [ ] Clean up utilities:
  - [ ] Remove Firebase-dependent utilities
  - [ ] Keep only JSON processing utilities
  - [ ] Update remaining utilities for JSON compatibility

## Phase 8: Update Testing Infrastructure (Day 4 Afternoon)
- [ ] Update test files:
  - [ ] Remove Firebase testing components
  - [ ] Update component tests to use JSON mocks
  - [ ] Update integration tests for JSON data flow
- [ ] Update test data:
  - [ ] Replace Firebase test data with JSON fixtures
  - [ ] Update test utilities for JSON operations
- [ ] Run full test suite:
  - [ ] Fix any failing tests due to Firebase removal
  - [ ] Ensure all dashboards work with JSON data
  - [ ] Verify export functionality still works

## Phase 9: Performance and Cleanup (Day 5)
- [ ] Code cleanup:
  - [ ] Remove unused imports throughout codebase
  - [ ] Delete unused variables and functions
  - [ ] Clean up commented Firebase code
- [ ] Performance verification:
  - [ ] Test application performance with JSON loading
  - [ ] Verify bundle size reduction
  - [ ] Check memory usage improvements
- [ ] Documentation updates:
  - [ ] Update CLAUDE.md to remove Firebase references
  - [ ] Update README.md with JSON data approach
  - [ ] Update CHANGELOG.md with migration details
  - [ ] Create JSON_DATA_STRUCTURE.md documentation

## Validation Checklist
- [ ] All 5 dashboards working with JSON data:
  - [ ] Combined Workforce Dashboard
  - [ ] Turnover Dashboard
  - [ ] I-9 Health Dashboard
  - [ ] Recruiting Dashboard
  - [ ] Exit Survey Dashboard
- [ ] No Firebase dependencies remaining in package.json
- [ ] All Firebase files deleted from codebase
- [ ] JSON data editor functional for all data types
- [ ] Application builds without Firebase errors
- [ ] Bundle size significantly reduced (~80% less code)
- [ ] Performance acceptable without real-time features
- [ ] Export functionality (PDF, Excel, CSV) still works
- [ ] All tests passing with JSON data mocks

## Expected Benefits After Migration
1. **Reduced Complexity**: ~80% reduction in codebase complexity
2. **Simplified Architecture**: No external dependencies for data storage
3. **Faster Development**: No Firebase setup required for development
4. **Better Performance**: No network calls for data loading
5. **Easier Deployment**: Self-contained application with JSON files
6. **Simplified Testing**: JSON mocks easier than Firebase emulators
7. **Cost Reduction**: No Firebase hosting/database costs
8. **Better Version Control**: JSON data files in git for change tracking

## Rollback Plan
If migration encounters critical issues:
1. Keep Firebase code in separate branch before deletion
2. Firebase service files backed up in `/backup-firebase/` directory
3. Database schema documentation maintained
4. Quick restore process documented in ROLLBACK.md

## Files to Delete (Complete List)
### Firebase Services
- src/services/FirebaseService.js
- src/config/firebase.js
- src/services/DataMigrationService.js (if Firebase-dependent)

### Firebase Hooks
- src/hooks/useFirebaseWorkforceData.js
- src/hooks/useFirebaseeTurnoverData.js
- src/hooks/useFirebaseComplianceData.js
- src/hooks/useFirebaseRecruitingData.js
- src/hooks/useFirebaseExitSurveyData.js
- src/hooks/useFirebaseEmployeeData.js

### Firebase Utilities
- src/utils/firebaseDiagnostic.js
- src/utils/firebaseMigration.js
- src/utils/simpleFirebaseTest.js

### Database Files
- src/database/ (entire directory)
- src/database/HRDatabase.js
- src/database/testDatabase.js
- src/database/migrations/
- src/database/schemas/

### Firebase Test Components
- src/components/testing/FirebaseTestComponent.jsx

## Files to Create (New JSON System)
### JSON Data Hooks
- src/hooks/useWorkforceData.js
- src/hooks/useTurnoverData.js
- src/hooks/useComplianceData.js
- src/hooks/useRecruitingData.js
- src/hooks/useExitSurveyData.js

### JSON Management Components
- src/components/admin/JsonDataEditor.jsx
- src/components/admin/JsonFileUploader.jsx
- src/components/admin/JsonValidator.jsx

### JSON Utilities
- src/utils/jsonDataLoader.js
- src/utils/jsonDataValidator.js
- src/utils/jsonDataProcessor.js

### Data Directories
- public/data/workforce/
- public/data/turnover/
- public/data/compliance/
- public/data/recruiting/
- public/data/exit-survey/

### Documentation
- JSON_DATA_STRUCTURE.md
- JSON_MIGRATION_GUIDE.md
- ROLLBACK.md

---

## Review Section
*This section will be updated as migration phases are completed with summaries of changes and relevant information.*

## Migration Status: READY TO BEGIN
**Prerequisites**: All Firebase functionality currently working and backed up
**Risk Level**: Medium - Comprehensive testing required
**Timeline**: 5 days for complete migration
**Success Criteria**: All dashboards functional with JSON data, 80% code reduction achieved