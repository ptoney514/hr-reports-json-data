import React, { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { 
  Upload, 
  Filter, 
  Download, 
  AlertCircle, 
  CheckCircle,
  Users,
  Building,
  Calendar,
  Database
} from 'lucide-react';
import { useFirebaseEmployeeData } from '../../hooks/useFirebaseEmployeeData';
import EmployeeFilterPanel from '../filters/EmployeeFilterPanel';
import EmployeeSummaryCards from '../cards/EmployeeSummaryCards';
import EmployeeDetailedBreakdown from '../cards/EmployeeDetailedBreakdown';

const EmployeeImportDashboard = () => {
  const [uploadedData, setUploadedData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    endDate: '',
    assignmentCodes: [],
    personType: 'ALL',
    newSchool: ''
  });
  const [uploadError, setUploadError] = useState(null);
  const [showAggregateImportModal, setShowAggregateImportModal] = useState(false);
  const [aggregateImportProgress, setAggregateImportProgress] = useState(null);
  const [existingAggregateData, setExistingAggregateData] = useState(null);
  const [cleanupProgress, setCleanupProgress] = useState(null);
  
  const { 
    importAggregateWorkforceData,
    getAggregateWorkforceData,
    clearAllIndividualEmployeeData,
    loading, 
    error 
  } = useFirebaseEmployeeData();

  // Helper function to sort dates in descending order (newest first)
  const sortDatesDescending = (dates) => {
    return [...new Set(dates)]
      .filter(date => date) // Remove empty dates
      .sort((a, b) => new Date(b) - new Date(a)); // Sort newest first
  };

  // File upload handler using existing React Dropzone
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadError(null);
    
    try {
      const data = await parseExcelFile(file);
      setUploadedData(data);
      
      // Get sorted dates and set the most recent as default
      const sortedDates = sortDatesDescending(data.map(e => e.endDate));
      const mostRecentDate = sortedDates[0] || '';
      
      // Update filters with most recent date
      const newFilters = { 
        ...filters, 
        endDate: mostRecentDate,
        assignmentCodes: [],
        personType: 'ALL',
        newSchool: ''
      };
      setFilters(newFilters);
      
      // Auto-apply filters with most recent date
      let filtered = [...data];
      if (mostRecentDate) {
        filtered = data.filter(emp => emp.endDate === mostRecentDate);
      }
      setFilteredData(filtered);
    } catch (error) {
      console.error('Error parsing file:', error);
      setUploadError(`Failed to parse file: ${error.message}`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  });

  // Parse Excel file
  const parseExcelFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, {
            type: 'binary',
            cellDates: true,
            cellNF: true,
            cellStyles: true
          });
          
          const sheet = workbook.Sheets['Sheet1'];
          if (!sheet) throw new Error('Sheet1 not found');
          
          const jsonData = XLSX.utils.sheet_to_json(sheet, {
            raw: false,
            dateNF: 'mm/dd/yyyy'
          });
          
          const employees = jsonData.map(row => ({
            endDate: row['END DATE'] || '',
            los: row[' LOS '] || '',
            losBand: row[' LOS Band '] || '',
            emplNum: row['Empl num'] || '',
            netId: row['Net ID'] || '',
            lastName: row['Last Name'] || '',
            firstName: row['First Name'] || '',
            gender: row['Gender'] || '',
            jobName: row['Job Name'] || '',
            personType: row['Person Type'] || '',
            assignmentCategoryCode: row['Assignment Category Code'] || '',
            gradeCode: row['Grade Code'] || '',
            hourlySalaried: row['Hourly/Salaried'] || '',
            organizationName: row['Organization Name'] || '',
            deptNum: row['Dept Num'] || '',
            newVP: row['New VP'] || '',
            newSchool: row['New School'] || '',
            employeeEthnicity: row['Employee Ethnicity'] || '',
            currentHireDate: row['Current Hire Date'] || '',
            age: row['Age'] || '',
            ageBand: row['Age Band'] || '',
            location: row['Location'] || ''
          }));
          
          resolve(employees);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = reject;
      reader.readAsBinaryString(file);
    });
  };

  // Apply filters
  const applyFilters = useCallback(() => {
    let filtered = [...uploadedData];
    
    if (filters.endDate) {
      filtered = filtered.filter(emp => emp.endDate === filters.endDate);
    }
    
    if (filters.assignmentCodes.length > 0) {
      filtered = filtered.filter(emp => 
        filters.assignmentCodes.includes(emp.assignmentCategoryCode)
      );
    }
    
    if (filters.personType !== 'ALL') {
      filtered = filtered.filter(emp => emp.personType === filters.personType);
    }
    
    if (filters.newSchool) {
      filtered = filtered.filter(emp => emp.newSchool === filters.newSchool);
    }
    
    setFilteredData(filtered);
  }, [uploadedData, filters]);

  // Helper function to filter employees by category criteria with flexible matching
  const filterEmployeesByCategory = useCallback((data, assignmentCodes, personType, location) => {
    const filtered = data.filter(emp => {
      // Assignment code matching (exact)
      const codeMatch = assignmentCodes.includes(emp.assignmentCategoryCode);
      
      // Person type matching (case-insensitive)
      const actualPersonType = (emp.personType || '').toString().toUpperCase().trim();
      const expectedPersonType = personType.toUpperCase().trim();
      const typeMatch = actualPersonType === expectedPersonType;
      
      // Location matching (flexible - handle variations)
      const actualLocation = (emp.location || '').toString().trim();
      const expectedLocation = location.trim();
      
      // Handle common location variations
      const locationMatch = 
        actualLocation === expectedLocation ||  // Exact match
        actualLocation === `${expectedLocation} Campus` ||  // "Omaha Campus"
        actualLocation.toLowerCase() === expectedLocation.toLowerCase() ||  // Case insensitive
        actualLocation.toLowerCase().includes(expectedLocation.toLowerCase());  // Contains
      
      // Debug first few mismatches to understand data structure
      if (!codeMatch || !typeMatch || !locationMatch) {
        const isFirst5 = data.indexOf(emp) < 5;
        if (isFirst5) {
          console.log(`Employee ${data.indexOf(emp)} mismatch:`, {
            assignmentCode: emp.assignmentCategoryCode,
            codeMatch,
            expectedCodes: assignmentCodes,
            actualPersonType,
            expectedPersonType,
            typeMatch,
            actualLocation,
            expectedLocation,
            locationMatch
          });
        }
      }
      
      return codeMatch && typeMatch && locationMatch;
    });
    
    console.log(`Filter result for ${assignmentCodes.join(',')} + ${personType} + ${location}: ${filtered.length} employees`);
    return filtered.length;
  }, []);

  // Calculate workforce categories and summary statistics
  const summaryStats = useMemo(() => {
    console.log('=== DEBUGGING WORKFORCE CATEGORIES ===');
    console.log('Filtered data length:', filteredData.length);
    
    // Debug: Show sample of actual data
    if (filteredData.length > 0) {
      const sampleEmployee = filteredData[0];
      console.log('Sample employee fields:', Object.keys(sampleEmployee));
      console.log('Sample employee data:', {
        assignmentCategoryCode: sampleEmployee.assignmentCategoryCode,
        personType: sampleEmployee.personType,
        location: sampleEmployee.location,
        newSchool: sampleEmployee.newSchool
      });
      
      // Show unique values for key fields
      const uniqueAssignmentCodes = [...new Set(filteredData.map(emp => emp.assignmentCategoryCode))];
      const uniquePersonTypes = [...new Set(filteredData.map(emp => emp.personType))];
      const uniqueLocations = [...new Set(filteredData.map(emp => emp.location))];
      
      console.log('Unique assignment codes in data:', uniqueAssignmentCodes);
      console.log('Unique person types in data:', uniquePersonTypes);
      console.log('Unique locations in data:', uniqueLocations);
    }
    
    // Updated assignment codes based on actual data analysis
    // BE (Benefit Eligible): PT1, PT2, PT9, PT10, PT11, PT12, TEMP, F09, F10, F11, F12, CWS
    // HSR (Hourly Student Researchers): HSR  
    // NBE (Non-Benefit Eligible): PRN, NBE
    // Note: Added F09, F10, F11, F12, CWS based on debug analysis showing 2166 missing employees
    const beAssignmentCodes = ['PT1','PT2','PT9','PT10','PT11','PT12','TEMP','F09','F10','F11','F12','CWS'];
    const nbeAssignmentCodes = ['PRN','NBE'];
    const hsrAssignmentCodes = ['HSR'];
    
    // Detect student assignment codes dynamically if SUE is not found
    let studentAssignmentCodes = ['SUE'];
    if (filteredData.length > 0) {
      const uniqueAssignmentCodes = [...new Set(filteredData.map(emp => emp.assignmentCategoryCode))];
      const hasSUE = uniqueAssignmentCodes.includes('SUE');
      
      if (!hasSUE) {
        // Look for other potential student codes (codes not in BE, NBE, HSR lists)
        const knownCodes = [...beAssignmentCodes, ...nbeAssignmentCodes, ...hsrAssignmentCodes];
        const potentialStudentCodes = uniqueAssignmentCodes.filter(code => !knownCodes.includes(code));
        
        if (potentialStudentCodes.length > 0) {
          studentAssignmentCodes = potentialStudentCodes;
          console.log('SUE not found, using potential student codes:', potentialStudentCodes);
        } else {
          console.warn('No SUE code found and no alternative student codes detected');
        }
      }
    }
    
    console.log('Using BE assignment codes:', beAssignmentCodes);
    console.log('Using NBE assignment codes:', nbeAssignmentCodes);
    console.log('Using student assignment codes:', studentAssignmentCodes);
    
    // Calculate all 12 workforce categories based on actual data structure
    const workforceCategories = {
      beFacultyOmaha: filterEmployeesByCategory(filteredData, beAssignmentCodes, 'FACULTY', 'Omaha'),
      beFacultyPhoenix: filterEmployeesByCategory(filteredData, beAssignmentCodes, 'FACULTY', 'Phoenix'),
      beStaffOmaha: filterEmployeesByCategory(filteredData, beAssignmentCodes, 'STAFF', 'Omaha'),
      beStaffPhoenix: filterEmployeesByCategory(filteredData, beAssignmentCodes, 'STAFF', 'Phoenix'),
      hsrOmaha: filterEmployeesByCategory(filteredData, hsrAssignmentCodes, 'STAFF', 'Omaha'),
      hsrPhoenix: filterEmployeesByCategory(filteredData, hsrAssignmentCodes, 'STAFF', 'Phoenix'),
      studentOmaha: filterEmployeesByCategory(filteredData, studentAssignmentCodes, 'STAFF', 'Omaha'),
      studentPhoenix: filterEmployeesByCategory(filteredData, studentAssignmentCodes, 'STAFF', 'Phoenix'),
      nbeFacultyOmaha: filterEmployeesByCategory(filteredData, nbeAssignmentCodes, 'FACULTY', 'Omaha'),
      nbeStaffOmaha: filterEmployeesByCategory(filteredData, nbeAssignmentCodes, 'STAFF', 'Omaha'),
      nbeFacultyPhoenix: filterEmployeesByCategory(filteredData, nbeAssignmentCodes, 'FACULTY', 'Phoenix'),
      nbeStaffPhoenix: filterEmployeesByCategory(filteredData, nbeAssignmentCodes, 'STAFF', 'Phoenix')
    };
    
    console.log('Calculated workforce categories:', workforceCategories);
    const categorySum = Object.values(workforceCategories).reduce((sum, count) => sum + count, 0);
    console.log('Sum of all categories:', categorySum);
    
    // Validation and user feedback
    const totalEmployees = filteredData.length;
    console.log('=== CATEGORIZATION ANALYSIS ===');
    console.log('Total employees in filteredData:', totalEmployees);
    console.log('Sum of all 12 categories:', categorySum);
    console.log('Missing employees:', totalEmployees - categorySum);
    
    // Show detailed assignment code analysis
    if (filteredData.length > 0) {
      const allAssignmentCodes = [...new Set(filteredData.map(emp => emp.assignmentCategoryCode))];
      const usedCodes = [...beAssignmentCodes, ...nbeAssignmentCodes, ...hsrAssignmentCodes, ...studentAssignmentCodes];
      const unusedCodes = allAssignmentCodes.filter(code => !usedCodes.includes(code));
      
      console.log('All assignment codes in data:', allAssignmentCodes);
      console.log('Codes we are using:', usedCodes);
      console.log('UNUSED codes (missing employees):', unusedCodes);
      
      if (unusedCodes.length > 0) {
        // Count employees with unused codes
        const unusedEmployeeCount = filteredData.filter(emp => unusedCodes.includes(emp.assignmentCategoryCode)).length;
        console.log('Employees with unused codes:', unusedEmployeeCount);
        
        // Show breakdown by unused code
        unusedCodes.forEach(code => {
          const count = filteredData.filter(emp => emp.assignmentCategoryCode === code).length;
          console.log(`  ${code}: ${count} employees`);
        });
      }
    }
    
    if (categorySum === 0 && totalEmployees > 0) {
      console.error('❌ CATEGORIZATION FAILED: All categories are 0 but total employees is', totalEmployees);
      console.error('This usually means assignment codes, person types, or locations do not match the data');
    } else if (categorySum < totalEmployees * 0.8) {
      console.warn('⚠️ LOW CATEGORIZATION: Only', categorySum, 'of', totalEmployees, 'employees categorized (' + Math.round(categorySum/totalEmployees*100) + '%)');
      console.warn('Some employees may not match the expected assignment codes, person types, or locations');
    } else {
      console.log('✅ CATEGORIZATION SUCCESS:', categorySum, 'of', totalEmployees, 'employees categorized (' + Math.round(categorySum/totalEmployees*100) + '%)');
    }

    // Calculate traditional summary data for detailed breakdown
    const bySchool = filteredData.reduce((acc, emp) => {
      const school = emp.newSchool || 'Unknown';
      if (!acc[school]) {
        acc[school] = { total: 0, faculty: 0, staff: 0 };
      }
      acc[school].total++;
      if (emp.personType === 'FACULTY') acc[school].faculty++;
      if (emp.personType === 'STAFF') acc[school].staff++;
      return acc;
    }, {});

    const schools = Object.entries(bySchool)
      .map(([school, data]) => ({ school, ...data }))
      .sort((a, b) => b.total - a.total);

    const byAssignmentCode = filteredData.reduce((acc, emp) => {
      acc[emp.assignmentCategoryCode] = (acc[emp.assignmentCategoryCode] || 0) + 1;
      return acc;
    }, {});

    return {
      // Workforce categories for the new cards
      ...workforceCategories,
      // Traditional summary data for detailed breakdown
      total: filteredData.length,
      totalFaculty: filteredData.filter(e => e.personType === 'FACULTY').length,
      totalStaff: filteredData.filter(e => e.personType === 'STAFF').length,
      schools,
      byAssignmentCode
    };
  }, [filteredData, filterEmployeesByCategory]);


  // Handle aggregate workforce data import
  const handleAggregateImport = async () => {
    console.log('=== handleAggregateImport called ===');
    console.log('filters.endDate:', filters.endDate);
    console.log('summaryStats:', summaryStats);
    
    if (!filters.endDate) {
      setAggregateImportProgress({ status: 'error', error: 'Please select an end date' });
      return;
    }

    // Validate summaryStats has data
    if (!summaryStats || summaryStats.total === 0) {
      setAggregateImportProgress({ status: 'error', error: 'No employee data to import. Please upload a file first.' });
      return;
    }

    // Check if importAggregateWorkforceData is available
    if (!importAggregateWorkforceData) {
      console.error('importAggregateWorkforceData function is not available');
      setAggregateImportProgress({ status: 'error', error: 'Import function not available. Please refresh and try again.' });
      return;
    }

    setAggregateImportProgress({ status: 'processing', message: 'Starting aggregate import...' });
    
    try {
      console.log('Calling importAggregateWorkforceData with:', {
        summaryStats,
        endDate: filters.endDate
      });
      
      // Import aggregate workforce data
      const result = await importAggregateWorkforceData(summaryStats, filters.endDate, (progress) => {
        console.log('Progress update:', progress);
        setAggregateImportProgress(progress);
      });
      
      console.log('Import result:', result);
      
      setAggregateImportProgress({ 
        status: 'completed', 
        message: `Aggregate data imported successfully for ${result.period}`,
        result
      });
      
      console.log('Aggregate import successful:', result);
    } catch (error) {
      console.error('Aggregate import error:', error);
      console.error('Error stack:', error.stack);
      setAggregateImportProgress({ status: 'error', error: error.message });
    }
  };

  // Check for existing aggregate data when end date changes
  const checkExistingAggregateData = async (endDate) => {
    if (!endDate) return;
    
    try {
      const existing = await getAggregateWorkforceData(endDate);
      setExistingAggregateData(existing);
    } catch (error) {
      console.warn('Could not check existing aggregate data:', error);
      setExistingAggregateData(null);
    }
  };

  // Handle privacy compliance cleanup
  const handlePrivacyCleanup = async () => {
    setCleanupProgress({ status: 'processing', message: 'Scanning for individual employee records...' });
    
    try {
      const result = await clearAllIndividualEmployeeData();
      
      setCleanupProgress({ 
        status: 'completed', 
        message: result.message,
        count: result.count
      });
      
      console.log('Privacy cleanup successful:', result);
    } catch (error) {
      console.error('Privacy cleanup error:', error);
      setCleanupProgress({ status: 'error', error: error.message });
    }
  };

  // Reset upload state
  const resetUpload = () => {
    setUploadedData([]);
    setFilteredData([]);
    setFilters({
      endDate: '',
      assignmentCodes: [],
      personType: 'ALL',
      newSchool: ''
    });
    setUploadError(null);
    setShowAggregateImportModal(false);
    setAggregateImportProgress(null);
    setExistingAggregateData(null);
    setCleanupProgress(null);
  };

  // Check for existing aggregate data when filters change
  React.useEffect(() => {
    if (filters.endDate) {
      checkExistingAggregateData(filters.endDate);
    } else {
      setExistingAggregateData(null);
    }
  }, [filters.endDate]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Employee Data Importer</h1>
          <p className="text-gray-600 mt-2">
            Upload employee data, filter as needed, and import aggregate workforce metrics to Firebase
          </p>
        </div>

        {/* Privacy Compliance Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-900">Privacy Compliance</h3>
                <p className="text-sm text-blue-700 mt-1">
                  This system only stores aggregate workforce metrics. Individual employee records with personal information are processed locally and never saved to the database.
                </p>
              </div>
            </div>
            
            {cleanupProgress?.status !== 'processing' && (
              <button
                onClick={handlePrivacyCleanup}
                disabled={loading}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Clear Legacy Data
              </button>
            )}
          </div>
          
          {cleanupProgress && (
            <div className="mt-3 p-2 bg-white rounded border">
              {cleanupProgress.status === 'processing' && (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                  <span className="text-xs text-gray-600">{cleanupProgress.message}</span>
                </div>
              )}
              {cleanupProgress.status === 'completed' && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-700">
                    {cleanupProgress.message} {cleanupProgress.count > 0 && `(${cleanupProgress.count} records removed)`}
                  </span>
                </div>
              )}
              {cleanupProgress.status === 'error' && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-3 h-3 text-red-600" />
                  <span className="text-xs text-red-700">{cleanupProgress.error}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Upload Area */}
        {uploadedData.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
                transition-colors duration-200
                ${isDragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
            >
              <input {...getInputProps()} />
              <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-700">
                {isDragActive ? 'Drop the Excel file here' : 'Drag & drop Excel file here'}
              </p>
              <p className="text-sm text-gray-500 mt-2">or click to select file</p>
              <p className="text-xs text-gray-400 mt-4">
                Supported formats: .xlsx, .xls
              </p>
            </div>
            
            {uploadError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700 font-medium">Upload Error</span>
                </div>
                <p className="text-red-600 text-sm mt-1">{uploadError}</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Main Summary Cards - Workforce Categories */}
            <EmployeeSummaryCards 
              stats={summaryStats} 
              selectedQuarter={filters.endDate}
            />

            {/* Filter Panel - Positioned right after main summary cards */}
            <EmployeeFilterPanel
              filters={filters}
              setFilters={setFilters}
              onApply={applyFilters}
              availableEndDates={sortDatesDescending(uploadedData.map(e => e.endDate))}
              availableSchools={[...new Set(uploadedData.map(e => e.newSchool))]}
            />

            {/* Action Buttons - Moved up higher for better accessibility */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-start">
                <button
                  onClick={resetUpload}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                >
                  Reset & Upload New File
                </button>
                
                {filteredData.length > 0 && (
                  <div className="flex flex-col">
                    <button
                      onClick={() => setShowAggregateImportModal(true)}
                      disabled={loading || !filters.endDate}
                      className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg
                               hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed
                               transition-colors duration-200 flex items-center gap-2"
                    >
                      <Database className="w-5 h-5" />
                      {loading ? 'Processing...' : 'Import Aggregate Workforce Data'}
                    </button>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      {existingAggregateData 
                        ? `Will override existing data for ${filters.endDate}` 
                        : `Creates workforce metrics for ${filters.endDate || 'selected quarter'}`
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* Existing Data Warning */}
              {existingAggregateData && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <span className="text-yellow-700 font-medium text-sm">
                      Existing workforce data found for {filters.endDate}
                    </span>
                  </div>
                  <p className="text-yellow-600 text-xs mt-1">
                    Importing aggregate data will override the existing workforce metrics.
                    Total employees: {existingAggregateData.totalEmployees || 'Unknown'}
                  </p>
                </div>
              )}
            </div>

            {/* Detailed Breakdown - Top Schools/Divisions and Assignment Codes */}
            <EmployeeDetailedBreakdown stats={summaryStats} />
          </>
        )}


        {/* Aggregate Import Modal */}
        {showAggregateImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Import Aggregate Workforce Data
              </h3>
              
              {aggregateImportProgress?.status === 'completed' ? (
                /* Success Screen */
                <div className="text-center">
                  <div className="mb-6">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Import Successful!</h4>
                    <p className="text-gray-600">
                      Workforce data has been successfully imported to Firebase for quarter <strong>{aggregateImportProgress.result?.period || filters.endDate}</strong>
                    </p>
                  </div>

                  {/* Import Summary with Checkmarks */}
                  <div className="bg-green-50 rounded-lg p-4 mb-6 text-left">
                    <p className="font-medium text-gray-800 mb-3 text-center">✅ Successfully Imported Data</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span>Total Employees: <strong>{aggregateImportProgress.result?.totalEmployees || summaryStats.total}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span>BE Faculty: <strong>{aggregateImportProgress.result?.dataPreview?.beFaculty || ((summaryStats.beFacultyOmaha || 0) + (summaryStats.beFacultyPhoenix || 0))}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span>BE Staff: <strong>{aggregateImportProgress.result?.dataPreview?.beStaff || ((summaryStats.beStaffOmaha || 0) + (summaryStats.beStaffPhoenix || 0))}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span>Students: <strong>{aggregateImportProgress.result?.dataPreview?.students || ((summaryStats.studentOmaha || 0) + (summaryStats.studentPhoenix || 0))}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span>Omaha Campus: <strong>{aggregateImportProgress.result?.dataPreview?.omaha || ((summaryStats.beFacultyOmaha || 0) + (summaryStats.beStaffOmaha || 0) + (summaryStats.nbeFacultyOmaha || 0) + (summaryStats.nbeStaffOmaha || 0) + (summaryStats.hsrOmaha || 0) + (summaryStats.studentOmaha || 0))}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span>Phoenix Campus: <strong>{aggregateImportProgress.result?.dataPreview?.phoenix || ((summaryStats.beFacultyPhoenix || 0) + (summaryStats.beStaffPhoenix || 0) + (summaryStats.nbeFacultyPhoenix || 0) + (summaryStats.nbeStaffPhoenix || 0) + (summaryStats.hsrPhoenix || 0) + (summaryStats.studentPhoenix || 0))}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Firebase Storage Confirmation */}
                  <div className="bg-blue-50 rounded-lg p-3 mb-6 text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Firebase Storage Details</span>
                    </div>
                    <div className="text-sm text-blue-700 space-y-1">
                      <div>• Path: <code className="bg-blue-100 px-1 rounded">dashboards/workforce/quarters/{aggregateImportProgress.result?.period}</code></div>
                      <div>• Period: <strong>{aggregateImportProgress.result?.period}</strong></div>
                      <div>• End Date: <strong>{aggregateImportProgress.result?.endDate}</strong></div>
                      <div>• Status: <span className="text-green-600 font-medium">✅ Successfully Saved</span></div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => window.open('/dashboards/workforce', '_blank')}
                      className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                    >
                      <Database className="w-4 h-4" />
                      View Workforce Dashboard
                    </button>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowAggregateImportModal(false);
                          setAggregateImportProgress(null);
                        }}
                        className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => {
                          setAggregateImportProgress(null);
                        }}
                        className="flex-1 px-4 py-2 text-green-700 bg-green-100 border border-green-300 rounded-lg hover:bg-green-200"
                      >
                        Import More Data
                      </button>
                    </div>
                  </div>
                </div>
              ) : aggregateImportProgress?.status !== 'processing' ? (
                /* Initial Import Preview */
                <>
                  <div className="mb-4">
                    <p className="text-gray-600 mb-3">
                      This will import aggregated workforce metrics for <strong>{filters.endDate}</strong> to the Workforce Analytics dashboard.
                    </p>
                    
                    {/* Data Preview */}
                    <div className="bg-gray-50 rounded-lg p-3 text-sm">
                      <p className="font-medium text-gray-700 mb-2">Data to be imported:</p>
                      <ul className="space-y-1 text-gray-600">
                        <li>• Total Employees: {summaryStats.total}</li>
                        <li>• BE Faculty: {(summaryStats.beFacultyOmaha || 0) + (summaryStats.beFacultyPhoenix || 0)}</li>
                        <li>• BE Staff: {(summaryStats.beStaffOmaha || 0) + (summaryStats.beStaffPhoenix || 0)}</li>
                        <li>• Students: {(summaryStats.studentOmaha || 0) + (summaryStats.studentPhoenix || 0)}</li>
                        <li>• Omaha Campus: {(summaryStats.beFacultyOmaha || 0) + (summaryStats.beStaffOmaha || 0) + (summaryStats.nbeFacultyOmaha || 0) + (summaryStats.nbeStaffOmaha || 0) + (summaryStats.hsrOmaha || 0) + (summaryStats.studentOmaha || 0)}</li>
                        <li>• Phoenix Campus: {(summaryStats.beFacultyPhoenix || 0) + (summaryStats.beStaffPhoenix || 0) + (summaryStats.nbeFacultyPhoenix || 0) + (summaryStats.nbeStaffPhoenix || 0) + (summaryStats.hsrPhoenix || 0) + (summaryStats.studentPhoenix || 0)}</li>
                      </ul>
                    </div>

                    {existingAggregateData && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-700 text-sm">
                          ⚠️ This will override existing workforce data for {filters.endDate}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setShowAggregateImportModal(false);
                        setAggregateImportProgress(null);
                      }}
                      className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        console.log('Import Aggregate Data button clicked');
                        console.log('Current loading state:', loading);
                        console.log('Current aggregateImportProgress:', aggregateImportProgress);
                        console.log('Is button disabled?', loading);
                        try {
                          handleAggregateImport();
                        } catch (error) {
                          console.error('Error calling handleAggregateImport:', error);
                        }
                      }}
                      disabled={loading}
                      className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Processing...' : 'Import Aggregate Data'}
                    </button>
                  </div>
                </>
              ) : (
                /* Progress Display */
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 mb-2">{aggregateImportProgress.message}</p>
                  {aggregateImportProgress.status === 'error' && (
                    <div className="mt-4">
                      <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <p className="text-red-600 text-sm mb-3">{aggregateImportProgress.error}</p>
                      <button
                        onClick={() => {
                          setShowAggregateImportModal(false);
                          setAggregateImportProgress(null);
                        }}
                        className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700 font-medium">Import Error</span>
            </div>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeImportDashboard;