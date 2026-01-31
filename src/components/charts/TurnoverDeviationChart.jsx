import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, LabelList } from 'recharts';
import { getTurnoverMetrics } from '../../services/dataService';

const TurnoverDeviationChart = ({ data = [], title = "FY2025 YTD Benefit Eligible Staff Turnover Rate Deviation from Average" }) => {
  // Get turnover metrics from data service (supports future API integration)
  const turnoverMetrics = getTurnoverMetrics('FY2025');

  // Transform staff deviation data from metrics
  const departmentTurnoverRates = turnoverMetrics.staffDeviation.map(dept => ({
    name: dept.department,
    rate: dept.rate
  }));

  // Get the average turnover rate from metrics
  const averageRate = turnoverMetrics.staffAverageRate;
  
  // Calculate deviations and sort by deviation
  const deviationData = departmentTurnoverRates
    .filter(dept => dept.name !== 'Total Staff Turnover') // Remove the average line
    .map(dept => ({
      name: `${dept.name} (${dept.rate}%)`,  // Include rate in name for print visibility
      nameOnly: dept.name,  // Keep original name for tooltips
      deviation: parseFloat((dept.rate - averageRate).toFixed(1)),
      actualRate: dept.rate,
      isAboveAverage: dept.rate > averageRate
    }))
    .sort((a, b) => a.deviation - b.deviation); // Sort from most negative to most positive

  // Custom label formatter to show department names properly
  const CustomXAxisTick = ({ x, y, payload }) => {
    const maxLength = 30;
    let displayName = payload.value;
    if (displayName.length > maxLength) {
      displayName = displayName.substring(0, maxLength) + '...';
    }
    
    return (
      <g transform={`translate(${x},${y})`}>
        <text 
          x={0} 
          y={0} 
          dy={16} 
          textAnchor="end" 
          fill="#666" 
          fontSize={10}
          transform="rotate(-45)"
        >
          {displayName}
        </text>
      </g>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded shadow-lg border">
          <p className="font-semibold text-sm">{data.nameOnly || data.name}</p>
          <p className="text-xs text-gray-600">
            Turnover Rate: {data.actualRate}%
          </p>
          <p className={`text-xs font-medium ${data.isAboveAverage ? 'text-red-600' : 'text-green-600'}`}>
            Deviation: {data.deviation > 0 ? '+' : ''}{data.deviation}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">
          Red bars indicate above-average turnover (opportunity areas) | Green bars indicate below-average turnover
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Average Staff Turnover Rate: {averageRate}%
        </p>
      </div>

      <div style={{ width: '100%', height: 600 }}>
        <ResponsiveContainer>
          <BarChart
            data={deviationData}
            margin={{ top: 20, right: 30, left: 120, bottom: 120 }}
            layout="horizontal"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name"
              type="category"
              tick={<CustomXAxisTick />}
              interval={0}
              height={100}
            />
            <YAxis 
              type="number"
              domain={[-15, 20]}
              ticks={[-15, -10, -5, 0, 5, 10, 15, 20]}
              tickFormatter={(value) => `${value}%`}
              label={{ 
                value: 'Deviation from Average Turnover Rate (%)', 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: 12 }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Reference line at 0 (average) */}
            <ReferenceLine 
              y={0} 
              stroke="#666" 
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{
                value: "Avg (13.6%)",
                position: "insideTopRight",
                offset: 10,
                style: { fontSize: 11, fill: '#666', fontWeight: 'bold' }
              }}
            />
            
            <Bar dataKey="deviation" radius={[4, 4, 0, 0]}>
              {deviationData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isAboveAverage ? '#DC2626' : '#16A34A'} 
                />
              ))}
              <LabelList 
                dataKey="deviation" 
                position="center"
                fill="white"
                fontSize={8}
                fontWeight="bold"
                formatter={(value) => {
                  // Only show label if the bar is large enough
                  if (Math.abs(value) < 2.0) return '';
                  return `${value > 0 ? '+' : ''}${value}%`;
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-600 rounded"></div>
          <span className="text-gray-600">Below Average (Better Retention)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-600 rounded"></div>
          <span className="text-gray-600">Above Average (Higher Turnover)</span>
        </div>
      </div>

      {/* Strategic Insights Section */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Problem Areas Card */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-red-800 mb-2">High Turnover Areas</h4>
              <ul className="text-xs text-red-700 space-y-1">
                <li>• Student Services leads at 30.9% (17.3% above average)</li>
                <li>• Professional & Continuing Ed at 26.1% (12.5% above average)</li>
                <li>• Health science areas showing 19-26% turnover rates</li>
                <li>• Pattern: Student-facing and health science areas most affected</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Strong Retention Card */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-green-800 mb-2">Strong Retention Areas</h4>
              <ul className="text-xs text-green-700 space-y-1">
                <li>• Executive offices show 0% turnover (exceptional retention)</li>
                <li>• Administrative functions 10% below average</li>
                <li>• Finance & HR maintaining single-digit turnover rates</li>
                <li>• Pattern: Leadership & support functions demonstrate stability</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Insight */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-blue-800 mb-1">Strategic Insight:</h4>
            <p className="text-xs text-blue-700 leading-relaxed">
              The turnover pattern reveals a divide where executive and administrative offices demonstrate exceptional retention while 
              some student-facing and health science areas experience significant attrition. With 11 departments showing turnover rates above 
              20%, targeted interventions could include heightened focus on workload management, compensation review, and career development pathways 
              in high-turnover areas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurnoverDeviationChart;