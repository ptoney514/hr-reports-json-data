import React from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';

const EthnicityBreakdownChart = ({ data }) => {
  if (!data || !data.ethnicity) return null;

  // Consolidate and clean ethnicity data
  const consolidateEthnicityData = (ethnicityObj) => {
    const consolidated = {};
    
    Object.entries(ethnicityObj).forEach(([key, value]) => {
      // Consolidate similar categories
      let normalizedKey = key;
      if (key.toLowerCase().includes('not disclosed')) {
        normalizedKey = 'Not Disclosed';
      } else if (key === 'More than one Ethnicity' || key === 'Two or more races') {
        normalizedKey = 'Two or More Races';
      }
      
      consolidated[normalizedKey] = (consolidated[normalizedKey] || 0) + value;
    });
    
    return consolidated;
  };

  // Process faculty data
  const facultyEthnicity = consolidateEthnicityData(data.ethnicity.faculty);
  const facultyData = Object.entries(facultyEthnicity)
    .map(([ethnicity, count]) => ({
      name: ethnicity === 'Native Hawaiian or other Pacific Islander' ? 'Pacific Islander' : ethnicity,
      value: count,
      percentage: ((count / data.totals.faculty) * 100).toFixed(1)
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6); // Top 6 categories for donut chart

  // Process staff data
  const staffEthnicity = consolidateEthnicityData(data.ethnicity.staff);
  const staffData = Object.entries(staffEthnicity)
    .map(([ethnicity, count]) => ({
      name: ethnicity === 'Native Hawaiian or other Pacific Islander' ? 'Pacific Islander' : ethnicity,
      value: count,
      percentage: ((count / data.totals.staff) * 100).toFixed(1)
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6); // Top 6 categories for donut chart

  // Colors for different ethnicities
  const COLORS = {
    'White': '#0054A6',           // Creighton Blue
    'Asian': '#1F74DB',           // Light Blue  
    'Black or African American': '#71CC98', // Green
    'Hispanic or Latino': '#FFC72C',        // Yellow
    'Not Disclosed': '#D7D2CB',            // Warm Gray
    'Two or More Races': '#95D2F3',        // Sky Blue
    'American Indian or Alaska Native': '#00245D', // Creighton Navy
    'Pacific Islander': '#F3F3F0'          // Light Gray
  };

  const getColor = (ethnicity) => COLORS[ethnicity] || '#808080';

  // Custom label to show both count and percentage
  const renderCustomLabel = (entry) => {
    return `${entry.value} (${entry.percentage}%)`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-2 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p>Count: {data.value}</p>
          <p>Percentage: {data.payload.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  // Custom legend with counts
  const renderCustomLegend = (props) => {
    const { payload } = props;
    return (
      <ul className="flex flex-wrap justify-center gap-3 mt-2">
        {payload.map((entry, index) => (
          <li key={`item-${index}`} className="flex items-center text-xs">
            <span 
              className="inline-block w-3 h-3 mr-1" 
              style={{ backgroundColor: entry.color }}
            />
            <span>
              {entry.value}: {entry.payload.value} ({entry.payload.percentage}%)
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 print:break-inside-avoid">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Ethnicity Distribution - Benefit Eligible Employees
      </h3>
      <p className="text-sm text-gray-600 mb-4">As of 6/30/25</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Faculty Chart */}
        <div>
          <h4 className="text-md font-medium text-center mb-2 text-gray-700">
            Faculty ({data.totals.faculty} total)
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={facultyData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                innerRadius={50}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {facultyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={renderCustomLegend} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Staff Chart */}
        <div>
          <h4 className="text-md font-medium text-center mb-2 text-gray-700">
            Staff ({data.totals.staff} total)
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={staffData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                innerRadius={50}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {staffData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={renderCustomLegend} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table for Accessibility */}
      <div className="mt-6 border-t pt-4">
        <table className="w-full text-sm">
          <caption className="sr-only">Ethnicity distribution data table</caption>
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Ethnicity</th>
              <th className="text-center py-2">Faculty</th>
              <th className="text-center py-2">Staff</th>
            </tr>
          </thead>
          <tbody>
            {['White', 'Asian', 'Black or African American', 'Hispanic or Latino', 'Not Disclosed', 'Two or More Races'].map(ethnicity => {
              const facultyItem = facultyData.find(d => d.name === ethnicity);
              const staffItem = staffData.find(d => d.name === ethnicity);
              return (
                <tr key={ethnicity} className="border-b">
                  <td className="py-2">{ethnicity}</td>
                  <td className="text-center py-2">
                    {facultyItem ? `${facultyItem.value} (${facultyItem.percentage}%)` : '0 (0.0%)'}
                  </td>
                  <td className="text-center py-2">
                    {staffItem ? `${staffItem.value} (${staffItem.percentage}%)` : '0 (0.0%)'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EthnicityBreakdownChart;