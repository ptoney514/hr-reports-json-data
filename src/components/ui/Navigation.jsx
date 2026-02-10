import React, { useState, useCallback, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Users,
  Home,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Map,
  PieChart
} from 'lucide-react';
import { announceToScreenReader } from '../../utils/accessibilityUtils';
import SyncStatusIndicator from './SyncStatusIndicator';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    ethnicity: false
  });
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // Navigation configuration
  const navigationConfig = {
    dashboard: {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboards',
      icon: Home
    },
    sections: [
      {
        id: 'employees',
        label: 'Employees',
        items: [
          {
            id: 'workforce',
            label: 'Workforce',
            path: '/dashboards/workforce-q1',
            icon: Users
          },
          {
            id: 'ethnicity',
            label: 'Ethnicity',
            icon: PieChart,
            expandable: true,
            sectionKey: 'ethnicity',
            children: [
              {
                id: 'ethnicity-distribution',
                label: 'Ethnicity Distribution',
                path: '/dashboards/ethnicity-q1',
                icon: PieChart
              },
              {
                id: 'age-gender',
                label: 'Age/Gender',
                path: '/dashboards/age-gender-q1',
                icon: Users
              }
            ]
          }
        ]
      }
    ],
    bottom: {
      id: 'sitemap',
      label: 'Sitemap',
      path: '/sitemap',
      icon: Map
    }
  };

  // Auto-expand active section on page load
  useEffect(() => {
    const ethnicityPaths = ['/dashboards/ethnicity-q1', '/dashboards/age-gender-q1'];
    if (ethnicityPaths.includes(location.pathname)) {
      setExpandedSections(prev => ({ ...prev, ethnicity: true }));
    }
  }, [location.pathname]);

  const toggleMobileMenu = useCallback(() => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    announceToScreenReader(newState ? 'Mobile menu opened' : 'Mobile menu closed');
  }, [isMobileMenuOpen]);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
    announceToScreenReader('Mobile menu closed');
  }, []);

  const toggleSection = useCallback((sectionId) => {
    setExpandedSections(prev => {
      const newState = !prev[sectionId];
      announceToScreenReader(newState ? `${sectionId} section expanded` : `${sectionId} section collapsed`);
      return { ...prev, [sectionId]: newState };
    });
  }, []);

  // Render a full-text nav link (icon + label)
  const renderNavItem = (item, { indent = false, onClick } = {}) => {
    const IconComponent = item.icon;
    const active = isActive(item.path);
    return (
      <Link
        key={item.id}
        to={item.path}
        onClick={() => {
          announceToScreenReader(`Navigating to ${item.label}`);
          if (onClick) onClick();
        }}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none ${
          indent ? 'ml-6' : ''
        } ${
          active
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <IconComponent size={18} />
        <span>{item.label}</span>
      </Link>
    );
  };

  // Render an expandable nav item with children
  const renderExpandableNavItem = (item, { onClick } = {}) => {
    const IconComponent = item.icon;
    const isExpanded = expandedSections[item.sectionKey];
    const hasActiveChild = item.children?.some(child => isActive(child.path));

    return (
      <div key={item.id}>
        <button
          onClick={() => toggleSection(item.sectionKey)}
          aria-expanded={isExpanded}
          className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none ${
            hasActiveChild
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <IconComponent size={18} />
            <span>{item.label}</span>
          </div>
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        {isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children.map(child => renderNavItem(child, { indent: true, onClick }))}
          </div>
        )}
      </div>
    );
  };

  // Render the full navigation content (shared between desktop and mobile)
  const renderNavigationContent = ({ onItemClick } = {}) => (
    <>
      {/* Dashboard link */}
      {renderNavItem(navigationConfig.dashboard, { onClick: onItemClick })}

      {/* Sections */}
      {navigationConfig.sections.map(section => (
        <div key={section.id} className="mt-6">
          {/* Section header */}
          <div className="px-3 mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {section.label}
            </span>
          </div>

          {/* Section items */}
          <div className="space-y-1">
            {section.items.map(item =>
              item.expandable
                ? renderExpandableNavItem(item, { onClick: onItemClick })
                : renderNavItem(item, { onClick: onItemClick })
            )}
          </div>
        </div>
      ))}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar - Full-Text Navigation */}
      <nav className="hidden md:flex md:flex-col md:w-64 bg-gray-50 border-r border-gray-200 h-full no-print navigation sidebar">
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200">
            <Link
              to="/dashboards"
              className="flex items-center gap-3 text-blue-700 hover:text-blue-800 transition-colors"
              aria-label="HR Reports Home"
            >
              <BarChart3 size={24} />
              <span className="text-lg font-bold">HR Reports</span>
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            {renderNavigationContent()}
          </div>

          {/* Bottom: Sitemap + Sync Status */}
          <div className="border-t border-gray-200 px-3 py-3 space-y-2">
            {renderNavItem(navigationConfig.bottom)}
            <SyncStatusIndicator className="text-xs" />
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Header */}
      <div className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-50 no-print navigation">
        <div className="flex items-center justify-between h-16 px-4">
          <Link
            to="/dashboards"
            className="flex items-center gap-2 text-blue-700 hover:text-blue-800 transition-colors"
          >
            <BarChart3 size={24} />
            <span className="text-xl font-bold">HR Reports</span>
          </Link>

          <SyncStatusIndicator className="hidden sm:flex text-xs" />

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
          <div id="mobile-menu" className="fixed inset-y-0 left-0 w-64 bg-gray-50 border-r border-gray-200 z-50 md:hidden no-print navigation sidebar">
            <div className="flex flex-col h-full">
              {/* Mobile Navigation Items */}
              <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
                {renderNavigationContent({ onItemClick: closeMobileMenu })}
              </div>

              {/* Bottom: Sitemap + Sync Status */}
              <div className="border-t border-gray-200 px-4 py-3 space-y-2">
                {renderNavItem(navigationConfig.bottom, { onClick: closeMobileMenu })}
                <SyncStatusIndicator className="text-xs" />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navigation;
