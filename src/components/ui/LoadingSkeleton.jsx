import React from 'react';

/**
 * Base skeleton component with shimmer animation
 */
const SkeletonBase = ({ 
  width = '100%', 
  height = '1rem', 
  className = '', 
  rounded = 'rounded' 
}) => (
  <div 
    className={`bg-gray-200 animate-pulse ${rounded} ${className}`}
    style={{ width, height }}
  />
);

/**
 * Card skeleton for dashboard cards
 */
export const CardSkeleton = ({ 
  showHeader = true, 
  showContent = true, 
  height = 'auto',
  className = '' 
}) => (
  <div className={`bg-white p-4 rounded-lg shadow-sm border ${className}`} style={{ height }}>
    {showHeader && (
      <div className="mb-3">
        <SkeletonBase width="60%" height="1.25rem" className="mb-2" />
        <SkeletonBase width="40%" height="0.875rem" />
      </div>
    )}
    {showContent && (
      <div className="space-y-3">
        <SkeletonBase width="100%" height="2rem" />
        <SkeletonBase width="85%" height="1rem" />
        <SkeletonBase width="70%" height="1rem" />
        <SkeletonBase width="90%" height="1rem" />
      </div>
    )}
  </div>
);

/**
 * Chart skeleton for chart containers
 */
export const ChartSkeleton = ({ 
  title, 
  height = 300, 
  showLegend = true,
  chartType = 'bar', // 'bar', 'line', 'pie', 'area'
  className = '' 
}) => {
  const renderChartContent = () => {
    switch (chartType) {
      case 'pie':
        return (
          <div className="flex items-center justify-center">
            <div className="relative">
              <SkeletonBase 
                width="120px" 
                height="120px" 
                rounded="rounded-full" 
              />
              <SkeletonBase 
                width="60px" 
                height="60px" 
                rounded="rounded-full" 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white"
              />
            </div>
          </div>
        );
      
      case 'line':
        return (
          <div className="space-y-4">
            {/* Y-axis labels */}
            <div className="flex justify-between items-end h-40">
              <div className="space-y-8">
                {[...Array(5)].map((_, i) => (
                  <SkeletonBase key={i} width="30px" height="0.75rem" />
                ))}
              </div>
              {/* Chart area with line pattern */}
              <div className="flex-1 mx-4 relative h-full">
                <svg width="100%" height="100%" className="absolute">
                  <defs>
                    <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f3f4f6" />
                      <stop offset="50%" stopColor="#e5e7eb" />
                      <stop offset="100%" stopColor="#f3f4f6" />
                    </linearGradient>
                  </defs>
                  <polyline
                    fill="none"
                    stroke="url(#shimmer)"
                    strokeWidth="2"
                    points="0,120 50,80 100,100 150,60 200,90 250,40 300,70"
                  />
                </svg>
              </div>
            </div>
            {/* X-axis labels */}
            <div className="flex justify-between">
              {[...Array(6)].map((_, i) => (
                <SkeletonBase key={i} width="40px" height="0.75rem" />
              ))}
            </div>
          </div>
        );
      
      case 'area':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-end h-40">
              <div className="space-y-8">
                {[...Array(5)].map((_, i) => (
                  <SkeletonBase key={i} width="30px" height="0.75rem" />
                ))}
              </div>
              <div className="flex-1 mx-4 relative h-full">
                <div className="absolute bottom-0 w-full h-3/4 bg-gradient-to-t from-gray-200 to-gray-100 animate-pulse rounded-t" />
                <div className="absolute bottom-3/4 w-full h-1/4 bg-gradient-to-t from-gray-100 to-transparent animate-pulse" />
              </div>
            </div>
            <div className="flex justify-between">
              {[...Array(6)].map((_, i) => (
                <SkeletonBase key={i} width="40px" height="0.75rem" />
              ))}
            </div>
          </div>
        );
      
      default: // bar chart
        return (
          <div className="space-y-4">
            {/* Y-axis labels */}
            <div className="flex justify-between items-end h-40">
              <div className="space-y-8">
                {[...Array(5)].map((_, i) => (
                  <SkeletonBase key={i} width="30px" height="0.75rem" />
                ))}
              </div>
              {/* Bars */}
              <div className="flex-1 mx-4 flex items-end justify-between gap-2 h-full">
                {[...Array(6)].map((_, i) => (
                  <SkeletonBase 
                    key={i} 
                    width="30px" 
                    height={`${Math.random() * 60 + 40}%`}
                    rounded="rounded-t"
                  />
                ))}
              </div>
            </div>
            {/* X-axis labels */}
            <div className="flex justify-between">
              {[...Array(6)].map((_, i) => (
                <SkeletonBase key={i} width="40px" height="0.75rem" />
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm border ${className}`}>
      {title && (
        <div className="mb-3">
          <SkeletonBase width="50%" height="1.25rem" />
        </div>
      )}
      
      <div style={{ height: `${height}px` }} className="relative">
        {renderChartContent()}
      </div>

      {showLegend && chartType !== 'pie' && (
        <div className="mt-4 flex justify-center gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <SkeletonBase width="12px" height="12px" rounded="rounded-full" />
              <SkeletonBase width="60px" height="0.75rem" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Summary card skeleton
 */
export const SummaryCardSkeleton = ({ className = '' }) => (
  <div className={`bg-white p-4 rounded-lg shadow-sm border ${className}`}>
    <div className="flex items-center justify-between mb-2">
      <SkeletonBase width="40%" height="0.875rem" />
      <SkeletonBase width="20px" height="20px" rounded="rounded" />
    </div>
    <SkeletonBase width="60%" height="2rem" className="mb-2" />
    <div className="flex items-center gap-2">
      <SkeletonBase width="12px" height="12px" rounded="rounded" />
      <SkeletonBase width="80px" height="0.75rem" />
    </div>
  </div>
);

/**
 * Composite dashboard skeleton
 */
export const DashboardSkeleton = ({ 
  showHeader = true,
  showSummaryCards = true,
  showCharts = true,
  summaryCardCount = 4,
  chartCount = 4,
  className = '' 
}) => (
  <div className={`space-y-6 ${className}`}>
    {showHeader && (
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <SkeletonBase width="40%" height="1.5rem" className="mb-2" />
            <SkeletonBase width="60%" height="1rem" />
          </div>
          <div className="flex gap-3">
            <SkeletonBase width="100px" height="2.5rem" rounded="rounded-md" />
            <SkeletonBase width="80px" height="2.5rem" rounded="rounded-md" />
            <SkeletonBase width="90px" height="2.5rem" rounded="rounded-md" />
          </div>
        </div>
      </div>
    )}
    
    {showSummaryCards && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(summaryCardCount)].map((_, i) => (
          <SummaryCardSkeleton key={i} />
        ))}
      </div>
    )}
    
    {showCharts && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(chartCount)].map((_, i) => (
          <ChartSkeleton 
            key={i} 
            title
            chartType={['bar', 'line', 'pie', 'area'][i % 4]}
            height={300}
          />
        ))}
      </div>
    )}
  </div>
);

/**
 * Loading pulse animation for any element
 */
export const PulseLoader = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className="animate-pulse bg-blue-500 rounded-full opacity-75"></div>
    </div>
  );
};

const loadingSkeletons = {
  CardSkeleton,
  ChartSkeleton,
  SummaryCardSkeleton,
  DashboardSkeleton,
  PulseLoader,
  SkeletonBase
};

export default loadingSkeletons; 