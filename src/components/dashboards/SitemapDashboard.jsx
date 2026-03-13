import React from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  Users,
  TrendingDown,
  TrendingUp,
  UserPlus,
  MessageSquare,
  Target,
  GraduationCap,
  DollarSign,
  Heart,
  FileText,
  LineChart,
  BarChart3,
  BookOpen,
  Shield,
  Database,
  Settings,
  Map
} from 'lucide-react';

/**
 * SitemapDashboard - Complete page directory for HR Reports
 *
 * This page serves as a safety net during navigation restructuring,
 * providing access to ALL pages including hidden and archived ones.
 */
const SitemapDashboard = () => {
  // Main Dashboards
  const mainDashboards = [
    { path: '/dashboards/executive-new', label: 'Executive Dashboard', icon: Home },
    { path: '/dashboards/marketing-slides', label: 'Marketing Slides', icon: FileText },
    { path: '/dashboards/workforce', label: 'Workforce Overview', icon: Users },
    { path: '/dashboards/turnover', label: 'Turnover Overview', icon: TrendingDown },
    { path: '/dashboards/recruiting', label: 'Recruiting Overview', icon: UserPlus }
  ];

  // Annual Reports
  const annualReports = [
    { path: '/dashboards/exit-survey-fy25', label: 'FY25 Exit Survey', icon: MessageSquare },
    { path: '/dashboards/fy26-priorities', label: 'FY26 Priorities', icon: Target },
    { path: '/dashboards/accomplishments', label: 'Accomplishments', icon: FileText, hidden: true },
    { path: '/dashboards/learning-development', label: 'Learning & Development', icon: GraduationCap },
    { path: '/dashboards/total-rewards', label: 'Total Rewards', icon: DollarSign },
    { path: '/dashboards/benefits-wellbeing', label: 'Benefits & Well-being', icon: Heart }
  ];

  // Quarterly Reports - Exit Surveys
  const quarterlyExitSurveys = [
    { path: '/dashboards/exit-survey-overview', label: 'Exit Survey Overview', icon: FileText, hidden: true },
    { path: '/dashboards/exit-survey-q1', label: 'Q1 FY26 Exit Survey', icon: FileText },
    { path: '/dashboards/exit-survey-q2', label: 'Q2 Exit Survey', icon: FileText, hidden: true },
    { path: '/dashboards/exit-survey-q3', label: 'Q3 Exit Survey', icon: FileText, hidden: true },
    { path: '/dashboards/exit-survey-q4', label: 'Q4 Exit Survey', icon: FileText, hidden: true },
    { path: '/dashboards/raw-exit-surveys', label: 'Raw Exit Survey Data', icon: Database }
  ];

  // Quarterly Reports - Turnover
  const quarterlyTurnover = [
    { path: '/dashboards/turnover-q1', label: 'Q1 FY26 Turnover', icon: TrendingDown },
    { path: '/dashboards/turnover-trends', label: 'Turnover Trends', icon: LineChart },
    { path: '/dashboards/quarterly-turnover-rates', label: 'Quarterly Turnover Rates', icon: BarChart3 }
  ];

  // Quarterly Reports - Workforce
  const quarterlyWorkforce = [
    { path: '/dashboards/workforce-q1', label: 'Q1 FY26 Workforce', icon: Users },
    { path: '/dashboards/demographics-q1', label: 'Q1 FY26 Demographics', icon: Users },
    { path: '/dashboards/ethnicity-q1', label: 'Q1 FY26 Ethnicity Distribution', icon: Users },
    { path: '/dashboards/age-gender-q1', label: 'Q1 FY26 Age/Gender Distribution', icon: Users }
  ];

  // Quarterly Reports - Recruiting
  const quarterlyRecruiting = [
    { path: '/dashboards/recruiting-q1', label: 'Q1 FY26 Recruiting (BE)', icon: UserPlus },
    { path: '/dashboards/recruiting-nbe-q1', label: 'Q1 FY26 Recruiting (Temp)', icon: UserPlus }
  ];

  // Quarterly Reports - Promotions
  const quarterlyPromotions = [
    { path: '/dashboards/promotions-q1', label: 'Q1 FY26 Promotions', icon: TrendingUp },
    { path: '/dashboards/promotion-reasons', label: 'Promotion Reasons Guide', icon: BookOpen },
    { path: '/dashboards/job-changes-testing', label: 'Job Changes (All Data)', icon: TrendingUp }
  ];

  // Admin & Tools
  const adminTools = [
    { path: '/admin/data-validation', label: 'Data Validation', icon: Shield },
    { path: '/admin/data-sources', label: 'Data Sources', icon: Database },
    { path: '/admin/report-generator', label: 'Report Generator', icon: FileText },
    { path: '/print', label: 'Print Layout', icon: FileText }
  ];

  // Development / Testing
  const devTesting = [
    { path: '/dashboards/workforce-test', label: 'Workforce Test', icon: Settings, dev: true },
    { path: '/dashboards/turnover-test', label: 'Turnover Test', icon: Settings, dev: true },
    { path: '/dashboards/recruiting-test', label: 'Recruiting Test', icon: Settings, dev: true }
  ];

  // Render a single link item
  const renderLink = (item) => {
    const IconComponent = item.icon;
    return (
      <Link
        key={item.path}
        to={item.path}
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors group"
      >
        <IconComponent size={18} className="text-gray-500 group-hover:text-blue-600" />
        <span className="flex-1">{item.label}</span>
        {item.hidden && (
          <span className="text-amber-500 text-xs font-medium" title="Hidden from navigation">
            Hidden
          </span>
        )}
        {item.dev && (
          <span className="text-purple-500 text-xs font-medium" title="Development/Testing">
            Dev
          </span>
        )}
      </Link>
    );
  };

  // Render a category card
  const renderCategory = (title, items, className = '') => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">{title}</h2>
      </div>
      <div className="p-2 space-y-1">
        {items.map(renderLink)}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Map size={32} className="text-blue-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">HR Reports Sitemap</h1>
        </div>
        <p className="text-gray-600">
          Complete page directory. All {mainDashboards.length + annualReports.length + quarterlyExitSurveys.length + quarterlyTurnover.length + quarterlyWorkforce.length + quarterlyRecruiting.length + quarterlyPromotions.length + adminTools.length + devTesting.length} pages are listed below.
        </p>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Main Dashboards */}
          {renderCategory('Main Dashboards', mainDashboards)}

          {/* Annual Reports */}
          {renderCategory('Annual Reports', annualReports)}

          {/* Admin & Tools */}
          {renderCategory('Admin & Tools', adminTools)}

          {/* Quarterly Exit Surveys */}
          {renderCategory('Exit Surveys (Quarterly)', quarterlyExitSurveys)}

          {/* Quarterly Turnover */}
          {renderCategory('Turnover (Quarterly)', quarterlyTurnover)}

          {/* Quarterly Workforce */}
          {renderCategory('Workforce (Quarterly)', quarterlyWorkforce)}

          {/* Quarterly Recruiting */}
          {renderCategory('Recruiting (Quarterly)', quarterlyRecruiting)}

          {/* Quarterly Promotions */}
          {renderCategory('Promotions (Quarterly)', quarterlyPromotions)}

          {/* Development / Testing */}
          {renderCategory('Development / Testing', devTesting)}
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Legend</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-amber-500 font-medium">Hidden</span>
              <span className="text-gray-600">= Not shown in main navigation</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-500 font-medium">Dev</span>
              <span className="text-gray-600">= Development/Testing page</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SitemapDashboard;
