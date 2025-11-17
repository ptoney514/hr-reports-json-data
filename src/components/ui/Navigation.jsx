import React, { useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Users,
  TrendingDown,
  Home,
  Menu,
  X,
  UserPlus,
  MessageSquare,
  Database,
  Shield,
  Target,
  GraduationCap,
  DollarSign,
  Heart,
  ChevronDown,
  ChevronRight,
  FileText
} from 'lucide-react';
import { announceToScreenReader } from '../../utils/accessibilityUtils';
import SyncStatusIndicator from './SyncStatusIndicator';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuarterlyReportsExpanded, setIsQuarterlyReportsExpanded] = useState(false);
  const location = useLocation();

  // Check if current path is active
  const isActive = (path) => location.pathname === path;

  // Check if any quarterly report is active
  const isQuarterlyReportActive = location.pathname.includes('/dashboards/exit-survey-q') ||
                                  location.pathname.includes('/dashboards/exit-survey-overview');

  const navigationItems = [
    {
      id: 'home',
      label: 'Home',
      shortLabel: 'Home',
      path: '/dashboards',
      icon: Home,
      isActive: isActive('/dashboards')
    },
    {
      id: 'workforce',
      label: 'Workforce Dashboard',
      shortLabel: 'Work',
      path: '/dashboards/workforce',
      icon: Users,
      isActive: isActive('/dashboards/workforce')
    },
    {
      id: 'turnover',
      label: 'Turnover Dashboard',
      shortLabel: 'Turn',
      path: '/dashboards/turnover',
      icon: TrendingDown,
      isActive: isActive('/dashboards/turnover')
    },
    {
      id: 'recruiting',
      label: 'Recruiting Dashboard',
      shortLabel: 'Recruit',
      path: '/dashboards/recruiting',
      icon: UserPlus,
      isActive: isActive('/dashboards/recruiting')
    },
    {
      id: 'exit-survey-fy25',
      label: 'FY25 Exit Survey Analysis',
      shortLabel: 'Exit Survey',
      path: '/dashboards/exit-survey-fy25',
      icon: MessageSquare,
      isActive: isActive('/dashboards/exit-survey-fy25')
    },
    {
      id: 'fy26-priorities',
      label: 'FY26 Priorities',
      shortLabel: 'FY26',
      path: '/dashboards/fy26-priorities',
      icon: Target,
      isActive: isActive('/dashboards/fy26-priorities')
    },
    {
      id: 'learning-development',
      label: 'Learning & Development',
      shortLabel: 'L&D',
      path: '/dashboards/learning-development',
      icon: GraduationCap,
      isActive: isActive('/dashboards/learning-development')
    },
    {
      id: 'total-rewards',
      label: 'Total Rewards',
      shortLabel: 'Rewards',
      path: '/dashboards/total-rewards',
      icon: DollarSign,
      isActive: isActive('/dashboards/total-rewards')
    },
    {
      id: 'benefits-wellbeing',
      label: 'Benefits & Well-being',
      shortLabel: 'Benefits',
      path: '/dashboards/benefits-wellbeing',
      icon: Heart,
      isActive: isActive('/dashboards/benefits-wellbeing')
    },
    {
      id: 'data-validation',
      label: 'Data Validation',
      shortLabel: 'Valid',
      path: '/admin/data-validation',
      icon: Shield,
      isActive: isActive('/admin/data-validation')
    },
    {
      id: 'data-sources',
      label: 'Data Sources',
      shortLabel: 'Data',
      path: '/admin/data-sources',
      icon: Database,
      isActive: isActive('/admin/data-sources')
    }
  ];

  // Quarterly Reports submenu items
  const quarterlyReportItems = [
    {
      id: 'exit-survey-overview',
      label: 'FY25 Overview',
      path: '/dashboards/exit-survey-overview',
      isActive: isActive('/dashboards/exit-survey-overview')
    },
    {
      id: 'exit-survey-q1',
      label: 'Q1 FY25',
      path: '/dashboards/exit-survey-q1',
      isActive: isActive('/dashboards/exit-survey-q1')
    },
    {
      id: 'exit-survey-q2',
      label: 'Q2 FY25',
      path: '/dashboards/exit-survey-q2',
      isActive: isActive('/dashboards/exit-survey-q2')
    },
    {
      id: 'exit-survey-q3',
      label: 'Q3 FY25',
      path: '/dashboards/exit-survey-q3',
      isActive: isActive('/dashboards/exit-survey-q3')
    },
    {
      id: 'exit-survey-q4',
      label: 'Q4 FY25',
      path: '/dashboards/exit-survey-q4',
      isActive: isActive('/dashboards/exit-survey-q4')
    }
  ];


  const toggleMobileMenu = useCallback(() => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    
    if (newState) {
      announceToScreenReader('Mobile menu opened');
    } else {
      announceToScreenReader('Mobile menu closed');
    }
  }, [isMobileMenuOpen]);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
    announceToScreenReader('Mobile menu closed');
  }, []);

  const toggleQuarterlyReports = useCallback(() => {
    const newState = !isQuarterlyReportsExpanded;
    setIsQuarterlyReportsExpanded(newState);
    announceToScreenReader(newState ? 'Quarterly Reports expanded' : 'Quarterly Reports collapsed');
  }, [isQuarterlyReportsExpanded]);



  return (
    <>
      {/* Desktop Sidebar - Compact Icon Navigation */}
      <nav className="hidden md:flex md:flex-col md:w-20 bg-white border-r border-gray-200 h-full no-print navigation sidebar">
        <div className="flex flex-col h-full">
          {/* Logo/Brand - Compact */}
          <div className="flex items-center justify-center p-4 border-b border-gray-200">
            <Link 
              to="/dashboards" 
              className="flex flex-col items-center gap-1 text-blue-700 hover:text-blue-800 transition-colors"
              aria-label="HR Reports Home"
            >
              <BarChart3 size={24} />
              <span className="text-xs font-bold">HR</span>
            </Link>
          </div>

          {/* Navigation Items - Icon with abbreviated labels */}
          <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => announceToScreenReader(`Navigating to ${item.label}`)}
                  aria-label={item.label}
                  className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none ${
                    item.isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <IconComponent size={20} />
                  <span className="text-xs text-center leading-tight break-words max-w-full">
                    {item.shortLabel}
                  </span>
                </Link>
              );
            })}

            {/* Quarterly Reports - Desktop Dropdown/Link */}
            <div className="pt-2 border-t border-gray-200">
              <Link
                to="/dashboards/exit-survey-overview"
                onClick={() => announceToScreenReader('Navigating to Quarterly Reports')}
                aria-label="Quarterly Reports"
                title="Quarterly Reports"
                className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none ${
                  isQuarterlyReportActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <FileText size={20} />
                <span className="text-xs text-center leading-tight break-words max-w-full">
                  Q Rpts
                </span>
              </Link>
            </div>
          </div>
          
          {/* Sync Status Indicator - Bottom of sidebar */}
          <div className="p-2 border-t border-gray-200">
            <SyncStatusIndicator className="text-xs" />
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Header */}
      <div className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-50 no-print navigation">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Logo/Brand */}
          <Link 
            to="/dashboards" 
            className="flex items-center gap-2 text-blue-700 hover:text-blue-800 transition-colors"
          >
            <BarChart3 size={24} />
            <span className="text-xl font-bold">HR Reports</span>
          </Link>
          
          {/* Sync Status - Mobile */}
          <SyncStatusIndicator className="hidden sm:flex text-xs" />

          {/* Mobile menu button */}
          <div>
            <button
              onClick={toggleMobileMenu}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Sidebar */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden"
            onClick={closeMobileMenu}
          />
          
          {/* Mobile Sidebar */}
          <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 md:hidden no-print navigation sidebar">
            <div className="flex flex-col h-full">
              {/* Mobile Navigation Items */}
              <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;

                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={closeMobileMenu}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                        item.isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <IconComponent size={20} />
                      {item.label}
                    </Link>
                  );
                })}

                {/* Quarterly Reports Section */}
                <div className="pt-2 border-t border-gray-200">
                  <button
                    onClick={toggleQuarterlyReports}
                    aria-expanded={isQuarterlyReportsExpanded}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isQuarterlyReportActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText size={20} />
                      <span>Quarterly Reports</span>
                    </div>
                    {isQuarterlyReportsExpanded ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>

                  {/* Quarterly Report Subitems */}
                  {isQuarterlyReportsExpanded && (
                    <div className="mt-1 ml-4 space-y-1">
                      {quarterlyReportItems.map((report) => (
                        <Link
                          key={report.id}
                          to={report.path}
                          onClick={closeMobileMenu}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                            report.isActive
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                          {report.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navigation; 