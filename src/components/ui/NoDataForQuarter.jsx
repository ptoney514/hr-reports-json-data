import React from 'react';
import { useQuarter } from '../../contexts/QuarterContext';

/**
 * Displayed when a dashboard's data getter returns null for the selected quarter.
 */
const NoDataForQuarter = ({ dataLabel = 'Dashboard data' }) => {
  const { quarterConfig, selectedQuarter } = useQuarter();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-lg shadow-sm border max-w-md">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mb-4">
          <svg
            className="w-6 h-6 text-amber-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">
          Data Not Yet Available
        </h2>
        <p className="text-sm text-gray-500">
          {dataLabel} for{' '}
          <span className="font-medium text-gray-700">
            {quarterConfig?.label || selectedQuarter}
          </span>{' '}
          has not been loaded yet.
        </p>
      </div>
    </div>
  );
};

export default NoDataForQuarter;
