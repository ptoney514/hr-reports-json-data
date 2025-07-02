import React from 'react';
import { ComplianceByType } from '../../../types';
import { BaseComponentProps } from '../../../types/components';

interface ComplianceTableProps extends BaseComponentProps {
  data: ComplianceByType[];
  showRates?: boolean;
  sortable?: boolean;
  loading?: boolean;
  error?: string | null;
}

const ComplianceTable: React.FC<ComplianceTableProps> = ({
  data,
  showRates = true,
  sortable = false,
  loading = false,
  error = null,
  className = '',
  ...ariaProps
}) => {
  if (loading) {
    return (
      <div className={className} {...ariaProps}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className} {...ariaProps}>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Compliance Metrics</h3>
        <div className="flex items-center justify-center h-32 bg-red-50 border border-red-200 rounded">
          <div className="text-center">
            <p className="text-red-600 mb-2">Error loading compliance data</p>
            <p className="text-sm text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={className} {...ariaProps}>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Compliance Metrics</h3>
        <div className="flex items-center justify-center h-32 bg-gray-50 border border-gray-200 rounded">
          <p className="text-gray-500">No compliance data available</p>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totals = data.reduce(
    (acc, item) => ({
      total: acc.total + item.total,
      onTime: acc.onTime + item.onTime,
      late: acc.late + item.late,
    }),
    { total: 0, onTime: 0, late: 0 }
  );

  const overallRate = totals.total > 0 ? ((totals.onTime / totals.total) * 100).toFixed(1) : '0';

  return (
    <div 
      className={className}
      role="region"
      aria-label="Compliance metrics by employee type"
      {...ariaProps}
    >
      <h3 className="text-lg print:text-base font-semibold text-blue-700 print:text-black mb-3 print:mb-2">
        Compliance Metrics by Location/Type
      </h3>
      
      <div className="overflow-x-auto">
        <table 
          className="w-full text-sm print:text-xs"
          role="table"
          aria-label="Detailed compliance metrics breakdown"
        >
          <thead>
            <tr className="border-b print:border-gray">
              <th 
                className="text-left p-2 print:p-1 font-semibold"
                scope="col"
              >
                Employee Type
              </th>
              <th 
                className="text-right p-2 print:p-1 font-semibold"
                scope="col"
              >
                Total Forms
              </th>
              <th 
                className="text-right p-2 print:p-1 font-semibold"
                scope="col"
              >
                On-Time
              </th>
              <th 
                className="text-right p-2 print:p-1 font-semibold"
                scope="col"
              >
                Late
              </th>
              {showRates && (
                <th 
                  className="text-right p-2 print:p-1 font-semibold"
                  scope="col"
                >
                  Compliance Rate
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((type, index) => (
              <tr 
                key={index} 
                className="border-b print:border-gray hover:bg-gray-50 print:hover:bg-white"
              >
                <td 
                  className="p-2 print:p-1 font-medium"
                  scope="row"
                >
                  {type.name}
                </td>
                <td className="text-right p-2 print:p-1">
                  {type.total.toLocaleString()}
                </td>
                <td className="text-right p-2 print:p-1 text-green-600 print:text-black">
                  {type.onTime.toLocaleString()}
                </td>
                <td className="text-right p-2 print:p-1 text-red-600 print:text-black">
                  {type.late.toLocaleString()}
                </td>
                {showRates && (
                  <td className="text-right p-2 print:p-1 font-semibold">
                    <span 
                      className={`${
                        type.rate >= 95 
                          ? 'text-green-600 print:text-black' 
                          : type.rate >= 90 
                          ? 'text-orange-600 print:text-black' 
                          : 'text-red-600 print:text-black'
                      }`}
                    >
                      {type.rate}%
                    </span>
                  </td>
                )}
              </tr>
            ))}
            
            {/* Totals row */}
            <tr className="border-t-2 border-gray-300 print:border-gray-600 bg-gray-50 print:bg-white font-semibold">
              <td 
                className="p-2 print:p-1 font-bold"
                scope="row"
              >
                Total
              </td>
              <td className="text-right p-2 print:p-1">
                {totals.total.toLocaleString()}
              </td>
              <td className="text-right p-2 print:p-1 text-green-600 print:text-black">
                {totals.onTime.toLocaleString()}
              </td>
              <td className="text-right p-2 print:p-1 text-red-600 print:text-black">
                {totals.late.toLocaleString()}
              </td>
              {showRates && (
                <td className="text-right p-2 print:p-1">
                  <span 
                    className={`${
                      Number(overallRate) >= 95 
                        ? 'text-green-600 print:text-black' 
                        : Number(overallRate) >= 90 
                        ? 'text-orange-600 print:text-black' 
                        : 'text-red-600 print:text-black'
                    }`}
                  >
                    {overallRate}%
                  </span>
                </td>
              )}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Additional context */}
      <div className="mt-3 text-xs text-gray-500 print:text-black">
        <p>
          <strong>Note:</strong> Compliance rate calculated as (On-Time / Total Forms) × 100. 
          Target compliance rate is 95% or higher.
        </p>
      </div>

      {/* Screen reader summary */}
      <div className="sr-only">
        <p>
          Compliance table showing {data.length} employee types. 
          Overall compliance rate is {overallRate}% with {totals.onTime} on-time and {totals.late} late out of {totals.total} total forms.
        </p>
      </div>
    </div>
  );
};

export default ComplianceTable;