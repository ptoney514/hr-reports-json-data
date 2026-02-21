import React from 'react';
import { Clock } from 'lucide-react';
import { getQuarterlyTurnoverData } from '../../services/dataService';
import { useQuarter } from '../../contexts/QuarterContext';
import NoDataForQuarter from '../ui/NoDataForQuarter';

/**
 * Turnover by Length of Service Slide
 * Stacked bar chart showing terminations by years-of-service buckets.
 * Data: QUARTERLY_TURNOVER_DATA[quarter].yearsOfService
 */
const TurnoverByServiceSlide = () => {
  const { selectedQuarter } = useQuarter();
  const data = getQuarterlyTurnoverData(selectedQuarter);

  if (!data || !data.yearsOfService) {
    return <NoDataForQuarter dataLabel="Turnover by length of service data" />;
  }

  const terminationData = data.summary;
  const yearsOfServiceData = data.yearsOfService.map(item => ({
    ...item,
    total: item.faculty + item.staff,
  }));

  const maxTotal = Math.max(...yearsOfServiceData.map(item => item.total));
  const yAxisMax = Math.ceil(maxTotal / 5) * 5 || 5;
  const yAxisSteps = Array.from({ length: (yAxisMax / 5) + 1 }, (_, i) => i * 5);

  return (
    <div className="min-h-screen">
      <div className="w-[85%] max-w-[1280px] mx-auto pt-5 pb-8">

        {/* Page Header */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {data.quarter} Terminations &amp; Turnover Report
                </h1>
                <p className="text-gray-600 mt-1">
                  Benefit Eligible • {data.fiscalPeriod}
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold" style={{ color: '#0054A6' }}>
                  {terminationData.total.count}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Faculty: {terminationData.faculty.count} | Staff: {terminationData.staff.count}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Clock style={{ color: '#0054A6' }} size={20} />
            Turnover by Length of Service
          </h2>

          <div className="relative" style={{ height: '360px' }}>
            {/* Y-axis */}
            <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
              {yAxisSteps.slice().reverse().map((step, index) => (
                <div key={index} className="relative">
                  <span className="absolute -left-2 -top-2">{step}</span>
                </div>
              ))}
            </div>

            {/* Grid lines */}
            <div className="absolute left-12 right-0 top-0 bottom-0">
              {yAxisSteps.map((step, index) => (
                <div
                  key={index}
                  className="absolute left-0 right-0 border-t border-gray-200"
                  style={{ bottom: `${(step / yAxisMax) * 100}%` }}
                />
              ))}
            </div>

            {/* Bars */}
            <div className="absolute left-12 right-0 bottom-0 flex items-end justify-around" style={{ height: '320px' }}>
              {yearsOfServiceData.map((item, index) => {
                const facultyHeightPx = (item.faculty / yAxisMax) * 320;
                const staffHeightPx = (item.staff / yAxisMax) * 320;

                return (
                  <div key={index} className="flex flex-col items-center" style={{ width: '12%' }}>
                    <div className="text-base font-semibold text-gray-900 mb-1">
                      {item.total}
                    </div>
                    <div className="w-full relative flex flex-col-reverse" style={{ height: `${(item.total / yAxisMax) * 320}px` }}>
                      <div
                        className="w-full bg-green-500 flex items-center justify-center text-white text-sm font-medium"
                        style={{ height: `${facultyHeightPx}px` }}
                      >
                        {item.faculty >= 2 && item.faculty}
                      </div>
                      <div
                        className="w-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium"
                        style={{ height: `${staffHeightPx}px` }}
                      >
                        {item.staff >= 2 && item.staff}
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 mt-2 text-center">
                      {item.range}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 flex justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-700">Benefit Eligible Faculty</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              <span className="text-gray-700">Benefit Eligible Staff</span>
            </div>
          </div>

          <div className="text-xs text-gray-600 mt-4 bg-blue-50 p-3 rounded border border-blue-200 text-center">
            <span className="font-semibold">Note:</span> Displays years of service at termination for {terminationData.faculty.count} benefit-eligible faculty and {terminationData.staff.count} benefit-eligible staff terminations in {data.quarter}.
          </div>
        </div>

      </div>
    </div>
  );
};

export default TurnoverByServiceSlide;
