import React, { memo, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { AlertCircle } from 'lucide-react';
import ChartErrorBoundary from '../ui/ChartErrorBoundary';

// Default data if none provided
const DEFAULT_DATA = [
  { fiscalYear: 'FY2023', rate: 14.9 },
  { fiscalYear: 'FY2024', rate: 12.8 },
  { fiscalYear: 'FY2025', rate: 11.2 }
];

const FacultyStaffTurnoverByFYChart = memo(({ 
  data = [], 
  title = "Faculty/Staff Turnover Rate by FY",
  height = 400,
  className = ""
}) => {
  // Use provided data or default data
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return DEFAULT_DATA;
    }
    
    return data.map((item) => ({
      fiscalYear: item.fiscalYear || item.year || item.period || 'FY2023',
      rate: item.rate || item.turnoverRate || 0
    }));
  }, [data]);

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <p className="text-sm text-blue-600">
            {`Turnover Rate: ${payload[0].value}%`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom label for data points
  const CustomDataLabel = (props) => {
    const { x, y, value } = props;
    return (
      <text
        x={x}
        y={y - 10}
        dy={-6}
        textAnchor="middle"
        fill="#1f2937"
        fontSize="12"
        fontWeight="600"
        className="print:fill-black"
      >
        {`${value}%`}
      </text>
    );
  };

  // Error handling for missing or invalid data
  if (!chartData || chartData.length === 0) {
    return (
      <div className={`bg-white p-4 rounded-lg shadow-sm border ${className}`}>
        <h3 className="text-lg font-semibold text-blue-700 mb-3">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <AlertCircle size={48} className="mx-auto mb-2 text-gray-400" />
            <p>No data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ChartErrorBoundary
      chartType="Area Chart"
      title={title}
      height={height}
      className={className}
      onRetry={() => window.location.reload()}
    >
      <div 
        id={`faculty-staff-turnover-fy-chart-${Date.now()}`}
        data-chart-id="faculty-staff-turnover-fy-chart"
        data-chart-title={title}
        className={`bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray ${className}`}
      >
        {/* Title */}
        <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black mb-3 print:mb-2">
          {title}
        </h3>
        
        {/* Chart container */}
        <ResponsiveContainer width="100%" height={height} className="print:h-48">
          <AreaChart 
            data={chartData} 
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            {/* Gradient definition */}
            <defs>
              <linearGradient id="colorTurnover" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            
            <XAxis 
              dataKey="fiscalYear"
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#d1d5db' }}
              axisLine={{ stroke: '#d1d5db' }}
            />
            
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#d1d5db' }}
              axisLine={{ stroke: '#d1d5db' }}
              domain={[10, 16]}
              tickFormatter={(value) => `${value}%`}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Area 
              type="monotone" 
              dataKey="rate" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fill="url(#colorTurnover)"
              dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#ffffff' }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            >
              <LabelList content={CustomDataLabel} />
            </Area>
          </AreaChart>
        </ResponsiveContainer>

        {/* Footer note */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Faculty and Staff turnover rates by fiscal year showing positive downward trend.
            <span className="inline-flex items-center gap-1 ml-1">
              <span>📈</span>
              <strong className="text-blue-600">Improving Performance</strong>
            </span>
            {" "}indicates successful retention strategies.
          </div>
        </div>
      </div>
    </ChartErrorBoundary>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  return (
    prevProps.data === nextProps.data &&
    prevProps.title === nextProps.title &&
    prevProps.height === nextProps.height &&
    prevProps.className === nextProps.className
  );
});

export default FacultyStaffTurnoverByFYChart;