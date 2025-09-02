import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { getWorkforceData, getAllSchoolOrgData } from '../../data/staticData';

const HeadcountReport = () => {
  // Get current data
  const currentData = getWorkforceData("2025-06-30");
  const schoolOrgData = getAllSchoolOrgData("2025-06-30");
  
  // Calculate total employees (excluding temp, students)
  const totalEmployees = currentData.faculty + currentData.staff + currentData.hsp;
  
  // Prepare data for Total Workforce chart
  const totalWorkforceData = [
    { 
      name: 'Faculty', 
      value: currentData.faculty, 
      percentage: ((currentData.faculty / totalEmployees) * 100).toFixed(1) 
    },
    { 
      name: 'Residents', 
      value: currentData.hsp, 
      percentage: ((currentData.hsp / totalEmployees) * 100).toFixed(1) 
    },
    { 
      name: 'Staff', 
      value: currentData.staff, 
      percentage: ((currentData.staff / totalEmployees) * 100).toFixed(1) 
    }
  ];
  
  // Prepare Staff breakdown data (top 10 departments by staff count)
  const staffDepartments = schoolOrgData
    .filter(org => org.staff > 0)
    .sort((a, b) => b.staff - a.staff)
    .slice(0, 10);
    
  const totalStaffInTop10 = staffDepartments.reduce((sum, dept) => sum + dept.staff, 0);
  const othersStaff = currentData.staff - totalStaffInTop10;
  
  const staffData = [
    ...staffDepartments.map(dept => ({
      name: dept.name,
      value: dept.staff,
      percentage: ((dept.staff / currentData.staff) * 100).toFixed(1)
    })),
    ...(othersStaff > 0 ? [{
      name: 'All Others',
      value: othersStaff,
      percentage: ((othersStaff / currentData.staff) * 100).toFixed(1)
    }] : [])
  ];
  
  // Prepare Faculty breakdown data (schools with faculty)
  const facultyDepartments = schoolOrgData
    .filter(org => org.faculty > 0)
    .sort((a, b) => b.faculty - a.faculty)
    .slice(0, 10);
    
  const totalFacultyInTop10 = facultyDepartments.reduce((sum, dept) => sum + dept.faculty, 0);
  const othersFaculty = currentData.faculty - totalFacultyInTop10;
  
  const facultyData = [
    ...facultyDepartments.map(dept => ({
      name: dept.name,
      value: dept.faculty,
      percentage: ((dept.faculty / currentData.faculty) * 100).toFixed(1)
    })),
    ...(othersFaculty > 0 ? [{
      name: 'Other',
      value: othersFaculty,
      percentage: ((othersFaculty / currentData.faculty) * 100).toFixed(1)
    }] : [])
  ];
  
  // Color schemes for each chart
  const totalWorkforceColors = ['#0054A6', '#95D2F3', '#1F74DB'];
  const staffColors = [
    '#0054A6', '#1F74DB', '#95D2F3', '#71CC98', '#FFC72C', 
    '#00245D', '#D7D2CB', '#F3F3F0', '#8B4513', '#FF6B6B'
  ];
  const facultyColors = [
    '#00245D', '#0054A6', '#1F74DB', '#95D2F3', '#71CC98',
    '#FFC72C', '#D7D2CB', '#8B4513', '#FF6B6B', '#4ECDC4'
  ];
  
  // Custom label renderer for print-friendly display
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.03) return null; // Don't show label for small slices
    
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
        className="text-xs font-bold"
        style={{ fontSize: '11px', fontWeight: 'bold' }}
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 print:bg-white print:py-4">
      <div className="max-w-7xl mx-auto px-4 print:max-w-none print:px-2">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6 print:shadow-none print:border-2 print:border-black">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 print:text-black">Creighton University</h1>
            <h2 className="text-xl text-gray-700 mt-1 print:text-black">Workforce Breakdown as of {currentData.reportingDate}</h2>
            
            {/* Summary Box */}
            <div className="inline-block mt-4 p-3 border-2 border-gray-800 rounded print:border-black">
              <div className="text-left">
                <div className="font-bold text-black">Total Employees = {totalEmployees.toLocaleString()}</div>
                <div className="text-sm font-semibold">Faculty = {currentData.faculty.toLocaleString()}</div>
                <div className="text-sm font-semibold">Residents = {currentData.hsp.toLocaleString()}</div>
                <div className="text-sm font-semibold">Staff = {currentData.staff.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* First Row - Pie Charts */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-center text-gray-900 mb-4">Pie Chart View</h2>
          
          {/* Total Workforce Pie Chart */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-bold text-center text-gray-900 mb-4">Total Workforce</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={totalWorkforceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {totalWorkforceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={totalWorkforceColors[index % totalWorkforceColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              {totalWorkforceData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded" 
                    style={{ backgroundColor: totalWorkforceColors[index] }}
                  />
                  <span className="text-sm font-semibold">
                    {entry.name}: {entry.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        
          {/* Staff and Faculty Pie Charts Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Staff Breakdown */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold text-center text-gray-900 mb-4">Staff</h3>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={staffData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {staffData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={staffColors[index % staffColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            <div className="mt-4 space-y-1">
              {staffData.slice(0, 10).map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded" 
                      style={{ backgroundColor: staffColors[index] }}
                    />
                    <span className="truncate max-w-[150px]">{entry.name}</span>
                  </div>
                  <span className="font-semibold">{entry.percentage}%</span>
                </div>
              ))}
              {staffData.length > 10 && (
                <div className="flex items-center justify-between text-xs pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded" 
                      style={{ backgroundColor: staffColors[10] }}
                    />
                    <span>All Others</span>
                  </div>
                  <span className="font-semibold">{staffData[10].percentage}%</span>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t text-xs text-gray-600 italic">
              The staff counts lists the top 10 areas. The remaining areas are included in the "All Others" category
            </div>
          </div>
          
            {/* Faculty Breakdown */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold text-center text-gray-900 mb-4">Faculty</h3>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={facultyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {facultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={facultyColors[index % facultyColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            <div className="mt-4 space-y-1">
              {facultyData.slice(0, 10).map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded" 
                      style={{ backgroundColor: facultyColors[index] }}
                    />
                    <span className="truncate max-w-[150px]">{entry.name}</span>
                  </div>
                  <span className="font-semibold">{entry.percentage}%</span>
                </div>
              ))}
              {facultyData.length > 10 && (
                <div className="flex items-center justify-between text-xs pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded" 
                      style={{ backgroundColor: facultyColors[10] }}
                    />
                    <span>Other</span>
                  </div>
                  <span className="font-semibold">{facultyData[10].percentage}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
        
        {/* Page break for printing */}
        <div className="print:break-before-page"></div>
        
        {/* Second Row - Donut Charts */}
        <div className="mb-8 print:mt-0">
          <h2 className="text-xl font-bold text-center text-gray-900 mb-4">Donut Chart View</h2>
          
          {/* Total Workforce Donut Chart */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-bold text-center text-gray-900 mb-4">Total Workforce</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={totalWorkforceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  innerRadius={50}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {totalWorkforceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={totalWorkforceColors[index % totalWorkforceColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              {totalWorkforceData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded" 
                    style={{ backgroundColor: totalWorkforceColors[index] }}
                  />
                  <span className="text-sm font-semibold">
                    {entry.name}: {entry.value.toLocaleString()} ({entry.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        
          {/* Staff and Faculty Donut Charts Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-2">
            {/* Staff Donut Breakdown */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold text-center text-gray-900 mb-4">Staff Distribution</h3>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={staffData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {staffData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={staffColors[index % staffColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-1">
                {staffData.slice(0, 10).map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded" 
                        style={{ backgroundColor: staffColors[index] }}
                      />
                      <span className="truncate max-w-[150px]">{entry.name}</span>
                    </div>
                    <span className="font-bold">{entry.value} ({entry.percentage}%)</span>
                  </div>
                ))}
                {staffData.length > 10 && (
                  <div className="flex items-center justify-between text-xs pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded" 
                        style={{ backgroundColor: staffColors[10] }}
                      />
                      <span>All Others</span>
                    </div>
                    <span className="font-bold">{staffData[10].value} ({staffData[10].percentage}%)</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Faculty Donut Breakdown */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold text-center text-gray-900 mb-4">Faculty Distribution</h3>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={facultyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {facultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={facultyColors[index % facultyColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-1">
                {facultyData.slice(0, 10).map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded" 
                        style={{ backgroundColor: facultyColors[index] }}
                      />
                      <span className="truncate max-w-[150px]">{entry.name}</span>
                    </div>
                    <span className="font-bold">{entry.value} ({entry.percentage}%)</span>
                  </div>
                ))}
                {facultyData.length > 10 && (
                  <div className="flex items-center justify-between text-xs pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded" 
                        style={{ backgroundColor: facultyColors[10] }}
                      />
                      <span>Other</span>
                    </div>
                    <span className="font-bold">{facultyData[10].value} ({facultyData[10].percentage}%)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Third Row - Charts with Label Lines */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-center text-gray-900 mb-4">Charts with Label Lines</h2>
          
          {/* Total Workforce with Lines */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-bold text-center text-gray-900 mb-4">Total Workforce</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={totalWorkforceData}
                  cx="50%"
                  cy="50%"
                  labelLine={{
                    stroke: '#333',
                    strokeWidth: 1
                  }}
                  label={({ name, percentage, x, y, midAngle, innerRadius, outerRadius, cx, cy }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = outerRadius + 30;
                    const x2 = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y2 = cy + radius * Math.sin(-midAngle * RADIAN);
                    
                    return (
                      <text 
                        x={x2} 
                        y={y2} 
                        fill="#000" 
                        textAnchor={x2 > cx ? 'start' : 'end'} 
                        dominantBaseline="central"
                        className="text-sm font-bold"
                      >
                        {`${name}: ${percentage}%`}
                      </text>
                    );
                  }}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {totalWorkforceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={totalWorkforceColors[index % totalWorkforceColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Staff Breakdown with Lines */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-bold text-center text-gray-900 mb-4">Staff Distribution</h3>
            <ResponsiveContainer width="100%" height={500}>
              <PieChart>
                <Pie
                  data={staffData}
                  cx="50%"
                  cy="50%"
                  labelLine={{
                    stroke: '#333',
                    strokeWidth: 1
                  }}
                  label={({ name, percentage, x, y, midAngle, innerRadius, outerRadius, cx, cy }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = outerRadius + 30;
                    const x2 = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y2 = cy + radius * Math.sin(-midAngle * RADIAN);
                    
                    // Shorten long names
                    const displayName = name.length > 20 ? name.substring(0, 17) + '...' : name;
                    
                    return (
                      <text 
                        x={x2} 
                        y={y2} 
                        fill="#000" 
                        textAnchor={x2 > cx ? 'start' : 'end'} 
                        dominantBaseline="central"
                        className="text-xs font-semibold"
                      >
                        {`${displayName}: ${percentage}%`}
                      </text>
                    );
                  }}
                  outerRadius={140}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {staffData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={staffColors[index % staffColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Faculty Breakdown with Lines */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-bold text-center text-gray-900 mb-4">Faculty Distribution</h3>
            <ResponsiveContainer width="100%" height={500}>
              <PieChart>
                <Pie
                  data={facultyData}
                  cx="50%"
                  cy="50%"
                  labelLine={{
                    stroke: '#333',
                    strokeWidth: 1
                  }}
                  label={({ name, percentage, x, y, midAngle, innerRadius, outerRadius, cx, cy }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = outerRadius + 30;
                    const x2 = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y2 = cy + radius * Math.sin(-midAngle * RADIAN);
                    
                    // Shorten long names
                    const displayName = name.length > 20 ? name.substring(0, 17) + '...' : name;
                    
                    return (
                      <text 
                        x={x2} 
                        y={y2} 
                        fill="#000" 
                        textAnchor={x2 > cx ? 'start' : 'end'} 
                        dominantBaseline="central"
                        className="text-xs font-semibold"
                      >
                        {`${displayName}: ${percentage}%`}
                      </text>
                    );
                  }}
                  outerRadius={140}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {facultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={facultyColors[index % facultyColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Footer Note */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mt-6">
          <p className="text-sm text-gray-600 text-center">
            Excludes Temporary Employees, Students and College Work Study
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeadcountReport;