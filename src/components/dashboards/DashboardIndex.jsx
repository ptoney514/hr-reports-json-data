import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users,
  BookOpen,
  Briefcase,
  Sparkles,
  Trophy,
  Zap,
  CheckCircle2,
  GraduationCap,
  Shield,
  Gift,
  BarChart3,
  Activity,
  FileText,
  Share2,
  Printer,
  Eye
} from 'lucide-react';

const DashboardIndex = () => {
  // Key metrics with more detail
  const keyMetrics = [
    { 
      label: "On-Demand Courses", 
      value: "660", 
      subtitle: "Available across the learning library",
      icon: BookOpen
    },
    { 
      label: "Live Trainings since Nov '22", 
      value: "236", 
      subtitle: "Scaled via myLearning",
      icon: Activity
    },
    { 
      label: "Compliance Journey", 
      value: "90%+", 
      subtitle: "Faculty & staff completion",
      icon: Shield
    },
    { 
      label: "Total Reward Statements", 
      value: "2,066", 
      subtitle: "Delivered with zero data quality issues",
      icon: FileText
    }
  ];

  const compensationMetrics = {
    completed: 90,
    remaining: 10,
    details: [
      { label: "Positions Evaluated", value: "1,268", subtitle: "Faculty & staff employees" },
      { label: "Market Adjustments", value: "729", subtitle: "Faculty & staff" },
      { label: "Staff Positions Reviewed", value: "326", subtitle: "Phases 3 & 4" },
      { label: "Employees Affected", value: "384", subtitle: "Across those positions" }
    ]
  };

  const pillars = [
    {
      title: "Learning & Development",
      icon: GraduationCap,
      color: "blue",
      description: "University Annual Compliance Journey, achieved 90%+ completion rate amongst faculty and staff.",
      highlights: [
        "Scaled myLearning infrastructure to support university-wide development; 660 on-demand courses and 236 live trainings since Nov 2022.",
        "Expanded Monthly Manager Briefings for added guidance to new and current leaders."
      ]
    },
    {
      title: "Total Rewards",
      icon: Gift,
      color: "purple",
      description: "Benefit enhancements including new voluntary offerings, Medicare Advocacy Service, and expanded mental health resources.",
      highlights: [
        "Well-Being programming with the re-introduction of a well-being incentive.",
        "Completed Staff - Phases 3 & 4 of the multi-year compensation review; 326 positions reviewed (384 employees); plus 85 employees across 75 positions received adjustments."
      ]
    },
    {
      title: "Employee Experience",
      icon: Users,
      color: "green",
      description: "Rebranded the Companions in Mission Recognition Program and celebrated Service Awards.",
      highlights: [
        "Belong Events fostering community and inclusion.",
        "Launched a new 90-day onboarding survey to capture new-hire feedback and improve the first-year experience."
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
            backgroundImage: 'url("/images/hero-bg.jpg")',
            filter: 'brightness(0.4) contrast(1.1)'
          }}
        ></div>
        
        {/* Dark Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-900/70 to-gray-900/80"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm mb-6">
              <span className="text-xs font-semibold text-white">FY2025 Wins</span>
            </div>
            
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              Advancing Our Mission with<br />
              Meaningful HR Impact
            </h1>
            
            <p className="text-lg text-gray-300 leading-relaxed">
              During Fiscal Year 2025, the Office of Human Resources achieved significant milestones, 
              supporting the advancement of Creighton's mission for alignment and enhancement of key 
              support structures and workforce skill development.
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
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