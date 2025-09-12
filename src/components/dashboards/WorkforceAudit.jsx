import React, { useState } from 'react';
import { Calendar, Calculator, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';
const Papa = require('papaparse');

const WorkforceAudit = () => {
  const [selectedEndDate, setSelectedEndDate] = useState('6/30/25');
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState({});
  const [calculations, setCalculations] = useState(null);
  const [previousCalculations, setPreviousCalculations] = useState(null);
  const [hasLoadedData, setHasLoadedData] = useState(false);

  // Only the two dates for YoY comparison
  const availableEndDates = [
    { value: '6/30/25', label: 'FY25 Year-End - June 30, 2025', fy: 'FY25' },
    { value: '6/30/24', label: 'FY24 Year-End - June 30, 2024', fy: 'FY24' }
  ];

  // Load CSV data function
  const loadData = async () => {
    if (hasLoadedData && rawData.length > 0) {
      // If data is already loaded, just recalculate
      console.log('Data already loaded, recalculating with', rawData.length, 'records');
      calculateMetrics();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching CSV file...');
      const response = await fetch('/source-metrics/workforce/fy25/New Emp List since FY20 to Q1FY25 1031 PT.csv');
      const text = await response.text();
      console.log('CSV text loaded, length:', text.length);
      
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          console.log('Papa Parse complete. Total records:', result.data.length);
          console.log('First record:', result.data[0]);
          console.log('Sample END DATE values:', result.data.slice(0, 5).map(r => r['END DATE']));
          setRawData(result.data);
          setHasLoadedData(true);
          setLoading(false);
          // Calculate for selected date
          calculateMetricsFromData(result.data);
          // Also calculate for comparison date if it's different
          const comparisonDate = selectedEndDate === '6/30/25' ? '6/30/24' : '6/30/25';
          calculateMetricsFromData(result.data, comparisonDate, true);
        },
        error: (error) => {
          console.error('Papa Parse error:', error);
          setError(error.message);
          setLoading(false);
        }
      });
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Calculate metrics from data
  const calculateMetricsFromData = (data, dateOverride = null, isComparison = false) => {
    if (!data || data.length === 0) {
      console.log('No data to calculate');
      if (!isComparison) setCalculations(null);
      return;
    }
    
    const dateToUse = dateOverride || selectedEndDate;
    console.log(`Calculating metrics for date: ${dateToUse}, isComparison: ${isComparison}`);

    // Clean BOM character from headers and normalize field names
    const cleanedData = data.map(row => {
      const cleanRow = {};
      Object.keys(row).forEach(key => {
        // Remove BOM character and trim all whitespace
        const cleanKey = key.replace(/^\uFEFF/, '').trim();
        // Also trim the value
        cleanRow[cleanKey] = row[key]?.trim ? row[key].trim() : row[key];
      });
      return cleanRow;
    });

    console.log('First cleaned record:', cleanedData[0]);
    console.log('Available columns:', Object.keys(cleanedData[0]));

    // Filter data based on selected end date
    const filteredData = cleanedData.filter(row => {
      const rowEndDate = row['END DATE'];  // No need to trim, already trimmed above
      return rowEndDate === dateToUse;
    });
    
    console.log(`Filtered data for ${dateToUse}: ${filteredData.length} records`);

    // Define benefit-eligible categories (matching workforce dashboard)
    const BE_CATEGORIES = ['F12', 'F11', 'F09', 'F10', 'PT12', 'PT9', 'PT11', 'PT10'];
    const STUDENT_CATEGORIES = ['SUE', 'CWS'];
    const TEMP_CATEGORIES = ['TEMP', 'NBE', 'PRN'];

    // Initialize calculation tracking
    const calc = {
      totalRecords: filteredData.length,
      beStaff: { total: 0, byLocation: {}, list: [] },
      beFaculty: { total: 0, byLocation: {}, list: [] },
      hsp: { total: 0, byLocation: {}, list: [] },
      students: { total: 0, byLocation: {}, list: [] },
      temp: { total: 0, byLocation: {}, list: [] },
      byLocation: {},
      byDepartment: {},
      byAssignmentCategory: {},
      calculations: []
    };

    // Process each record
    console.log('Processing', filteredData.length, 'filtered records...');
    if (filteredData.length > 0) {
      console.log('Sample record keys:', Object.keys(filteredData[0]));
    }
    
    filteredData.forEach((row, index) => {
      const personType = row['Person Type'] || 'Unknown';
      const assignmentCategory = row['Assignment Category Code'] || 'Unknown';
      const location = row['Location'] || 'Unknown';
      const department = row['New VP'] || 'Unknown';
      const jobName = row['Job Name'] || '';
      const empNum = row['Empl num'] || '';
      const name = `${row['Last Name'] || ''}, ${row['First Name'] || ''}`.trim();
      
      // Log first few records for debugging
      if (index < 3) {
        console.log(`Record ${index}:`, {
          personType,
          assignmentCategory,
          location,
          department
        });
      }

      // Track by location
      if (!calc.byLocation[location]) {
        calc.byLocation[location] = {
          total: 0,
          beStaff: 0,
          beFaculty: 0,
          hsp: 0,
          students: 0,
          temp: 0
        };
      }
      calc.byLocation[location].total++;

      // Track by department
      if (!calc.byDepartment[department]) {
        calc.byDepartment[department] = { total: 0, faculty: 0, staff: 0 };
      }
      calc.byDepartment[department].total++;

      // Track by assignment category
      if (!calc.byAssignmentCategory[assignmentCategory]) {
        calc.byAssignmentCategory[assignmentCategory] = 0;
      }
      calc.byAssignmentCategory[assignmentCategory]++;

      // Categorize employee using exact same logic as workforce dashboard
      let category = 'Uncategorized';
      let isBeEligible = false;

      // Check for House Staff Physicians (HSP) - uses HSR category
      if (assignmentCategory === 'HSR') {
        category = 'HSP';
        calc.hsp.total++;
        if (!calc.hsp.byLocation[location]) calc.hsp.byLocation[location] = 0;
        calc.hsp.byLocation[location]++;
        calc.byLocation[location].hsp++;
        calc.hsp.list.push({ empNum, name, location, jobName, assignmentCategory });
      }
      // Check for Students
      else if (STUDENT_CATEGORIES.includes(assignmentCategory)) {
        category = 'Student';
        calc.students.total++;
        if (!calc.students.byLocation[location]) calc.students.byLocation[location] = 0;
        calc.students.byLocation[location]++;
        calc.byLocation[location].students++;
        calc.students.list.push({ empNum, name, location, jobName, assignmentCategory });
      }
      // Check for Temp workers
      else if (TEMP_CATEGORIES.includes(assignmentCategory)) {
        category = 'Temp';
        calc.temp.total++;
        if (!calc.temp.byLocation[location]) calc.temp.byLocation[location] = 0;
        calc.temp.byLocation[location]++;
        calc.byLocation[location].temp++;
        calc.temp.list.push({ empNum, name, location, jobName, assignmentCategory });
      }
      // Check for Benefit-Eligible Faculty
      else if (personType === 'FACULTY' && BE_CATEGORIES.includes(assignmentCategory)) {
        category = 'BE Faculty';
        isBeEligible = true;
        calc.beFaculty.total++;
        if (!calc.beFaculty.byLocation[location]) calc.beFaculty.byLocation[location] = 0;
        calc.beFaculty.byLocation[location]++;
        calc.byLocation[location].beFaculty++;
        calc.byDepartment[department].faculty++;
        calc.beFaculty.list.push({ empNum, name, location, jobName, assignmentCategory, department });
      }
      // Check for Benefit-Eligible Staff
      else if (personType === 'STAFF' && BE_CATEGORIES.includes(assignmentCategory)) {
        category = 'BE Staff';
        isBeEligible = true;
        calc.beStaff.total++;
        if (!calc.beStaff.byLocation[location]) calc.beStaff.byLocation[location] = 0;
        calc.beStaff.byLocation[location]++;
        calc.byLocation[location].beStaff++;
        calc.byDepartment[department].staff++;
        calc.beStaff.list.push({ empNum, name, location, jobName, assignmentCategory, department });
      }

      // Add to calculation log
      calc.calculations.push({
        empNum,
        name,
        personType,
        assignmentCategory,
        location,
        department,
        jobName,
        category,
        isBeEligible
      });
    });

    console.log('Calculation results:', {
      totalRecords: calc.totalRecords,
      beStaff: calc.beStaff.total,
      beFaculty: calc.beFaculty.total,
      hsp: calc.hsp.total,
      students: calc.students.total,
      temp: calc.temp.total,
      sum: calc.beStaff.total + calc.beFaculty.total + calc.hsp.total + calc.students.total + calc.temp.total
    });

    if (isComparison) {
      setPreviousCalculations(calc);
    } else {
      setCalculations(calc);
    }
  };

  // Recalculate metrics when needed
  const calculateMetrics = () => {
    calculateMetricsFromData(rawData);
    // Also calculate comparison
    const comparisonDate = selectedEndDate === '6/30/25' ? '6/30/24' : '6/30/25';
    calculateMetricsFromData(rawData, comparisonDate, true);
  };

  const toggleDetails = (section) => {
    setShowDetails(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const exportCalculations = () => {
    if (!calculations) return;
    
    const csv = Papa.unparse(calculations.calculations);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workforce_audit_calculations_${selectedEndDate.replace(/\//g, '-')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const selectedDateInfo = availableEndDates.find(d => d.value === selectedEndDate);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workforce data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
          <p className="text-red-600">Error loading data: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <Calculator className="mr-2 h-6 w-6" />
          Workforce Calculation Audit Tool
        </h1>
        <p className="text-gray-600">Detailed calculation breakdown for workforce dashboard metrics</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="inline h-4 w-4 mr-1" />
                Select Report End Date
              </label>
              <select
                value={selectedEndDate}
                onChange={(e) => setSelectedEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableEndDates.map(date => (
                  <option key={date.value} value={date.value}>
                    {date.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="pt-6">
              <button
                onClick={loadData}
                disabled={loading}
                className={`px-6 py-2 rounded-md font-medium flex items-center ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate
                  </>
                )}
              </button>
            </div>
            {selectedDateInfo && calculations && (
              <div className="text-sm text-gray-600 pt-6">
                <span className="font-semibold">{selectedDateInfo.fy}</span>
                {previousCalculations && (
                  <span className="ml-2">vs {selectedEndDate === '6/30/25' ? 'FY24' : 'FY25'}</span>
                )}
              </div>
            )}
          </div>
          <button
            onClick={exportCalculations}
            disabled={!calculations}
            className={`px-4 py-2 rounded-md flex items-center ${
              calculations
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 cursor-not-allowed text-gray-500'
            }`}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Calculations
          </button>
        </div>
      </div>

      {!calculations && !loading && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Calculations Yet</h3>
          <p className="text-gray-600 mb-4">Select a report end date and click "Calculate" to analyze workforce data</p>
          <p className="text-sm text-gray-500">The data file contains workforce information from FY20 to FY25</p>
        </div>
      )}

      {calculations && (
        <>
          {/* Summary Metrics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Summary Calculation Results
              {previousCalculations && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  (showing YoY changes)
                </span>
              )}
            </h2>
            <div className="grid grid-cols-6 gap-4 text-center">
              <div className="border-r">
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-2xl font-bold">{calculations.totalRecords.toLocaleString()}</p>
                {previousCalculations && (
                  <p className="text-xs text-gray-500">
                    vs {previousCalculations.totalRecords.toLocaleString()}
                  </p>
                )}
              </div>
              <div className="border-r">
                <p className="text-sm text-gray-600">BE Staff</p>
                <p className="text-2xl font-bold text-blue-600">{calculations.beStaff.total.toLocaleString()}</p>
                {previousCalculations && (
                  <p className={`text-xs ${calculations.beStaff.total > previousCalculations.beStaff.total ? 'text-green-600' : 'text-red-600'}`}>
                    {calculations.beStaff.total > previousCalculations.beStaff.total ? '+' : ''}
                    {((calculations.beStaff.total - previousCalculations.beStaff.total) / previousCalculations.beStaff.total * 100).toFixed(1)}%
                  </p>
                )}
              </div>
              <div className="border-r">
                <p className="text-sm text-gray-600">BE Faculty</p>
                <p className="text-2xl font-bold text-green-600">{calculations.beFaculty.total.toLocaleString()}</p>
                {previousCalculations && (
                  <p className={`text-xs ${calculations.beFaculty.total > previousCalculations.beFaculty.total ? 'text-green-600' : 'text-red-600'}`}>
                    {calculations.beFaculty.total > previousCalculations.beFaculty.total ? '+' : ''}
                    {((calculations.beFaculty.total - previousCalculations.beFaculty.total) / previousCalculations.beFaculty.total * 100).toFixed(1)}%
                  </p>
                )}
              </div>
              <div className="border-r">
                <p className="text-sm text-gray-600">HSP</p>
                <p className="text-2xl font-bold text-purple-600">{calculations.hsp.total.toLocaleString()}</p>
                {previousCalculations && (
                  <p className={`text-xs ${calculations.hsp.total > previousCalculations.hsp.total ? 'text-green-600' : 'text-red-600'}`}>
                    {calculations.hsp.total > previousCalculations.hsp.total ? '+' : ''}
                    {previousCalculations.hsp.total > 0 
                      ? ((calculations.hsp.total - previousCalculations.hsp.total) / previousCalculations.hsp.total * 100).toFixed(1) + '%'
                      : 'N/A'}
                  </p>
                )}
              </div>
              <div className="border-r">
                <p className="text-sm text-gray-600">Students</p>
                <p className="text-2xl font-bold text-orange-600">{calculations.students.total.toLocaleString()}</p>
                {previousCalculations && (
                  <p className={`text-xs ${calculations.students.total > previousCalculations.students.total ? 'text-green-600' : 'text-red-600'}`}>
                    {calculations.students.total > previousCalculations.students.total ? '+' : ''}
                    {((calculations.students.total - previousCalculations.students.total) / previousCalculations.students.total * 100).toFixed(1)}%
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">Temp</p>
                <p className="text-2xl font-bold text-red-600">{calculations.temp.total.toLocaleString()}</p>
                {previousCalculations && (
                  <p className={`text-xs ${calculations.temp.total > previousCalculations.temp.total ? 'text-green-600' : 'text-red-600'}`}>
                    {calculations.temp.total > previousCalculations.temp.total ? '+' : ''}
                    {((calculations.temp.total - previousCalculations.temp.total) / previousCalculations.temp.total * 100).toFixed(1)}%
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* BE Staff Calculation Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
            <div 
              className="p-4 border-b cursor-pointer hover:bg-gray-50"
              onClick={() => toggleDetails('beStaff')}
            >
              <h3 className="text-lg font-semibold flex items-center justify-between">
                <span>
                  <CheckCircle className="inline h-5 w-5 text-blue-600 mr-2" />
                  Benefit-Eligible Staff Calculation: {calculations.beStaff.total}
                </span>
                <span className="text-sm text-gray-500">
                  {showDetails.beStaff ? '▼' : '▶'}
                </span>
              </h3>
            </div>
            {showDetails.beStaff && (
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-3">
                  Formula: Person Type = "STAFF" AND Assignment Category IN (F12, F11, F09, F10, PT12, PT9, PT11, PT10)
                </p>
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Location Breakdown:</h4>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Object.entries(calculations.beStaff.byLocation).map(([loc, count]) => (
                        <tr key={loc}>
                          <td className="px-4 py-2 text-sm">{loc}</td>
                          <td className="px-4 py-2 text-sm text-right font-medium">{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <details className="text-xs">
                  <summary className="cursor-pointer text-blue-600 hover:underline">Show first 10 records</summary>
                  <div className="mt-2 bg-gray-50 p-2 rounded overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-1">Emp#</th>
                          <th className="text-left p-1">Name</th>
                          <th className="text-left p-1">Location</th>
                          <th className="text-left p-1">Job</th>
                          <th className="text-left p-1">Category</th>
                        </tr>
                      </thead>
                      <tbody>
                        {calculations.beStaff.list.slice(0, 10).map((emp, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="p-1">{emp.empNum}</td>
                            <td className="p-1">{emp.name}</td>
                            <td className="p-1">{emp.location}</td>
                            <td className="p-1">{emp.jobName}</td>
                            <td className="p-1">{emp.assignmentCategory}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              </div>
            )}
          </div>

          {/* BE Faculty Calculation Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
            <div 
              className="p-4 border-b cursor-pointer hover:bg-gray-50"
              onClick={() => toggleDetails('beFaculty')}
            >
              <h3 className="text-lg font-semibold flex items-center justify-between">
                <span>
                  <CheckCircle className="inline h-5 w-5 text-green-600 mr-2" />
                  Benefit-Eligible Faculty Calculation: {calculations.beFaculty.total}
                </span>
                <span className="text-sm text-gray-500">
                  {showDetails.beFaculty ? '▼' : '▶'}
                </span>
              </h3>
            </div>
            {showDetails.beFaculty && (
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-3">
                  Formula: Person Type = "FACULTY" AND Assignment Category IN (F12, F11, F09, F10, PT12, PT9, PT11, PT10)
                </p>
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Location Breakdown:</h4>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Object.entries(calculations.beFaculty.byLocation).map(([loc, count]) => (
                        <tr key={loc}>
                          <td className="px-4 py-2 text-sm">{loc}</td>
                          <td className="px-4 py-2 text-sm text-right font-medium">{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <details className="text-xs">
                  <summary className="cursor-pointer text-green-600 hover:underline">Show first 10 records</summary>
                  <div className="mt-2 bg-gray-50 p-2 rounded overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-1">Emp#</th>
                          <th className="text-left p-1">Name</th>
                          <th className="text-left p-1">Location</th>
                          <th className="text-left p-1">Department</th>
                          <th className="text-left p-1">Category</th>
                        </tr>
                      </thead>
                      <tbody>
                        {calculations.beFaculty.list.slice(0, 10).map((emp, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="p-1">{emp.empNum}</td>
                            <td className="p-1">{emp.name}</td>
                            <td className="p-1">{emp.location}</td>
                            <td className="p-1">{emp.department}</td>
                            <td className="p-1">{emp.assignmentCategory}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              </div>
            )}
          </div>

          {/* HSP Calculation Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
            <div 
              className="p-4 border-b cursor-pointer hover:bg-gray-50"
              onClick={() => toggleDetails('hsp')}
            >
              <h3 className="text-lg font-semibold flex items-center justify-between">
                <span>
                  <CheckCircle className="inline h-5 w-5 text-purple-600 mr-2" />
                  House Staff Physicians (HSP) Calculation: {calculations.hsp.total}
                </span>
                <span className="text-sm text-gray-500">
                  {showDetails.hsp ? '▼' : '▶'}
                </span>
              </h3>
            </div>
            {showDetails.hsp && (
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-3">
                  Formula: Assignment Category = "HSR"
                </p>
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Location Breakdown:</h4>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Object.entries(calculations.hsp.byLocation).map(([loc, count]) => (
                        <tr key={loc}>
                          <td className="px-4 py-2 text-sm">{loc}</td>
                          <td className="px-4 py-2 text-sm text-right font-medium">{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Students Calculation Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
            <div 
              className="p-4 border-b cursor-pointer hover:bg-gray-50"
              onClick={() => toggleDetails('students')}
            >
              <h3 className="text-lg font-semibold flex items-center justify-between">
                <span>
                  <CheckCircle className="inline h-5 w-5 text-orange-600 mr-2" />
                  Student Workers Calculation: {calculations.students.total}
                </span>
                <span className="text-sm text-gray-500">
                  {showDetails.students ? '▼' : '▶'}
                </span>
              </h3>
            </div>
            {showDetails.students && (
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-3">
                  Formula: Assignment Category IN (SUE, CWS)
                </p>
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Location Breakdown:</h4>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Object.entries(calculations.students.byLocation).map(([loc, count]) => (
                        <tr key={loc}>
                          <td className="px-4 py-2 text-sm">{loc}</td>
                          <td className="px-4 py-2 text-sm text-right font-medium">{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Temp Workers Calculation Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
            <div 
              className="p-4 border-b cursor-pointer hover:bg-gray-50"
              onClick={() => toggleDetails('temp')}
            >
              <h3 className="text-lg font-semibold flex items-center justify-between">
                <span>
                  <CheckCircle className="inline h-5 w-5 text-red-600 mr-2" />
                  Temporary Workers Calculation: {calculations.temp.total}
                </span>
                <span className="text-sm text-gray-500">
                  {showDetails.temp ? '▼' : '▶'}
                </span>
              </h3>
            </div>
            {showDetails.temp && (
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-3">
                  Formula: Assignment Category IN (TEMP, NBE, PRN)
                </p>
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Location Breakdown:</h4>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Object.entries(calculations.temp.byLocation).map(([loc, count]) => (
                        <tr key={loc}>
                          <td className="px-4 py-2 text-sm">{loc}</td>
                          <td className="px-4 py-2 text-sm text-right font-medium">{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Location Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">
                <FileText className="inline h-5 w-5 text-gray-600 mr-2" />
                Complete Location Breakdown
              </h3>
            </div>
            <div className="p-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">BE Staff</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">BE Faculty</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">HSP</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Students</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Temp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(calculations.byLocation).map(([location, data]) => (
                    <tr key={location}>
                      <td className="px-4 py-2 text-sm font-medium">{location}</td>
                      <td className="px-4 py-2 text-sm text-right">{data.total}</td>
                      <td className="px-4 py-2 text-sm text-right text-blue-600">{data.beStaff || 0}</td>
                      <td className="px-4 py-2 text-sm text-right text-green-600">{data.beFaculty || 0}</td>
                      <td className="px-4 py-2 text-sm text-right text-purple-600">{data.hsp || 0}</td>
                      <td className="px-4 py-2 text-sm text-right text-orange-600">{data.students || 0}</td>
                      <td className="px-4 py-2 text-sm text-right text-red-600">{data.temp || 0}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-gray-50">
                    <td className="px-4 py-2 text-sm">TOTAL</td>
                    <td className="px-4 py-2 text-sm text-right">{calculations.totalRecords}</td>
                    <td className="px-4 py-2 text-sm text-right text-blue-600">{calculations.beStaff.total}</td>
                    <td className="px-4 py-2 text-sm text-right text-green-600">{calculations.beFaculty.total}</td>
                    <td className="px-4 py-2 text-sm text-right text-purple-600">{calculations.hsp.total}</td>
                    <td className="px-4 py-2 text-sm text-right text-orange-600">{calculations.students.total}</td>
                    <td className="px-4 py-2 text-sm text-right text-red-600">{calculations.temp.total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Assignment Category Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">
                <FileText className="inline h-5 w-5 text-gray-600 mr-2" />
                Assignment Category Distribution
              </h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(calculations.byAssignmentCategory)
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, count]) => (
                    <div key={category} className="flex justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">{category}</span>
                      <span className="text-sm text-gray-600">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Calculation Verification */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-yellow-800 mb-2">
              <AlertCircle className="inline h-4 w-4 mr-1" />
              Calculation Verification
            </h3>
            <div className="text-sm text-yellow-700">
              <p>Total Records Processed: {calculations.totalRecords}</p>
              <p>Sum of Categories: {
                calculations.beStaff.total + 
                calculations.beFaculty.total + 
                calculations.hsp.total + 
                calculations.students.total + 
                calculations.temp.total
              }</p>
              <p className={calculations.totalRecords === (
                calculations.beStaff.total + 
                calculations.beFaculty.total + 
                calculations.hsp.total + 
                calculations.students.total + 
                calculations.temp.total
              ) ? 'text-green-700' : 'text-red-700 font-bold'}>
                {calculations.totalRecords === (
                  calculations.beStaff.total + 
                  calculations.beFaculty.total + 
                  calculations.hsp.total + 
                  calculations.students.total + 
                  calculations.temp.total
                ) ? '✓ Calculations reconciled' : '✗ Discrepancy detected - review categorization logic'}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WorkforceAudit;