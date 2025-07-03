import React, { Suspense, lazy } from 'react';
import LoadingSkeleton from '../ui/LoadingSkeleton';

// Lazy load chart components for better code splitting
const HeadcountChart = lazy(() => import('./HeadcountChart'));
const LocationChart = lazy(() => import('./LocationChart'));
const DivisionsChart = lazy(() => import('./DivisionsChart'));
const StartersLeaversChart = lazy(() => import('./StartersLeaversChart'));
const TurnoverPieChart = lazy(() => import('./TurnoverPieChart'));

// Chart loading wrapper with error boundary
const ChartWrapper = ({ children, height = "h-64" }) => (
  <Suspense 
    fallback={
      <div className={`${height} bg-gray-100 rounded-lg animate-pulse flex items-center justify-center`}>
        <div className="text-gray-500">Loading chart...</div>
      </div>
    }
  >
    {children}
  </Suspense>
);

// Exported lazy-loaded chart components
export const LazyHeadcountChart = (props) => (
  <ChartWrapper>
    <HeadcountChart {...props} />
  </ChartWrapper>
);

export const LazyLocationChart = (props) => (
  <ChartWrapper>
    <LocationChart {...props} />
  </ChartWrapper>
);

export const LazyDivisionsChart = (props) => (
  <ChartWrapper>
    <DivisionsChart {...props} />
  </ChartWrapper>
);

export const LazyStartersLeaversChart = (props) => (
  <ChartWrapper>
    <StartersLeaversChart {...props} />
  </ChartWrapper>
);

export const LazyTurnoverPieChart = (props) => (
  <ChartWrapper>
    <TurnoverPieChart {...props} />
  </ChartWrapper>
);

export default {
  HeadcountChart: LazyHeadcountChart,
  LocationChart: LazyLocationChart,
  DivisionsChart: LazyDivisionsChart,
  StartersLeaversChart: LazyStartersLeaversChart,
  TurnoverPieChart: LazyTurnoverPieChart
};