import React from 'react';
import { Link } from 'react-router-dom';
import ErrorBoundary from '../ui/ErrorBoundary';
import { 
  DollarSign,
  Users,
  CheckCircle,
  TrendingUp,
  Award,
  FileText,
  Briefcase,
  Target,
  BarChart3,
  ClipboardCheck,
  Calendar,
  Sparkles,
  Building2,
  UserCheck,
  Shield
} from 'lucide-react';

const TotalRewardsDashboard = () => {
  // Compensation Review Phases Data
  const compensationPhases = [
    {
      phase: 1,
      timeframe: 'March 2023 - September 2023',
      payGrades: 'All positions with compensation below $50,000 and grades G, H, I, J, K and IT Band 1',
      positions: 154,
      impact: '268 staff in 81 benefit eligible positions',
      effectiveDate: 'October 1, 2023',
      marketAdjustment: ''
    },
    {
      phase: 2,
      timeframe: 'October 2023 - July 2024',
      payGrades: 'E, F and IT Bands 2 and 3',
      positions: 219,
      impact: '118 staff in 74 benefit eligible positions',
      effectiveDate: 'July 1, 2024',
      marketAdjustment: ''
    },
    {
      phase: 3,
      timeframe: 'April 2024 - September 2024',
      payGrades: 'C, D and IT Band 4',
      positions: '194 staff; 569 faculty',
      impact: '68 staff in 58 benefit eligible positions + 258 faculty in identifiable positions',
      effectiveDate: 'October 1, 2024; October 1, 2025',
      marketAdjustment: ''
    },
    {
      phase: 4,
      timeframe: 'October 2024 - April 2025',
      payGrades: 'A, B, X and IT Band 5',
      positions: 132,
      impact: '17 staff in 17 benefit eligible positions',
      effectiveDate: 'October 1, 2025; October 1, 2026',
      marketAdjustment: ''
    }
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-white border-b-2" style={{ borderBottomColor: '#4366D0' }}>
          <div className="p-8">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-4xl font-bold text-center mb-2" style={{ color: '#00245D' }}>Total Rewards FY2025 Excellence</h1>
              <p className="text-center text-lg" style={{ color: '#4366D0' }}>Transforming Compensation & Benefits Strategy</p>
            </div>
          </div>
        </div>

        <div className="p-8 max-w-7xl mx-auto">
          {/* Strategic Focus Card - Similar to Benefits & Wellbeing */}
          <div className="mb-12">
            <div className="rounded-3xl p-10 relative overflow-hidden"
                 style={{ background: 'linear-gradient(135deg, #D7D2CB20 0%, white 100%)' }}>
              <div className="grid grid-cols-12 gap-8 items-center">
                <div className="col-span-8">
                  <h3 className="text-3xl font-semibold mb-4" style={{ color: '#00245D' }}>
                    Strategic Focus
                  </h3>
                  <p className="text-lg font-light" style={{ color: '#6B7280' }}>
                    Competitive benefits, rewards and programs is an ongoing area of focus for the University.
                    Our comprehensive strategy ensures we attract and retain top talent through market-aligned compensation
                    and meaningful total rewards offerings.
                  </p>
                </div>
                <div className="col-span-4 text-center">
                  <div className="inline-flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
                         style={{ backgroundColor: '#4366D0' }}>
                      <TrendingUp className="w-10 h-10 text-white" />
                    </div>
                    <span className="text-sm font-medium" style={{ color: '#4366D0' }}>
                      Leading the Way
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Achievements Section */}
          <div className="bg-white rounded-2xl border p-8 mb-12" style={{ borderColor: '#D7D2CB' }}>
            <h2 className="text-3xl font-bold text-center mb-8" style={{ color: '#00245D' }}>FY2025 Total Rewards Impact</h2>
            
            <div className="grid grid-cols-2 gap-8">
              {/* Reward Statements Success */}
              <div className="border-l-4 pl-6 bg-white rounded-r-lg p-4" style={{ borderLeftColor: '#4366D0' }}>
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-6 h-6" style={{ color: '#4366D0' }} />
                  <h3 className="text-xl font-bold" style={{ color: '#00245D' }}>Perfect Data Quality</h3>
                </div>
                <p className="mb-3" style={{ color: '#00245D' }}>
                  Delivered <span className="font-bold" style={{ color: '#4366D0' }}>2,066 total reward statements</span> for staff and faculty 
                  without one question with data quality - a testament to our commitment to accuracy.
                </p>
                <p className="text-sm italic" style={{ color: '#5F7FC3' }}>
                  "Excellence in data integrity and communication transparency."
                </p>
              </div>

              {/* Compensation Review Impact */}
              <div className="border-l-4 pl-6 bg-white rounded-r-lg p-4" style={{ borderLeftColor: '#7FCC93' }}>
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-6 h-6" style={{ color: '#7FCC93' }} />
                  <h3 className="text-xl font-bold" style={{ color: '#00245D' }}>Comprehensive Review</h3>
                </div>
                <p className="mb-3" style={{ color: '#00245D' }}>
                  <span className="font-bold" style={{ color: '#7FCC93' }}>1,268 total positions</span> representing 1,873 faculty and staff evaluated,
                  with 729 receiving market adjustments.
                </p>
                <p className="text-sm italic" style={{ color: '#5F7FC3' }}>
                  "Strategic compensation alignment for competitive positioning."
                </p>
              </div>

              {/* Phase 3 & 4 Completion */}
              <div className="border-l-4 pl-6 bg-white rounded-r-lg p-4" style={{ borderLeftColor: '#FFC72C' }}>
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-6 h-6" style={{ color: '#FFC72C' }} />
                  <h3 className="text-xl font-bold" style={{ color: '#00245D' }}>Multi-Year Progress</h3>
                </div>
                <p className="mb-3" style={{ color: '#00245D' }}>
                  Completed Staff Phases 3 and 4: <span className="font-bold" style={{ color: '#FFC72C' }}>326 staff positions</span> reviewed,
                  representing 384 employees with 85 receiving adjustments.
                </p>
                <p className="text-sm italic" style={{ color: '#5F7FC3' }}>
                  "Systematic approach to equitable compensation."
                </p>
              </div>

              {/* Additional Accomplishments */}
              <div className="border-l-4 pl-6 bg-white rounded-r-lg p-4" style={{ borderLeftColor: '#5F7FC3' }}>
                <div className="flex items-center gap-3 mb-3">
                  <Award className="w-6 h-6" style={{ color: '#5F7FC3' }} />
                  <h3 className="text-xl font-bold" style={{ color: '#00245D' }}>Process Excellence</h3>
                </div>
                <p className="mb-3" style={{ color: '#00245D' }}>
                  <span className="font-bold" style={{ color: '#5F7FC3' }}>255 job descriptions</span> standardized in Job Architect,
                  plus 1,925 merit increases and 1,805 minimum wage adjustments processed.
                </p>
                <p className="text-sm italic" style={{ color: '#5F7FC3' }}>
                  "Operational excellence in compensation management."
                </p>
              </div>
            </div>

            <div className="mt-8 text-center flex items-center justify-center gap-2" style={{ color: '#00245D' }}>
              <Sparkles className="w-5 h-5" style={{ color: '#FFC72C' }} />
              <span>Delivering competitive compensation strategies that attract and retain top talent</span>
            </div>
          </div>

          {/* Achievement Badges Section */}
          <div className="grid grid-cols-3 gap-6 mb-12">
            {/* Total Reward Statements Badge */}
            <div className="rounded-2xl p-6 border bg-white" style={{ borderColor: '#4366D0' }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#4366D0' }}>
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: '#00245D' }}>Reward Statements</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Shield className="w-4 h-4" style={{ color: '#4366D0' }} />
                      <span className="text-sm font-medium" style={{ color: '#4366D0' }}>100% Data Quality</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="font-medium" style={{ color: '#00245D' }}>Statements Delivered</span>
                    <span className="text-2xl font-bold" style={{ color: '#00245D' }}>2,066</span>
                  </div>
                  <div className="w-full rounded-full h-3 overflow-hidden" style={{ backgroundColor: '#D7D2CB' }}>
                    <div className="h-full rounded-full" style={{ width: '100%', backgroundColor: '#4366D0' }}></div>
                  </div>
                  <p className="text-xs mt-1" style={{ color: '#5F7FC3' }}>Zero data quality issues</p>
                </div>
              </div>
            </div>

            {/* Positions Evaluated Badge */}
            <div className="rounded-2xl p-6 border bg-white" style={{ borderColor: '#7FCC93' }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#7FCC93' }}>
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: '#00245D' }}>Compensation Review</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <CheckCircle className="w-4 h-4" style={{ color: '#7FCC93' }} />
                      <span className="text-sm font-medium" style={{ color: '#7FCC93' }}>Multi-Year Outcomes</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="pb-2 border-b" style={{ borderColor: '#D7D2CB' }}>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold" style={{ color: '#00245D' }}>1,268</span>
                    <span className="text-sm" style={{ color: '#6B7280' }}>Positions Evaluated</span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: '#5F7FC3' }}>Representing 1,873 faculty & staff</p>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold" style={{ color: '#7FCC93' }}>729</span>
                    <span className="text-sm" style={{ color: '#6B7280' }}>Market Adjustments</span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: '#5F7FC3' }}>Faculty & staff receiving adjustments</p>
                </div>
              </div>
            </div>

            {/* Process Improvements Badge */}
            <div className="rounded-2xl p-6 border bg-white" style={{ borderColor: '#FFC72C' }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFC72C' }}>
                    <BarChart3 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: '#00245D' }}>Process Excellence</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Target className="w-4 h-4" style={{ color: '#FFC72C' }} />
                      <span className="text-sm font-medium" style={{ color: '#FFC72C' }}>Operational Success</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: '#5F7FC3' }}>Merit Increases</span>
                  <span className="font-bold" style={{ color: '#00245D' }}>1,925</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: '#5F7FC3' }}>Min Wage Adjustments</span>
                  <span className="font-bold" style={{ color: '#00245D' }}>1,805</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: '#5F7FC3' }}>Job Descriptions</span>
                  <span className="font-bold" style={{ color: '#00245D' }}>255</span>
                </div>
              </div>
            </div>
          </div>

          {/* Compensation Review Phases - Modern Timeline */}
          <div className="bg-white rounded-2xl border p-8 mb-12" style={{ borderColor: '#D7D2CB' }}>
            <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: '#00245D' }}>Multi-Year Total Rewards & Compensation Review Strategy</h2>
            
            {/* Timeline Progress Bar */}
            <div className="relative mb-12">
              <div className="absolute top-12 left-0 right-0 h-1" style={{ backgroundColor: '#D7D2CB' }}>
                <div className="absolute left-0 h-full" style={{ width: '75%', backgroundColor: '#4366D0' }}></div>
              </div>
              
              <div className="flex justify-between relative">
                {compensationPhases.map((phase, index) => (
                  <div key={index} className="flex flex-col items-center" style={{ flex: 1 }}>
                    <div 
                      className="w-24 h-24 rounded-full flex flex-col items-center justify-center text-white font-bold shadow-lg z-10 relative"
                      style={{ 
                        backgroundColor: index < 2 ? '#7FCC93' : index === 2 ? '#F39C12' : '#4366D0',
                        border: '4px solid white'
                      }}
                    >
                      <div className="text-sm">Phase</div>
                      <div className="text-2xl">{phase.phase}</div>
                      {index < 2 && <CheckCircle className="w-4 h-4 mt-1" />}
                    </div>
                    <div className="text-xs font-medium mt-2 text-center" style={{ color: '#5F7FC3' }}>
                      {phase.effectiveDate.split(';')[0]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Phase Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
              {compensationPhases.map((phase, index) => (
                <div 
                  key={index} 
                  className="rounded-xl border-2 px-8 py-7 hover:shadow-lg transition-all"
                  style={{ 
                    borderColor: index < 2 ? '#7FCC93' : index === 2 ? '#F39C12' : '#B5D2F3',
                    backgroundColor: index < 2 ? '#F8FFF9' : index === 2 ? '#FEF5E7' : '#F7FBFF'
                  }}
                >
                  {/* Phase Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: index < 2 ? '#7FCC93' : index === 2 ? '#F39C12' : '#4366D0' }}
                      >
                        {phase.phase}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg" style={{ color: '#00245D' }}>
                          {index < 2 ? 'Completed' : index === 2 ? 'In Progress' : 'Upcoming'}
                        </h3>
                        <p className="text-sm" style={{ color: '#5F7FC3' }}>{phase.timeframe}</p>
                      </div>
                    </div>
                  </div>

                  {/* Phase Details */}
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#5F7FC3' }}>
                        Pay Grades
                      </div>
                      <p className="text-sm" style={{ color: '#00245D' }}>{phase.payGrades}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#5F7FC3' }}>
                          Positions
                        </div>
                        <div className="text-2xl font-bold" style={{ color: index < 2 ? '#7FCC93' : index === 2 ? '#F39C12' : '#4366D0' }}>
                          {phase.positions}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#5F7FC3' }}>
                          Effective Date
                        </div>
                        <p className="text-sm font-medium" style={{ color: '#00245D' }}>
                          {phase.effectiveDate}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#5F7FC3' }}>
                        Impact
                      </div>
                      <p className="text-sm" style={{ color: '#00245D' }}>{phase.impact}</p>
                    </div>

                    {phase.marketAdjustment && (
                      <div className="pt-3 border-t" style={{ borderColor: '#D7D2CB' }}>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" style={{ color: index < 2 ? '#7FCC93' : '#F39C12' }} />
                          <span className="text-sm font-medium" style={{ color: '#00245D' }}>
                            {phase.marketAdjustment}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Statistics */}
            <div className="mt-8 p-6 rounded-xl" style={{ backgroundColor: '#F8F9FA' }}>
              <div className="grid grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold" style={{ color: '#4366D0' }}>1,268</div>
                  <div className="text-sm" style={{ color: '#5F7FC3' }}>Total Positions Reviewed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold" style={{ color: '#7FCC93' }}>1,873</div>
                  <div className="text-sm" style={{ color: '#5F7FC3' }}>Employees Impacted</div>
                </div>
                <div>
                  <div className="text-3xl font-bold" style={{ color: '#F39C12' }}>729</div>
                  <div className="text-sm" style={{ color: '#5F7FC3' }}>Market Adjustments</div>
                </div>
                <div>
                  <div className="text-3xl font-bold" style={{ color: '#00245D' }}>4</div>
                  <div className="text-sm" style={{ color: '#5F7FC3' }}>Implementation Phases</div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Accomplishments */}
          <div className="grid grid-cols-2 gap-6 mb-12">
            {/* Market Evaluations */}
            <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#D7D2CB' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#B5D2F3' }}>
                  <Briefcase className="w-6 h-6" style={{ color: '#4366D0' }} />
                </div>
                <h3 className="text-xl font-bold" style={{ color: '#00245D' }}>Market Evaluations</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#F8F9FA' }}>
                  <div className="flex justify-between items-center">
                    <span style={{ color: '#00245D' }}>Newly Created/Restructured Jobs</span>
                    <span className="font-bold text-lg" style={{ color: '#4366D0' }}>130</span>
                  </div>
                </div>
                <p className="text-sm" style={{ color: '#5F7FC3' }}>
                  Market evaluations completed for additional positions ensuring competitive alignment
                </p>
              </div>
            </div>

            {/* Merit & Compliance */}
            <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#D7D2CB' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#D7D2CB' }}>
                  <DollarSign className="w-6 h-6" style={{ color: '#00245D' }} />
                </div>
                <h3 className="text-xl font-bold" style={{ color: '#00245D' }}>Merit & Compliance</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2">
                  <span style={{ color: '#5F7FC3' }}>Merit Increases Processed</span>
                  <span className="font-bold" style={{ color: '#00245D' }}>1,925</span>
                </div>
                <div className="flex items-center justify-between p-2">
                  <span style={{ color: '#5F7FC3' }}>Lump Sum Payouts</span>
                  <span className="font-bold" style={{ color: '#00245D' }}>8</span>
                </div>
                <div className="flex items-center justify-between p-2">
                  <span style={{ color: '#5F7FC3' }}>State Minimum Wage Adjustments</span>
                  <span className="font-bold" style={{ color: '#00245D' }}>1,805</span>
                </div>
              </div>
            </div>
          </div>

          {/* Job Architecture Achievement */}
          <div className="bg-white rounded-2xl border p-8 mb-12" style={{ borderColor: '#D7D2CB' }}>
            <div className="flex items-center justify-center gap-4 mb-6">
              <Building2 className="w-8 h-8" style={{ color: '#4366D0' }} />
              <h2 className="text-2xl font-bold text-center" style={{ color: '#00245D' }}>Job Architecture Transformation</h2>
            </div>
            <div className="text-center">
              <div className="inline-block">
                <div className="text-5xl font-bold mb-2" style={{ color: '#4366D0' }}>255</div>
                <div className="text-lg font-medium mb-3" style={{ color: '#00245D' }}>Job Descriptions Standardized</div>
                <div className="mt-4 px-8 py-3 rounded-full inline-block max-w-5xl" style={{ backgroundColor: '#B5D2F3' }}>
                  <span className="font-medium" style={{ color: '#00245D' }}>This effort sets a foundation for more seamless updates to job descriptions, which were historically stored in a manually updated environment. This will allow the university to better track the various requirements across roles for compliance management.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="flex justify-between items-center mt-12 p-6 bg-gray-50 rounded-xl">
            <Link to="/dashboards" className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
              <span className="mr-2">←</span> Back to Dashboard Home
            </Link>
            <div className="text-sm text-gray-500">
              Data Source: HR Total Rewards | Fiscal Year 2025
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default TotalRewardsDashboard;