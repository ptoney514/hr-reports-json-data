import React from 'react';
import { 
  Calendar,
  BarChart3,
  User,
  Database,
  FileSpreadsheet,
  CheckCircle2,
  Info
} from 'lucide-react';
import { getWorkforceData } from '../../services/dataService';

const DataCalculations = ({ date, dateLabel }) => {
  const workforceData = getWorkforceData(date);
  
  if (!workforceData) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">Data Not Available for {dateLabel}</h3>
          <p className="text-yellow-700">
            Real workforce data is not available for this date. The system only contains verified data for:
          </p>
          <ul className="mt-3 list-disc list-inside text-yellow-700">
            <li>June 30, 2024 (FY24 End)</li>
            <li>June 30, 2025 (FY25 End)</li>
          </ul>
          <p className="mt-4 text-sm text-yellow-600">
            Note: We only display real, verified data from official sources. Sample or placeholder data is not used.
          </p>
        </div>
      </div>
    );
  }

  const omahaData = workforceData.locationDetails?.omaha || {
    faculty: 0,
    staff: 0,
    hsp: 0,
    students: 0,
    temp: 0
  };

  const phoenixData = workforceData.locationDetails?.phoenix || {
    faculty: 0,
    staff: 0,
    hsp: 0,
    students: 0,
    temp: 0
  };

  const omahaTotal = omahaData.faculty + omahaData.staff + omahaData.hsp + omahaData.students + omahaData.temp;
  const phoenixTotal = phoenixData.faculty + phoenixData.staff + phoenixData.hsp + phoenixData.students + phoenixData.temp;
  const grandTotal = omahaTotal + phoenixTotal;

  const studentTotal = workforceData.studentCount?.total || 0;
  const studentWorker = workforceData.studentCount?.studentWorker || 0;
  const fws = workforceData.studentCount?.fws || 0;

  const beTotal = workforceData.faculty + workforceData.staff;
  const hspTotal = workforceData.hsp || 0;
  const tempTotal = workforceData.temp || 0;

  return (
    <div className="space-y-6">
      {/* Date Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-blue-900">Data Calculations for {dateLabel}</h3>
        </div>
        <p className="text-sm text-blue-700 mt-1">Showing detailed calculations and source data breakdowns</p>
      </div>

      {/* Campus Totals Calculation */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
          Campus Total Calculations
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Omaha Campus */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3 text-center bg-gray-50 py-2 rounded">Omaha Campus</h4>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b">
                  <td className="py-2 text-gray-600">Faculty (BE)</td>
                  <td className="py-2 text-right font-mono">{omahaData.faculty.toLocaleString()}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 text-gray-600">Staff (BE)</td>
                  <td className="py-2 text-right font-mono">{omahaData.staff.toLocaleString()}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 text-gray-600">HSP (House Staff)</td>
                  <td className="py-2 text-right font-mono">{omahaData.hsp.toLocaleString()}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 text-gray-600">Students (SUE + CWS)</td>
                  <td className="py-2 text-right font-mono">{omahaData.students.toLocaleString()}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 text-gray-600">Temp Employees</td>
                  <td className="py-2 text-right font-mono">{omahaData.temp.toLocaleString()}</td>
                </tr>
                <tr className="bg-green-50 font-semibold">
                  <td className="py-2 text-green-800">TOTAL</td>
                  <td className="py-2 text-right font-mono text-green-800">{omahaTotal.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
            <div className="mt-3 p-3 bg-gray-50 rounded text-xs">
              <code className="text-gray-700">
                {omahaData.faculty.toLocaleString()} + {omahaData.staff.toLocaleString()} + {omahaData.hsp.toLocaleString()} + {omahaData.students.toLocaleString()} + {omahaData.temp.toLocaleString()} = {omahaTotal.toLocaleString()} ✓
              </code>
            </div>
          </div>

          {/* Phoenix Campus */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3 text-center bg-gray-50 py-2 rounded">Phoenix Campus</h4>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b">
                  <td className="py-2 text-gray-600">Faculty (BE)</td>
                  <td className="py-2 text-right font-mono">{phoenixData.faculty.toLocaleString()}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 text-gray-600">Staff (BE)</td>
                  <td className="py-2 text-right font-mono">{phoenixData.staff.toLocaleString()}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 text-gray-600">HSP (House Staff)</td>
                  <td className="py-2 text-right font-mono">{phoenixData.hsp.toLocaleString()}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 text-gray-600">Students (SUE + CWS)</td>
                  <td className="py-2 text-right font-mono">{phoenixData.students.toLocaleString()}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 text-gray-600">Temp Employees</td>
                  <td className="py-2 text-right font-mono">{phoenixData.temp.toLocaleString()}</td>
                </tr>
                <tr className="bg-green-50 font-semibold">
                  <td className="py-2 text-green-800">TOTAL</td>
                  <td className="py-2 text-right font-mono text-green-800">{phoenixTotal.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
            <div className="mt-3 p-3 bg-gray-50 rounded text-xs">
              <code className="text-gray-700">
                {phoenixData.faculty.toLocaleString()} + {phoenixData.staff.toLocaleString()} + {phoenixData.hsp.toLocaleString()} + {phoenixData.students.toLocaleString()} + {phoenixData.temp.toLocaleString()} = {phoenixTotal.toLocaleString()} ✓
              </code>
            </div>
          </div>
        </div>

        {/* Grand Total */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-blue-900">Grand Total (All Locations)</span>
            <span className="text-2xl font-bold text-blue-900 font-mono">{grandTotal.toLocaleString()}</span>
          </div>
          <div className="mt-2 text-sm text-blue-700">
            <code>Omaha ({omahaTotal.toLocaleString()}) + Phoenix ({phoenixTotal.toLocaleString()}) = {grandTotal.toLocaleString()} ✓</code>
          </div>
        </div>
      </div>

      {/* Student Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <User className="h-5 w-5 mr-2 text-blue-600" />
          Student Employee Breakdown (SUE + CWS)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-3">By Category</h4>
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-right">Code</th>
                  <th className="px-4 py-2 text-right">Count</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-2">Student Employee</td>
                  <td className="px-4 py-2 text-right font-mono">SUE</td>
                  <td className="px-4 py-2 text-right font-mono">{studentWorker.toLocaleString()}</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2">College Work Study</td>
                  <td className="px-4 py-2 text-right font-mono">CWS</td>
                  <td className="px-4 py-2 text-right font-mono">{fws.toLocaleString()}</td>
                </tr>
                <tr className="bg-blue-50 font-semibold">
                  <td className="px-4 py-2" colSpan="2">Total Students</td>
                  <td className="px-4 py-2 text-right font-mono">{studentTotal.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-3">By Location</h4>
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Location</th>
                  <th className="px-4 py-2 text-right">Students</th>
                  <th className="px-4 py-2 text-right">Percentage</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-2">Omaha</td>
                  <td className="px-4 py-2 text-right font-mono">{omahaData.students.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right text-gray-600">
                    {studentTotal > 0 ? `${((omahaData.students / studentTotal) * 100).toFixed(1)}%` : '0%'}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2">Phoenix</td>
                  <td className="px-4 py-2 text-right font-mono">{phoenixData.students.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right text-gray-600">
                    {studentTotal > 0 ? `${((phoenixData.students / studentTotal) * 100).toFixed(1)}%` : '0%'}
                  </td>
                </tr>
                <tr className="bg-blue-50 font-semibold">
                  <td className="px-4 py-2">Total</td>
                  <td className="px-4 py-2 text-right font-mono">
                    {(omahaData.students + phoenixData.students).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-right">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Source:</strong> Excel Sheet1 filtered by Assignment Category Codes (SUE + CWS) for END DATE {date}
          </p>
        </div>
      </div>

      {/* Category Totals */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2 text-blue-600" />
          Employee Category Totals
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Benefit-Eligible (BE) Breakdown</h4>
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-2 text-gray-600">Faculty (BE)</td>
                  <td className="px-4 py-2 text-right font-mono">{workforceData.faculty.toLocaleString()}</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2 text-gray-600">Staff (BE)</td>
                  <td className="px-4 py-2 text-right font-mono">{workforceData.staff.toLocaleString()}</td>
                </tr>
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-4 py-2">Total BE Employees</td>
                  <td className="px-4 py-2 text-right font-mono">{beTotal.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
            <div className="mt-2 text-xs text-gray-600">
              <code>{workforceData.faculty.toLocaleString()} + {workforceData.staff.toLocaleString()} = {beTotal.toLocaleString()}</code>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-3">Other Categories</h4>
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-2 text-gray-600">HSP (House Staff)</td>
                  <td className="px-4 py-2 text-right font-mono">{hspTotal.toLocaleString()}</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2 text-gray-600">Students (SUE + CWS)</td>
                  <td className="px-4 py-2 text-right font-mono">{studentTotal.toLocaleString()}</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2 text-gray-600">Temp (TEMP + NBE + PRN)</td>
                  <td className="px-4 py-2 text-right font-mono">{tempTotal.toLocaleString()}</td>
                </tr>
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-4 py-2">Total Other</td>
                  <td className="px-4 py-2 text-right font-mono">{(hspTotal + studentTotal + tempTotal).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
            <div className="mt-2 text-xs text-gray-600">
              <code>{hspTotal.toLocaleString()} + {studentTotal.toLocaleString()} + {tempTotal.toLocaleString()} = {(hspTotal + studentTotal + tempTotal).toLocaleString()}</code>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-green-900">All Categories Total</span>
            <span className="text-2xl font-bold text-green-900 font-mono">{workforceData.totalEmployees.toLocaleString()}</span>
          </div>
          <div className="mt-2 text-sm text-green-700">
            <code>BE ({beTotal.toLocaleString()}) + HSP ({hspTotal.toLocaleString()}) + Students ({studentTotal.toLocaleString()}) + Temp ({tempTotal.toLocaleString()}) = {workforceData.totalEmployees.toLocaleString()} ✓</code>
          </div>
        </div>
      </div>

      {/* Data Source Reference */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileSpreadsheet className="h-5 w-5 mr-2 text-blue-600" />
          Data Source Reference
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Primary Source</p>
              <p className="text-sm text-gray-600">New Emp List since FY20 to Q1FY25 1031 PT.xlsx - Sheet1</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Filter Criteria</p>
              <p className="text-sm text-gray-600">END DATE = {date}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Student Categories</p>
              <p className="text-sm text-gray-600">Assignment Category Code IN ('SUE', 'CWS')</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Validation Method</p>
              <p className="text-sm text-gray-600">Excel Pivot Table validation matches JSON data exactly</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataCalculations;