import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase,
  Share2,
  Printer,
  Sparkles,
  Wrench,
  GraduationCap,
  Gift,
  CheckCircle2,
  ArrowRight,
  Target,
  Zap,
  Users
} from 'lucide-react';

const FY26Priorities = () => {
  const priorities = [
    {
      title: "Oracle Optimization",
      icon: Wrench,
      color: "blue",
      description: "Part of our ongoing effort to better support faculty and staff with modern tools that simplify processes and improve access to important information. Success outcomes to include:",
      initiatives: [
        "A streamlined and upgraded myHR site for a modern, integrated solution from hiring to retiring.",
        "Improving reporting and workforce planning; Expanding self service capabilities; Supporting University data governance strategy"
      ]
    },
    {
      title: "Upskilling Offerings",
      icon: GraduationCap,
      color: "green",
      description: "Remain invested and continue to build capacity in our employee development.",
      initiatives: [
        "Ongoing amplification of myLearning (Bridge) for scalable, notable offerings to support relevant learning and development across the university.",
        "Monthly Manager Briefing series with ongoing access to more training and guidance available on a variety of topics as an added layer of knowledge and resources to further support their role as leaders"
      ]
    },
    {
      title: "Total Rewards",
      icon: Gift,
      color: "purple",
      description: "Continue to leverage the results of the total rewards survey, prioritizing rewards that are highly valued and provide opportunity.",
      initiatives: [
        "Roll out a vacation donation program which aligns closely with Creighton's mission and core values.",
        "Closely evaluate offerings to address the diverse needs of our workforce to help serve the needs of faculty, staff and house staff physicians."
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
              <span className="text-sm text-gray-500">Fiscal Year 2026 Strategic Priorities</span>
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
      <div className="relative overflow-hidden" style={{ backgroundColor: '#102E6A' }}>
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, white 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, white 0%, transparent 50%),
                              radial-gradient(circle at 40% 40%, white 0%, transparent 50%)`,
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm mb-6">
              <Target className="h-4 w-4 text-white mr-2" />
              <span className="text-xs font-semibold text-white">FY2026 Priorities</span>
            </div>
            
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight max-w-3xl">
              Forward Looking Priorities<br />
              Shaping Tomorrow's Workplace
            </h1>
            
            <p className="text-lg text-gray-200 leading-relaxed max-w-5xl">
              Looking ahead to Fiscal Year 2026, the Office of Human Resources will continue advancing 
              strategic initiatives that strengthen our support structures and enhance workforce capabilities. 
              These priorities reflect our ongoing commitment to operational excellence and our dedication 
              to exemplifying Creighton's Core Jesuit Values in all that we do.
            </p>
            
            <div className="mt-8 flex items-center space-x-4">
              <div className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
                <Zap className="h-5 w-5 text-yellow-300 mr-2" />
                <span className="text-sm font-medium text-white">Innovation-Driven</span>
              </div>
              <div className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
                <Users className="h-5 w-5 text-green-300 mr-2" />
                <span className="text-sm font-medium text-white">People-First</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Priorities Section - Matching Home Page Style */}
      <div id="priorities" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Forward Looking Priorities</h2>
            <p className="text-lg text-gray-600 mb-8">
              Strategic initiatives that will transform how we support, develop, and reward our faculty and staff in FY2026.
            </p>
          </div>
            
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {priorities.map((priority, index) => {
                const Icon = priority.icon;
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
                          <div className={`p-4 bg-gradient-to-br ${colors[priority.color]} rounded-xl`}>
                            <Icon className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{priority.title}</h3>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                          {priority.description}
                        </p>
                        
                        <div className="space-y-3">
                          {priority.initiatives.map((initiative, iIndex) => (
                            <div key={iIndex} className="flex items-start">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-xs text-gray-600 leading-relaxed">{initiative}</span>
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
          
          {/* Call to Action */}
          <div className="mt-16 bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Shape the Future Together
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              These initiatives represent our commitment to continuous improvement and excellence. 
              Together, we'll build a workplace that empowers every member of our community to thrive.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Link 
                to="/dashboards"
                className="inline-flex items-center px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                View Current Dashboards
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
              <Link 
                to="/dashboards/workforce"
                className="inline-flex items-center px-6 py-3 bg-transparent text-white font-semibold rounded-lg hover:bg-white/10 transition-colors border border-white/30"
              >
                Explore Metrics
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Looking Ahead Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Sparkles className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Building on Success, Looking to the Future
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              These forward-looking priorities build upon our FY2025 achievements and position 
              Creighton for continued excellence in supporting our faculty, staff, and the broader 
              university mission.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white py-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>© FY2026 Office of Human Resources - Strategic Planning</div>
            <div className="flex items-center space-x-6">
              <Link to="/dashboards" className="hover:text-gray-900 transition-colors">Dashboard Home</Link>
              <Link to="/dashboards" className="hover:text-gray-900 transition-colors">Contact HR</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FY26Priorities;