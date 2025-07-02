import React, { useState } from 'react';
import { Printer, Eye, Download, FileText } from 'lucide-react';
import DashboardLayout from '../dashboards/DashboardLayout';
import SummaryCard from '../ui/SummaryCard';
import HeadcountChart from '../charts/HeadcountChart';
import TurnoverPieChart from '../charts/TurnoverPieChart';
import LocationChart from '../charts/LocationChart';
import { PrintButton, PrintSection, PrintDataTable } from '../ui/PrintUtilities';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PrintTestComponent = () => {
  const [printPreview, setPrintPreview] = useState(false);
  
  // Sample data for testing
  const sampleData = [
    { name: 'Academic Affairs', employees: 567, budget: 12450000 },
    { name: 'Student Affairs', employees: 234, budget: 5670000 },
    { name: 'Research', employees: 189, budget: 8920000 },
    { name: 'Administration', employees: 145, budget: 3450000 },
    { name: 'IT Services', employees: 98, budget: 2100000 }
  ];

  const tableData = [
    {
      department: 'Academic Affairs',
      employees: 567,
      vacancies: 18,
      vacancyRate: '3.2%',
      budget: '$12,450,000'
    },
    {
      department: 'Student Affairs', 
      employees: 234,
      vacancies: 7,
      vacancyRate: '2.9%',
      budget: '$5,670,000'
    },
    {
      department: 'Research & Innovation',
      employees: 189,
      vacancies: 12,
      vacancyRate: '6.3%',
      budget: '$8,920,000'
    }
  ];

  const tableColumns = [
    { key: 'department', header: 'Department' },
    { key: 'employees', header: 'Employees', format: 'number' },
    { key: 'vacancies', header: 'Vacancies', format: 'number' },
    { key: 'vacancyRate', header: 'Vacancy Rate' },
    { key: 'budget', header: 'Budget' }
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleBeforePrint = () => {
    console.log('Preparing for print...');
  };

  const handleAfterPrint = () => {
    console.log('Print completed');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Print Controls */}
      <div className="no-print bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Print Test Dashboard</h1>
              <p className="text-gray-600">Test the print functionality with sample dashboard content</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPrintPreview(!printPreview)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                <Eye size={16} />
                {printPreview ? 'Exit Preview' : 'Print Preview'}
              </button>
              
              <PrintButton
                onBeforePrint={handleBeforePrint}
                onAfterPrint={handleAfterPrint}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <Printer size={16} />
                Print Dashboard
              </PrintButton>
            </div>
          </div>
        </div>
      </div>

      {/* Print Instructions */}
      <div className="no-print bg-blue-50 border-b border-blue-200 p-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Print Features Demonstrated</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <h3 className="font-medium text-blue-800 mb-1">Layout Optimization</h3>
              <ul className="list-disc list-inside text-blue-700 space-y-1">
                <li>A4/Letter page size</li>
                <li>Proper margins</li>
                <li>Page break controls</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-blue-800 mb-1">Chart Rendering</h3>
              <ul className="list-disc list-inside text-blue-700 space-y-1">
                <li>High-quality chart output</li>
                <li>White backgrounds</li>
                <li>Proper sizing</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-blue-800 mb-1">Headers & Footers</h3>
              <ul className="list-disc list-inside text-blue-700 space-y-1">
                <li>Company branding</li>
                <li>Date and filters</li>
                <li>Page numbers</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-blue-800 mb-1">Interactive Elements</h3>
              <ul className="list-disc list-inside text-blue-700 space-y-1">
                <li>Buttons hidden</li>
                <li>Tooltips removed</li>
                <li>Clean layout</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className={printPreview ? 'print-preview' : ''}>
        <DashboardLayout
          title="Print Test Dashboard"
          subtitle="Demonstration of Print-Optimized Layout"
          showFilters={true}
          showExport={true}
          gridCols="grid-cols-1 lg:grid-cols-2"
          availableFilters={{
            location: ['All Locations', 'Main Campus', 'Omaha Campus', 'Remote'],
            division: ['All Divisions', 'Academic Affairs', 'Student Affairs', 'Research'],
            employeeType: ['All Types', 'Faculty', 'Staff', 'Students']
          }}
        >
          {/* Summary Cards Section */}
          <PrintSection title="Key Metrics" className="lg:col-span-2">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:gap-2">
              <SummaryCard
                title="Total Employees"
                value="2,847"
                change={2.5}
                changeType="percentage"
                subtitle="vs last quarter"
                trend="positive"
              />
              <SummaryCard
                title="Open Positions"
                value="87"
                change={-12}
                changeType="number"
                subtitle="vs last month"
                trend="positive"
              />
              <SummaryCard
                title="Vacancy Rate"
                value="3.1%"
                change={-0.4}
                changeType="percentage"
                subtitle="target: 2.5%"
                trend="positive"
              />
              <SummaryCard
                title="Avg. Tenure"
                value="8.2 years"
                change={0.3}
                changeType="number"
                subtitle="university-wide"
                trend="positive"
              />
            </div>
          </PrintSection>

          {/* Charts Section */}
          <div className="chart-container page-break-inside-avoid">
            <h3 className="chart-title">Employee Distribution by Department</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sampleData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="employees" fill="#1e40af" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container page-break-inside-avoid">
            <h3 className="chart-title">Budget Allocation</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sampleData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${(value/1000000).toFixed(1)}M`, 'Budget']} />
                <Bar dataKey="budget" fill="#059669" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Data Table Section */}
          <PrintSection title="Department Summary" className="lg:col-span-2 page-break-before">
            <PrintDataTable
              data={tableData}
              columns={tableColumns}
              maxRows={10}
              className="mt-4"
            />
          </PrintSection>

          {/* Additional Information */}
          <PrintSection title="Report Notes" className="lg:col-span-2">
            <div className="bg-gray-50 print:bg-white p-4 print:p-2 rounded border">
              <ul className="space-y-2 text-sm print:text-xs">
                <li>• Data reflects current staffing levels as of the report generation date</li>
                <li>• Vacancy rates are calculated based on approved position counts</li>
                <li>• Budget figures include both salary and benefits allocations</li>
                <li>• Tenure calculations exclude temporary and contract positions</li>
              </ul>
            </div>
          </PrintSection>
        </DashboardLayout>
      </div>

      {/* Print-only footer information */}
      <div className="print-only print-metadata mt-8">
        <div className="border-t pt-4">
          <div className="text-center text-xs text-gray-600">
            <p><strong>Confidential Document</strong> - University System HR Analytics</p>
            <p>Generated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
            <p>For internal use only - Do not distribute without authorization</p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          .print-only {
            display: block !important;
          }
          
          body {
            background: white !important;
          }
          
          .chart-container {
            page-break-inside: avoid !important;
            margin-bottom: 20pt !important;
          }
          
          .dashboard-section {
            page-break-inside: avoid !important;
          }
          
          .page-break-before {
            page-break-before: always !important;
          }
        }
        
        .print-preview {
          background: #f5f5f5;
          padding: 20px;
        }
        
        .print-preview .dashboard-layout {
          background: white;
          max-width: 8.5in;
          margin: 0 auto;
          padding: 0.75in 0.5in;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
};

export default PrintTestComponent; 