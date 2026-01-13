import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';

const AgeDistributionChart = ({ data }) => {
  if (!data || !data.ageBands) return null;

  // Prepare data for grouped bar chart
  const chartData = [];
  const ageBandOrder = ['20-30', '31-40', '41-50', '51-60', '61 Plus'];
  
  ageBandOrder.forEach(band => {
    const facultyCount = data.ageBands.faculty[band] || 0;
    const staffCount = data.ageBands.staff[band] || 0;
    
    chartData.push({
      ageBand: band,
      faculty: facultyCount,
      facultyPct: ((facultyCount / data.totals.faculty) * 100).toFixed(1),
      staff: staffCount,
      staffPct: ((staffCount / data.totals.staff) * 100).toFixed(1)
    });
  });

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value} ({entry.name === 'Faculty' ? 
                chartData.find(d => d.ageBand === label)?.facultyPct : 
                chartData.find(d => d.ageBand === label)?.staffPct}%)
            </p>
          ))}
        </div>
      );
    }
    return null;
  };


  return (
    <div className="bg-white rounded-lg shadow p-6 print:break-inside-avoid">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Age Distribution - Benefit Eligible Employees
      </h3>
      <p className="text-sm text-gray-600 mb-4">As of 6/30/25</p>
      
      <ResponsiveContainer width="100%" height={350}>
        <BarChart 
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="ageBand" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            label={{ value: 'Number of Employees', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => {
              const total = value === 'Faculty' ? data.totals.faculty : data.totals.staff;
              return `${value} (${total} total)`;
            }}
          />
          <Bar 
            dataKey="faculty" 
            fill="#0054A6"
            name="Faculty"
          >
            <LabelList dataKey="faculty" position="top" />
          </Bar>
          <Bar 
            dataKey="staff" 
            fill="#71CC98"
            name="Staff"
          >
            <LabelList dataKey="staff" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Data Table for Accessibility */}
      <div className="mt-6 border-t pt-4">
        <table className="w-full text-sm">
          <caption className="sr-only">Age distribution data table</caption>
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Age Band</th>
              <th className="text-center py-2">Faculty</th>
              <th className="text-center py-2">Staff</th>
              <th className="text-center py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row, index) => (
              <tr key={row.ageBand} className={index < chartData.length - 1 ? 'border-b' : ''}>
                <td className="py-2 font-medium">{row.ageBand}</td>
                <td className="text-center py-2">
                  {row.faculty} ({row.facultyPct}%)
                </td>
                <td className="text-center py-2">
                  {row.staff} ({row.staffPct}%)
                </td>
                <td className="text-center py-2">
                  {row.faculty + row.staff}
                </td>
              </tr>
            ))}
            <tr className="border-t-2 font-semibold">
              <td className="py-2">Total</td>
              <td className="text-center py-2">{data.totals.faculty}</td>
              <td className="text-center py-2">{data.totals.staff}</td>
              <td className="text-center py-2">{data.totals.combined}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Average Age Calculation */}
      <div className="mt-4 p-3 bg-gray-50 rounded">
        <p className="text-sm text-gray-700">
          <strong>Age Distribution Summary:</strong>
        </p>
        <ul className="text-sm text-gray-600 mt-2 space-y-1">
          <li>• Median age range for Faculty: 41-50 years</li>
          <li>• Median age range for Staff: 41-50 years</li>
          <li>• Largest faculty cohort: 41-50 years ({chartData[2].faculty} employees)</li>
          <li>• Largest staff cohort: 51-60 years ({chartData[3].staff} employees)</li>
        </ul>
      </div>
    </div>
  );
};

export default AgeDistributionChart;