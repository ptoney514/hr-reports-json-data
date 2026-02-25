import React, { useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import { navigationRoutes, getNavigationGroups } from '../../config/navigationConfig';
import { useQuarter } from '../../contexts/QuarterContext';

/**
 * Two-row slide-style top navigation header.
 *
 * Row 1 (top bar): slide nav + quarter dropdown — hidden in print.
 * Row 2 (bottom bar): identity + period context + branding — stays visible in print.
 */
const SlideHeader = ({ sticky = true }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedQuarter, quarterConfig, setQuarter, availableQuarters, quartersLoading } = useQuarter();

  // Find current index in the ordered route list
  const currentIndex = navigationRoutes.findIndex(r => r.path === location.pathname);
  const currentRoute = currentIndex >= 0 ? navigationRoutes[currentIndex] : null;

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < navigationRoutes.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev) navigate(navigationRoutes[currentIndex - 1].path);
  }, [hasPrev, currentIndex, navigate]);

  const goNext = useCallback(() => {
    if (hasNext) navigate(navigationRoutes[currentIndex + 1].path);
  }, [hasNext, currentIndex, navigate]);

  // Keyboard arrow navigation (only when not focused on input/select)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'select' || tag === 'textarea') return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goPrev, goNext]);

  // Build grouped options for the nav dropdown
  const groups = getNavigationGroups();

  const handleNavChange = (e) => {
    navigate(e.target.value);
  };

  const handleQuarterChange = (e) => {
    setQuarter(e.target.value);
  };

  return (
    <header
      className={`${sticky ? 'sticky top-0' : ''} z-40`}
    >
      {/* ── ROW 1 — Navigation bar (controls + quarter selector) ── */}
      <div className="bg-[#003580] text-white print:hidden">
        <div className="w-[85%] max-w-[1280px] mx-auto py-1.5 flex items-center justify-between gap-4">
          {/* LEFT: Prev/Next + Dropdown + Slide counter */}
          <div className="flex items-center gap-2 min-w-0">
            {/* Prev/Next Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={goPrev}
                disabled={!hasPrev}
                className={`p-1 rounded transition-colors ${
                  hasPrev
                    ? 'bg-white/10 hover:bg-white/20 cursor-pointer'
                    : 'opacity-30 cursor-not-allowed'
                }`}
                aria-label="Previous dashboard"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={goNext}
                disabled={!hasNext}
                className={`p-1 rounded transition-colors ${
                  hasNext
                    ? 'bg-white/10 hover:bg-white/20 cursor-pointer'
                    : 'opacity-30 cursor-not-allowed'
                }`}
                aria-label="Next dashboard"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Divider */}
            <span className="text-white/30 hidden sm:inline" aria-hidden="true">|</span>

            {/* Nav Dropdown */}
            <select
              value={currentRoute?.path || ''}
              onChange={handleNavChange}
              className="bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white focus:ring-2 focus:ring-white/40 focus:outline-none min-w-0 max-w-[200px] truncate"
              aria-label="Navigate to dashboard"
            >
              {groups.map((group) => {
                const routes = navigationRoutes.filter(r =>
                  group === '__ungrouped__' ? !r.group : r.group === group
                );
                if (group === '__ungrouped__') {
                  return routes.map(r => (
                    <option key={r.path} value={r.path} className="text-gray-900">
                      {r.label}
                    </option>
                  ));
                }
                return (
                  <optgroup key={group} label={group}>
                    {routes.map(r => (
                      <option key={r.path} value={r.path} className="text-gray-900">
                        {r.label}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>

            {/* Slide counter */}
            {currentIndex >= 0 && (
              <span
                className="text-xs text-blue-300 hidden md:inline"
                aria-live="polite"
              >
                Slide {currentIndex + 1} of {navigationRoutes.length}
              </span>
            )}
          </div>

          {/* RIGHT: Quarter dropdown */}
          <select
            value={selectedQuarter}
            onChange={handleQuarterChange}
            disabled={quartersLoading}
            aria-busy={quartersLoading}
            className="bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white focus:ring-2 focus:ring-white/40 focus:outline-none disabled:opacity-50"
            aria-label="Select reporting quarter"
          >
            {quartersLoading ? (
              <option value="">Loading quarters…</option>
            ) : (
              availableQuarters.map(q => (
                <option key={q.value} value={q.value} className="text-gray-900">
                  {q.label} ({q.period})
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* ── ROW 2 — Title bar (identity + period context + branding) ── */}
      <div className="bg-gradient-to-r from-[#00245D] to-[#0054A6] text-white print:static">
        <div className="w-[85%] max-w-[1280px] mx-auto py-2.5 flex items-center justify-between gap-4">
          {/* LEFT: App title */}
          <Link
            to="/dashboards/executive"
            className="flex items-center gap-2 text-white hover:text-blue-200 transition-colors shrink-0"
            aria-label="HR Reports Home"
          >
            <BarChart3 size={22} />
            <span className="text-base font-bold hidden sm:inline">{currentRoute?.label || 'HR Executive Dashboard'}</span>
          </Link>

          {/* CENTER: Period context (static text, prints cleanly) */}
          {quarterConfig && (
            <div className="text-center flex-1 min-w-0">
              <span className="text-sm font-semibold">
                {quarterConfig.label}
              </span>
              <span className="text-xs text-blue-200 ml-2 hidden sm:inline">
                {quarterConfig.period}
              </span>
            </div>
          )}

          {/* RIGHT: Branding */}
          <div className="text-right shrink-0 hidden sm:block">
            <div className="text-xs text-blue-200 uppercase tracking-wider">
              Creighton University
            </div>
            <div className="text-xs text-blue-300">Omaha &amp; Phoenix</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SlideHeader;
