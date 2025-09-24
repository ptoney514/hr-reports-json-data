import React, { memo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users } from 'lucide-react';
import ChartErrorBoundary from '../ui/ChartErrorBoundary';

const StaffRetirementAnalysis = memo(({ 
  title = "Staff Retirement Analysis",
  height = 400,
  className = ""
}) => {
  // Static data based on the image provided
  const retirementData = {
    averageData: [
      { year: '2019', avgAge: 63.7, avgLOS: 21.7 },
      { year: '2020', avgAge: 64.8, avgLOS: 23.3 },
      { year: '2021', avgAge: 66.5, avgLOS: 23.3 },
      { year: '2022', avgAge: 64.8, avgLOS: 22.6 },
      { year: '2023', avgAge: 65.4, avgLOS: 21.7 },
      { year: '2024', avgAge: 67.1, avgLOS: 24.5 },
      { year: '2025', avgAge: 68.1, avgLOS: 21.5 }
    ],
    retirementDistribution: [
      { name: 'Under', value: 85.9, color: '#0054A6' },
      { name: 'Over', value: 7.8, color: '#FFC627' },
      { name: 'Three-Year', value: 2.6, color: '#95D2F3' },
      { name: 'Two-Year', value: 2.0, color: '#FF6B35' },
      { name: 'One-Year', value: 1.7, color: '#00245D' }
    ]
  };

  // Custom tooltip for line chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">Year {label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name === 'avgAge' ? 'Average Age: ' : 'Average LOS: '}
              {entry.value.toFixed(1)}
              {entry.name === 'avgLOS' ? ' years' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom label for pie chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, index }) => {
    if (value < 2) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="600"
      >
        {`${value.toFixed(1)}%`}
      </text>
    );
  };

  return (
    <ChartErrorBoundary
      chartType="Staff Retirement Analysis"
      title={title}
      height={height}
      className={className}
      onRetry={() => window.location.reload()}
    >
      <div 
        id="staff-retirement-analysis"
        data-chart-id="staff-retirement-analysis"
        data-chart-title={title}
        className={`bg-white print:bg-white p-6 print:p-4 rounded-lg shadow-sm border print:border-gray ${className}`}
      >
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold print:text-black flex items-center gap-2" style={{color: '#0054A6'}}>
            <Users size={20} />
            {title}
          </h3>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column - Line Chart with Data Table */}
          <div className="border rounded-lg p-4" style={{ borderColor: '#E6E6E6' }}>
            <h4 className="text-sm font-semibold mb-3" style={{color: '#00245D'}}>
              Staff Retirees - Average Age and Length of Service
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={retirementData.averageData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="year" 
                  tick={{ fontSize: 11 }}
                  tickLine={{ stroke: '#d1d5db' }}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 11 }}
                  tickLine={{ stroke: '#d1d5db' }}
                  domain={[20, 80]}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  tickLine={{ stroke: '#d1d5db' }}
                  domain={[20, 35]}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Average Age Line */}
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="avgAge"
                  stroke="#DC143C"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#DC143C' }}
                  name="Average Age"
                  label={{ 
                    position: 'top', 
                    fontSize: 10,
                    formatter: (value) => value.toFixed(1)
                  }}
                />
                
                {/* Average LOS Line */}
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgLOS"
                  stroke="#0054A6"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#0054A6' }}
                  name="Average LOS"
                  label={{ 
                    position: 'bottom', 
                    fontSize: 10,
                    formatter: (value) => value.toFixed(1)
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
            
            {/* Legend */}
            <div className="flex justify-center gap-6 mt-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#0054A6' }}></div>
                <span>Average of LOS</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#DC143C' }}></div>
                <span>Average of Age</span>
              </div>
            </div>

          </div>

          {/* Right Column - Pie Chart */}
          <div className="border rounded-lg p-4" style={{ borderColor: '#E6E6E6' }}>
            <h4 className="text-sm font-semibold mb-3" style={{color: '#00245D'}}>
              Staff over or nearing retirement by year
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={retirementData.retirementDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {retirementData.retirementDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Pie Chart Legend */}
            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
              {retirementData.retirementDistribution.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights Section */}
        <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: '#F3F3F0' }}>
          <h4 className="font-semibold mb-3" style={{color: '#00245D'}}>
            Key Insights
          </h4>
          <ul className="space-y-2 text-sm" style={{ color: '#0054A6' }}>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>
                The average age of a staff member who retires is 66 with nearly 23 years of service 
                based on 6-year average.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>
                Currently nearly 7.5% (or 108 staff members) of staff are over this threshold, with 
                around 1% to 2% joining that cohort each year.
              </span>
            </li>
          </ul>
        </div>

        {/* Footer Note */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600 italic">
            <strong>Note:</strong> Data reflects staff retirement patterns and projections based on current demographics.
          </p>
        </div>
      </div>
    </ChartErrorBoundary>
  );
});

export default StaffRetirementAnalysis;