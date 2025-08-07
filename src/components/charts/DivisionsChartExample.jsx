import React from 'react';
import DivisionsChart from './DivisionsChart';

/**
 * Example component demonstrating the enhanced DivisionsChart with 
 * bar-end label positioning matching the desired design
 */
const DivisionsChartExample = () => {
  // Sample data similar to your actual workforce data structure
  const sampleDivisionsData = [
    { name: "Academic Affairs", total: 2328, faculty: 1862, staff: 466 },
    { name: "Health Sciences", total: 1862, faculty: 980, staff: 882 },
    { name: "Student Affairs", total: 1425, faculty: 232, staff: 1193 },
    { name: "Finance & Admin", total: 886, faculty: 44, staff: 842 },
    { name: "Information Technology", total: 688, faculty: 94, staff: 594 }
  ];

  // Sample percentage data to demonstrate percentage formatting
  const samplePercentageData = [
    { name: "Academic Affairs", percentage: 0.324 },
    { name: "Health Sciences", percentage: 0.259 },
    { name: "Student Affairs", percentage: 0.198 },
    { name: "Finance & Admin", percentage: 0.123 },
    { name: "Information Technology", percentage: 0.096 }
  ];

  return (
    <div className="p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Enhanced Horizontal Bar Charts with End-of-Bar Labels
      </h2>
      
      <div className="space-y-8">
        {/* Regular count data */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Employee Count by Division (Numbers)
          </h3>
          <DivisionsChart
            data={sampleDivisionsData}
            title="Employee Distribution by Division"
            layout="horizontal"
            height={350}
            sortBy="total"
            showRanking={true}
            className="max-w-4xl"
          />
        </div>

        {/* Percentage data */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Division Distribution (Percentages)
          </h3>
          <DivisionsChart
            data={samplePercentageData}
            title="Division Distribution by Percentage"
            layout="horizontal"
            height={300}
            sortBy="percentage"
            showRanking={false}
            className="max-w-4xl"
          />
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Key Features:</h4>
        <ul className="text-blue-800 space-y-1">
          <li>✓ Labels positioned at the end of each individual bar (not container edge)</li>
          <li>✓ Natural staggering based on data values</li>
          <li>✓ Automatic percentage formatting for decimal values</li>
          <li>✓ Proper spacing and professional appearance</li>
          <li>✓ Responsive design with adequate margins</li>
          <li>✓ Maintains accessibility and tooltip functionality</li>
        </ul>
      </div>
    </div>
  );
};

export default DivisionsChartExample;