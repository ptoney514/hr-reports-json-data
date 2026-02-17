import React from 'react';
import { Users, FileText } from 'lucide-react';
import { getQuarterlyWorkforceData } from '../../services/dataService';
import { useQuarter } from '../../contexts/QuarterContext';
import NoDataForQuarter from '../ui/NoDataForQuarter';

/**
 * Q1 FY26 Age/Gender Distribution Report
 * Standalone page extracting age/gender diverging bar charts from DemographicsQ1FY26Dashboard
 *
 * Data Source: source-metrics/workforce/raw/FY26_Q1/
 * Methodology: WORKFORCE_METHODOLOGY.md v2.0
 * No Recharts needed - pure CSS/Tailwind bars
 */
const AgeGenderQ1 = () => {
  const { selectedQuarter } = useQuarter();
  const data = getQuarterlyWorkforceData(selectedQuarter);

  if (!data) {
    return <NoDataForQuarter dataLabel="Age/gender distribution data" />;
  }

  return (
    <div id="age-gender-q1-dashboard" className="min-h-screen">
      <div className="w-[85%] max-w-[1280px] mx-auto pt-5 pb-8">

        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Users style={{color: '#0054A6'}} size={32} />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {data.quarter} Age/Gender Distribution Report
                  </h1>
                  <p className="text-gray-600 text-lg mt-2">
                    Benefit Eligible Employees • {data.fiscalPeriod}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Age and gender distribution analysis for faculty and staff
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold" style={{color: '#0054A6'}}>
                  {(data.summary.faculty.count + data.summary.staff.count).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 font-medium">Benefit Eligible Employees</div>
                <div className="text-xs text-gray-500 mt-1">
                  Faculty: {data.summary.faculty.count} | Staff: {data.summary.staff.count.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Age/Gender Distribution - Diverging Bar Chart */}
        {data.demographics?.ageGender && (
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Age/Gender Distribution
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Faculty Age/Gender - Diverging Chart */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                Faculty ({data.demographics.ageGender.faculty.total} total)
              </h3>
              <div className="text-sm text-center mb-6">
                <span className="text-pink-600 font-medium">&#9792; {data.demographics.ageGender.faculty.femalePercentage}% Female</span>
                <span className="text-gray-400 mx-2">|</span>
                <span className="text-blue-600 font-medium">&#9794; {data.demographics.ageGender.faculty.malePercentage}% Male</span>
              </div>

              <div className="relative">
                {/* Vertical grid lines */}
                <div className="absolute inset-0 flex pointer-events-none">
                  <div className="flex-1 flex justify-between pr-10">
                    {[0, 50, 100, 150].reverse().map((_, idx) => (
                      <div key={`left-${idx}`} className="border-l border-gray-200 h-full"></div>
                    ))}
                  </div>
                  <div className="w-16"></div>
                  <div className="flex-1 flex justify-between pl-10">
                    {[0, 50, 100, 150].map((_, idx) => (
                      <div key={`right-${idx}`} className="border-l border-gray-200 h-full"></div>
                    ))}
                  </div>
                </div>

                <div className="relative space-y-2">
                  {[...data.demographics.ageGender.faculty.ageGenderBreakdown].reverse().map((ageBand, index) => {
                    const maxCount = 150;
                    return (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex-1 flex justify-end pr-2">
                          <div
                            className="bg-pink-500 h-10 flex items-center justify-center text-white text-xs font-medium rounded"
                            style={{ width: `${(ageBand.female / maxCount) * 100}%` }}
                          >
                            {ageBand.female >= 15 && ageBand.female}
                          </div>
                        </div>
                        <div className="w-16 text-sm text-gray-700 font-medium text-center bg-white z-10">{ageBand.ageBand}</div>
                        <div className="flex-1 pl-2">
                          <div
                            className="bg-blue-500 h-10 flex items-center justify-center text-white text-xs font-medium rounded"
                            style={{ width: `${(ageBand.male / maxCount) * 100}%` }}
                          >
                            {ageBand.male >= 15 && ageBand.male}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
                  <div className="flex-1 flex justify-between text-right pr-2">
                    <span>150</span>
                    <span>100</span>
                    <span>50</span>
                    <span>0</span>
                  </div>
                  <div className="w-16 text-center font-semibold">0</div>
                  <div className="flex-1 flex justify-between text-left pl-2">
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                    <span>150</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Staff Age/Gender - Diverging Chart */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                Staff ({data.demographics.ageGender.staff.total.toLocaleString()} total)
              </h3>
              <div className="text-sm text-center mb-6">
                <span className="text-pink-600 font-medium">&#9792; {data.demographics.ageGender.staff.femalePercentage}% Female</span>
                <span className="text-gray-400 mx-2">|</span>
                <span className="text-blue-600 font-medium">&#9794; {data.demographics.ageGender.staff.malePercentage}% Male</span>
              </div>

              <div className="relative">
                {/* Vertical grid lines */}
                <div className="absolute inset-0 flex pointer-events-none">
                  <div className="flex-1 flex justify-between pr-10">
                    {[0, 100, 200].reverse().map((_, idx) => (
                      <div key={`left-${idx}`} className="border-l border-gray-200 h-full"></div>
                    ))}
                  </div>
                  <div className="w-16"></div>
                  <div className="flex-1 flex justify-between pl-10">
                    {[0, 100, 200].map((_, idx) => (
                      <div key={`right-${idx}`} className="border-l border-gray-200 h-full"></div>
                    ))}
                  </div>
                </div>

                <div className="relative space-y-2">
                  {[...data.demographics.ageGender.staff.ageGenderBreakdown].reverse().map((ageBand, index) => {
                    const maxCount = 250;
                    return (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex-1 flex justify-end pr-2">
                          <div
                            className="bg-pink-500 h-10 flex items-center justify-center text-white text-xs font-medium rounded"
                            style={{ width: `${(ageBand.female / maxCount) * 100}%` }}
                          >
                            {ageBand.female >= 30 && ageBand.female}
                          </div>
                        </div>
                        <div className="w-16 text-sm text-gray-700 font-medium text-center bg-white z-10">{ageBand.ageBand}</div>
                        <div className="flex-1 pl-2">
                          <div
                            className="bg-blue-500 h-10 flex items-center justify-center text-white text-xs font-medium rounded"
                            style={{ width: `${(ageBand.male / maxCount) * 100}%` }}
                          >
                            {ageBand.male >= 30 && ageBand.male}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
                  <div className="flex-1 flex justify-between text-right pr-2">
                    <span>250</span>
                    <span>200</span>
                    <span>100</span>
                    <span>0</span>
                  </div>
                  <div className="w-16 text-center font-semibold">0</div>
                  <div className="flex-1 flex justify-between text-left pl-2">
                    <span>0</span>
                    <span>100</span>
                    <span>200</span>
                    <span>250</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        )}

        {/* Data Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText style={{color: '#0054A6'}} size={20} />
            Data Information
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Data as of:</strong> 2025-09-30
          </p>
          <p className="text-sm text-gray-600">
            <strong>Data Sources:</strong> Oracle HCM
          </p>
          <p className="text-sm text-gray-600 mt-2">
            <strong>Methodology:</strong> WORKFORCE_METHODOLOGY.md
          </p>
        </div>

      </div>
    </div>
  );
};

export default AgeGenderQ1;
