import React, { memo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Users, UserCheck } from 'lucide-react';

const InternalExternalComparisonChart = memo(({ 
  internalApplicants = 225,
  externalApplicants = 7635,
  internalHired = 54,
  externalHired = 286,
  title = "Internal vs External Hiring Analysis",
  className = ""
}) => {
  // Application Volume Data
  const applicationData = [
    { 
      name: 'Internal Applicants', 
      value: internalApplicants, 
      color: '#10B981',
      percentage: (internalApplicants / (internalApplicants + externalApplicants) * 100).toFixed(1)
    },
    { 
      name: 'External Applicants', 
      value: externalApplicants, 
      color: '#6B7280',
      percentage: (externalApplicants / (internalApplicants + externalApplicants) * 100).toFixed(1)
    }
  ];

  // Hired Breakdown Data
  const hiredData = [
    { 
      name: 'Internal Hires', 
      value: internalHired, 
      color: '#10B981',
      percentage: (internalHired / (internalHired + externalHired) * 100).toFixed(1)
    },
    { 
      name: 'External Hires', 
      value: externalHired, 
      color: '#6B7280',
      percentage: (externalHired / (internalHired + externalHired) * 100).toFixed(1)
    }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">
            <span style={{color: data.color}}>●</span> {data.value.toLocaleString()} ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-white print:bg-white p-6 print:p-4 rounded-lg shadow-sm border print:border-gray ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Users 
          className="print:text-black" 
          style={{color: '#0054A6'}}
          size={24} 
        />
        <h3 className="text-lg font-semibold print:text-black" style={{color: '#0054A6'}}>
          {title}
        </h3>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Volume Distribution */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} style={{color: '#00245D'}} />
            <h4 className="text-md font-semibold print:text-black" style={{color: '#00245D'}}>
              Application Volume Distribution
            </h4>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={applicationData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percentage }) => `${percentage}%`}
                labelLine={false}
              >
                {applicationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1">
            {applicationData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{backgroundColor: entry.color}}
                />
                <span className="print:text-black">{entry.name}: {entry.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hiring Outcomes */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <UserCheck size={18} style={{color: '#00245D'}} />
            <h4 className="text-md font-semibold print:text-black" style={{color: '#00245D'}}>
              Hiring Outcomes
            </h4>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={hiredData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percentage }) => `${percentage}%`}
                labelLine={false}
              >
                {hiredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1">
            {hiredData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{backgroundColor: entry.color}}
                />
                <span className="print:text-black">{entry.name}: {entry.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Insight */}
      <div className="mt-4 p-3 rounded-lg" style={{backgroundColor: '#F3F3F0'}}>
        <p className="text-sm print:text-black" style={{color: '#00245D'}}>
          <strong>Key Insight:</strong> While external applicants make up 97.1% of the application volume, 
          internal candidates achieve a 6.4x higher success rate, resulting in 15.9% of all hires 
          coming from just 2.9% of applicants.
        </p>
      </div>
    </div>
  );
});

export default InternalExternalComparisonChart;