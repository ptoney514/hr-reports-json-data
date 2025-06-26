import React, { useState } from 'react';
import HeadcountChart from './charts/HeadcountChart';
import StartersLeaversChart from './charts/StartersLeaversChart';
import LocationChart from './charts/LocationChart';
import DivisionsChart from './charts/DivisionsChart';
import TurnoverPieChart from './charts/TurnoverPieChart';
import SummaryCard from './ui/SummaryCard';
import { AlertTriangle, Database, RefreshCw } from 'lucide-react';

const ErrorTestComponent = () => {
  const [testScenario, setTestScenario] = useState('normal');

  const getTestData = (scenario) => {
    switch (scenario) {
      case 'empty':
        return [];
      case 'null':
        return null;
      case 'undefined':
        return undefined;
      case 'malformed':
        return [
          { invalidKey: 'test', missingRequiredField: null },
          { anotherBadKey: 123 }
        ];
      case 'single-item':
        return [{ quarter: 'Q1-2024', total: 1000 }];
      case 'normal':
      default:
        return [
          { quarter: 'Q1-2024', total: 2800, faculty: 1200, staff: 1400, students: 200 },
          { quarter: 'Q2-2024', total: 2850, faculty: 1220, staff: 1420, students: 210 },
          { quarter: 'Q3-2024', total: 2900, faculty: 1240, staff: 1440, students: 220 }
        ];
    }
  };

  const scenarios = [
    { value: 'normal', label: 'Normal Data' },
    { value: 'empty', label: 'Empty Array' },
    { value: 'null', label: 'Null Data' },
    { value: 'undefined', label: 'Undefined Data' },
    { value: 'malformed', label: 'Malformed Data' },
    { value: 'single-item', label: 'Single Item' }
  ];

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Error State Testing
          </h1>
          <p className="text-gray-600 mb-4">
            Test how components handle different data scenarios and error states.
          </p>
          
          <div className="flex items-center gap-4">
            <label className="font-medium text-gray-700">Test Scenario:</label>
            <select
              value={testScenario}
              onChange={(e) => setTestScenario(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {scenarios.map(scenario => (
                <option key={scenario.value} value={scenario.value}>
                  {scenario.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Summary Cards */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Summary Cards</h3>
            <div className="space-y-4">
              <SummaryCard
                title="Total Employees"
                value={testScenario === 'null' ? null : testScenario === 'undefined' ? undefined : '2,847'}
                icon={Database}
                change={testScenario === 'malformed' ? 'invalid' : '+2.1%'}
                trend="up"
              />
              <SummaryCard
                title="Error Test"
                value={testScenario === 'empty' ? '' : 'Normal'}
                icon={AlertTriangle}
                change={testScenario === 'normal' ? '+5%' : null}
                trend={testScenario === 'normal' ? 'up' : 'down'}
              />
            </div>
          </div>

          {/* Headcount Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Headcount Chart</h3>
            <HeadcountChart
              data={getTestData(testScenario)}
              title="Test Headcount Chart"
              height={300}
            />
          </div>

          {/* Starters/Leavers Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Starters/Leavers Chart</h3>
            <StartersLeaversChart
              data={getTestData(testScenario)}
              title="Test Starters/Leavers"
              height={300}
            />
          </div>

          {/* Location Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Location Chart</h3>
            <LocationChart
              data={testScenario === 'normal' ? [
                { name: 'Omaha', total: 2687, faculty: 1134, staff: 1396, students: 157 },
                { name: 'Phoenix', total: 160, faculty: 100, staff: 60, students: 0 }
              ] : getTestData(testScenario)}
              title="Test Location Chart"
              height={300}
            />
          </div>

          {/* Divisions Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Divisions Chart</h3>
            <DivisionsChart
              data={testScenario === 'normal' ? [
                { name: 'Academic Affairs', total: 567, faculty: 234, staff: 333 },
                { name: 'Student Affairs', total: 234, faculty: 45, staff: 189 },
                { name: 'Research', total: 189, faculty: 123, staff: 66 }
              ] : getTestData(testScenario)}
              title="Test Divisions Chart"
              height={300}
            />
          </div>

          {/* Turnover Pie Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Turnover Pie Chart</h3>
            <TurnoverPieChart
              data={testScenario === 'normal' ? [
                { name: 'Career Advancement', value: 39.2 },
                { name: 'Compensation', value: 22.9 },
                { name: 'Work-Life Balance', value: 13.7 },
                { name: 'Other', value: 24.2 }
              ] : getTestData(testScenario)}
              title="Test Turnover Reasons"
              height={300}
            />
          </div>
        </div>

        {/* Loading State Test */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mt-6">
          <h3 className="text-lg font-semibold mb-4">Loading State Test</h3>
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <RefreshCw className="mx-auto mb-2 text-blue-500 animate-spin" size={32} />
              <p className="text-gray-600">Loading dashboard data...</p>
            </div>
          </div>
        </div>

        {/* Error State Test */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mt-6">
          <h3 className="text-lg font-semibold mb-4">Error State Test</h3>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertTriangle className="mx-auto mb-4 text-red-500" size={48} />
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Something went wrong
            </h3>
            <p className="text-red-600 mb-4">
              Failed to load dashboard data. Please check your connection and try again.
            </p>
            <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
              Retry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorTestComponent; 