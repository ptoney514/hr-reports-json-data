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
  Database
} from 'lucide-react';
import { announceToScreenReader } from '../../utils/accessibilityUtils';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Check if current path is active
  const isActive = (path) => location.pathname === path;

  const navigationItems = [
    {
      id: 'home',
      label: 'Home',
      path: '/dashboards',
      icon: Home,
      isActive: isActive('/dashboards')
    },
    {
      id: 'workforce',
      label: 'Workforce Analytics',
      path: '/dashboards/workforce',
      icon: Users,
      isActive: isActive('/dashboards/workforce')
    },
    {
      id: 'turnover',
      label: 'Turnover Dashboard',
      path: '/dashboards/turnover',
      icon: TrendingDown,
      isActive: isActive('/dashboards/turnover')
    },
    {
      id: 'recruiting',
      label: 'Recruiting & Retention Analytics',
      path: '/dashboards/recruiting',
      icon: UserPlus,
      isActive: isActive('/dashboards/recruiting')
    },
    {
      id: 'exit-survey',
      label: 'Exit Survey Insights',
      path: '/dashboards/exit-survey',
      icon: MessageSquare,
      isActive: isActive('/dashboards/exit-survey')
    },
    {
      id: 'admin',
      label: 'Admin Dashboard',
      path: '/admin',
      icon: Database,
      isActive: isActive('/admin')
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



  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-200 h-full no-print navigation sidebar">
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3 p-6 border-b border-gray-200">
            <Link 
              to="/dashboards" 
              className="flex items-center gap-2 text-blue-700 hover:text-blue-800 transition-colors"
            >
              <BarChart3 size={24} />
              <span className="text-xl font-bold">TrioReports</span>
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 py-6 px-4 space-y-2">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => announceToScreenReader(`Navigating to ${item.label}`)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none ${
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
            <span className="text-xl font-bold">TrioReports</span>
          </Link>

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
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navigation; 