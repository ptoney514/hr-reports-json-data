import React from 'react';
import { Link } from 'react-router-dom';
import ErrorBoundary from '../ui/ErrorBoundary';
import { 
  BookOpen,
  CheckCircle,
  Briefcase,
  ClipboardCheck,
  Mail,
  UserPlus,
  Settings,
  Shield,
  Heart,
  Building2,
  Trophy,
  Activity,
  FileText,
  Award,
  Sparkles
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LearningDevelopmentDashboard = () => {
  // Manager Newsletter Open Rates - ACTUAL DATA
  const newsletterOpenRates = [
    { month: 'Apr 2024', rate: 50.4 },
    { month: 'Aug 2024', rate: 58.8 },
    { month: 'Oct 2024', rate: 55.5 },
    { month: 'Jan 2025', rate: 58.1 },
    { month: 'May 2025', rate: 53.7 },
    { month: 'Aug 2025', rate: 65.6 }
  ];

  // Manager Briefing Topics (no attendee numbers as they weren't provided)
  const managerBriefingTopics = [
    'Compensation',
    'Accommodation',
    'Title IX',
    'Managing to the Mission',
    'Employee Leaves',
    'Addressing Performance Concerns',
    'Payroll',
    'Annual Performance Reviews',
    'Navigating the Journey from Peer to Leader',
    'Employees on Visa Status'
  ];

  // Compliance Training Modules (as provided, without completion percentages)
  const complianceModules = [
    'Title IX',
    'FERPA',
    'Child Abuse Prevention',
    'Cybersecurity',
    'University Policies Attestation',
    'Media Release Authorization',
    'Drug Free Schools and Communities',
    'Additional Attestations'
  ];

  // Process Improvements (actual items mentioned)
  const processImprovements = [
    { category: 'ADA Processes', description: 'Updated accommodation workflows' },
    { category: 'Lactation Resources', description: 'Enhanced campus support' },
    { category: 'Performance Management', description: 'Updated conduct pages and progressive discipline forms' },
    { category: 'Manager Check-In Guide', description: 'Refreshed conversation framework' },
    { category: 'Exit Survey', description: 'Enhanced questions for quarterly trend analysis' },
    { category: 'Onboarding/Offboarding', description: 'Improved checklists and processes' },
    { category: 'Internal Transfer', description: 'New checklist for internal mobility' },
    { category: 'Survey Framework', description: 'Created onboarding, new hire orientation, and 90-day surveys' }
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-white border-b-2" style={{ borderBottomColor: '#4366D0' }}>
          <div className="p-8">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-4xl font-bold text-center mb-2" style={{ color: '#00245D' }}>FY2025 Achievements Unlocked</h1>
              <p className="text-center text-lg" style={{ color: '#4366D0' }}>Celebrating milestones that advance our mission</p>
            </div>
          </div>
        </div>

        <div className="p-8 max-w-7xl mx-auto">
          {/* Transforming How We Learn Section - New Design */}
          <div className="bg-white rounded-2xl border p-8 mb-12" style={{ borderColor: '#D7D2CB' }}>
            <h2 className="text-3xl font-bold text-center mb-8" style={{ color: '#00245D' }}>Transforming How We Learn, Grow, and Succeed</h2>
            
            <div className="grid grid-cols-2 gap-8">
              {/* Learning Revolution */}
              <div className="border-l-4 pl-6 bg-white rounded-r-lg p-4" style={{ borderLeftColor: '#4366D0' }}>
                <div className="flex items-center gap-3 mb-3">
                  <BookOpen className="w-6 h-6" style={{ color: '#4366D0' }} />
                  <h3 className="text-xl font-bold" style={{ color: '#00245D' }}>Learning Revolution</h3>
                </div>
                <p className="mb-3" style={{ color: '#00245D' }}>
                  We've created a comprehensive learning ecosystem with{' '}
                  <span className="font-bold" style={{ color: '#4366D0' }}>660 on-demand courses</span> available across our learning library,
                  making knowledge accessible anytime, anywhere.
                </p>
                <p className="text-sm italic" style={{ color: '#5F7FC3' }}>
                  "From compliance to capability building, learning has never been more accessible."
                </p>
              </div>

              {/* Interactive Engagement */}
              <div className="border-l-4 pl-6 bg-white rounded-r-lg p-4" style={{ borderLeftColor: '#7FCC93' }}>
                <div className="flex items-center gap-3 mb-3">
                  <Activity className="w-6 h-6" style={{ color: '#7FCC93' }} />
                  <h3 className="text-xl font-bold" style={{ color: '#00245D' }}>Interactive Engagement</h3>
                </div>
                <p className="mb-3" style={{ color: '#00245D' }}>
                  Since November 2022, we've scaled myLearning to deliver{' '}
                  <span className="font-bold" style={{ color: '#7FCC93' }}>236 live trainings</span>, creating dynamic learning experiences
                  that bring our community together.
                </p>
                <p className="text-sm italic" style={{ color: '#5F7FC3' }}>
                  "Real-time learning that builds connections and capabilities."
                </p>
              </div>

              {/* Compliance Excellence */}
              <div className="border-l-4 pl-6 bg-white rounded-r-lg p-4" style={{ borderLeftColor: '#FFC72C' }}>
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-6 h-6" style={{ color: '#FFC72C' }} />
                  <h3 className="text-xl font-bold" style={{ color: '#00245D' }}>Compliance Excellence</h3>
                </div>
                <p className="mb-3" style={{ color: '#00245D' }}>
                  3,314 learners were assigned the Annual Compliance Journey, which covered{' '}
                  8 essential modules. The university achieved a{' '}
                  <span className="font-bold" style={{ color: '#FFC72C' }}>90%+ completion rate</span>.
                </p>
                <p className="text-sm italic" style={{ color: '#5F7FC3' }}>
                  "Setting the standard for university-wide compliance participation."
                </p>
              </div>

              {/* Quality & Transparency */}
              <div className="border-l-4 pl-6 bg-white rounded-r-lg p-4" style={{ borderLeftColor: '#5F7FC3' }}>
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-6 h-6" style={{ color: '#5F7FC3' }} />
                  <h3 className="text-xl font-bold" style={{ color: '#00245D' }}>Quality & Transparency</h3>
                </div>
                <p className="mb-3" style={{ color: '#00245D' }}>
                  We achieved{' '}
                  <span className="font-bold" style={{ color: '#5F7FC3' }}>65.6% manager newsletter engagement</span>, our highest rate to date,
                  reflecting our commitment to keeping leaders informed and engaged.
                </p>
                <p className="text-sm italic" style={{ color: '#5F7FC3' }}>
                  "Perfect execution in employee communication and data integrity."
                </p>
              </div>
            </div>

            <div className="mt-8 text-center flex items-center justify-center gap-2" style={{ color: '#00245D' }}>
              <Sparkles className="w-5 h-5" style={{ color: '#FFC72C' }} />
              <span>These achievements reflect our commitment to continuous improvement</span>
            </div>
          </div>

          {/* Achievement Badges Section - Visual Style from Image 1 */}
          <div className="grid grid-cols-2 gap-6 mb-12">
            {/* Learning Ecosystem Badge */}
            <div className="rounded-2xl p-6 border bg-white" style={{ borderColor: '#4366D0' }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#4366D0' }}>
                    <BookOpen className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: '#00245D' }}>Learning Ecosystem</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Trophy className="w-4 h-4" style={{ color: '#4366D0' }} />
                      <span className="text-sm font-medium" style={{ color: '#4366D0' }}>Excellence Badge Earned</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="font-medium" style={{ color: '#00245D' }}>On-Demand Courses Available</span>
                    <span className="text-2xl font-bold" style={{ color: '#00245D' }}>660</span>
                  </div>
                  <div className="w-full rounded-full h-3 overflow-hidden" style={{ backgroundColor: '#D7D2CB' }}>
                    <div className="h-full rounded-full" style={{ width: '100%', backgroundColor: '#4366D0' }}></div>
                  </div>
                  <p className="text-xs mt-1" style={{ color: '#5F7FC3' }}>Complete learning library transformation</p>
                </div>

                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="font-medium" style={{ color: '#00245D' }}>Live Trainings Delivered</span>
                    <span className="text-2xl font-bold" style={{ color: '#00245D' }}>236</span>
                  </div>
                  <div className="w-full rounded-full h-3 overflow-hidden" style={{ backgroundColor: '#D7D2CB' }}>
                    <div className="h-full rounded-full" style={{ width: '75%', backgroundColor: '#4366D0' }}></div>
                  </div>
                  <p className="text-xs mt-1" style={{ color: '#5F7FC3' }}>Since Nov '22 via myLearning platform</p>
                </div>
              </div>
            </div>

            {/* Compliance & Quality Badge */}
            <div className="rounded-2xl p-6 border bg-white" style={{ borderColor: '#7FCC93' }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#7FCC93' }}>
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: '#00245D' }}>Compliance & Quality</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Trophy className="w-4 h-4" style={{ color: '#7FCC93' }} />
                      <span className="text-sm font-medium" style={{ color: '#7FCC93' }}>Superior Performance</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="font-medium" style={{ color: '#00245D' }}>Compliance Journey Completion</span>
                    <span className="text-2xl font-bold" style={{ color: '#00245D' }}>8 Modules</span>
                  </div>
                  <div className="w-full rounded-full h-3 overflow-hidden" style={{ backgroundColor: '#D7D2CB' }}>
                    <div className="h-full rounded-full" style={{ width: '100%', backgroundColor: '#7FCC93' }}></div>
                  </div>
                  <p className="text-xs mt-1" style={{ color: '#5F7FC3' }}>Faculty & staff university-wide participation</p>
                </div>

                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="font-medium" style={{ color: '#00245D' }}>Manager Newsletter Open Rate</span>
                    <span className="text-2xl font-bold" style={{ color: '#00245D' }}>65.6%</span>
                  </div>
                  <div className="w-full rounded-full h-3 overflow-hidden" style={{ backgroundColor: '#D7D2CB' }}>
                    <div className="h-full rounded-full" style={{ width: '65.6%', backgroundColor: '#7FCC93' }}></div>
                  </div>
                  <p className="text-xs mt-1" style={{ color: '#5F7FC3' }}>Highest engagement rate achieved in August 2025</p>
                </div>
              </div>
            </div>
          </div>

          {/* Impact Journey Timeline - Visual Style from Image 2 */}
          <div className="bg-white rounded-2xl border p-8 mb-12" style={{ borderColor: '#D7D2CB' }}>
            <h2 className="text-3xl font-bold text-center mb-8" style={{ color: '#00245D' }}>Our FY2025 Impact Journey</h2>
            
            <div className="relative">
              {/* Vertical Timeline Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 rounded-full" style={{ backgroundColor: '#4366D0' }}></div>
              
              <div className="space-y-12">
                {/* Learning Library Expansion */}
                <div className="relative flex items-center">
                  <div className="flex-1 text-right pr-8">
                    <div className="rounded-xl p-4 inline-block" style={{ backgroundColor: '#B5D2F3' }}>
                      <h3 className="text-lg font-bold" style={{ color: '#00245D' }}>Learning Library Expansion</h3>
                      <p className="text-sm mt-1" style={{ color: '#5F7FC3' }}>Building a comprehensive knowledge base</p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center z-10" style={{ backgroundColor: '#4366D0' }}>
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 pl-8">
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-bold" style={{ color: '#4366D0' }}>660</span>
                      <span style={{ color: '#00245D' }}>On-demand courses available across the learning library</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Learning */}
                <div className="relative flex items-center">
                  <div className="flex-1 text-right pr-8">
                    <div className="flex items-baseline gap-3 justify-end">
                      <span style={{ color: '#00245D' }}>Live trainings scaled via myLearning since Nov '22</span>
                      <span className="text-4xl font-bold" style={{ color: '#7FCC93' }}>236</span>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center z-10" style={{ backgroundColor: '#7FCC93' }}>
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 pl-8">
                    <div className="rounded-xl p-4 inline-block bg-white border" style={{ borderColor: '#D7D2CB' }}>
                      <h3 className="text-lg font-bold" style={{ color: '#00245D' }}>Interactive Learning</h3>
                      <p className="text-sm mt-1" style={{ color: '#5F7FC3' }}>Real-time engagement and skill building</p>
                    </div>
                  </div>
                </div>

                {/* Compliance Excellence */}
                <div className="relative flex items-center">
                  <div className="flex-1 text-right pr-8">
                    <div className="rounded-xl p-4 inline-block bg-white border" style={{ borderColor: '#D7D2CB' }}>
                      <h3 className="text-lg font-bold" style={{ color: '#00245D' }}>Compliance Excellence</h3>
                      <p className="text-sm mt-1" style={{ color: '#5F7FC3' }}>University-wide commitment to standards</p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center z-10" style={{ backgroundColor: '#FFC72C' }}>
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 pl-8">
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-bold" style={{ color: '#FFC72C' }}>8 Modules</span>
                      <span style={{ color: '#00245D' }}>Comprehensive Compliance Journey launched</span>
                    </div>
                  </div>
                </div>

                {/* Manager Engagement */}
                <div className="relative flex items-center">
                  <div className="flex-1 text-right pr-8">
                    <div className="flex items-baseline gap-3 justify-end">
                      <span style={{ color: '#00245D' }}>Peak newsletter engagement rate achieved</span>
                      <span className="text-4xl font-bold" style={{ color: '#5F7FC3' }}>65.6%</span>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center z-10" style={{ backgroundColor: '#5F7FC3' }}>
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 pl-8">
                    <div className="rounded-xl p-4 inline-block bg-white border" style={{ borderColor: '#D7D2CB' }}>
                      <h3 className="text-lg font-bold" style={{ color: '#00245D' }}>Transparent Communication</h3>
                      <p className="text-sm mt-1" style={{ color: '#5F7FC3' }}>Quarterly newsletters keeping managers informed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Manager Newsletter Performance Chart */}
          <div className="bg-white rounded-2xl border p-8 mb-12" style={{ borderColor: '#D7D2CB' }}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#00245D' }}>Manager Newsletter Engagement Trend</h2>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={newsletterOpenRates} margin={{ top: 40, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D7D2CB" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#5F7FC3' }} />
                <YAxis tick={{ fontSize: 12, fill: '#5F7FC3' }} domain={[40, 70]} />
                <Tooltip 
                  formatter={(value) => `${value}%`}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '2px solid #4366D0',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 10px 25px -5px rgba(67, 102, 208, 0.25)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#4366D0" 
                  strokeWidth={4} 
                  dot={{ r: 7, fill: '#4366D0', strokeWidth: 2, stroke: '#ffffff' }}
                  name="Open Rate"
                  activeDot={{ r: 9, fill: '#4366D0', stroke: '#ffffff', strokeWidth: 3 }}
                  label={{
                    position: 'top',
                    offset: 15,
                    style: { fontSize: 16, fontWeight: 'bold', fill: '#00245D' },
                    formatter: (value) => `${value}%`
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="text-center mt-4 rounded-lg p-3" style={{ backgroundColor: '#B5D2F3' }}>
              <span className="text-sm" style={{ color: '#5F7FC3' }}>Latest Achievement: </span>
              <span className="text-xl font-bold" style={{ color: '#4366D0' }}>65.6% Open Rate</span>
              <span className="text-sm" style={{ color: '#5F7FC3' }}> in August 2025 - Our highest engagement to date!</span>
            </div>
          </div>

          {/* Key Initiatives Grid */}
          <div className="grid grid-cols-2 gap-6 mb-12">
            {/* Manager Support */}
            <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#D7D2CB' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#B5D2F3' }}>
                  <Briefcase className="w-6 h-6" style={{ color: '#4366D0' }} />
                </div>
                <h3 className="text-xl font-bold" style={{ color: '#00245D' }}>Manager Development</h3>
              </div>
              <div className="space-y-3">
                <div className="rounded-lg p-3" style={{ backgroundColor: '#D7D2CB' }}>
                  <div className="font-medium mb-2" style={{ color: '#00245D' }}>Monthly Manager Briefings</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {managerBriefingTopics.slice(0, 6).map((topic, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#4366D0' }}></div>
                        <span className="truncate" style={{ color: '#00245D' }}>{topic}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs mt-2" style={{ color: '#4366D0' }}>+4 more topics covered</div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: '#B5D2F3' }}>
                  <Mail className="w-5 h-5" style={{ color: '#4366D0' }} />
                  <div>
                    <div className="font-medium" style={{ color: '#00245D' }}>Quarterly Newsletter</div>
                    <div className="text-sm" style={{ color: '#5F7FC3' }}>Keeping leaders informed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Process Improvements */}
            <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#D7D2CB' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(127, 204, 147, 0.2)' }}>
                  <Settings className="w-6 h-6" style={{ color: '#7FCC93' }} />
                </div>
                <h3 className="text-xl font-bold" style={{ color: '#00245D' }}>Process Enhancements</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {processImprovements.slice(0, 6).map((item, index) => (
                  <div key={index} className="rounded-lg p-2" style={{ backgroundColor: '#D7D2CB' }}>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#7FCC93' }} />
                      <div>
                        <div className="text-sm font-medium" style={{ color: '#00245D' }}>{item.category}</div>
                        <div className="text-xs" style={{ color: '#5F7FC3' }}>{item.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center text-xs mt-3" style={{ color: '#7FCC93' }}>+2 additional improvements implemented</div>
            </div>
          </div>

          {/* New Initiatives Section */}
          <div className="rounded-2xl p-8 mb-12" style={{ backgroundColor: '#D7D2CB' }}>
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#00245D' }}>FY2025 New Initiatives</h2>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 border" style={{ borderColor: '#D7D2CB' }}>
                <UserPlus className="w-10 h-10 mb-3" style={{ color: '#4366D0' }} />
                <h3 className="font-bold mb-2" style={{ color: '#00245D' }}>90-Day Survey</h3>
                <p className="text-sm" style={{ color: '#5F7FC3' }}>Launched April 2025 to gauge new hire experience</p>
              </div>
              <div className="bg-white rounded-xl p-6 border" style={{ borderColor: '#D7D2CB' }}>
                <Heart className="w-10 h-10 mb-3" style={{ color: '#7FCC93' }} />
                <h3 className="font-bold mb-2" style={{ color: '#00245D' }}>Community & Belonging</h3>
                <p className="text-sm" style={{ color: '#5F7FC3' }}>"The Gifts You Bring" added to orientation</p>
              </div>
              <div className="bg-white rounded-xl p-6 border" style={{ borderColor: '#D7D2CB' }}>
                <Building2 className="w-10 h-10 mb-3" style={{ color: '#FFC72C' }} />
                <h3 className="font-bold mb-2" style={{ color: '#00245D' }}>System Alignment</h3>
                <p className="text-sm" style={{ color: '#5F7FC3' }}>Bridge rebranded to myLearning</p>
              </div>
            </div>
          </div>

          {/* Compliance Training Modules */}
          <div className="bg-white rounded-2xl border p-8 mb-12" style={{ borderColor: '#D7D2CB' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#00245D' }}>Compliance Training Journey</h2>
              <span className="px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: 'rgba(127, 204, 147, 0.2)', color: '#00245D' }}>
                Launched January 2025
              </span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {complianceModules.map((module, index) => (
                <div key={index} className="rounded-lg p-4 border-2 transition-all duration-300 bg-white" style={{ 
                  borderColor: '#4366D0'
                }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#7FCC93' }}>
                      <ClipboardCheck className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium" style={{ color: '#00245D' }}>{module}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center p-4 rounded-lg bg-white" style={{}}>
              <Award className="w-8 h-8 mx-auto mb-2" style={{ color: '#7FCC93' }} />
              <p className="text-sm" style={{ color: '#00245D' }}>Ensuring compliance with federal and state regulations through comprehensive training</p>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="flex justify-between items-center mt-12 p-6 rounded-xl" style={{ backgroundColor: '#D7D2CB' }}>
            <Link to="/dashboards" className="font-medium flex items-center transition-colors duration-200" style={{ color: '#4366D0' }}>
              <span className="mr-2">←</span> Back to Dashboard Home
            </Link>
            <div className="text-sm" style={{ color: '#5F7FC3' }}>
              Data Source: HR Learning & Development | Fiscal Year 2025
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default LearningDevelopmentDashboard;