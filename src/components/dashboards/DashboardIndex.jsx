import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  TrendingDown, 
  FileBarChart, 
  ArrowRight, 
  BarChart3,
  PieChart,
  Activity,
  Building2,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Database,
  Zap,
  Shield,
  RefreshCw
} from 'lucide-react';

const DashboardIndex = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Simulate data refresh every 5 minutes
  useEffect(() => {
    const refreshTimer = setInterval(() => {
      setLastRefresh(new Date());
    }, 300000); // 5 minutes

    return () => clearInterval(refreshTimer);
  }, []);

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const dashboards = [
    {
      id: 'turnover',
      title: 'Turnover Analysis',
      description: 'Departure trends, retention metrics, and cost impact analysis',
      path: '/dashboards/turnover',
      icon: TrendingDown,
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      borderColor: 'border-orange-200',
      bgColor: 'bg-orange-50',
      lastUpdated: new Date(Date.now() - 1000 * 60 * 8), // 8 minutes ago
      status: 'healthy',
      stats: [
        { label: 'Turnover Rate', value: '12.5%', trend: 'down', change: '-1.2%' },
        { label: 'Cost Impact', value: '$6.8M', trend: 'down', change: '-$0.4M' },
        { label: 'vs Industry', value: '-12%', trend: 'up', change: 'Better' }
      ]
    },
    {
      id: 'i9-compliance',
      title: 'I-9 Compliance',
      description: 'Immigration compliance tracking and audit readiness metrics',
      path: '/dashboards/i9',
      icon: FileBarChart,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      borderColor: 'border-green-200',
      bgColor: 'bg-green-50',
      lastUpdated: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      status: 'warning',
      stats: [
        { label: 'Compliance Rate', value: '90%', trend: 'up', change: '+3%' },
        { label: 'Forms Processed', value: '619', trend: 'up', change: '+32' },
        { label: 'Audit Ready', value: '88%', trend: 'up', change: '+5%' }
      ]
    }
  ];

  const systemMetrics = [
    {
      icon: Building2,
      label: 'Active Dashboards',
      value: '2',
      description: 'Analytics dashboards',
      status: 'healthy',
      color: 'blue'
    },
    {
      icon: Database,
      label: 'Data Sources',
      value: '5',
      description: 'Integrated HR systems',
      status: 'healthy',
      color: 'green'
    },
    {
      icon: Activity,
      label: 'Uptime',
      value: '99.9%',
      description: 'System availability',
      status: 'healthy',
      color: 'green'
    },
    {
      icon: PieChart,
      label: 'Reports Generated',
      value: '127',
      description: 'This month',
      status: 'healthy',
      color: 'blue'
    }
  ];

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

  const getStatusColor = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      orange: 'bg-orange-100 text-orange-600',
      red: 'bg-red-100 text-red-600'
    };
    return colors[color] || colors.blue;
  };

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
                Comprehensive workforce analytics and reporting platform
              </p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2 text-sm text-blue-100">
                  <Clock size={16} />
                  <span>Last updated: {getTimeAgo(lastRefresh)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-100">
                  <CheckCircle size={16} />
                  <span>All systems operational</span>
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
        {/* System Status Overview */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">System Overview</h2>
            <button className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {systemMetrics.map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${getStatusColor(metric.color)}`}>
                      <IconComponent size={20} />
                    </div>
                    {getStatusIcon(metric.status)}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {metric.value}
                  </div>
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    {metric.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {metric.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enhanced Dashboard Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Dashboards</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {dashboards.map((dashboard) => {
              const IconComponent = dashboard.icon;
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
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Workforce Dashboard Enhanced
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Added 5-quarter trend analysis and campus distribution charts
                  </p>
                  <p className="text-xs text-blue-600 mt-1">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Turnover Analysis Updated
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    New benchmark comparisons and cost impact metrics
                  </p>
                  <p className="text-xs text-orange-600 mt-1">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    I-9 Compliance Tracking
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Real-time compliance monitoring and audit preparation
                  </p>
                  <p className="text-xs text-green-600 mt-1">6 hours ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Data Sources */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-2 mb-4">
              <Database className="text-green-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">
                Data Sources
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Workday HCM</span>
                </div>
                <span className="text-xs text-green-600">Active</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">BambooHR</span>
                </div>
                <span className="text-xs text-green-600">Active</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">I-9 Management</span>
                </div>
                <span className="text-xs text-green-600">Active</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium">Payroll System</span>
                </div>
                <span className="text-xs text-yellow-600">Syncing</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Active Directory</span>
                </div>
                <span className="text-xs text-green-600">Active</span>
              </div>
            </div>
          </div>

          {/* Support & Resources */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="text-blue-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">
                Support & Resources
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileBarChart className="text-blue-600" size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Documentation
                  </p>
                  <p className="text-xs text-gray-500">
                    User guides and tutorials
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Zap className="text-green-600" size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    API Status
                  </p>
                  <p className="text-xs text-gray-500">
                    All services operational
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Users className="text-orange-600" size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Support Team
                  </p>
                  <p className="text-xs text-gray-500">
                    hr-analytics@creighton.edu
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="text-purple-600" size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Refresh Schedule
                  </p>
                  <p className="text-xs text-gray-500">
                    Daily at 6:00 AM
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