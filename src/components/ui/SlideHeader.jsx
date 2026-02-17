import React, { useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import { navigationRoutes, getNavigationGroups } from '../../config/navigationConfig';

/**
 * Slide-style top navigation header.
 * Replaces the sidebar Navigation with a compact top bar
 * that looks clean when screenshotted for Keynote presentations.
 */
const SlideHeader = ({ sticky = true }) => {
  const location = useLocation();
  const navigate = useNavigate();

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

  return (
    <header
      className={`bg-gradient-to-r from-[#00245D] to-[#0054A6] text-white ${sticky ? 'sticky top-0' : ''} z-40 print:static`}
    >
      <div className="w-[85%] max-w-[1280px] mx-auto py-3 flex items-center justify-between gap-4">
        {/* LEFT: Logo + Prev/Next + Dropdown */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Logo */}
          <Link
            to="/dashboards/executive"
            className="flex items-center gap-2 text-white hover:text-blue-200 transition-colors shrink-0"
            aria-label="HR Reports Home"
          >
            <BarChart3 size={22} />
            <span className="text-base font-bold hidden sm:inline">HR Reports</span>
          </Link>

          {/* Prev/Next Buttons */}
          <div className="flex items-center gap-1 print:hidden">
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
          <span className="text-white/30 hidden sm:inline print:hidden" aria-hidden="true">|</span>

          {/* Nav Dropdown */}
          <select
            value={currentRoute?.path || ''}
            onChange={handleNavChange}
            className="bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white print:hidden focus:ring-2 focus:ring-white/40 focus:outline-none min-w-0 max-w-[200px] truncate"
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
        </div>

        {/* CENTER-RIGHT: Title */}
        {currentRoute && (
          <div className="text-right sm:text-center flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">{currentRoute.label}</h1>
          </div>
        )}

        {/* FAR RIGHT: Branding */}
        <div className="text-right shrink-0 hidden sm:block">
          <div className="text-xs text-blue-200 uppercase tracking-wider">
            Creighton University
          </div>
          <div className="text-xs text-blue-300">Omaha &amp; Phoenix</div>
        </div>
      </div>
    </header>
  );
};

export default SlideHeader;
