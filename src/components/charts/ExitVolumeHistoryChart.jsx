import React, { memo, useMemo } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { TrendingDown, AlertCircle } from 'lucide-react';
import ChartErrorBoundary from '../ui/ChartErrorBoundary';
import { getHistoricalComparison } from '../../utils/exitSurveyAnalytics';

const ExitVolumeHistoryChart = memo(({ 
  height = 400,
  className = "",
  showTitle = true 
}) => {
  // Get historical comparison data
  const historicalData = useMemo(() => {
    const comparison = getHistoricalComparison();
    
    if (!comparison) {
      return [];
    }
    
    return [
      {
        period: comparison.baseline.period,
        date: 'Q1 FY25',
        exits: comparison.baseline.totalExits,
        satisfaction: null, // No survey data available
        hasData: false
      },
      {
        period: comparison.current.period,
        date: 'Q4 FY25',
        exits: comparison.current.totalExits,
        satisfaction: comparison.current.wouldRecommend,
        hasData: true,
        responseRate: comparison.current.responseRate
      }
    ];
  }, []);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{data.period}</p>
          <div className="space-y-1">
            <p className="text-sm text-blue-600">
              Total Exits: <span className="font-bold">{data.exits}</span>
            </p>
            {data.satisfaction !== null && (
              <>
                <p className="text-sm text-green-600">
                  Would Recommend: <span className="font-bold">{data.satisfaction}%</span>
                </p>
                <p className="text-sm text-gray-600">
                  Response Rate: <span className="font-bold">{data.responseRate}%</span>
                </p>
              </>
            )}
            {!data.hasData && (
              <p className="text-xs text-gray-500 italic">No survey data available</p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom label for bars
  const ExitLabel = (props) => {
    const { x, y, width, value } = props;
    return (
      <text
        x={x + width / 2}
        y={y - 5}
        textAnchor="middle"
        className="fill-gray-700 text-sm font-semibold"
      >
        {value}
      </text>
    );
  };

  // Custom label for satisfaction line
  const SatisfactionLabel = (props) => {
    const { x, y, value } = props;
    if (value === null) return null;
    
    return (
      <text
        x={x + 5}
        y={y - 5}
        className="fill-green-600 text-sm font-semibold"
      >
        {value}%
      </text>
    );
  };

  if (historicalData.length === 0) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center gap-2 text-amber-600">
          <AlertCircle size={20} />
          <span className="text-sm font-medium">Historical data not available</span>
        </div>
      </div>
    );
  }

  const comparison = getHistoricalComparison();
  const isImproving = comparison?.changes?.direction === 'improving';

  return (
    <ChartErrorBoundary>
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        {showTitle && (
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Exit Volume History</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Quarterly comparison with satisfaction overlay
                </p>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                isImproving 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                <TrendingDown size={16} className={isImproving ? 'text-green-600' : 'text-red-600'} />
                {Math.abs(comparison?.changes?.exitVolumeChange || 0)}% 
                {isImproving ? 'Improvement' : 'Increase'}
              </div>
            </div>
          </div>
        )}

        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={historicalData}
              margin={{ top: 40, right: 40, left: 40, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis 
                yAxisId="exits"
                orientation="left"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                label={{ value: 'Total Exits', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="satisfaction"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                domain={[0, 100]}
                label={{ value: 'Satisfaction %', angle: 90, position: 'insideRight' }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Exit volume bars */}
              <Bar 
                yAxisId="exits"
                dataKey="exits" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                opacity={0.8}
              >
                <LabelList content={<ExitLabel />} />
              </Bar>
              
              {/* Satisfaction line */}
              <Line
                yAxisId="satisfaction"
                type="monotone"
                dataKey="satisfaction"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 6, fill: '#10b981' }}
                connectNulls={false}
              >
                <LabelList content={<SatisfactionLabel />} />
              </Line>
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Key insights */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-blue-600 text-lg">
                {comparison?.changes?.exitVolumeChange || 0}%
              </div>
              <div className="text-gray-600">Exit Volume Change</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600 text-lg">
                {comparison?.current?.wouldRecommend || 0}%
              </div>
              <div className="text-gray-600">Current Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-purple-600 text-lg">
                {comparison?.current?.responseRate || 0}%
              </div>
              <div className="text-gray-600">Response Rate</div>
            </div>
          </div>
        </div>
      </div>
    </ChartErrorBoundary>
  );
});

ExitVolumeHistoryChart.displayName = 'ExitVolumeHistoryChart';

export default ExitVolumeHistoryChart;