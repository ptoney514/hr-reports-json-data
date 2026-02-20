import React from 'react';
import { Users, Stethoscope, Clock, GraduationCap, MapPin } from 'lucide-react';
import { ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { getQuarterlyWorkforceData, QUARTERLY_HEADCOUNT_TRENDS } from '../../services/dataService';
import { useQuarter } from '../../contexts/QuarterContext';
import NoDataForQuarter from '../ui/NoDataForQuarter';

/**
 * Temporary Workers Dashboard
 * Displays quarterly temporary workforce composition: HSP, Temp NBE, and Student Workers
 *
 * Data Source: QUARTERLY_WORKFORCE_DATA (summary cards) + QUARTERLY_HEADCOUNT_TRENDS (trend chart)
 * Design: Distinct color palette from benefit-eligible Workforce page
 */

// Color palette - distinct from the Workforce page
const COLORS = {
  total: '#6366F1',       // Indigo
  hsp: '#F59E0B',         // Amber
  tempNBE: '#64748B',     // Slate gray
  students: '#10B981',    // Emerald
  campusHsp: '#F97316',   // Orange (campus bar)
  campusTempNBE: '#64748B', // Slate (campus bar)
  campusStudents: '#22C55E', // Green (campus bar)
};

// Badge component for card category labels
const Badge = ({ label, color }) => (
  <span
    className="text-xs font-bold px-2 py-0.5 rounded-full border"
    style={{ color, borderColor: color, backgroundColor: `${color}10` }}
  >
    {label}
  </span>
);

const TempWorkersQ1FY26Dashboard = () => {
  const { selectedQuarter } = useQuarter();

  const data = getQuarterlyWorkforceData(selectedQuarter);

  if (!data) {
    return <NoDataForQuarter dataLabel="Temporary worker data" />;
  }

  const { houseStaffPhysicians, temporary, studentWorkers } = data.summary;
  const totalTempWorkers = houseStaffPhysicians.count + temporary.count + studentWorkers.count;
  const totalOma = houseStaffPhysicians.oma + temporary.oma + studentWorkers.oma;
  const totalPhx = houseStaffPhysicians.phx + temporary.phx + studentWorkers.phx;

  // Derive trend data from QUARTERLY_HEADCOUNT_TRENDS
  const tempWorkerTrends = QUARTERLY_HEADCOUNT_TRENDS.slice(-9).map(q => ({
    quarter: q.quarter,
    hsp: q.hsp,
    tempNBE: q.temp,
    students: q.students,
    total: q.hsp + q.temp + q.students,
  }));

  // Campus data for horizontal bar chart
  const campusData = {
    omaha: {
      hsp: data.locationDetails.omaha.hsp,
      tempNBE: data.locationDetails.omaha.temp,
      students: data.locationDetails.omaha.students,
      total: data.locationDetails.omaha.hsp + data.locationDetails.omaha.temp + data.locationDetails.omaha.students,
    },
    phoenix: {
      hsp: data.locationDetails.phoenix.hsp,
      tempNBE: data.locationDetails.phoenix.temp,
      students: data.locationDetails.phoenix.students,
      total: data.locationDetails.phoenix.hsp + data.locationDetails.phoenix.temp + data.locationDetails.phoenix.students,
    },
  };

  const maxCampusTotal = Math.max(campusData.omaha.total, campusData.phoenix.total);
  const barScale = Math.ceil(maxCampusTotal / 500) * 500; // Round up to nearest 500

  return (
    <div id="temp-workers-q1-fy26-dashboard" className="min-h-screen print:bg-white print:min-h-0">
      <div className="w-[85%] max-w-[1280px] mx-auto pt-5 pb-8 space-y-3 print:w-full print:max-w-none print:px-2 print:py-1 print:space-y-2">

        {/* Summary Cards - 4 Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" role="region" aria-label="Temporary worker metrics">

          {/* Total Temporary Workers */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-2">
              <Users size={22} className="text-indigo-400" />
              <Badge label="Q1" color={COLORS.total} />
            </div>
            <div className="text-3xl font-bold text-gray-900">{totalTempWorkers.toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-1">Total Temporary Workers</div>
            <div className="text-xs text-gray-500 mt-1">
              OMA: {totalOma.toLocaleString()} | PHX: {totalPhx.toLocaleString()}
            </div>
          </div>

          {/* House Staff Physicians */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-2">
              <Stethoscope size={22} className="text-amber-500" />
              <Badge label="HSP" color={COLORS.hsp} />
            </div>
            <div className="text-3xl font-bold text-gray-900">{houseStaffPhysicians.count.toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-1">House Staff Physicians</div>
            <div className="text-xs text-gray-500 mt-1">
              OMA: {houseStaffPhysicians.oma} | PHX: {houseStaffPhysicians.phx}
            </div>
          </div>

          {/* Temporary NBE */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock size={22} className="text-slate-500" />
              <Badge label="TEMP" color={COLORS.tempNBE} />
            </div>
            <div className="text-3xl font-bold text-gray-900">{temporary.count.toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-1">Temporary NBE</div>
            <div className="text-xs text-gray-500 mt-1">
              OMA: {temporary.oma} | PHX: {temporary.phx}
            </div>
          </div>

          {/* Student Workers */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-2">
              <GraduationCap size={22} className="text-emerald-500" />
              <Badge label="STUDENT" color={COLORS.students} />
            </div>
            <div className="text-3xl font-bold text-gray-900">{studentWorkers.count.toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-1">Student Workers</div>
            <div className="text-xs text-gray-500 mt-1">
              OMA: {studentWorkers.oma.toLocaleString()} | PHX: {studentWorkers.phx}
            </div>
          </div>
        </div>

        {/* Quarterly Trend Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="text-base font-bold text-gray-900 mb-3">
            Quarterly Temporary Workers Headcount Trend
          </h2>
          <ResponsiveContainer width="100%" height={385}>
            <LineChart data={tempWorkerTrends} margin={{ top: 40, right: 30, left: 50, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D7D2CB" />
              <XAxis dataKey="quarter" tick={{ fontSize: 12, fill: '#5F7FC3' }} />
              <YAxis
                tick={{ fontSize: 12, fill: '#5F7FC3' }}
                domain={[0, 4000]}
                ticks={[0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000]}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '2px solid #6366F1',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.25)',
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />

              {/* HSP Line - Dashed orange */}
              <Line
                type="monotone"
                dataKey="hsp"
                stroke={COLORS.hsp}
                strokeWidth={3}
                strokeDasharray="8 4"
                dot={{ r: 5, fill: COLORS.hsp, strokeWidth: 2, stroke: '#ffffff' }}
                name="House Staff Physicians"
                activeDot={{ r: 7, fill: COLORS.hsp, stroke: '#ffffff', strokeWidth: 3 }}
              />

              {/* Student Workers Line - Dashed green */}
              <Line
                type="monotone"
                dataKey="students"
                stroke={COLORS.students}
                strokeWidth={3}
                strokeDasharray="8 4"
                dot={{ r: 5, fill: COLORS.students, strokeWidth: 2, stroke: '#ffffff' }}
                name="Student Workers"
                activeDot={{ r: 7, fill: COLORS.students, stroke: '#ffffff', strokeWidth: 3 }}
              />

              {/* Temporary NBE Line - Dot-dash gray */}
              <Line
                type="monotone"
                dataKey="tempNBE"
                stroke={COLORS.tempNBE}
                strokeWidth={3}
                strokeDasharray="4 2 1 2"
                dot={{ r: 5, fill: COLORS.tempNBE, strokeWidth: 2, stroke: '#ffffff' }}
                name="Temporary NBE"
                activeDot={{ r: 7, fill: COLORS.tempNBE, stroke: '#ffffff', strokeWidth: 3 }}
              />

              {/* Total Line - Solid indigo */}
              <Line
                type="monotone"
                dataKey="total"
                stroke={COLORS.total}
                strokeWidth={4}
                dot={{ r: 7, fill: COLORS.total, strokeWidth: 2, stroke: '#ffffff' }}
                name="Total"
                activeDot={{ r: 9, fill: COLORS.total, stroke: '#ffffff', strokeWidth: 3 }}
                label={{
                  position: 'top',
                  offset: 15,
                  style: { fontSize: 13, fontWeight: 'bold', fill: COLORS.total },
                }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Chart Note */}
          <div className="text-xs text-gray-600 bg-amber-50 p-3 rounded border border-amber-200 mt-3">
            <span className="font-semibold">Note:</span> All quarterly data is actual headcount from Oracle HCM (since Q1 FY23). Student headcount peaks align with academic semesters. HSP headcount reflects residency program cycles.
          </div>
        </div>

        {/* Campus Comparison - Temporary Workers by Type */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
            <MapPin style={{ color: COLORS.total }} size={18} />
            Campus Comparison - Temporary Workers by Type
          </h2>

          {/* Legend */}
          <div className="mb-4 flex justify-center gap-6 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.campusHsp }}></div>
              <span className="text-gray-700">House Staff Physicians</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.campusTempNBE }}></div>
              <span className="text-gray-700">Temporary NBE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.campusStudents }}></div>
              <span className="text-gray-700">Student Workers</span>
            </div>
          </div>

          {/* Horizontal Stacked Bar Chart */}
          <div className="space-y-8">
            {/* X-axis scale */}
            <div className="relative">
              <div className="flex justify-between text-xs text-gray-500 mb-2 px-32">
                {Array.from({ length: Math.floor(barScale / 500) + 1 }, (_, i) => (
                  <span key={i}>{(i * 500).toLocaleString()}</span>
                ))}
              </div>

              {/* Vertical grid lines */}
              <div className="absolute top-6 left-32 right-32 bottom-0 flex justify-between pointer-events-none">
                {Array.from({ length: Math.floor(barScale / 500) + 1 }, (_, i) => (
                  <div key={i} className="border-l border-gray-200 h-full"></div>
                ))}
              </div>

              {/* Omaha Bar */}
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-24 text-sm text-gray-700 font-medium text-right">Omaha (OMA)</div>
                  <div className="flex-1 relative">
                    <div className="flex h-12 rounded overflow-hidden">
                      <div
                        className="flex items-center justify-center text-white text-xs font-medium"
                        style={{
                          width: `${(campusData.omaha.hsp / barScale) * 100}%`,
                          backgroundColor: COLORS.campusHsp,
                        }}
                      >
                        {campusData.omaha.hsp >= 100 && campusData.omaha.hsp}
                      </div>
                      <div
                        className="flex items-center justify-center text-white text-xs font-medium"
                        style={{
                          width: `${(campusData.omaha.tempNBE / barScale) * 100}%`,
                          backgroundColor: COLORS.campusTempNBE,
                        }}
                      >
                        {campusData.omaha.tempNBE >= 100 && campusData.omaha.tempNBE}
                      </div>
                      <div
                        className="flex items-center justify-center text-white text-xs font-medium"
                        style={{
                          width: `${(campusData.omaha.students / barScale) * 100}%`,
                          backgroundColor: COLORS.campusStudents,
                        }}
                      >
                        {campusData.omaha.students >= 100 && campusData.omaha.students.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="w-20 text-right text-base font-bold text-gray-900">
                    {campusData.omaha.total.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Phoenix Bar */}
              <div>
                <div className="flex items-center gap-4">
                  <div className="w-24 text-sm text-gray-700 font-medium text-right">Phoenix (PHX)</div>
                  <div className="flex-1 relative">
                    <div className="flex h-12 rounded overflow-hidden">
                      <div
                        className="flex items-center justify-center text-white text-xs font-medium"
                        style={{
                          width: `${(campusData.phoenix.hsp / barScale) * 100}%`,
                          backgroundColor: COLORS.campusHsp,
                        }}
                      >
                        {campusData.phoenix.hsp >= 100 && campusData.phoenix.hsp}
                      </div>
                      <div
                        className="flex items-center justify-center text-white text-xs font-medium"
                        style={{
                          width: `${(campusData.phoenix.tempNBE / barScale) * 100}%`,
                          backgroundColor: COLORS.campusTempNBE,
                        }}
                      >
                        {campusData.phoenix.tempNBE >= 100 && campusData.phoenix.tempNBE}
                      </div>
                      <div
                        className="flex items-center justify-center text-white text-xs font-medium"
                        style={{
                          width: `${(campusData.phoenix.students / barScale) * 100}%`,
                          backgroundColor: COLORS.campusStudents,
                        }}
                      >
                        {campusData.phoenix.students >= 100 && campusData.phoenix.students}
                      </div>
                    </div>
                  </div>
                  <div className="w-20 text-right text-base font-bold text-gray-900">
                    {campusData.phoenix.total.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Campus Note */}
          <div className="text-xs text-gray-600 bg-green-50 p-3 rounded border border-green-200 mt-4">
            <span className="font-semibold">Note:</span> Campus comparison shows {totalTempWorkers.toLocaleString()} total temporary workers across Omaha ({totalOma.toLocaleString()}) and Phoenix ({totalPhx.toLocaleString()}) campuses as of end of {data.quarter}.
          </div>
        </div>

      </div>
    </div>
  );
};

export default TempWorkersQ1FY26Dashboard;
