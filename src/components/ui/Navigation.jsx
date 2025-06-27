import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  TrendingDown, 
  FileBarChart, 
  ChevronDown, 
  Home,
  Menu,
  X
} from 'lucide-react';

const Navigation = () => {
  const [isHRAnalyticsOpen, setIsHRAnalyticsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Check if current path is active
  const isActive = (path) => location.pathname === path;
  const isHRAnalyticsActive = () => location.pathname.startsWith('/dashboards');

  const navigationItems = [
    {
      id: 'home',
      label: 'Home',
      path: '/dashboards',
      icon: Home,
      isActive: isActive('/dashboards')
    },
    {
      id: 'hr-analytics',
      label: 'HR Analytics',
      icon: BarChart3,
      isActive: isHRAnalyticsActive(),
      hasSubmenu: true,
      submenu: [
        {
          id: 'workforce',
          label: 'Workforce Dashboard',
          path: '/dashboards/workforce',
          icon: Users,
          description: 'Employee headcount and distribution',
          isActive: isActive('/dashboards/workforce')
        },
        {
          id: 'turnover',
          label: 'Turnover Dashboard',
          path: '/dashboards/turnover',
          icon: TrendingDown,
          description: 'Retention and departure analysis',
          isActive: isActive('/dashboards/turnover')
        },
        {
          id: 'i9-compliance',
          label: 'I-9 Compliance',
          path: '/dashboards/i9',
          icon: FileBarChart,
          description: 'Immigration compliance tracking',
          isActive: isActive('/dashboards/i9')
        },
        {
          id: 'recruiting',
          label: 'Recruiting & Retention Analytics',
          path: '/dashboards/recruiting',
          icon: BarChart3,
          description: 'Open positions, pipeline, and hiring trends',
          isActive: isActive('/dashboards/recruiting')
        },
        {
          id: 'exit-survey',
          label: 'Exit Survey Insights',
          path: '/dashboards/exit-survey',
          icon: TrendingDown,
          description: 'Exit survey results and key insights',
          isActive: isActive('/dashboards/exit-survey')
        },
        {
          id: 'combined-workforce',
          label: 'Combined Workforce Analytics',
          path: '/dashboards/combined-workforce',
          icon: Users,
          description: 'Comprehensive workforce and turnover analysis',
          isActive: isActive('/dashboards/combined-workforce')
        }
      ]
    }
  ];

  const toggleHRAnalytics = () => {
    setIsHRAnalyticsOpen(!isHRAnalyticsOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsHRAnalyticsOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <Link 
              to="/dashboards" 
              className="flex items-center gap-2 text-blue-700 hover:text-blue-800 transition-colors"
            >
              <BarChart3 size={24} />
              <span className="text-xl font-bold">TrioReports</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              
              if (item.hasSubmenu) {
                return (
                  <div key={item.id} className="relative">
                    <button
                      onClick={toggleHRAnalytics}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        item.isActive
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <IconComponent size={16} />
                      {item.label}
                      <ChevronDown 
                        size={14} 
                        className={`transition-transform ${isHRAnalyticsOpen ? 'rotate-180' : ''}`} 
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {isHRAnalyticsOpen && (
                      <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        <div className="py-2">
                          {item.submenu.map((subItem) => {
                            const SubIconComponent = subItem.icon;
                            return (
                              <Link
                                key={subItem.id}
                                to={subItem.path}
                                onClick={() => setIsHRAnalyticsOpen(false)}
                                className={`flex items-start gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
                                  subItem.isActive ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                                }`}
                              >
                                <SubIconComponent 
                                  size={16} 
                                  className={`mt-0.5 ${subItem.isActive ? 'text-blue-600' : 'text-gray-500'}`} 
                                />
                                <div>
                                  <div className={`font-medium ${subItem.isActive ? 'text-blue-700' : 'text-gray-900'}`}>
                                    {subItem.label}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    {subItem.description}
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              } else {
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      item.isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <IconComponent size={16} />
                    {item.label}
                  </Link>
                );
              }
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="py-2 space-y-1">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                
                if (item.hasSubmenu) {
                  return (
                    <div key={item.id}>
                      <button
                        onClick={toggleHRAnalytics}
                        className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium transition-colors ${
                          item.isActive
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent size={16} />
                          {item.label}
                        </div>
                        <ChevronDown 
                          size={14} 
                          className={`transition-transform ${isHRAnalyticsOpen ? 'rotate-180' : ''}`} 
                        />
                      </button>

                      {/* Mobile Submenu */}
                      {isHRAnalyticsOpen && (
                        <div className="bg-gray-50">
                          {item.submenu.map((subItem) => {
                            const SubIconComponent = subItem.icon;
                            return (
                              <Link
                                key={subItem.id}
                                to={subItem.path}
                                onClick={closeMobileMenu}
                                className={`flex items-start gap-3 px-8 py-3 text-sm hover:bg-gray-100 transition-colors ${
                                  subItem.isActive ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                                }`}
                              >
                                <SubIconComponent 
                                  size={16} 
                                  className={`mt-0.5 ${subItem.isActive ? 'text-blue-600' : 'text-gray-500'}`} 
                                />
                                <div>
                                  <div className={`font-medium ${subItem.isActive ? 'text-blue-700' : 'text-gray-900'}`}>
                                    {subItem.label}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    {subItem.description}
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                } else {
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={closeMobileMenu}
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                        item.isActive
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <IconComponent size={16} />
                      {item.label}
                    </Link>
                  );
                }
              })}
            </div>
          </div>
        )}
      </div>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Overlay for desktop dropdown */}
      {isHRAnalyticsOpen && (
        <div 
          className="fixed inset-0 z-40 hidden md:block"
          onClick={() => setIsHRAnalyticsOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navigation; 