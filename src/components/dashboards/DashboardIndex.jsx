import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  TrendingDown, 
  FileBarChart, 
  ArrowRight, 
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  UserCheck,
  MessageSquare,
  Settings,
  BookOpen,
  FileText,
  HelpCircle,
  Database,
  BarChart3
} from 'lucide-react';
// Removed useHomePageMetrics - using static data

const DashboardIndex = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  // Static home page data
  const loading = false;
  const error = null;
  const organizationalInsights = {
    totalEmployees: 2847,
    turnoverRate: 8.1,
    openPositions: 127,
    exitSurveyResponses: 52
  };
  const dashboardPreviews = [];
  const recentUpdates = [];
  const getTimeAgo = (date) => "Just now";
  const lastUpdated = new Date();

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Icon mapping for dashboard previews
  const iconComponents = {
    Users,
    TrendingDown,
    UserCheck,
    MessageSquare,
    Settings
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500" size={16} />;
      case 'error':
        return <AlertTriangle className="text-red-500" size={16} />;
      default:
        return <CheckCircle className="text-green-500" size={16} />;
    }
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? (
      <TrendingUp className="text-green-500" size={14} />
    ) : (
      <TrendingDown className="text-red-500" size={14} />
    );
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2">Failed to load dashboard data</p>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Enhanced Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                HR Analytics Dashboard
              </h1>
              <p className="text-blue-100 text-lg">
                JSON-based workforce analytics and organizational insights
              </p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2 text-sm text-blue-100">
                  <Clock size={16} />
                  <span>Last updated: {lastUpdated ? getTimeAgo(lastUpdated) : 'Loading...'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-100">
                  <Database size={16} />
                  <span>JSON data architecture</span>
                </div>
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
        {/* Organizational Insights */}
        {organizationalInsights && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Organizational Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    <Users size={20} />
                  </div>
                  <CheckCircle className="text-green-500" size={16} />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {organizationalInsights.totalEmployees?.toLocaleString()}
                </div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Total Employees
                </div>
                <div className="text-xs text-gray-500">
                  Active workforce
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-green-100 text-green-600">
                    <TrendingUp size={20} />
                  </div>
                  <CheckCircle className="text-green-500" size={16} />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {organizationalInsights.quarterlyGrowth >= 0 ? '+' : ''}{organizationalInsights.quarterlyGrowth}
                </div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Quarterly Growth
                </div>
                <div className="text-xs text-gray-500">
                  Net headcount change
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                    <TrendingDown size={20} />
                  </div>
                  <CheckCircle className="text-green-500" size={16} />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {organizationalInsights.turnoverRate}%
                </div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Turnover Rate
                </div>
                <div className="text-xs text-gray-500">
                  Annual turnover
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                    <BarChart3 size={20} />
                  </div>
                  <CheckCircle className="text-green-500" size={16} />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {organizationalInsights.vacancyRate}%
                </div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Vacancy Rate
                </div>
                <div className="text-xs text-gray-500">
                  Open positions
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Dashboard Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Dashboards</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {dashboardPreviews.map((dashboard) => {
              const IconComponent = iconComponents[dashboard.icon] || Users;
              return (
                <div key={dashboard.id} className={`bg-white rounded-xl shadow-sm border-2 ${dashboard.borderColor} hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1`}>
                  <div className="p-6">
                    {/* Enhanced Header */}
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
                      {getStatusIcon(dashboard.status)}
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {dashboard.description}
                    </p>

                    {/* Enhanced Stats with Trends */}
                    <div className="space-y-3 mb-6">
                      {dashboard.stats.map((stat, index) => (
                        <div key={index} className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                          <span className="text-sm text-gray-600">{stat.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">{stat.value}</span>
                            <div className="flex items-center gap-1">
                              {getTrendIcon(stat.trend)}
                              <span className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                {stat.change}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Data Freshness */}
                    <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
                      <Clock size={12} />
                      <span>Updated {getTimeAgo(dashboard.lastUpdated)}</span>
                    </div>

                    {/* Action Button */}
                    <Link
                      to={dashboard.path}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 ${dashboard.color} ${dashboard.hoverColor} text-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md`}
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

        {/* Enhanced Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Updates */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="text-blue-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Updates
              </h3>
            </div>
            <div className="space-y-4">
              {recentUpdates.map((update, index) => {
                // Define color classes to ensure they're not purged by Tailwind
                const colorClasses = {
                  blue: {
                    bg: 'bg-blue-50',
                    dot: 'bg-blue-500',
                    text: 'text-blue-600'
                  },
                  orange: {
                    bg: 'bg-orange-50',
                    dot: 'bg-orange-500',
                    text: 'text-orange-600'
                  },
                  purple: {
                    bg: 'bg-purple-50',
                    dot: 'bg-purple-500',
                    text: 'text-purple-600'
                  },
                  green: {
                    bg: 'bg-green-50',
                    dot: 'bg-green-500',
                    text: 'text-green-600'
                  }
                };
                const colors = colorClasses[update.color] || colorClasses.blue;
                
                return (
                  <div key={index} className={`flex items-start gap-3 p-3 rounded-lg ${colors.bg}`}>
                    <div className={`w-2 h-2 ${colors.dot} rounded-full mt-2`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {update.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {update.description}
                      </p>
                      <p className={`text-xs ${colors.text} mt-1`}>{update.timestamp}</p>
                    </div>
                  </div>
                );
              })}
              {recentUpdates.length === 0 && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Data Loading...
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Recent dashboard updates will appear here
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Data Architecture */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-2 mb-4">
              <Database className="text-green-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">
                Data Architecture
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Workforce Data</span>
                </div>
                <span className="text-xs text-green-600">5 quarters</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Turnover Data</span>
                </div>
                <span className="text-xs text-green-600">5 quarters</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Recruiting Data</span>
                </div>
                <span className="text-xs text-green-600">5 quarters</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Exit Survey Data</span>
                </div>
                <span className="text-xs text-green-600">5 quarters</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700 font-medium">JSON-based file system</p>
              <p className="text-xs text-blue-600 mt-1">Quarterly snapshots from 2024-Q2 to 2025-Q2</p>
            </div>
          </div>

          {/* Documentation Hub */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="text-blue-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">
                Documentation & Help
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileBarChart className="text-blue-600" size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    User Guides
                  </p>
                  <p className="text-xs text-gray-500">
                    Dashboard navigation and features
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="text-green-600" size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Metric Definitions
                  </p>
                  <p className="text-xs text-gray-500">
                    Understanding HR metrics
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <HelpCircle className="text-purple-600" size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    FAQ & Tutorials
                  </p>
                  <p className="text-xs text-gray-500">
                    Common questions answered
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Database className="text-orange-600" size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Data Dictionary
                  </p>
                  <p className="text-xs text-gray-500">
                    Field descriptions and sources
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardIndex; 