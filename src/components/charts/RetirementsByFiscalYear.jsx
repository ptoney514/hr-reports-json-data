import React, { memo, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import ChartErrorBoundary from '../ui/ChartErrorBoundary';
import { getTurnoverMetrics } from '../../services/dataService';

const RetirementsByFiscalYear = memo(({
  title = "Retirements by Fiscal Year",
  height = 400,
  className = ""
}) => {
  // Get turnover metrics from data service (supports future API integration)
  const turnoverMetrics = getTurnoverMetrics('FY2025');

  // Transform retirements data from metrics
  const retirementData = useMemo(() => {
    return turnoverMetrics.retirementsByFY.map(fy => ({
      year: fy.fiscalYear.replace('FY', ''),
      faculty: fy.faculty,
      staffNonExempt: fy.staffNonExempt,
      staffExempt: fy.staffExempt,
      total: fy.total
    }));
  }, [turnoverMetrics.retirementsByFY]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const total = payload.find(p => p.dataKey === 'total')?.value || 0;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">FY {label}</p>
          {payload.map((entry, index) => (
            entry.dataKey !== 'total' && (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {entry.name}: {entry.value}
              </p>
            )
          ))}
          <p className="text-sm font-semibold mt-1 pt-1 border-t">
            Total: {total}
          </p>
        </div>
      );
    }
    return null;
  };


  return (
    <ChartErrorBoundary
      chartType="Retirements by Fiscal Year"
      title={title}
      height={height}
      className={className}
      onRetry={() => window.location.reload()}
    >
      <div 
        id="retirements-by-fiscal-year"
        data-chart-id="retirements-by-fiscal-year"
        data-chart-title={title}
        className={`bg-white print:bg-white p-6 print:p-4 rounded-lg shadow-sm border print:border-gray ${className}`}
      >
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold print:text-black flex items-center gap-2" style={{color: '#0054A6'}}>
            <TrendingUp size={20} />
            {title}
          </h3>
        </div>

        {/* Line Chart */}
        <ResponsiveContainer width="100%" height={height}>
          <LineChart 
            data={retirementData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="year" 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#d1d5db' }}
              axisLine={{ stroke: '#d1d5db' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#d1d5db' }}
              axisLine={{ stroke: '#d1d5db' }}
              domain={[0, 55]}
              ticks={[0, 10, 20, 30, 40, 50]}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Faculty Line */}
            <Line
              type="monotone"
              dataKey="faculty"
              stroke="#1E6BA8"
              strokeWidth={3}
              dot={{ r: 6, fill: '#1E6BA8' }}
              name="Faculty"
            />
            
            {/* Staff Non-Exempt Line */}
            <Line
              type="monotone"
              dataKey="staffNonExempt"
              stroke="#DC143C"
              strokeWidth={3}
              dot={{ r: 6, fill: '#DC143C' }}
              name="Staff Non-Exempt"
            />
            
            {/* Staff Exempt Line */}
            <Line
              type="monotone"
              dataKey="staffExempt"
              stroke="#7CB342"
              strokeWidth={3}
              dot={{ r: 6, fill: '#7CB342' }}
              name="Staff Exempt"
            />
            
            {/* Total Line */}
            <Line
              type="monotone"
              dataKey="total"
              stroke="#7B61A8"
              strokeWidth={3}
              dot={{ r: 6, fill: '#7B61A8' }}
              name="Total"
            />
            
            {/* Legend */}
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
              iconSize={18}
            />
          </LineChart>
        </ResponsiveContainer>


        {/* Footer Note */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600 italic">
            <strong>Note:</strong> Data represents actual retirement counts by employee category across fiscal years 2018-2025.
          </p>
        </div>
      </div>
    </ChartErrorBoundary>
  );
});

export default RetirementsByFiscalYear;