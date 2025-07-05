import React, { useState, useCallback } from 'react';
import { Users, Building2, UserPlus, AlertTriangle, MapPin, Upload, RefreshCw } from 'lucide-react';
import DashboardLayout from './DashboardLayout';
import HeadcountChart from '../charts/HeadcountChart';
import LocationChart from '../charts/LocationChart';
import DivisionsChart from '../charts/DivisionsChart';
import StartersLeaversChart from '../charts/StartersLeaversChart';
import SummaryCard from '../ui/SummaryCard';
import FileUploader from '../ui/FileUploader';
import useFirebaseWorkforceData from '../../hooks/useFirebaseWorkforceData';
import { 
  mapColumns, 
  normalizeEmployeeData, 
  generateWorkforceMetrics, 
  validateWorkforceData 
} from '../../utils/workforceDataProcessor';

// Expected columns for workforce data
const EXPECTED_COLUMNS = [
  'employee_id', 'name', 'first_name', 'last_name', 'department', 
  'division', 'position', 'location', 'employee_type', 'hire_date'
];

// Enhanced fallback data (same as WorkforceDashboard)
const WORKFORCE_FALLBACK_DATA = {
  summary: {
    totalEmployees: 2847,
    totalPositions: 2950,
    faculty: 1234,
    staff: 1456,
    students: 157,
    vacancies: 103,
    vacancyRate: 3.5,
    employeeChange: 1.5,
    facultyChange: 1.4,
    staffChange: 1.5,
    vacancyRateChange: -0.9
  },
  charts: {
    historicalTrends: [
      { quarter: 'Q2-2024', total: 2675, faculty: 1189, staff: 1342, students: 144 },
      { quarter: 'Q3-2024', total: 2712, faculty: 1198, staff: 1368, students: 146 },
      { quarter: 'Q4-2024', total: 2756, faculty: 1205, staff: 1398, students: 153 },
      { quarter: 'Q1-2025', total: 2804, faculty: 1216, staff: 1434, students: 154 },
      { quarter: 'Q2-2025', total: 2847, faculty: 1234, staff: 1456, students: 157 }
    ],
    startersLeavers: [
      { month: 'Oct 2024', starters: 45, leavers: 32, netChange: 13 },
      { month: 'Nov 2024', starters: 38, leavers: 28, netChange: 10 },
      { month: 'Dec 2024', starters: 52, leavers: 41, netChange: 11 },
      { month: 'Jan 2025', starters: 67, leavers: 35, netChange: 32 },
      { month: 'Feb 2025', starters: 43, leavers: 31, netChange: 12 },
      { month: 'Mar 2025', starters: 39, leavers: 27, netChange: 12 }
    ],
    topDivisions: [
      { name: 'Academic Affairs', total: 567, faculty: 423, staff: 144, vacancies: 12, vacancyRate: 2.1 },
      { name: 'Student Affairs', total: 234, faculty: 45, staff: 189, vacancies: 6, vacancyRate: 2.5 },
      { name: 'Research & Innovation', total: 189, faculty: 134, staff: 55, vacancies: 8, vacancyRate: 4.1 },
      { name: 'Information Technology', total: 156, faculty: 23, staff: 133, vacancies: 7, vacancyRate: 4.3 },
      { name: 'Finance & Administration', total: 145, faculty: 12, staff: 133, vacancies: 4, vacancyRate: 2.7 }
    ],
    locationDistribution: [
      { name: 'Omaha Campus', total: 2687, faculty: 1156, staff: 1374, students: 157, percentage: 94.4 },
      { name: 'Phoenix Campus', total: 160, faculty: 78, staff: 82, students: 0, percentage: 5.6 }
    ]
  },
  metrics: {
    recentHires: { faculty: 23, staff: 34, students: 12 },
    demographics: { averageTenure: '8.2', averageAge: '42', genderRatio: '52/48', diversityIndex: '34' },
    campuses: {
      omaha: { percentage: 94.4, employees: 2687 },
      phoenix: { percentage: 5.6, employees: 160 },
      growthRate: 2.1
    }
  }
};

const EnhancedWorkforceDashboard = () => {
  // State for import functionality
  const [importedData, setImportedData] = useState(null);
  const [showImporter, setShowImporter] = useState(false);
  const [processedMetrics, setProcessedMetrics] = useState(null);
  const [importError, setImportError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Firebase data hook
  const { 
    data: firebaseData, 
    loading, 
    error: firebaseError, 
    isRealTime, 
    lastSyncTime, 
    refetch 
  } = useFirebaseWorkforceData({ reportingPeriod: 'Q2-2025' });

  // Determine data source priority: processed import > firebase > fallback
  const data = processedMetrics || firebaseData || WORKFORCE_FALLBACK_DATA;
  const dataSource = processedMetrics ? 'Imported' : (firebaseData ? 'Firebase' : 'Sample');

  // Handle successful data import
  const handleDataImported = useCallback(async (importResult) => {
    setIsProcessing(true);
    setImportError(null);
    
    try {
      const { data: rawData, headers, validation } = importResult;
      
      // Map columns to standard format
      const columnMapping = mapColumns(headers);
      
      // Normalize employee data
      const normalizedEmployees = normalizeEmployeeData(rawData, columnMapping);
      
      // Validate the normalized data
      const dataValidation = validateWorkforceData(normalizedEmployees);
      
      if (!dataValidation.isValid) {
        throw new Error(`Data validation failed: ${dataValidation.errors.join(', ')}`);
      }
      
      // Generate dashboard metrics
      const metrics = generateWorkforceMetrics(normalizedEmployees);
      
      // Store the results
      setImportedData({
        rawData,
        normalizedEmployees,
        columnMapping,
        validation: dataValidation
      });
      setProcessedMetrics(metrics);
      setShowImporter(false);
      
    } catch (error) {
      setImportError(error.message);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Handle import errors
  const handleImportError = useCallback((error) => {
    setImportError(error);
  }, []);

  // Reset to original data
  const resetToOriginalData = () => {
    setImportedData(null);
    setProcessedMetrics(null);
    setImportError(null);
    setShowImporter(false);
  };

  // Handle export functionality
  const handleExport = (type, context) => {
    console.log('Exporting enhanced workforce dashboard:', type, context, {
      hasImportedData: !!importedData,
      dataSource
    });
  };

  // Available filters
  const availableFilters = {
    reportingPeriod: [
      { value: 'Q2-2025', label: 'Q2 2025' },
      { value: 'Q1-2025', label: 'Q1 2025' },
      { value: 'Q4-2024', label: 'Q4 2024' }
    ],
    location: [
      { value: 'all', label: 'All Locations' },
      { value: 'omaha', label: 'Omaha Campus' },
      { value: 'phoenix', label: 'Phoenix Campus' }
    ],
    employeeType: [
      { value: 'all', label: 'All Types' },
      { value: 'faculty', label: 'Faculty' },
      { value: 'staff', label: 'Staff' },
      { value: 'student', label: 'Students' }
    ]
  };

  // Generate subtitle with data source info
  const realtimeStatus = importedData ? '📁 Imported' : (isRealTime ? '🔴 Live' : '📊 Cached');
  const syncInfo = lastSyncTime ? ` | Last sync: ${lastSyncTime.toLocaleTimeString()}` : '';
  const subtitle = `Q2 2025 | ${realtimeStatus} (${dataSource})${syncInfo}`;

  // Show loading state
  if (loading && !importedData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading workforce data...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Combined Workforce Analytics"
      subtitle={subtitle}
      onExport={handleExport}
      availableFilters={availableFilters}
      gridCols="grid-cols-1"
      maxWidth="max-w-7xl"
      customActions={
        <div className="flex gap-2">
          {importedData && (
            <button
              onClick={resetToOriginalData}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <RefreshCw size={16} />
              Reset Data
            </button>
          )}
          <button
            onClick={() => setShowImporter(!showImporter)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Upload size={16} />
            {showImporter ? 'Hide Importer' : 'Import Data'}
          </button>
        </div>
      }
    >
      {/* Data Import Section */}
      {showImporter && (
        <div className="mb-6 p-6 bg-white rounded-lg shadow-sm border">
          <FileUploader
            onDataImported={handleDataImported}
            onError={handleImportError}
            expectedColumns={EXPECTED_COLUMNS}
            title="Import Employee Data"
            description="Upload your employee data file to generate real-time workforce analytics"
          />
          
          {isProcessing && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-blue-800">Processing your data...</span>
              </div>
            </div>
          )}
          
          {importError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{importError}</p>
            </div>
          )}
        </div>
      )}

      {/* Data Source Indicator */}
      {importedData && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-green-900">Using Imported Data</h4>
              <p className="text-sm text-green-700">
                Showing analytics for {importedData.normalizedEmployees.length} employees 
                from your uploaded file
              </p>
            </div>
            <div className="text-sm text-green-600">
              <div>✓ {importedData.validation.stats.validRows} valid records</div>
              {importedData.validation.warnings.length > 0 && (
                <div>⚠ {importedData.validation.warnings.length} warnings</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:gap-2 mb-6 print:mb-4">
        <SummaryCard
          title="Total Employees"
          value={data.summary.totalEmployees.toLocaleString()}
          change={data.summary.employeeChange}
          changeType="percentage"
          subtitle={`${data.summary.totalPositions.toLocaleString()} total positions`}
          icon={Users}
          trend="positive"
        />
        
        <SummaryCard
          title="Faculty"
          value={data.summary.faculty.toLocaleString()}
          change={data.summary.facultyChange}
          changeType="percentage"
          subtitle={`${((data.summary.faculty / data.summary.totalEmployees) * 100).toFixed(1)}% of workforce`}
          icon={Users}
        />
        
        <SummaryCard
          title="Staff"
          value={data.summary.staff.toLocaleString()}
          change={data.summary.staffChange}
          changeType="percentage"
          subtitle={`${((data.summary.staff / data.summary.totalEmployees) * 100).toFixed(1)}% of workforce`}
          icon={Building2}
        />
        
        <SummaryCard
          title="Vacancy Rate"
          value={`${data.summary.vacancyRate.toFixed(1)}%`}
          change={data.summary.vacancyRateChange}
          changeType="percentage"
          subtitle={`${data.summary.vacancies.toLocaleString()} open positions`}
          icon={AlertTriangle}
          trend={data.summary.vacancyRateChange > 0 ? 'negative' : 'positive'}
        />
      </div>

      {/* Charts Row 1: Historical Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:gap-2 mb-6 print:mb-4">
        <HeadcountChart
          data={data.charts.historicalTrends}
          title="5-Quarter Headcount Trend"
          height={320}
          showLegend={true}
        />
        
        <StartersLeaversChart
          data={data.charts.startersLeavers}
          title="Monthly Hiring Activity"
          height={320}
          showLegend={true}
          showGrid={true}
        />
      </div>

      {/* Charts Row 2: Distribution Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:gap-2 mb-6 print:mb-4">
        <DivisionsChart
          data={data.charts.topDivisions}
          title="Top Divisions by Headcount"
          height={400}
          maxItems={10}
          sortBy="total"
          layout="horizontal"
          showRanking={true}
        />
        
        <LocationChart
          data={data.charts.locationDistribution}
          title="Employee Distribution by Campus"
          height={400}
          showLegend={true}
          showLabels={true}
          showPercentages={true}
        />
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 print:gap-2 mb-6 print:mb-4">
        <div className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray">
          <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black mb-3 print:mb-2">
            Recent Hires (Last 30 Days)
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="text-green-500 print:text-black" size={16} />
                <span className="text-sm font-medium">New Faculty</span>
              </div>
              <span className="text-lg font-bold text-green-600 print:text-black">
                {data.metrics.recentHires.faculty}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="text-blue-500 print:text-black" size={16} />
                <span className="text-sm font-medium">New Staff</span>
              </div>
              <span className="text-lg font-bold text-blue-600 print:text-black">
                {data.metrics.recentHires.staff}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="text-purple-500 print:text-black" size={16} />
                <span className="text-sm font-medium">New Students</span>
              </div>
              <span className="text-lg font-bold text-purple-600 print:text-black">
                {data.metrics.recentHires.students}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray">
          <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black mb-3 print:mb-2">
            Demographics Overview
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 print:text-black">Average Tenure</span>
              <span className="font-semibold print:text-black">
                {data.metrics.demographics.averageTenure} years
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 print:text-black">Avg Age</span>
              <span className="font-semibold print:text-black">
                {data.metrics.demographics.averageAge} years
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 print:text-black">Gender Ratio (F/M)</span>
              <span className="font-semibold print:text-black">
                {data.metrics.demographics.genderRatio}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 print:text-black">Diversity Index</span>
              <span className="font-semibold print:text-black">
                {data.metrics.demographics.diversityIndex}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray">
          <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black mb-3 print:mb-2">
            Campus Highlights
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="text-blue-500 print:text-black" size={16} />
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Omaha Campus</span>
                  <span className="text-sm font-bold print:text-black">
                    {data.metrics.campuses.omaha.percentage}%
                  </span>
                </div>
                <div className="text-xs text-gray-500 print:text-black">
                  {data.metrics.campuses.omaha.employees.toLocaleString()} employees
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="text-orange-500 print:text-black" size={16} />
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Phoenix Campus</span>
                  <span className="text-sm font-bold print:text-black">
                    {data.metrics.campuses.phoenix.percentage}%
                  </span>
                </div>
                <div className="text-xs text-gray-500 print:text-black">
                  {data.metrics.campuses.phoenix.employees.toLocaleString()} employees
                </div>
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="text-xs text-gray-500 print:text-black">
                Growth Rate: <span className="font-semibold text-green-600 print:text-black">
                  +{data.metrics.campuses.growthRate}%
                </span> YoY
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Executive Summary Section */}
      <div className="bg-gray-50 print:bg-white p-6 print:p-4 rounded-lg border border-gray-200 print:border-gray">
        <h2 className="text-xl print:text-lg font-bold text-blue-700 print:text-black mb-4 print:mb-3">
          WORKFORCE ANALYTICS EXECUTIVE SUMMARY
        </h2>
        <div className="space-y-4 print:space-y-2 text-sm print:text-xs">
          <p className="text-gray-700 print:text-black">
            <strong>Data Source:</strong> {importedData ? 
              `Analysis based on imported employee data (${importedData.normalizedEmployees.length} records processed)` :
              `Analysis using ${dataSource.toLowerCase()} data for Q2 2025`
            }. Current workforce of {data.summary.totalEmployees.toLocaleString()} employees across {data.summary.totalPositions.toLocaleString()} authorized positions with a {data.summary.vacancyRate.toFixed(1)}% vacancy rate.
          </p>
          <p className="text-gray-700 print:text-black">
            <strong>Workforce Composition:</strong> Faculty represents {((data.summary.faculty / data.summary.totalEmployees) * 100).toFixed(1)}% ({data.summary.faculty.toLocaleString()} employees), staff comprises {((data.summary.staff / data.summary.totalEmployees) * 100).toFixed(1)}% ({data.summary.staff.toLocaleString()} employees), and student workers contribute {((data.summary.students / data.summary.totalEmployees) * 100).toFixed(1)}% ({data.summary.students.toLocaleString()} employees).
          </p>
          <p className="text-gray-700 print:text-black">
            <strong>Strategic Outlook:</strong> Recent hiring trends show {(data.metrics.recentHires.faculty + data.metrics.recentHires.staff + data.metrics.recentHires.students)} new hires in the last 30 days. Campus distribution shows {data.metrics.campuses.omaha.percentage}% at Omaha Campus and {data.metrics.campuses.phoenix.percentage}% at Phoenix Campus, with a healthy year-over-year growth rate of +{data.metrics.campuses.growthRate}%.
          </p>
          {importedData && (
            <p className="text-gray-700 print:text-black">
              <strong>Data Quality:</strong> Successfully processed {importedData.validation.stats.validRows} valid employee records with {importedData.validation.warnings.length} data quality warnings. This real-time analysis provides current insights based on your organization's actual workforce data.
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EnhancedWorkforceDashboard;