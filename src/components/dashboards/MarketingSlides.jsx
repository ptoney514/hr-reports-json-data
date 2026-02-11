import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  Briefcase,
  Sparkles,
  Trophy,
  CheckCircle2,
  GraduationCap,
  Shield,
  Gift,
  BarChart3,
  Activity,
  FileText,
  Share2,
  Printer
} from 'lucide-react';

const DashboardIndex = () => {
  const pillars = [
    {
      title: "Total Rewards",
      icon: Gift,
      color: "purple",
      description: "Implemented compensation adjustments and benefit enhancements including new voluntary offerings, expanded mental health and well-being resources, and a new Medicare Advocacy Service.",
      highlights: [
        "Delivered 2,066 Total Reward Statements to benefit eligible faculty and staff reflecting the university's commitment and strategies to attract and retain employees.",
        "Successful outcomes of the multi-year Total Rewards compensation review: 1268 total positions representing 1873 faculty and staff have been evaluated; 729 faculty and staff have or will receive market adjustments resulting from the review.",
        "Processed 1933 merit increases to help recognize the important contributions and work being done by our colleagues."
      ]
    },
    {
      title: "Employee Experience",
      icon: Users,
      color: "green",
      description: "Continued improved turnover and achievement of positive results with recruiting efforts as we provided upward mobility opportunities and a shared sense of community.",
      highlights: [
        "Heightened engagement and collaboration with campus partners to boost sense of community through Well-Being programming efforts that bring together collective efforts of Mission & Ministry, Belonging & Inclusion, Rec & Wellness, Creighton Engage, Creighton Therapy & Wellness, the Lifestyle Medicine Clinic and Sustainability supporting dozens of wellness events and activities for Creighton faculty & staff.",
        "Rebranded the Companions in Mission Recognition Program and celebrated Service Awards.",
        "Launched a new 90-day onboarding survey to capture new-hire feedback and improve the first-year experience."
      ]
    },
    {
      title: "Learning & Development",
      icon: GraduationCap,
      color: "blue",
      description: "Launched the University-wide Annual Compliance Journey, achieving a 90%+ completion rate amongst faculty and staff.",
      highlights: [
        "Scaled myLearning infrastructure to support university-wide development; 660 on-demand courses and 236 live trainings since Nov 2022.",
        "Boosting real-time engagement and skill building across the university; added in discounts to lifelong learning opportunities for employees.",
        "Expanded Monthly Manager Briefings for added guidance to new and current leaders."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-gray-700" />
                <span className="text-sm font-medium text-gray-900">Office of Human Resources</span>
              </div>
              <span className="text-sm text-gray-500">Fiscal Year 2025 Highlights</span>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                <Share2 className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                <Printer className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gray-900 overflow-hidden">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/images/hero-bg.webp")',
            filter: 'brightness(0.4) contrast(1.1)'
          }}
        ></div>
        
        {/* Dark Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-900/70 to-gray-900/80"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm mb-6">
              <span className="text-xs font-semibold text-white">FY2025 Wins</span>
            </div>
            
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight max-w-3xl">
              Advancing Our Mission with<br />
              Meaningful HR Impact
            </h1>
            
            <p className="text-lg text-gray-300 leading-relaxed max-w-5xl">
              During Fiscal Year 2025, the Office of Human Resources achieved significant milestones, 
              supporting Creighton's advancement of alignment and enhancement of key 
              support structures and workforce skill development. We are fueled by the university's 
              mission and are committed to exemplifying Creighton's Core Jesuit Values in all that we do.
            </p>
          </div>
        </div>
      </div>

      {/* DESIGN ALTERNATIVE 1: NARRATIVE STORY BLOCKS */}
      <div className="mb-12">
        <h3 className="text-center text-xl font-bold text-gray-700 mb-6 bg-blue-100 p-3 rounded-lg">Option 1: Narrative Story Blocks</h3>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Our Learning & Development Story</h2>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              This year, we transformed how our community learns and grows. Through our comprehensive learning ecosystem, we've made 
              <span className="inline-flex items-center mx-2 px-3 py-1 bg-blue-50 rounded-full">
                <BookOpen className="h-4 w-4 text-blue-600 mr-1" />
                <span className="font-bold text-blue-900">660 on-demand courses</span>
              </span>
              available across our learning library, ensuring everyone has access to knowledge when they need it.
            </p>
            
            <p className="text-gray-700 leading-relaxed mb-6">
              Since November 2022, we've scaled our myLearning infrastructure to deliver 
              <span className="inline-flex items-center mx-2 px-3 py-1 bg-green-50 rounded-full">
                <Activity className="h-4 w-4 text-green-600 mr-1" />
                <span className="font-bold text-green-900">236 live trainings</span>
              </span>
              creating dynamic, interactive learning experiences that bring our community together.
            </p>
            
            <p className="text-gray-700 leading-relaxed mb-6">
              Our University Annual Compliance Journey achieved remarkable success with 
              <span className="inline-flex items-center mx-2 px-3 py-1 bg-amber-50 rounded-full">
                <Shield className="h-4 w-4 text-amber-600 mr-1" />
                <span className="font-bold text-amber-900">90%+ completion</span>
              </span>
              among faculty and staff, demonstrating our collective commitment to excellence and regulatory compliance.
            </p>
            
            <p className="text-gray-700 leading-relaxed">
              Meanwhile, our Total Reward Statements reached 
              <span className="inline-flex items-center mx-2 px-3 py-1 bg-purple-50 rounded-full">
                <FileText className="h-4 w-4 text-purple-600 mr-1" />
                <span className="font-bold text-purple-900">2,066 deliveries</span>
              </span>
              with zero data quality issues, reflecting our dedication to accuracy and transparency in employee communications.
            </p>
          </div>
        </div>
      </div>
      </div>

      {/* DESIGN ALTERNATIVE 2: TIMELINE JOURNEY */}
      <div className="mb-12">
        <h3 className="text-center text-xl font-bold text-gray-700 mb-6 bg-green-100 p-3 rounded-lg">Option 2: Timeline Journey</h3>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Our FY2025 Impact Journey</h2>
          
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-200 via-green-200 via-amber-200 to-purple-200"></div>
            
            <div className="space-y-12">
              <div className="relative flex items-center">
                <div className="flex-1 text-right pr-8">
                  <div className="bg-blue-50 rounded-lg p-4 inline-block">
                    <h3 className="font-bold text-blue-900 text-lg">Learning Library Expansion</h3>
                    <p className="text-blue-700 text-sm mt-1">Building a comprehensive knowledge base</p>
                  </div>
                </div>
                <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1 pl-8">
                  <div className="bg-white border-l-4 border-blue-500 pl-4">
                    <span className="text-3xl font-bold text-blue-900">660</span>
                    <p className="text-gray-600 text-sm">On-demand courses available across the learning library</p>
                  </div>
                </div>
              </div>

              <div className="relative flex items-center">
                <div className="flex-1 text-right pr-8">
                  <div className="bg-white border-r-4 border-green-500 pr-4 text-right">
                    <span className="text-3xl font-bold text-green-900">236</span>
                    <p className="text-gray-600 text-sm">Live trainings scaled via myLearning since Nov '22</p>
                  </div>
                </div>
                <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-green-500 rounded-full">
                  <Activity className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1 pl-8">
                  <div className="bg-green-50 rounded-lg p-4 inline-block">
                    <h3 className="font-bold text-green-900 text-lg">Interactive Learning</h3>
                    <p className="text-green-700 text-sm mt-1">Real-time engagement and skill building</p>
                  </div>
                </div>
              </div>

              <div className="relative flex items-center">
                <div className="flex-1 text-right pr-8">
                  <div className="bg-amber-50 rounded-lg p-4 inline-block">
                    <h3 className="font-bold text-amber-900 text-lg">Compliance Excellence</h3>
                    <p className="text-amber-700 text-sm mt-1">University-wide commitment to standards</p>
                  </div>
                </div>
                <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-amber-500 rounded-full">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1 pl-8">
                  <div className="bg-white border-l-4 border-amber-500 pl-4">
                    <span className="text-3xl font-bold text-amber-900">90%+</span>
                    <p className="text-gray-600 text-sm">Faculty & staff completion in Compliance Journey</p>
                  </div>
                </div>
              </div>

              <div className="relative flex items-center">
                <div className="flex-1 text-right pr-8">
                  <div className="bg-white border-r-4 border-purple-500 pr-4 text-right">
                    <span className="text-3xl font-bold text-purple-900">2,066</span>
                    <p className="text-gray-600 text-sm">Total Reward Statements with zero data quality issues</p>
                  </div>
                </div>
                <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-purple-500 rounded-full">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1 pl-8">
                  <div className="bg-purple-50 rounded-lg p-4 inline-block">
                    <h3 className="font-bold text-purple-900 text-lg">Transparent Communication</h3>
                    <p className="text-purple-700 text-sm mt-1">Accurate, comprehensive employee information</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* DESIGN ALTERNATIVE 3: ACHIEVEMENT BADGES WITH PROGRESS BARS */}
      <div className="mb-12">
        <h3 className="text-center text-xl font-bold text-gray-700 mb-6 bg-amber-100 p-3 rounded-lg">Option 3: Achievement Badges with Progress Bars</h3>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">FY2025 Achievements Unlocked</h2>
          <p className="text-lg text-gray-600">Celebrating milestones that advance our mission</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-blue-500 rounded-full mr-4">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-900">Learning Ecosystem</h3>
                <div className="flex items-center mt-1">
                  <Trophy className="h-4 w-4 text-blue-600 mr-1" />
                  <span className="text-sm text-blue-700 font-medium">Excellence Badge Earned</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-blue-900 font-medium">On-Demand Courses Available</span>
                  <span className="text-blue-900 font-bold">660</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full" style={{width: '100%'}}></div>
                </div>
                <p className="text-xs text-blue-700 mt-1">Complete learning library transformation</p>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-blue-900 font-medium">Live Trainings Delivered</span>
                  <span className="text-blue-900 font-bold">236</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full" style={{width: '85%'}}></div>
                </div>
                <p className="text-xs text-blue-700 mt-1">Since Nov '22 via myLearning platform</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-green-500 rounded-full mr-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-900">Compliance & Quality</h3>
                <div className="flex items-center mt-1">
                  <Trophy className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-700 font-medium">Superior Performance</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-green-900 font-medium">Compliance Journey Completion</span>
                  <span className="text-green-900 font-bold">90%+</span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full" style={{width: '95%'}}></div>
                </div>
                <p className="text-xs text-green-700 mt-1">Faculty & staff university-wide participation</p>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-green-900 font-medium">Total Reward Statements</span>
                  <span className="text-green-900 font-bold">2,066</span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full" style={{width: '100%'}}></div>
                </div>
                <p className="text-xs text-green-700 mt-1">Delivered with zero data quality issues</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* DESIGN ALTERNATIVE 4: INTEGRATED NARRATIVE FLOW */}
      <div className="mb-12">
        <h3 className="text-center text-xl font-bold text-gray-700 mb-6 bg-purple-100 p-3 rounded-lg">Option 4: Integrated Narrative Flow</h3>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Transforming How We Learn, Grow, and Succeed</h2>
            
            <div className="prose prose-lg max-w-none">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="relative">
                  <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-blue-500 to-transparent"></div>
                  <div className="pl-6">
                    <div className="flex items-center mb-3">
                      <BookOpen className="h-6 w-6 text-blue-600 mr-2" />
                      <span className="font-semibold text-gray-900">Learning Revolution</span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed mb-3">
                      We've created a comprehensive learning ecosystem with <strong className="text-blue-900">660 on-demand courses</strong> 
                      available across our learning library, making knowledge accessible anytime, anywhere.
                    </p>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-blue-800 italic">
                        "From compliance to capability building, learning has never been more accessible."
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-green-500 to-transparent"></div>
                  <div className="pl-6">
                    <div className="flex items-center mb-3">
                      <Activity className="h-6 w-6 text-green-600 mr-2" />
                      <span className="font-semibold text-gray-900">Interactive Engagement</span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed mb-3">
                      Since November 2022, we've scaled myLearning to deliver <strong className="text-green-900">236 live trainings</strong>, 
                      creating dynamic learning experiences that bring our community together.
                    </p>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs text-green-800 italic">
                        "Real-time learning that builds connections and capabilities."
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="relative">
                  <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-amber-500 to-transparent"></div>
                  <div className="pl-6">
                    <div className="flex items-center mb-3">
                      <Shield className="h-6 w-6 text-amber-600 mr-2" />
                      <span className="font-semibold text-gray-900">Compliance Excellence</span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed mb-3">
                      Our University Annual Compliance Journey achieved <strong className="text-amber-900">90%+ completion</strong> 
                      among faculty and staff, demonstrating collective commitment to excellence.
                    </p>
                    <div className="bg-amber-50 rounded-lg p-3">
                      <p className="text-xs text-amber-800 italic">
                        "Setting the standard for university-wide compliance participation."
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-purple-500 to-transparent"></div>
                  <div className="pl-6">
                    <div className="flex items-center mb-3">
                      <FileText className="h-6 w-6 text-purple-600 mr-2" />
                      <span className="font-semibold text-gray-900">Quality & Transparency</span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed mb-3">
                      We delivered <strong className="text-purple-900">2,066 Total Reward Statements</strong> with zero data quality issues, 
                      reflecting our commitment to accuracy and transparency.
                    </p>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-xs text-purple-800 italic">
                        "Perfect execution in employee communication and data integrity."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <div className="inline-flex items-center px-6 py-3 bg-gray-50 rounded-full">
                <Sparkles className="h-5 w-5 text-gray-600 mr-2" />
                <span className="text-sm font-medium text-gray-800">These achievements reflect our commitment to continuous improvement</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      
      {/* ORIGINAL DESIGN - CURRENTLY COMMENTED OUT */}
      {/* 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {keyMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <Icon className="h-5 w-5 text-gray-700" />
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-2">{metric.label}</div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</div>
                <div className="text-xs text-gray-500">{metric.subtitle}</div>
              </div>
            );
          })}
        </div>
      </div>
      */}



      {/* Highlights by Strategic Pillar */}
      <div id="highlights" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Highlights by Strategic Pillar</h2>
            <p className="text-lg text-gray-600 mb-8">
              A snapshot of the work that elevated learning, total rewards, and the employee experience.
            </p>
          </div>
            
          <div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {pillars.map((pillar, index) => {
                  const Icon = pillar.icon;
                  const colors = {
                    'blue': 'from-blue-500 to-indigo-600',
                    'purple': 'from-purple-500 to-pink-600',
                    'green': 'from-emerald-500 to-teal-600'
                  };
                  return (
                    <div key={index} className="group">
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                        {/* Icon-based header */}
                        <div className="p-6 border-b border-gray-100">
                          <div className="flex items-center space-x-4">
                            <div className={`p-4 bg-gradient-to-br ${colors[pillar.color]} rounded-xl`}>
                              <Icon className="h-8 w-8 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">{pillar.title}</h3>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-6">
                          <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                            {pillar.description}
                          </p>
                          
                          <div className="space-y-3">
                            {pillar.highlights.map((highlight, hIndex) => (
                              <div key={hIndex} className="flex items-start">
                                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-xs text-gray-600 leading-relaxed">{highlight}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
          </div>
        </div>
      </div>

      {/* People-Centered Progress */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">People-Centered Progress</h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                From compliance and capability building to meaningful rewards and recognition, the outcomes this 
                year reflect a commitment to clarity, care, and continuous improvement. These accomplishments 
                align with the University's Lighting The Way Strategic Plan and strengthen the systems that help our 
                people thrive.
              </p>
              
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-2">HR Partnerships Team</div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Building capacity across colleges and divisions
                    </p>
                    <p className="text-xs text-gray-500 mt-3 italic">
                      "We set a clear path and delivered—with measurable impact in learning, wellness, 
                      compensation, and belonging."
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              {/* Visual element - could be an image */}
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl h-96 flex items-center justify-center">
                <div className="text-center">
                  <Trophy className="h-20 w-20 text-indigo-600 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-800">Excellence in HR Innovation</p>
                  <p className="text-sm text-gray-600 mt-2">FY2025 Achievements</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thank You Section */}
      <div className="bg-white py-16 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Thank you to our faculty, staff, and partners
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Together, we're building a better employee experience and stronger outcomes for our community.
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <Link 
              to="/dashboards/exit-survey-fy25"
              className="inline-flex items-center px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
            >
              <BarChart3 className="h-5 w-5 mr-2" />
              Review Filters
            </Link>
            <Link 
              to="/dashboards/workforce"
              className="inline-flex items-center px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors border border-gray-300"
            >
              See Metrics
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 py-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>© FY2025 Office of Human Resources</div>
            <div className="flex items-center space-x-6">
              <Link to="/dashboards" className="hover:text-gray-900 transition-colors">Accessibility</Link>
              <Link to="/dashboards" className="hover:text-gray-900 transition-colors">Privacy</Link>
              <Link to="/dashboards" className="hover:text-gray-900 transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardIndex;