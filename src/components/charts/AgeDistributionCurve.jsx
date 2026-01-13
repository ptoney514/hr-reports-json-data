import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const AgeDistributionCurve = ({ data }) => {
  if (!data || !data.ageBands) return null;

  // Prepare data for smooth curves
  const prepareDistributionData = () => {
    // Map age bands to midpoint ages for smoother visualization
    const ageMidpoints = {
      '20-30': 25,
      '31-40': 35,
      '41-50': 45,
      '51-60': 55,
      '61 Plus': 66
    };

    // Create data points for the curve
    const dataPoints = [];
    const ageRanges = ['20-30', '31-40', '41-50', '51-60', '61 Plus'];
    
    ageRanges.forEach(band => {
      const facultyCount = data.ageBands.faculty[band] || 0;
      const staffCount = data.ageBands.staff[band] || 0;
      
      dataPoints.push({
        age: ageMidpoints[band],
        ageBand: band,
        faculty: facultyCount,
        facultyPercent: ((facultyCount / data.totals.faculty) * 100).toFixed(1),
        staff: staffCount,
        staffPercent: ((staffCount / data.totals.staff) * 100).toFixed(1),
        combined: facultyCount + staffCount
      });
    });

    return dataPoints;
  };

  const chartData = prepareDistributionData();

  // Calculate statistics
  const calculateMedianAge = (ageBands, total) => {
    let cumulative = 0;
    const halfTotal = total / 2;
    
    for (const [band, count] of Object.entries(ageBands)) {
      cumulative += count;
      if (cumulative >= halfTotal) {
        return band;
      }
    }
    return '41-50'; // fallback
  };

  const facultyMedian = calculateMedianAge(data.ageBands.faculty, data.totals.faculty);
  const staffMedian = calculateMedianAge(data.ageBands.staff, data.totals.staff);

  // Find peak ages
  const facultyPeak = Object.entries(data.ageBands.faculty).reduce((a, b) => 
    b[1] > a[1] ? b : a
  )[0];
  const staffPeak = Object.entries(data.ageBands.staff).reduce((a, b) => 
    b[1] > a[1] ? b : a
  )[0];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const ageBand = chartData.find(d => d.age === label)?.ageBand || '';
      
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold">{ageBand}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value} 
              {entry.name === 'Faculty' ? ` (${chartData.find(d => d.age === label)?.facultyPercent}%)` : ''}
              {entry.name === 'Staff' ? ` (${chartData.find(d => d.age === label)?.staffPercent}%)` : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom tick formatter for X axis
  const xAxisTickFormatter = (value) => {
    const dataPoint = chartData.find(d => d.age === value);
    return dataPoint ? dataPoint.ageBand : value;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 print:break-inside-avoid">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Age Distribution Curves - Benefit Eligible Employees
      </h3>
      <p className="text-sm text-gray-600 mb-4">As of 6/30/25</p>
      
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 40 }}
        >
          <defs>
            <linearGradient id="facultyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0054A6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#0054A6" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="staffGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#71CC98" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#71CC98" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="age"
            ticks={[25, 35, 45, 55, 66]}
            tickFormatter={xAxisTickFormatter}
            label={{ value: 'Age Range', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
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
          
          <Area
            type="monotone"
            dataKey="faculty"
            stroke="#0054A6"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#facultyGradient)"
            name="Faculty"
          />
          <Area
            type="monotone"
            dataKey="staff"
            stroke="#71CC98"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#staffGradient)"
            name="Staff"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h5 className="font-semibold text-sm mb-2 text-blue-900">Faculty Distribution</h5>
          <div className="text-sm text-gray-700 space-y-1">
            <p>• Peak age range: <strong>{facultyPeak}</strong></p>
            <p>• Median age range: <strong>{facultyMedian}</strong></p>
            <p>• Bimodal distribution with secondary peak at 61+</p>
            <p>• {((data.ageBands.faculty['61 Plus'] / data.totals.faculty) * 100).toFixed(1)}% approaching retirement</p>
          </div>
        </div>
        
        <div className="p-4 bg-green-50 rounded-lg">
          <h5 className="font-semibold text-sm mb-2 text-green-900">Staff Distribution</h5>
          <div className="text-sm text-gray-700 space-y-1">
            <p>• Peak age range: <strong>{staffPeak}</strong></p>
            <p>• Median age range: <strong>{staffMedian}</strong></p>
            <p>• More evenly distributed across ages</p>
            <p>• {((data.ageBands.staff['20-30'] / data.totals.staff) * 100).toFixed(1)}% early career (20-30)</p>
          </div>
        </div>
      </div>

      {/* Workforce Insights */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h5 className="font-semibold text-sm mb-2 text-gray-700">Workforce Age Insights</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div>
            <p className="font-semibold mb-1">Early Career (20-30)</p>
            <p>Faculty: {data.ageBands.faculty['20-30']} ({((data.ageBands.faculty['20-30'] / data.totals.faculty) * 100).toFixed(1)}%)</p>
            <p>Staff: {data.ageBands.staff['20-30']} ({((data.ageBands.staff['20-30'] / data.totals.staff) * 100).toFixed(1)}%)</p>
          </div>
          <div>
            <p className="font-semibold mb-1">Mid Career (31-50)</p>
            <p>Faculty: {data.ageBands.faculty['31-40'] + data.ageBands.faculty['41-50']} ({(((data.ageBands.faculty['31-40'] + data.ageBands.faculty['41-50']) / data.totals.faculty) * 100).toFixed(1)}%)</p>
            <p>Staff: {data.ageBands.staff['31-40'] + data.ageBands.staff['41-50']} ({(((data.ageBands.staff['31-40'] + data.ageBands.staff['41-50']) / data.totals.staff) * 100).toFixed(1)}%)</p>
          </div>
          <div>
            <p className="font-semibold mb-1">Late Career (51+)</p>
            <p>Faculty: {data.ageBands.faculty['51-60'] + data.ageBands.faculty['61 Plus']} ({(((data.ageBands.faculty['51-60'] + data.ageBands.faculty['61 Plus']) / data.totals.faculty) * 100).toFixed(1)}%)</p>
            <p>Staff: {data.ageBands.staff['51-60'] + data.ageBands.staff['61 Plus']} ({(((data.ageBands.staff['51-60'] + data.ageBands.staff['61 Plus']) / data.totals.staff) * 100).toFixed(1)}%)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgeDistributionCurve;