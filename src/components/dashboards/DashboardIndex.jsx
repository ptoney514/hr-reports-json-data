import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  TrendingDown, 
  UserCheck,
  ClipboardList,
  Building,
  ArrowRight,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Calendar,
  Target,
  Activity
} from 'lucide-react';
import { WORKFORCE_DATA, TURNOVER_DATA, RECRUITING_DATA, EXIT_SURVEY_DATA } from '../../data/staticData';

const DashboardIndex = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Get latest data from each dataset
  const latestWorkforce = WORKFORCE_DATA["2025-06-30"];
  const latestTurnover = TURNOVER_DATA["2025-06-30"];
  const latestRecruiting = RECRUITING_DATA["2025-06-30"];
  
  // Calculate FY25 exit survey metrics
  const fy25Quarters = ["2024-09-30", "2024-12-31", "2025-03-31", "2025-06-30"];
  let totalFY25Responses = 0;
  let totalFY25Exits = 0;
  let totalSatisfactionSum = 0;
  let totalWouldRecommend = 0;
  
  fy25Quarters.forEach(quarter => {
    if (EXIT_SURVEY_DATA[quarter]) {
      totalFY25Responses += EXIT_SURVEY_DATA[quarter].totalResponses;
      totalFY25Exits += EXIT_SURVEY_DATA[quarter].totalExits;
      totalSatisfactionSum += EXIT_SURVEY_DATA[quarter].overallSatisfaction * EXIT_SURVEY_DATA[quarter].totalResponses;
      totalWouldRecommend += EXIT_SURVEY_DATA[quarter].wouldRecommendCount.positive;
    }
  });
  
  const fy25ResponseRate = totalFY25Exits > 0 ? ((totalFY25Responses / totalFY25Exits) * 100).toFixed(1) : 0;
  const fy25AvgSatisfaction = totalFY25Responses > 0 ? (totalSatisfactionSum / totalFY25Responses).toFixed(1) : 0;
  const fy25WouldRecommend = totalFY25Responses > 0 ? ((totalWouldRecommend / totalFY25Responses) * 100).toFixed(1) : 0;

  const dashboardCards = [
    {
      id: 'workforce',
      title: 'Workforce Dashboard',
      description: 'Real-time headcount and demographic insights',
      path: '/dashboards/workforce',
      icon: Users,
      color: 'bg-blue-600',
      borderColor: 'border-blue-200',
      stats: [
        { label: 'Total Employees', value: latestWorkforce?.totalEmployees?.toLocaleString() || '5,037' },
        { label: 'Faculty', value: latestWorkforce?.faculty || '689' },
        { label: 'Staff', value: latestWorkforce?.staff?.toLocaleString() || '1,448' },
        { label: 'Omaha / Phoenix', value: '4,287 / 750' }
      ]
    },
    {
      id: 'turnover',
      title: 'Turnover Dashboard',
      description: 'Employee retention and departure analytics',
      path: '/dashboards/turnover',
      icon: TrendingDown,
      color: 'bg-orange-600',
      borderColor: 'border-orange-200',
      stats: [
        { label: 'Annual Rate', value: `${latestTurnover?.totalTurnoverRate || 8.1}%` },
        { label: 'Voluntary', value: `${latestTurnover?.voluntaryTurnover || 5.8}%` },
        { label: 'Involuntary', value: `${latestTurnover?.involuntaryTurnover || 2.1}%` },
        { label: 'Q4 FY25 Exits', value: '51' }
      ]
    },
    {
      id: 'recruiting',
      title: 'Recruiting Dashboard',
      description: 'Hiring metrics and talent acquisition',
      path: '/dashboards/recruiting',
      icon: UserCheck,
      color: 'bg-green-600',
      borderColor: 'border-green-200',
      stats: [
        { label: 'Open Positions', value: latestRecruiting?.openPositions || '140+' },
        { label: 'Time to Fill', value: `${latestRecruiting?.timeToFill || 42} days` },
        { label: 'Offer Acceptance', value: `${latestRecruiting?.offerAcceptanceRate || 79.2}%` },
        { label: 'Internal Applications', value: '18' }
      ]
    },
    {
      id: 'exit-survey',
      title: 'Exit Survey Analysis',
      description: 'FY25 employee feedback and insights',
      path: '/dashboards/exit-survey-fy25',
      icon: ClipboardList,
      color: 'bg-purple-600',
      borderColor: 'border-purple-200',
      stats: [
        { label: 'FY25 Response Rate', value: `${fy25ResponseRate}%` },
        { label: 'Overall Satisfaction', value: `${fy25AvgSatisfaction}/5.0` },
        { label: 'Would Recommend', value: `${fy25WouldRecommend}%` },
        { label: 'Total Responses', value: totalFY25Responses }
      ]
    },
    {
      id: 'headcount',
      title: 'Headcount Details',
      description: 'Department and school distribution',
      path: '/dashboards/headcount-details',
      icon: Building,
      color: 'bg-indigo-600',
      borderColor: 'border-indigo-200',
      stats: [
        { label: 'Largest School', value: 'Medicine (817)' },
        { label: 'Largest Dept', value: 'Phoenix Alliance (345)' },
        { label: 'Total Departments', value: '100+' },
        { label: 'Schools/Colleges', value: '12' }
      ]
    }
  ];

  const keyMetrics = [
    {
      title: 'Total Workforce',
      value: latestWorkforce?.totalEmployees?.toLocaleString() || '5,037',
      change: '+263',
      trend: 'up',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Turnover Rate',
      value: `${latestTurnover?.totalTurnoverRate || 8.1}%`,
      change: '-0.2%',
      trend: 'down',
      icon: TrendingDown,
      color: 'green'
    },
    {
      title: 'Exit Survey Response',
      value: `${fy25ResponseRate}%`,
      change: '+5.1%',
      trend: 'up',
      icon: ClipboardList,
      color: 'purple'
    },
    {
      title: 'Open Positions',
      value: latestRecruiting?.openPositions || '140+',
      change: '+55',
      trend: 'up',
      icon: Target,
      color: 'orange'
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                HR Analytics Dashboard
              </h1>
              <p className="text-blue-100 text-lg">
                Comprehensive workforce analytics and organizational insights
              </p>
              <div className="flex items-center gap-2 mt-3 text-sm text-blue-100">
                <Clock size={16} />
                <span>Real-time data from all HR systems</span>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-sm text-blue-100 mb-1">
                  Creighton University
                </p>
                <p className="text-lg font-semibold">
                  {currentTime.toLocaleDateString()}
                </p>
                <p className="text-sm text-blue-100">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Key Metrics Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Metrics Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {keyMetrics.map((metric, index) => {
              const IconComponent = metric.icon;
              const colorClasses = {
                blue: { bg: 'bg-blue-100', icon: 'text-blue-600', trend: 'text-green-600' },
                green: { bg: 'bg-green-100', icon: 'text-green-600', trend: 'text-green-600' },
                purple: { bg: 'bg-purple-100', icon: 'text-purple-600', trend: 'text-green-600' },
                orange: { bg: 'bg-orange-100', icon: 'text-orange-600', trend: 'text-orange-600' }
              };
              const colors = colorClasses[metric.color];
              
              return (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${colors.bg} ${colors.icon}`}>
                      <IconComponent size={20} />
                    </div>
                    {metric.trend === 'up' ? (
                      <TrendingUp className={colors.trend} size={16} />
                    ) : (
                      <TrendingDown className="text-green-600" size={16} />
                    )}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {metric.value}
                  </div>
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    {metric.title}
                  </div>
                  <div className={`text-xs ${colors.trend}`}>
                    {metric.change} from last quarter
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Dashboard Overview</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {dashboardCards.map((dashboard) => {
              const IconComponent = dashboard.icon;
              return (
                <div key={dashboard.id} className={`bg-white rounded-xl shadow-sm border-2 ${dashboard.borderColor} hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1`}>
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 ${dashboard.color} rounded-lg shadow-sm`}>
                          <IconComponent className="text-white" size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {dashboard.title}
                          </h3>
                        </div>
                      </div>
                      <CheckCircle className="text-green-500" size={16} />
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 mb-4 text-sm">
                      {dashboard.description}
                    </p>

                    {/* Stats */}
                    <div className="space-y-2 mb-4">
                      {dashboard.stats.map((stat, index) => (
                        <div key={index} className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                          <span className="text-sm text-gray-600">{stat.label}</span>
                          <span className="text-sm font-semibold text-gray-900">{stat.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <Link
                      to={dashboard.path}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 ${dashboard.color} hover:opacity-90 text-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md`}
                    >
                      View Dashboard
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="text-blue-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Activity
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Q4 FY25 Exit Survey Complete
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    51 exits processed, 18 responses collected
                  </p>
                  <p className="text-xs text-blue-600 mt-1">June 30, 2025</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    FY25 Workforce Report
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Total headcount increased to 5,037
                  </p>
                  <p className="text-xs text-green-600 mt-1">June 30, 2025</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Recruiting Update
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    140+ open positions across all departments
                  </p>
                  <p className="text-xs text-orange-600 mt-1">Ongoing</p>
                </div>
              </div>
            </div>
          </div>

          {/* Data Coverage */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="text-green-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">
                Data Coverage
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Workforce Data</span>
                </div>
                <span className="text-xs text-green-600">FY24-FY25</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Turnover Data</span>
                </div>
                <span className="text-xs text-green-600">Q1-Q4 FY25</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Exit Surveys</span>
                </div>
                <span className="text-xs text-green-600">Q1-Q4 FY25</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Recruiting Data</span>
                </div>
                <span className="text-xs text-green-600">FY24-FY25</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700 font-medium">Latest Update</p>
              <p className="text-xs text-blue-600 mt-1">All dashboards current through June 30, 2025</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="text-purple-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">
                Quick Access
              </h3>
            </div>
            <div className="space-y-3">
              <Link to="/dashboards/exit-survey-fy25" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ClipboardList className="text-purple-600" size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    FY25 Exit Survey Report
                  </p>
                  <p className="text-xs text-gray-500">
                    Complete year analysis
                  </p>
                </div>
              </Link>
              <Link to="/dashboards/headcount-report" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="text-blue-600" size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Headcount Report
                  </p>
                  <p className="text-xs text-gray-500">
                    Detailed breakdown
                  </p>
                </div>
              </Link>
              <Link to="/dashboards/accomplishments" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Target className="text-green-600" size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    FY25 Accomplishments
                  </p>
                  <p className="text-xs text-gray-500">
                    Year in review
                  </p>
                </div>
              </Link>
              <Link to="/admin/data-sources" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Activity className="text-orange-600" size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Data Source Admin
                  </p>
                  <p className="text-xs text-gray-500">
                    Manage data updates
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardIndex;