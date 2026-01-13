import React from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

const GenderDistributionChart = ({ data }) => {
  if (!data || !data.gender) return null;

  // Colors from Creighton brand guidelines
  const COLORS = {
    male: '#0054A6',    // Creighton Blue
    female: '#71CC98'   // Green
  };

  // Prepare data for faculty chart
  const facultyData = [
    { 
      name: 'Male', 
      value: data.gender.faculty.male,
      percentage: ((data.gender.faculty.male / data.totals.faculty) * 100).toFixed(1)
    },
    { 
      name: 'Female', 
      value: data.gender.faculty.female,
      percentage: ((data.gender.faculty.female / data.totals.faculty) * 100).toFixed(1)
    }
  ];

  // Prepare data for staff chart
  const staffData = [
    { 
      name: 'Male', 
      value: data.gender.staff.male,
      percentage: ((data.gender.staff.male / data.totals.staff) * 100).toFixed(1)
    },
    { 
      name: 'Female', 
      value: data.gender.staff.female,
      percentage: ((data.gender.staff.female / data.totals.staff) * 100).toFixed(1)
    }
  ];

  // Custom label to show both count and percentage
  const renderCustomLabel = (entry) => {
    return `${entry.value} (${entry.percentage}%)`;
  };

  // Custom legend with counts
  const renderCustomLegend = (props) => {
    const { payload } = props;
    return (
      <ul className="flex justify-center gap-6 mt-2">
        {payload.map((entry, index) => (
          <li key={`item-${index}`} className="flex items-center">
            <span 
              className="inline-block w-3 h-3 mr-2" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm">
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
        Gender Distribution - Benefit Eligible Employees
      </h3>
      <p className="text-sm text-gray-600 mb-4">As of 6/30/25</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Faculty Chart */}
        <div>
          <h4 className="text-md font-medium text-center mb-2 text-gray-700">
            Faculty ({data.totals.faculty} total)
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={facultyData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                innerRadius={40}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {facultyData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.name === 'Male' ? COLORS.male : COLORS.female} 
                  />
                ))}
              </Pie>
              <Legend content={renderCustomLegend} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Staff Chart */}
        <div>
          <h4 className="text-md font-medium text-center mb-2 text-gray-700">
            Staff ({data.totals.staff} total)
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={staffData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                innerRadius={40}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {staffData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.name === 'Male' ? COLORS.male : COLORS.female} 
                  />
                ))}
              </Pie>
              <Legend content={renderCustomLegend} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table for Accessibility */}
      <div className="mt-6 border-t pt-4">
        <table className="w-full text-sm">
          <caption className="sr-only">Gender distribution data table</caption>
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Category</th>
              <th className="text-center py-2">Male</th>
              <th className="text-center py-2">Female</th>
              <th className="text-center py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2 font-medium">Faculty</td>
              <td className="text-center py-2">
                {data.gender.faculty.male} ({facultyData[0].percentage}%)
              </td>
              <td className="text-center py-2">
                {data.gender.faculty.female} ({facultyData[1].percentage}%)
              </td>
              <td className="text-center py-2">{data.totals.faculty}</td>
            </tr>
            <tr>
              <td className="py-2 font-medium">Staff</td>
              <td className="text-center py-2">
                {data.gender.staff.male} ({staffData[0].percentage}%)
              </td>
              <td className="text-center py-2">
                {data.gender.staff.female} ({staffData[1].percentage}%)
              </td>
              <td className="text-center py-2">{data.totals.staff}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GenderDistributionChart;