import React, { memo } from 'react';
import { Users, TrendingUp } from 'lucide-react';

const StaffHiringAnalyticsCard = memo(({ 
  internalSuccessRate = 24.0,
  externalSuccessRate = 3.7,
  internalAdvantage = 6.4,
  title = "Taleo Hiring Analytics",
  className = ""
}) => {
  return (
    <div className={`bg-white print:bg-white p-6 print:p-4 rounded-lg shadow-sm border print:border-gray ${className}`}>
      {/* Header with icon and title */}
      <div className="flex items-center gap-3 mb-4">
        <Users 
          className="print:text-black" 
          style={{color: '#0054A6'}}
          size={24} 
        />
        <h3 className="text-lg font-semibold print:text-black" style={{color: '#0054A6'}}>
          {title}
        </h3>
      </div>

      {/* Key Metrics Grid */}
      <div className="space-y-4">
        {/* Internal Advantage - Prominent Display */}
        <div className="text-center p-4 rounded-lg" style={{backgroundColor: '#F3F3F0'}}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp size={20} style={{color: '#10B981'}} />
            <span className="text-sm font-medium print:text-black" style={{color: '#00245D'}}>
              Internal Candidate Advantage
            </span>
          </div>
          <div className="text-4xl font-bold mb-1" style={{color: '#10B981'}}>
            {internalAdvantage}x
          </div>
          <p className="text-sm print:text-black" style={{color: '#00245D'}}>
            Higher likelihood vs external candidates
          </p>
        </div>

        {/* Success Rates Comparison */}
        <div className="grid grid-cols-2 gap-4">
          {/* Internal Success Rate */}
          <div className="text-center p-3 rounded-lg border-2" style={{borderColor: '#10B981', backgroundColor: '#F0FDF4'}}>
            <div className="text-2xl font-bold mb-1" style={{color: '#10B981'}}>
              {internalSuccessRate}%
            </div>
            <div className="text-xs font-medium print:text-black" style={{color: '#00245D'}}>
              Internal Success Rate
            </div>
            <div className="text-xs text-gray-600 print:text-black mt-1">
              1 in 4 hired
            </div>
          </div>

          {/* External Success Rate */}
          <div className="text-center p-3 rounded-lg border-2 border-gray-300 bg-gray-50">
            <div className="text-2xl font-bold mb-1 text-gray-600">
              {externalSuccessRate}%
            </div>
            <div className="text-xs font-medium print:text-black" style={{color: '#00245D'}}>
              External Success Rate
            </div>
            <div className="text-xs text-gray-600 print:text-black mt-1">
              1 in 27 hired
            </div>
          </div>
        </div>

        {/* Visual Comparison Bar */}
        <div className="mt-4">
          <div className="text-sm font-medium mb-2 print:text-black" style={{color: '#00245D'}}>
            Success Rate Comparison
          </div>
          <div className="space-y-2">
            {/* Internal Rate Bar */}
            <div className="flex items-center gap-3">
              <span className="text-xs w-16 print:text-black">Internal</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full"
                  style={{
                    backgroundColor: '#10B981',
                    width: `${internalSuccessRate}%`
                  }}
                />
              </div>
              <span className="text-xs font-semibold print:text-black" style={{color: '#10B981'}}>
                {internalSuccessRate}%
              </span>
            </div>
            
            {/* External Rate Bar */}
            <div className="flex items-center gap-3">
              <span className="text-xs w-16 print:text-black">External</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-gray-400"
                  style={{
                    width: `${externalSuccessRate}%`
                  }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-600 print:text-black">
                {externalSuccessRate}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default StaffHiringAnalyticsCard;