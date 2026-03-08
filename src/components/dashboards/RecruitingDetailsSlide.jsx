import React from 'react';
import { Briefcase, UserCheck, Clock, Target, GraduationCap } from 'lucide-react';
import { useQuarter } from '../../contexts/QuarterContext';
import NoDataForQuarter from '../ui/NoDataForQuarter';
import { getQuarterlyRecruitingDetails } from '../../services/dataService';

const Badge = ({ label, color }) => (
  <span
    className="text-xs font-bold px-2 py-0.5 rounded-full border"
    style={{ color, borderColor: color, backgroundColor: `${color}10` }}
  >
    {label}
  </span>
);

const RecruitingDetailsSlide = () => {
  const { selectedQuarter } = useQuarter();
  const data = getQuarterlyRecruitingDetails(selectedQuarter);

  if (!data) {
    return <NoDataForQuarter dataLabel="Recruiting position activity data" />;
  }

  const { staff, faculty, quarter, fiscalPeriod } = data;
  const totalOpened = staff.opened + faculty.opened;

  return (
    <div id="recruiting-details-dashboard" className="min-h-screen print:bg-white print:min-h-0">
      <div className="w-[85%] max-w-[1280px] mx-auto pt-5 pb-8 space-y-3 print:w-full print:max-w-none print:px-2 print:py-1 print:space-y-2">

        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Briefcase style={{ color: '#0054A6' }} size={32} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {quarter} Recruiting Position Activity
                </h1>
                <p className="text-gray-600 text-lg mt-2">
                  Staff & Faculty Positions &bull; {fiscalPeriod}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold" style={{ color: '#0054A6' }}>
                {totalOpened}
              </div>
              <div className="text-sm text-gray-600 font-medium">Total Positions Opened</div>
              <div className="text-xs text-gray-500 mt-1">
                Staff: {staff.opened} | Faculty: {faculty.opened}
              </div>
            </div>
          </div>
        </div>

        {/* Staff Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" role="region" aria-label="Staff position metrics">

          {/* Staff Opened */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-2">
              <Briefcase size={22} className="text-blue-500" />
              <Badge label="STAFF" color="#3B82F6" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{staff.opened}</div>
            <div className="text-sm text-gray-600 mt-1">Staff Opened</div>
            <div className="text-xs text-gray-500 mt-1">Positions created in quarter</div>
          </div>

          {/* Staff Filled */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-2">
              <UserCheck size={22} className="text-emerald-500" />
              <Badge label="FILLED" color="#10B981" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{staff.filled}</div>
            <div className="text-sm text-gray-600 mt-1">Staff Filled</div>
            <div className="text-xs text-gray-500 mt-1">Filled date in quarter</div>
          </div>

          {/* Staff Still Open */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock size={22} className="text-amber-500" />
              <Badge label="OPEN" color="#F59E0B" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{staff.stillOpen}</div>
            <div className="text-sm text-gray-600 mt-1">Staff Still Open</div>
            <div className="text-xs text-gray-500 mt-1">Cumulative open positions</div>
          </div>

          {/* Fill Rate */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-2">
              <Target size={22} className="text-indigo-500" />
              <Badge label="RATE" color="#6366F1" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{staff.fillRate}%</div>
            <div className="text-sm text-gray-600 mt-1">Fill Rate</div>
            <div className="text-xs text-gray-500 mt-1">Filled / Opened</div>
          </div>
        </div>

        {/* Faculty Section */}
        <div className="bg-white rounded-lg shadow-sm border p-4" role="region" aria-label="Faculty position metrics">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Faculty Positions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between mb-2">
                <GraduationCap size={22} className="text-blue-500" />
                <Badge label="FACULTY" color="#3B82F6" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{faculty.opened}</div>
              <div className="text-sm text-gray-600 mt-1">Faculty Opened</div>
              <div className="text-xs text-gray-500 mt-1">Positions opened in quarter</div>
            </div>
            <div className="col-span-1 lg:col-span-3 flex items-center bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">
                Filled and Still Open metrics are not available for faculty positions.
                Interfolio does not provide a reliable filled date.
              </p>
            </div>
          </div>
        </div>

        {/* Note Footer */}
        <div className="text-xs text-gray-600 bg-amber-50 p-3 rounded border border-amber-200 mt-3">
          <span className="font-semibold">Note:</span> Data Sources: Oracle Recruiting Cloud (Staff) &middot; Interfolio (Faculty).
          Opened = created in quarter &middot; Filled = filled date in quarter &middot;
          Still Open = created on/before quarter end and not yet filled &middot;
          Canceled/Deleted positions excluded.
        </div>

      </div>
    </div>
  );
};

export default RecruitingDetailsSlide;
