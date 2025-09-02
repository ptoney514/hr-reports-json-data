import React, { memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Target, TrendingDown } from 'lucide-react';

const HiringCompetitivenessChart = memo(({ 
  totalApplications = 7860,
  totalHired = 340,
  internalSuccessRate = 24.0,
  externalSuccessRate = 3.7,
  overallHireRate = 4.3,
  title = "Hiring Competitiveness",
  className = ""
}) => {
  // Calculate competitiveness metrics
  const applicantsPerPosition = Math.round(totalApplications / totalHired);
  
  // Data for the bar chart
  const competitivenessData = [
    {
      category: 'Internal Candidates',
      rate: internalSuccessRate,
      color: '#10B981',
      description: '1 in 4 hired'
    },
    {
      category: 'External Candidates',
      rate: externalSuccessRate,
      color: '#6B7280',
      description: '1 in 27 hired'
    },
    {
      category: 'Overall Rate',
      rate: overallHireRate,
      color: '#0054A6',
      description: `${applicantsPerPosition} applicants per position`
    }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-medium">{data.category}</p>
          <p className="text-sm" style={{color: data.color}}>
            Success Rate: {data.rate}%
          </p>
          <p className="text-xs text-gray-600">{data.description}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-white print:bg-white p-6 print:p-4 rounded-lg shadow-sm border print:border-gray ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Target 
          className="print:text-black" 
          style={{color: '#0054A6'}}
          size={24} 
        />
        <h3 className="text-lg font-semibold print:text-black" style={{color: '#0054A6'}}>
          {title}
        </h3>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Applications */}
        <div className="text-center p-4 rounded-lg" style={{backgroundColor: '#F3F3F0'}}>
          <div className="text-2xl font-bold print:text-black" style={{color: '#0054A6'}}>
            {totalApplications.toLocaleString()}
          </div>
          <div className="text-sm font-medium print:text-black" style={{color: '#00245D'}}>
            Total Applications
          </div>
        </div>

        {/* Total Hired */}
        <div className="text-center p-4 rounded-lg" style={{backgroundColor: '#F3F3F0'}}>
          <div className="text-2xl font-bold" style={{color: '#10B981'}}>
            {totalHired.toLocaleString()}
          </div>
          <div className="text-sm font-medium print:text-black" style={{color: '#00245D'}}>
            Total Hired
          </div>
        </div>

        {/* Competitiveness */}
        <div className="text-center p-4 rounded-lg border-2" style={{borderColor: '#DC2626', backgroundColor: '#FEF2F2'}}>
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingDown size={20} style={{color: '#DC2626'}} />
            <div className="text-2xl font-bold" style={{color: '#DC2626'}}>
              {applicantsPerPosition}:1
            </div>
          </div>
          <div className="text-sm font-medium print:text-black" style={{color: '#00245D'}}>
            Applicants per Position
          </div>
        </div>
      </div>


      {/* Competitiveness Analysis */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold print:text-black" style={{color: '#00245D'}}>
          Competitiveness Indicators
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* High Competitiveness */}
          <div className="p-4 rounded-lg border-l-4" style={{borderColor: '#DC2626', backgroundColor: '#FEF2F2'}}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown size={16} style={{color: '#DC2626'}} />
              <span className="font-semibold text-sm print:text-black" style={{color: '#DC2626'}}>
                Highly Competitive Market
              </span>
            </div>
            <ul className="text-sm space-y-1 print:text-black" style={{color: '#00245D'}}>
              <li>• {overallHireRate.toFixed(0)}% overall success rate</li>
              <li>• {applicantsPerPosition} people compete per position</li>
              <li>• Strong employer brand attraction</li>
            </ul>
          </div>

          {/* Internal Advantage */}
          <div className="p-4 rounded-lg border-l-4" style={{borderColor: '#10B981', backgroundColor: '#F0FDF4'}}>
            <div className="flex items-center gap-2 mb-2">
              <Target size={16} style={{color: '#10B981'}} />
              <span className="font-semibold text-sm print:text-black" style={{color: '#10B981'}}>
                Internal Candidate Priority
              </span>
            </div>
            <ul className="text-sm space-y-1 print:text-black" style={{color: '#00245D'}}>
              <li>• {internalSuccessRate}% internal success rate</li>
              <li>• 6.4x advantage over external</li>
              <li>• Cultural fit prioritization</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Insight */}
      <div className="mt-6 p-4 rounded-lg" style={{backgroundColor: '#F3F3F0'}}>
        <p className="text-sm print:text-black" style={{color: '#00245D'}}>
          <strong>Strategic Insight:</strong> The {overallHireRate.toFixed(0)}% overall hire rate indicates Creighton maintains 
          rigorous selection standards while prioritizing internal talent development. External candidates 
          face significant competition, with only 1 in {Math.round(100/externalSuccessRate)} being successful.
        </p>
      </div>
    </div>
  );
});

export default HiringCompetitivenessChart;