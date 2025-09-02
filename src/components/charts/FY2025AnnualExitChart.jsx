import React, { memo, useMemo } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { TrendingDown, Calendar, Users } from 'lucide-react';
import ChartErrorBoundary from '../ui/ChartErrorBoundary';

const FY2025AnnualExitChart = memo(({ 
  height = 500,
  className = "",
  showTitle = true 
}) => {
  // FY2025 complete year data with Q1 and Q4 actual, Q2/Q3 estimated
  const fy2025Data = useMemo(() => {
    return [
      {
        quarter: 'Q1 FY25',
        period: 'Jul-Sep 2024',
        exits: 80,
        satisfaction: null,
        hasData: true,
        hasSurvey: false,
        note: 'Baseline - No Survey'
      },
      {
        quarter: 'Q2 FY25',
        period: 'Oct-Dec 2024',
        exits: 71, // Estimated: 80 → 62 linear progression
        satisfaction: null,
        hasData: false,
        hasSurvey: false,
        note: 'Estimated'
      },
      {
        quarter: 'Q3 FY25',
        period: 'Jan-Mar 2025',
        exits: 66, // Estimated: continuing downward trend
        satisfaction: null,
        hasData: false,
        hasSurvey: false,
        note: 'Estimated'
      },
      {
        quarter: 'Q4 FY25',
        period: 'Apr-Jun 2025',
        exits: 62,
        satisfaction: 83,
        hasData: true,
        hasSurvey: true,
        responseRate: 29,
        note: 'Actual + Survey'
      }
    ];
  }, []);

  // Calculate annual totals
  const annualMetrics = useMemo(() => {
    const totalExits = fy2025Data.reduce((sum, q) => sum + q.exits, 0);
    const actualQuarters = fy2025Data.filter(q => q.hasData);
    const improvement = actualQuarters.length >= 2 ? 
      Math.round(((actualQuarters[0].exits - actualQuarters[actualQuarters.length - 1].exits) / actualQuarters[0].exits) * 100) : 0;
    
    return {
      totalExits,
      improvement,
      finalSatisfaction: fy2025Data[3].satisfaction,
      surveysImplemented: fy2025Data.filter(q => q.hasSurvey).length
    };
  }, [fy2025Data]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg max-w-xs">
          <p className="font-semibold text-gray-900 mb-2">{data.quarter}</p>
          <p className="text-xs text-gray-600 mb-3">{data.period}</p>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-600">Exits:</span>
              <span className="font-bold text-blue-800">{data.exits}</span>
            </div>
            
            {data.satisfaction && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-600">Satisfaction:</span>
                <span className="font-bold text-green-800">{data.satisfaction}%</span>
              </div>
            )}
            
            {data.responseRate && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-purple-600">Response Rate:</span>
                <span className="font-bold text-purple-800">{data.responseRate}%</span>
              </div>
            )}
          </div>
          
          <div className={`mt-3 pt-2 border-t text-xs ${
            data.hasData ? 'text-green-600' : 'text-orange-600'
          }`}>
            <span className="font-medium">{data.note}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom label for exit bars
  const ExitLabel = (props) => {
    const { x, y, width, value, payload } = props;
    if (!payload) return null;
    
    const isEstimated = !payload.hasData;
    
    return (
      <text
        x={x + width / 2}
        y={y - 5}
        textAnchor="middle"
        className={`text-sm font-semibold ${isEstimated ? 'fill-orange-600' : 'fill-gray-700'}`}
      >
        {value}
        {isEstimated && '*'}
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

  return (
    <ChartErrorBoundary>
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        {showTitle && (
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="text-blue-600" size={24} />
                  FY2025 Exit Volume & Satisfaction Trend
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  Complete fiscal year analysis showing quarterly progression and survey implementation
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {annualMetrics.totalExits}
                </div>
                <div className="text-sm text-gray-600">Total FY2025 Exits</div>
              </div>
            </div>
          </div>
        )}

        {/* Annual Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-xl font-bold" style={{color: '#0054A6'}}>{annualMetrics.totalExits}</div>
            <div className="text-sm text-gray-600">Total FY2025 Exits</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <TrendingDown style={{color: '#71CC98'}} className="rotate-180" size={16} />
              <span className="text-xl font-bold" style={{color: '#71CC98'}}>{annualMetrics.improvement}%</span>
            </div>
            <div className="text-sm text-gray-600">Q1 to Q4 Improvement</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold" style={{color: '#71CC98'}}>{annualMetrics.finalSatisfaction}%</div>
            <div className="text-sm text-gray-600">Final Satisfaction (Q4)</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold" style={{color: '#1F74DB'}}>{annualMetrics.surveysImplemented}/4</div>
            <div className="text-sm text-gray-600">Quarters w/ Surveys</div>
          </div>
        </div>

        {/* Main Chart */}
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={fy2025Data}
              margin={{ top: 40, right: 50, left: 40, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="quarter" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                yAxisId="exits"
                orientation="left"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                label={{ value: 'Total Exits', angle: -90, position: 'insideLeft' }}
                domain={[0, 90]}
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
                fill="#0054A6"
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
                dot={(props) => {
                  const { payload } = props;
                  return payload.satisfaction ? 
                    <circle {...props} r={6} fill="#10b981" /> : 
                    null;
                }}
                connectNulls={false}
              >
                <LabelList content={<SatisfactionLabel />} />
              </Line>
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Legend and Notes */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Data Sources</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Actual exit counts (Q1, Q4)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span>Estimated counts* (Q2, Q3)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Satisfaction survey data (Q4 only)</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Key Insights</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 22.5% improvement from Q1 to Q4</li>
                <li>• Survey implementation in Q4 revealed 83% satisfaction</li>
                <li>• Trend suggests retention strategies working</li>
                <li>• Need consistent quarterly surveys for FY2026</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ChartErrorBoundary>
  );
});

FY2025AnnualExitChart.displayName = 'FY2025AnnualExitChart';

export default FY2025AnnualExitChart;