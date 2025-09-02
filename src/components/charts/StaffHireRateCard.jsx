import React, { memo } from 'react';
import { Briefcase, Target } from 'lucide-react';

const StaffHireRateCard = memo(({ 
  applications = 6362,
  hires = 340,
  hireRate = 4.3,
  title = "Taleo ATS Hire Rate",
  className = ""
}) => {
  // Calculate hire rate if not provided
  const calculatedRate = applications > 0 ? (hires / applications * 100) : 0;
  const displayRate = hireRate || calculatedRate;

  return (
    <div className={`bg-white print:bg-white p-6 print:p-4 rounded-lg shadow-sm border print:border-gray ${className}`}>
      {/* Header with icon and title */}
      <div className="flex items-center gap-3 mb-4">
        <Briefcase 
          className="print:text-black" 
          style={{color: '#0054A6'}}
          size={24} 
        />
        <h3 className="text-lg font-semibold print:text-black" style={{color: '#0054A6'}}>
          {title}
        </h3>
      </div>

      {/* Main visual - Large percentage display */}
      <div className="text-center mb-6">
        <div className="relative">
          {/* Large percentage number */}
          <div className="text-6xl font-bold print:text-black mb-2" style={{color: '#0054A6'}}>
            {displayRate.toFixed(1)}%
          </div>
          
          {/* Visual progress indicator */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="h-3 rounded-full transition-all duration-1000"
              style={{
                backgroundColor: '#0054A6',
                width: `${Math.min(displayRate * 2.3, 100)}%` // Scale for visibility (4.3% * 2.3 = ~10% width)
              }}
            />
          </div>
          
          {/* Competitiveness indicator */}
          <div className="flex items-center justify-center gap-2 text-sm print:text-black" style={{color: '#00245D'}}>
            <Target size={16} />
            <span className="font-medium">Competitive Taleo Positions</span>
          </div>
        </div>
      </div>

      {/* Supporting metrics */}
      <div className="space-y-3 pt-4 border-t border-gray-200 print:border-gray-400">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 print:text-black">Applications Received:</span>
          <span className="font-semibold text-lg print:text-black">{applications.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 print:text-black">Taleo Hires:</span>
          <span className="font-semibold text-lg print:text-black" style={{color: '#0054A6'}}>
            {hires.toLocaleString()}
          </span>
        </div>
        
        {/* Competitiveness message */}
        <div className="mt-4 p-3 rounded-lg" style={{backgroundColor: '#F3F3F0'}}>
          <p className="text-sm print:text-black" style={{color: '#00245D'}}>
            The {displayRate.toFixed(1)}% hire rate demonstrates competitive Taleo positions with 
            strong candidate quality during FY25. <strong>Taleo applications include staff, temporary, PRN and NBE positions.</strong>
          </p>
        </div>
      </div>
    </div>
  );
});

export default StaffHireRateCard;