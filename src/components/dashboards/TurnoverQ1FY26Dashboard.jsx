import React from 'react';
import { TrendingDown, Users, UserCheck, Briefcase, BarChart3, Clock, Calendar, PieChart } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer } from 'recharts';
import { getQuarterlyTurnoverData } from '../../services/dataService';
import { useQuarter } from '../../contexts/QuarterContext';
import NoDataForQuarter from '../ui/NoDataForQuarter';

/**
 * Q1 FY26 Terminations & Turnover Dashboard
 * Displays quarterly termination and turnover analysis
 *
 * Design System Reference: docs/QUARTERLY_REPORTS_DESIGN_SYSTEM.md
 * Follows universal quarterly report patterns for consistency
 */
const TurnoverQ1FY26Dashboard = () => {
  const { selectedQuarter } = useQuarter();

  // Load data dynamically from staticData.js based on global quarter
  const data = getQuarterlyTurnoverData(selectedQuarter);

  if (!data) {
    return <NoDataForQuarter dataLabel="Turnover data" />;
  }

  // Extract data for easier access
  const terminationData = data.summary;
  const employeeGroupData = data.terminationTypesByGroup;

  // Termination type colors
  const terminationColors = {
    voluntary: '#3B82F6',        // Blue
    endOfAssignment: '#F59E0B',  // Yellow/Orange
    retirement: '#10B981',       // Green
    involuntary: '#EF4444'       // Red
  };

  // Years of Service at Termination - Load from data
  const yearsOfServiceData = data.yearsOfService.map(item => ({
    ...item,
    total: item.faculty + item.staff
  }));

  // Find max total for scaling
  const maxYearsTotal = Math.max(...yearsOfServiceData.map(item => item.total));

  // Y-axis scale (0 to max, rounded up to nearest 5)
  const yAxisMax = Math.ceil(maxYearsTotal / 5) * 5;
  const yAxisSteps = Array.from({ length: (yAxisMax / 5) + 1 }, (_, i) => i * 5);

  // Turnover by Age - Load from data
  const ageGroupData = data.ageGroups.map(item => ({
    ...item,
    total: item.faculty + item.staff
  }));

  // Find max for age chart scaling
  const maxAgeTotal = Math.max(...ageGroupData.map(item => item.total));
  const ageAxisMax = Math.ceil(maxAgeTotal / 5) * 5;
  const ageAxisSteps = Array.from({ length: (ageAxisMax / 5) + 1 }, (_, i) => i * 5);

  // Early Turnover Data - Load from data
  const earlyTenureData = data.earlyTurnover.byTerminationType;
  const earlyTenureTotal = data.earlyTurnover.total;
  const earlyTenureCategoryData = data.earlyTurnover.byEmployeeCategory;

  return (
    <div id="turnover-q1-fy26-dashboard" className="min-h-screen">
      <div className="w-[85%] max-w-[1280px] mx-auto pt-5 pb-8">

        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <TrendingDown style={{color: '#0054A6'}} size={32} />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {data.quarter} Terminations & Turnover Report
                  </h1>
                  <p className="text-gray-600 text-lg mt-2">
                    Benefit Eligible Employees • {data.fiscalPeriod}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Employee terminations, turnover rates, and workforce trends
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold" style={{color: '#0054A6'}}>
                  {terminationData.total.count}
                </div>
                <div className="text-sm text-gray-600 font-medium">Total {data.quarter} Terminations</div>
                <div className="text-xs text-gray-500 mt-1">
                  Benefit Eligible - Faculty: {terminationData.faculty.count} | Staff: {terminationData.staff.count}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Termination Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          {/* Total Terminations Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <Users style={{color: '#0054A6'}} size={24} />
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                Q1
              </span>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{terminationData.total.count}</div>
            <div className="text-sm text-gray-600 font-medium">Total Terminations</div>
            <div className="text-xs text-gray-500 mt-2">
              OMA: {terminationData.total.oma} | PHX: {terminationData.total.phx}
            </div>
          </div>

          {/* Benefit Eligible Faculty Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <UserCheck style={{color: '#0054A6'}} size={24} />
              <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 font-medium">
                FACULTY
              </span>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{terminationData.faculty.count}</div>
            <div className="text-sm text-gray-600 font-medium">Benefit Eligible Faculty Terminations</div>
            <div className="text-xs text-gray-500 mt-2">
              OMA: {terminationData.faculty.oma} | PHX: {terminationData.faculty.phx}
            </div>
          </div>

          {/* Benefit Eligible Staff Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <Briefcase style={{color: '#7C3AED'}} size={24} />
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                STAFF
              </span>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{terminationData.staff.count}</div>
            <div className="text-sm text-gray-600 font-medium">Benefit Eligible Staff Terminations</div>
            <div className="text-xs text-gray-500 mt-2">
              OMA: {terminationData.staff.oma} | PHX: {terminationData.staff.phx}
            </div>
          </div>

        </div>

        {/* Turnover by Employee Group */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 style={{color: '#0054A6'}} size={20} />
            Turnover by Employee Group
          </h2>

          {/* Chart Area */}
          <div className="relative" style={{ height: '360px' }}>
            {/* Y-axis with horizontal grid lines */}
            <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
              {[90, 80, 70, 60, 50, 40, 30, 20, 10, 0].map((step, index) => (
                <div key={index} className="relative">
                  <span className="absolute -left-2 -top-2">{step}</span>
                </div>
              ))}
            </div>

            {/* Horizontal grid lines */}
            <div className="absolute left-12 right-0 top-0 bottom-0">
              {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90].map((step, index) => (
                <div
                  key={index}
                  className="absolute left-0 right-0 border-t border-gray-200"
                  style={{ bottom: `${(step / 90) * 100}%` }}
                />
              ))}
            </div>

            {/* Vertical Stacked Bar Chart */}
            <div className="absolute left-12 right-0 bottom-0 flex items-end justify-center gap-16" style={{ height: '320px' }}>
              {employeeGroupData.map((group, index) => {
                // Calculate heights in pixels based on 90 max scale
                const voluntaryPx = (group.voluntary / 90) * 320;
                const endOfAssignmentPx = (group.endOfAssignment / 90) * 320;
                const retirementPx = (group.retirement / 90) * 320;
                const involuntaryPx = (group.involuntary / 90) * 320;

                return (
                  <div key={index} className="flex flex-col items-center" style={{ width: '200px' }}>
                    {/* Total label above bar */}
                    <div className="text-base font-semibold text-gray-900 mb-2">
                      {group.total}
                    </div>

                    {/* Stacked bar container */}
                    <div className="w-full flex flex-col-reverse">
                      {/* Voluntary (bottom) */}
                      <div
                        className="w-full flex items-center justify-center text-white text-sm font-medium"
                        style={{
                          height: `${voluntaryPx}px`,
                          backgroundColor: terminationColors.voluntary
                        }}
                      >
                        {group.voluntary >= 4 && group.voluntary}
                      </div>

                      {/* End of Assignment */}
                      <div
                        className="w-full flex items-center justify-center text-white text-sm font-medium"
                        style={{
                          height: `${endOfAssignmentPx}px`,
                          backgroundColor: terminationColors.endOfAssignment
                        }}
                      >
                        {group.endOfAssignment >= 4 && group.endOfAssignment}
                      </div>

                      {/* Retirement */}
                      <div
                        className="w-full flex items-center justify-center text-white text-sm font-medium"
                        style={{
                          height: `${retirementPx}px`,
                          backgroundColor: terminationColors.retirement
                        }}
                      >
                        {group.retirement >= 4 && group.retirement}
                      </div>

                      {/* Involuntary (top) */}
                      <div
                        className="w-full flex items-center justify-center text-white text-sm font-medium"
                        style={{
                          height: `${involuntaryPx}px`,
                          backgroundColor: terminationColors.involuntary
                        }}
                      >
                        {group.involuntary >= 4 && group.involuntary}
                      </div>
                    </div>

                    {/* Group label below bar */}
                    <div className="text-sm text-gray-700 mt-3 text-center">
                      {group.group}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 flex justify-center gap-6 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{backgroundColor: terminationColors.voluntary}}></div>
              <span className="text-gray-700">Voluntary</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{backgroundColor: terminationColors.endOfAssignment}}></div>
              <span className="text-gray-700">End of Assignment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{backgroundColor: terminationColors.retirement}}></div>
              <span className="text-gray-700">Retirement</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{backgroundColor: terminationColors.involuntary}}></div>
              <span className="text-gray-700">Involuntary</span>
            </div>
          </div>

          {/* Data Note */}
          <div className="text-xs text-gray-600 mt-4 bg-blue-50 p-3 rounded border border-blue-200 text-center">
            <span className="font-semibold">Note:</span> Termination types show breakdown of voluntary resignations, end of assignment, retirements, and involuntary separations for benefit-eligible employees only.
          </div>
        </div>

        {/* Turnover by School - Combined Faculty & Staff Table */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 style={{color: '#0054A6'}} size={20} />
            Turnover by School/Area
          </h2>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">School/Area</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{color: '#0054A6'}}>Faculty</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-green-600 uppercase tracking-wider">Staff</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Distribution</th>
                </tr>
              </thead>
              <tbody>
                {data.turnoverBySchool.map((row, index) => {
                  const totalTerminations = terminationData.total.count;
                  const percentage = ((row.total / totalTerminations) * 100).toFixed(1);
                  // Max value is 16 (Other), scale bar width accordingly
                  const maxCount = 16;
                  const barWidthPercent = (row.total / maxCount) * 100;

                  return (
                    <tr key={index} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium text-gray-900">{row.school}</div>
                        {row.note && <div className="text-xs text-gray-500 mt-1">{row.note}</div>}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="text-lg font-bold text-gray-900">{row.total}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-sm font-semibold ${row.faculty > 0 ? 'text-white' : 'bg-gray-100 text-gray-400'}`}
                          style={row.faculty > 0 ? {backgroundColor: '#0054A6'} : {}}
                        >
                          {row.faculty}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-sm font-semibold ${row.staff > 0 ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                          {row.staff}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-4 bg-gray-100 rounded overflow-hidden" style={{width: '120px'}}>
                            {/* Faculty portion */}
                            {row.faculty > 0 && (
                              <div
                                className="h-full"
                                style={{
                                  width: `${(row.faculty / row.total) * barWidthPercent}%`,
                                  backgroundColor: '#0054A6'
                                }}
                              />
                            )}
                            {/* Staff portion */}
                            {row.staff > 0 && (
                              <div
                                className="h-full bg-green-500"
                                style={{ width: `${(row.staff / row.total) * barWidthPercent}%` }}
                              />
                            )}
                          </div>
                          <span className="text-xs text-gray-500 w-10">{percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td className="py-4 px-4 font-semibold text-gray-900">Total</td>
                  <td className="py-4 px-4 text-center">
                    <div className="text-xl font-bold text-gray-900">{terminationData.total.count}</div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-white text-sm font-bold"
                      style={{backgroundColor: '#0054A6'}}
                    >
                      {terminationData.faculty.count}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-bold">
                      {terminationData.staff.count}
                    </span>
                  </td>
                  <td className="py-4 px-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{backgroundColor: '#0054A6'}}></div>
              <span className="text-gray-700">Faculty Terminations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span className="text-gray-700">Staff Terminations</span>
            </div>
          </div>

          {/* Data Note */}
          <div className="text-xs text-gray-600 mt-4 bg-blue-50 p-3 rounded border border-blue-200 text-center">
            <span className="font-semibold">Note:</span> All counts represent benefit-eligible employees only (Faculty + Staff). Sorted by total departures descending.
          </div>
        </div>

        {/* Turnover by Length of Service */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Clock style={{color: '#0054A6'}} size={20} />
            Turnover by Length of Service
          </h2>

          {/* Chart Area */}
          <div className="relative" style={{ height: '320px' }}>
            {/* Y-axis with horizontal grid lines */}
            <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
              {yAxisSteps.slice().reverse().map((step, index) => (
                <div key={index} className="relative">
                  <span className="absolute -left-2 -top-2">{step}</span>
                </div>
              ))}
            </div>

            {/* Horizontal grid lines */}
            <div className="absolute left-12 right-0 top-0 bottom-0">
              {yAxisSteps.map((step, index) => (
                <div
                  key={index}
                  className="absolute left-0 right-0 border-t border-gray-200"
                  style={{ bottom: `${(step / yAxisMax) * 100}%` }}
                />
              ))}
            </div>

            {/* Stacked Bars */}
            <div className="absolute left-12 right-0 bottom-0 flex items-end justify-around" style={{ height: '280px' }}>
              {yearsOfServiceData.map((item, index) => {
                // Calculate bar height as percentage of chart height based on y-axis max
                const barHeightPx = (item.total / yAxisMax) * 280;
                const facultyHeightPx = (item.faculty / yAxisMax) * 280;
                const staffHeightPx = (item.staff / yAxisMax) * 280;

                return (
                  <div key={index} className="flex flex-col items-center" style={{ width: '12%' }}>
                    {/* Total label above bar */}
                    <div className="text-base font-semibold text-gray-900 mb-1">
                      {item.total}
                    </div>

                    {/* Stacked bar */}
                    <div
                      className="w-full relative flex flex-col-reverse"
                      style={{ height: `${barHeightPx}px` }}
                    >
                      {/* Faculty segment (bottom, green) */}
                      <div
                        className="w-full bg-green-500 flex items-center justify-center text-white text-sm font-medium"
                        style={{ height: `${facultyHeightPx}px` }}
                      >
                        {item.faculty >= 2 && item.faculty}
                      </div>

                      {/* Staff segment (top, blue) */}
                      <div
                        className="w-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium"
                        style={{ height: `${staffHeightPx}px` }}
                      >
                        {item.staff >= 2 && item.staff}
                      </div>
                    </div>

                    {/* Range label */}
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

          {/* Data Note */}
          <div className="text-xs text-gray-600 mt-4 bg-blue-50 p-3 rounded border border-blue-200 text-center">
            <span className="font-semibold">Note:</span> Displays years of service at termination for {terminationData.faculty.count} benefit-eligible faculty and {terminationData.staff.count} benefit-eligible staff terminations in {data.quarter}.
          </div>
        </div>

        {/* Turnover by Age */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Calendar style={{color: '#0054A6'}} size={20} />
            Turnover by Age
          </h2>

          {/* Chart Area */}
          <div className="relative" style={{ height: '320px' }}>
            {/* Y-axis with horizontal grid lines */}
            <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
              {ageAxisSteps.slice().reverse().map((step, index) => (
                <div key={index} className="relative">
                  <span className="absolute -left-2 -top-2">{step}</span>
                </div>
              ))}
            </div>

            {/* Horizontal grid lines */}
            <div className="absolute left-12 right-0 top-0 bottom-0">
              {ageAxisSteps.map((step, index) => (
                <div
                  key={index}
                  className="absolute left-0 right-0 border-t border-gray-200"
                  style={{ bottom: `${(step / ageAxisMax) * 100}%` }}
                />
              ))}
            </div>

            {/* Stacked Bars */}
            <div className="absolute left-12 right-0 bottom-0 flex items-end justify-around" style={{ height: '280px' }}>
              {ageGroupData.map((item, index) => {
                // Calculate bar heights in pixels based on y-axis max
                const facultyHeightPx = (item.faculty / ageAxisMax) * 280;
                const staffHeightPx = (item.staff / ageAxisMax) * 280;

                return (
                  <div key={index} className="flex flex-col items-center" style={{ width: '14%' }}>
                    {/* Total label above bar */}
                    <div className="text-base font-semibold text-gray-900 mb-1">
                      {item.total}
                    </div>

                    {/* Stacked bar */}
                    <div className="w-full relative flex flex-col-reverse">
                      {/* Faculty segment (bottom, green) */}
                      <div
                        className="w-full bg-green-500 flex items-center justify-center text-white text-sm font-medium"
                        style={{ height: `${facultyHeightPx}px` }}
                      >
                        {item.faculty >= 2 && item.faculty}
                      </div>

                      {/* Staff segment (top, blue) */}
                      <div
                        className="w-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium"
                        style={{ height: `${staffHeightPx}px` }}
                      >
                        {item.staff >= 2 && item.staff}
                      </div>
                    </div>

                    {/* Age range label */}
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

          {/* Data Note */}
          <div className="text-xs text-gray-600 mt-4 bg-blue-50 p-3 rounded border border-blue-200 text-center">
            <span className="font-semibold">Note:</span> Displays age distribution at termination for {terminationData.faculty.count} benefit-eligible faculty and {terminationData.staff.count} benefit-eligible staff terminations in {data.quarter}.
          </div>
        </div>

        {/* Early Turnover Deep Dive - Two Column Layout */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
              <PieChart style={{color: '#0054A6'}} size={24} />
              Early Turnover Deep Dive (&lt;1 Year Tenure)
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* By Employee Category */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  By Employee Category (&lt;1 Year Tenure)
                </h3>

                <div className="flex flex-col items-center">
                  {/* Donut Chart Container with Centered Label */}
                  <div className="relative w-full" style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPie>
                        <Pie
                          data={earlyTenureCategoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                          label={(entry) => `${entry.value} (${entry.percentage}%)`}
                          labelLine={true}
                          style={{ fontSize: '14px', fontWeight: '500' }}
                        >
                          {earlyTenureCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </RechartsPie>
                    </ResponsiveContainer>

                    {/* Center Label - Perfectly Centered */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">{earlyTenureTotal}</div>
                        <div className="text-xs text-gray-600 uppercase tracking-wide">TOTAL</div>
                      </div>
                    </div>
                  </div>

                  {/* Custom Legend */}
                  <div className="flex justify-center gap-6 text-sm mt-2">
                    {earlyTenureCategoryData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{backgroundColor: item.color}}></div>
                        <span className="text-gray-700">{item.name}: <strong>{item.value}</strong> ({item.percentage}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* By Termination Type */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  By Termination Type (&lt;1 Year Tenure)
                </h3>

                <div className="flex flex-col items-center">
                  {/* Donut Chart Container with Centered Label */}
                  <div className="relative w-full" style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPie>
                        <Pie
                          data={earlyTenureData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                          label={(entry) => `${entry.value} (${entry.percentage}%)`}
                          labelLine={true}
                          style={{ fontSize: '14px', fontWeight: '500' }}
                        >
                          {earlyTenureData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </RechartsPie>
                    </ResponsiveContainer>

                    {/* Center Label - Perfectly Centered */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">{earlyTenureTotal}</div>
                        <div className="text-xs text-gray-600 uppercase tracking-wide">TOTAL</div>
                      </div>
                    </div>
                  </div>

                  {/* Custom Legend */}
                  <div className="flex justify-center gap-6 text-sm mt-2">
                    {earlyTenureData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{backgroundColor: item.color}}></div>
                        <span className="text-gray-700">{item.name}: <strong>{item.value}</strong> ({item.percentage}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* By School/Area */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  By School/Area (&lt;1 Year Tenure)
                </h3>

                <div className="flex flex-col items-center">
                  {/* Donut Chart Container with Centered Label */}
                  <div className="relative w-full" style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPie>
                        <Pie
                          data={data.earlyTurnover.bySchool}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="count"
                          label={(entry) => `${entry.count} (${entry.percentage}%)`}
                          labelLine={true}
                          style={{ fontSize: '14px', fontWeight: '500' }}
                        >
                          {data.earlyTurnover.bySchool.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </RechartsPie>
                    </ResponsiveContainer>

                    {/* Center Label - Perfectly Centered */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">{earlyTenureTotal}</div>
                        <div className="text-xs text-gray-600 uppercase tracking-wide">TOTAL</div>
                      </div>
                    </div>
                  </div>

                  {/* Custom Legend */}
                  <div className="flex flex-col gap-1 text-sm mt-2">
                    {data.earlyTurnover.bySchool.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{backgroundColor: item.color}}></div>
                        <span className="text-gray-700 text-xs">{item.school}: <strong>{item.count}</strong> ({item.percentage}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Early Turnover by School Table - Detailed Breakdown */}
            <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 style={{color: '#0054A6'}} size={18} />
                Early Turnover by School/Area (Detailed)
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">School/Area</th>
                      <th className="text-center py-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Count</th>
                      <th className="text-left py-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Distribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.earlyTurnover.bySchoolDetailed?.map((row, index) => {
                      const maxCount = 4; // Medicine has the highest at 4
                      const barWidthPercent = (row.count / maxCount) * 100;

                      return (
                        <tr key={index} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="py-2 px-4">
                            <div className="text-sm font-medium text-gray-900">{row.school}</div>
                          </td>
                          <td className="py-2 px-4 text-center">
                            <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-sm font-semibold bg-blue-500 text-white">
                              {row.count}
                            </span>
                          </td>
                          <td className="py-2 px-4">
                            <div className="flex items-center gap-2">
                              <div className="flex h-4 bg-gray-100 rounded overflow-hidden" style={{width: '120px'}}>
                                <div
                                  className="h-full bg-blue-500"
                                  style={{ width: `${barWidthPercent}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 w-12">{row.percentage}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-300 bg-gray-50">
                      <td className="py-3 px-4 font-semibold text-gray-900">Total</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold">
                          {earlyTenureTotal}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs text-gray-500">100%</span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="text-xs text-gray-600 mt-4 bg-blue-50 p-3 rounded border border-blue-200 text-center">
                <span className="font-semibold">Note:</span> Shows all {data.earlyTurnover.bySchoolDetailed?.length || 0} schools/areas with early turnover (&lt;1 year tenure) in {data.quarter}. Sorted by count descending.
              </div>
            </div>
          </div>
        </div>

        {/* Future: Additional charts and visualizations will go here */}

      </div>
    </div>
  );
};

export default TurnoverQ1FY26Dashboard;
