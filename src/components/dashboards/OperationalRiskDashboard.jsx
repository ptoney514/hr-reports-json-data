import React, { useState, Suspense, lazy } from 'react';
import { Layout, Table, Grid3X3, Sparkles, Info } from 'lucide-react';
import ErrorBoundary from '../ui/ErrorBoundary';

// Lazy load design variants for better performance
const ExecutiveScorecard = lazy(() => import('./operational-risk/ExecutiveScorecard'));
const MissionAlignedHero = lazy(() => import('./operational-risk/MissionAlignedHero'));
const CardGridLayout = lazy(() => import('./operational-risk/CardGridLayout'));
const DataTableFocus = lazy(() => import('./operational-risk/DataTableFocus'));

/**
 * OperationalRiskDashboard - Main wrapper component
 *
 * Provides a tabbed interface to view and compare 4 different
 * design variants of the Operational Risk - Talent Management dashboard.
 *
 * Variants:
 * 1. Executive Scorecard - Large status tiles + detailed table
 * 2. Mission-Aligned Hero - Dark hero banner + progress bars
 * 3. Card Grid Layout - Bento-box cards with status badges
 * 4. Data Table Focus - Table-first with insight callouts
 */
const OperationalRiskDashboard = () => {
  const [activeVariant, setActiveVariant] = useState('executive');
  const [showInfo, setShowInfo] = useState(false);

  // Design variant configurations
  const variants = [
    {
      id: 'executive',
      label: 'Executive Scorecard',
      shortLabel: 'Executive',
      icon: Layout,
      description: 'Clean, executive-focused with large status tiles and detailed data table',
      component: ExecutiveScorecard
    },
    {
      id: 'hero',
      label: 'Mission-Aligned Hero',
      shortLabel: 'Hero',
      icon: Sparkles,
      description: 'Dark navy hero banner with inspirational messaging and horizontal progress bars',
      component: MissionAlignedHero
    },
    {
      id: 'cards',
      label: 'Card Grid Layout',
      shortLabel: 'Cards',
      icon: Grid3X3,
      description: 'Bento-box cards with prominent status badges and left-border accents',
      component: CardGridLayout
    },
    {
      id: 'table',
      label: 'Data Table Focus',
      shortLabel: 'Table',
      icon: Table,
      description: 'Professional table-first design with insight callouts and benchmark comparisons',
      component: DataTableFocus
    }
  ];

  // Get the active variant component
  const ActiveComponent = variants.find(v => v.id === activeVariant)?.component || ExecutiveScorecard;

  // Loading skeleton for lazy-loaded components
  const LoadingSkeleton = () => (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-24 bg-gray-200 rounded-lg mb-6" />
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg mb-6" />
          <div className="h-48 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* Variant Selector - Fixed at top */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Tab Navigation */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              {variants.map((variant) => {
                const IconComponent = variant.icon;
                const isActive = activeVariant === variant.id;

                return (
                  <button
                    key={variant.id}
                    onClick={() => setActiveVariant(variant.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                      ${isActive
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                    aria-pressed={isActive}
                    aria-label={`View ${variant.label} design`}
                  >
                    <IconComponent size={16} />
                    <span className="hidden sm:inline">{variant.shortLabel}</span>
                  </button>
                );
              })}
            </div>

            {/* Info Toggle */}
            <button
              onClick={() => setShowInfo(!showInfo)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all
                ${showInfo
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
              aria-expanded={showInfo}
              aria-label="Toggle design information"
            >
              <Info size={16} />
              <span className="hidden sm:inline">About Designs</span>
            </button>
          </div>

          {/* Info Panel - Expandable */}
          {showInfo && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">
                Design Variants for Operational Risk Dashboard
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {variants.map((variant) => {
                  const IconComponent = variant.icon;
                  const isActive = activeVariant === variant.id;

                  return (
                    <div
                      key={variant.id}
                      className={`
                        p-3 rounded-lg border transition-all cursor-pointer
                        ${isActive
                          ? 'bg-white border-blue-400 shadow-sm'
                          : 'bg-blue-50/50 border-blue-200 hover:bg-white'
                        }
                      `}
                      onClick={() => setActiveVariant(variant.id)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <IconComponent
                          size={18}
                          className={isActive ? 'text-blue-600' : 'text-blue-400'}
                        />
                        <span className={`text-sm font-medium ${isActive ? 'text-blue-900' : 'text-blue-700'}`}>
                          {variant.label}
                        </span>
                      </div>
                      <p className="text-xs text-blue-600">
                        {variant.description}
                      </p>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-blue-600 mt-3">
                Click on any tab above or card here to switch between design variants.
                All variants display the same data in different visual formats.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Active Dashboard Variant */}
      <ErrorBoundary>
        <Suspense fallback={<LoadingSkeleton />}>
          <ActiveComponent />
        </Suspense>
      </ErrorBoundary>

      {/* Print Header - Only visible when printing */}
      <div className="hidden print:block print:mb-4 print:p-4 print:border-b">
        <div className="text-center">
          <h1 className="text-xl font-bold">Operational Risk - Talent Management (O.3)</h1>
          <p className="text-sm text-gray-600">
            Design: {variants.find(v => v.id === activeVariant)?.label}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OperationalRiskDashboard;
