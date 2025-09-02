import React, { memo, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, CheckCircle, Users, TrendingUp } from 'lucide-react';
import { calculateDepartmentRiskScores, getRiskLevel } from '../../utils/exitSurveyAnalytics';

const DepartmentExitAnalysis = memo(({ 
  height = 400,
  className = "",
  showTitle = true,
  layout = "chart" // "chart" | "table" | "both"
}) => {
  // Get department risk analysis
  const departmentData = useMemo(() => {
    const riskScores = calculateDepartmentRiskScores();
    
    // Sort by risk score descending to show highest risk first
    return riskScores
      .filter(dept => dept.exits > 0) // Only show departments with actual exits
      .sort((a, b) => b.riskScore - a.riskScore);
  }, []);

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg max-w-xs">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Exits:</span>
              <span className="font-medium text-red-600">{data.exits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Responses:</span>
              <span className="font-medium text-blue-600">{data.responses}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Response Rate:</span>
              <span className="font-medium text-green-600">{data.responseRate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Risk Level:</span>
              <span className={`font-medium ${
                data.riskLevel === 'Critical' ? 'text-red-600' :
                data.riskLevel === 'High' ? 'text-orange-600' :
                data.riskLevel === 'Moderate' ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {data.riskLevel}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Get risk level color
  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Critical': return '#dc2626';
      case 'High': return '#ea580c';
      case 'Moderate': return '#d97706';
      case 'Low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  // Get risk icon
  const getRiskIcon = (riskLevel) => {
    switch (riskLevel) {
      case 'Critical': 
      case 'High': 
        return <AlertTriangle size={16} className="text-red-500" />;
      case 'Moderate': 
        return <AlertTriangle size={16} className="text-yellow-500" />;
      case 'Low': 
        return <CheckCircle size={16} className="text-green-500" />;
      default: 
        return <Users size={16} className="text-gray-500" />;
    }
  };

  if (departmentData.length === 0) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center gap-2 text-amber-600">
          <AlertTriangle size={20} />
          <span className="text-sm font-medium">No department exit data available</span>
        </div>
      </div>
    );
  }

  const chartData = departmentData.map(dept => ({
    ...dept,
    color: getRiskColor(dept.riskLevel),
    shortName: dept.department.length > 15 ? 
      dept.department.substring(0, 12) + '...' : 
      dept.department
  }));

  const renderChart = () => (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis 
            dataKey="shortName"
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
            tick={{ fontSize: 11, fill: '#6b7280' }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            label={{ value: 'Total Exits', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="exits" 
            fill="#3b82f6"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left p-3 font-medium text-gray-700">Department</th>
            <th className="text-center p-3 font-medium text-gray-700">Exits</th>
            <th className="text-center p-3 font-medium text-gray-700">Responses</th>
            <th className="text-center p-3 font-medium text-gray-700">Response Rate</th>
            <th className="text-center p-3 font-medium text-gray-700">Risk Level</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {departmentData.map((dept, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="p-3">
                <div className="flex items-center gap-2">
                  {getRiskIcon(dept.riskLevel)}
                  <span className="font-medium text-gray-900">{dept.department}</span>
                </div>
              </td>
              <td className="p-3 text-center">
                <span className="font-semibold text-red-600">{dept.exits}</span>
              </td>
              <td className="p-3 text-center">
                <span className="font-semibold text-blue-600">{dept.responses}</span>
              </td>
              <td className="p-3 text-center">
                <span className={`font-semibold ${
                  parseFloat(dept.responseRate) >= 50 ? 'text-green-600' :
                  parseFloat(dept.responseRate) >= 30 ? 'text-yellow-600' :
                  parseFloat(dept.responseRate) > 0 ? 'text-orange-600' :
                  'text-red-600'
                }`}>
                  {dept.responseRate}
                </span>
              </td>
              <td className="p-3 text-center">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  dept.riskLevel === 'Critical' ? 'bg-red-100 text-red-700' :
                  dept.riskLevel === 'High' ? 'bg-orange-100 text-orange-700' :
                  dept.riskLevel === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {dept.riskLevel}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Summary stats
  const totalExits = departmentData.reduce((sum, dept) => sum + dept.exits, 0);
  const totalResponses = departmentData.reduce((sum, dept) => sum + dept.responses, 0);
  const avgResponseRate = totalResponses > 0 ? 
    Math.round((totalResponses / totalExits) * 100) : 0;
  const highRiskDepts = departmentData.filter(dept => 
    dept.riskLevel === 'Critical' || dept.riskLevel === 'High'
  ).length;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {showTitle && (
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Department Exit Analysis</h3>
              <p className="text-sm text-gray-600 mt-1">
                Q4 FY25 exit patterns and response rates by department
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users size={16} />
              <span>{departmentData.length} departments with exits</span>
            </div>
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{totalExits}</div>
          <div className="text-sm text-gray-600">Total Exits</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{totalResponses}</div>
          <div className="text-sm text-gray-600">Total Responses</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{avgResponseRate}%</div>
          <div className="text-sm text-gray-600">Avg Response Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{highRiskDepts}</div>
          <div className="text-sm text-gray-600">High Risk Depts</div>
        </div>
      </div>

      {/* Content based on layout */}
      {layout === 'chart' && renderChart()}
      {layout === 'table' && renderTable()}
      {layout === 'both' && (
        <div className="space-y-6">
          {renderChart()}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-base font-semibold text-gray-900 mb-4">Detailed Breakdown</h4>
            {renderTable()}
          </div>
        </div>
      )}

      {/* Key Insights */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium text-gray-900 mb-2">🎯 Focus Areas</h5>
            <ul className="space-y-1 text-gray-600">
              {departmentData.slice(0, 3).map((dept, index) => (
                <li key={index}>
                  • {dept.department}: {dept.exits} exits ({dept.responseRate} response rate)
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-gray-900 mb-2">📈 Success Stories</h5>
            <ul className="space-y-1 text-gray-600">
              {departmentData
                .filter(dept => parseFloat(dept.responseRate) >= 50)
                .slice(0, 3)
                .map((dept, index) => (
                  <li key={index}>
                    • {dept.department}: {dept.responseRate} response rate
                  </li>
                ))}
              {departmentData.filter(dept => parseFloat(dept.responseRate) >= 50).length === 0 && (
                <li className="text-amber-600">• Focus needed on improving response rates across departments</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
});

DepartmentExitAnalysis.displayName = 'DepartmentExitAnalysis';

export default DepartmentExitAnalysis;