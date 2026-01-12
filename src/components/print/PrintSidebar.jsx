import React, { useState } from 'react';
import {
  Users, PieChart, UserPlus, TrendingDown, ClipboardList,
  FileText, Printer, Download, GripVertical, Plus, Settings,
  ChevronDown, ChevronRight, Check, Edit3, Archive
} from 'lucide-react';

/**
 * PrintSidebar - Left navigation sidebar for report builder
 *
 * Features:
 * - Report info header
 * - Status filter (All, Published, Drafts, Archived)
 * - Collapsible section navigation
 * - Page list with status indicators
 * - Tools section (Print, Export, Reorder, Add Page, Settings)
 */

// Icon mapping for sections
const sectionIcons = {
  headcount: Users,
  demographics: PieChart,
  recruiting: UserPlus,
  turnover: TrendingDown,
  'exit-surveys': ClipboardList
};

// Status icons and colors
const statusConfig = {
  published: { icon: Check, color: 'text-green-600', bg: 'bg-green-100', label: 'Published' },
  draft: { icon: Edit3, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Draft' },
  archived: { icon: Archive, color: 'text-gray-400', bg: 'bg-gray-100', label: 'Archived' }
};

const PrintSidebar = ({
  reportData,
  pages,
  sections,
  selectedPageId,
  statusFilter,
  pageCounts,
  view,
  onPageSelect,
  onStatusFilterChange,
  onViewChange
}) => {
  // Track expanded sections
  const [expandedSections, setExpandedSections] = useState(
    sections?.reduce((acc, section) => ({ ...acc, [section.id]: true }), {}) || {}
  );

  // Toggle section expansion
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Get pages for a section
  const getPagesForSection = (sectionId) => {
    return pages?.filter(page => page.section === sectionId) || [];
  };

  // Get pages without a section (cover, toc, etc.)
  const getStandalonePages = () => {
    return pages?.filter(page => !page.section) || [];
  };

  // Render status indicator
  const renderStatusIndicator = (status) => {
    const config = statusConfig[status];
    if (!config) return null;

    if (status === 'published') {
      return <Check className="w-3 h-3 text-green-600" />;
    }
    if (status === 'draft') {
      return <Edit3 className="w-3 h-3 text-yellow-600" />;
    }
    if (status === 'archived') {
      return <Archive className="w-3 h-3 text-gray-400" />;
    }
    return null;
  };

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden">
      {/* Report Info Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded">
            {reportData?.quarter} {reportData?.fiscalYear}
          </span>
        </div>
        <p className="text-xs text-gray-500">{reportData?.dateRange?.label}</p>
      </div>

      {/* Status Filter */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Filter by Status
        </h3>
        <div className="space-y-1">
          {[
            { id: 'all', label: 'All', count: pageCounts.all },
            { id: 'published', label: 'Published', count: pageCounts.published },
            { id: 'draft', label: 'Drafts', count: pageCounts.draft },
            { id: 'archived', label: 'Archived', count: pageCounts.archived }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => onStatusFilterChange(filter.id)}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded text-sm transition-colors ${
                statusFilter === filter.id
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  statusFilter === filter.id ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
                {filter.label}
              </span>
              <span className="text-xs text-gray-400">({filter.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pages Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Pages
        </h3>

        {/* Standalone Pages (Cover, TOC) */}
        <div className="space-y-1 mb-4">
          {getStandalonePages().map(page => (
            <button
              key={page.id}
              onClick={() => onPageSelect(page.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                selectedPageId === page.id
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-4 h-4 text-gray-400" />
              <span className="flex-1 text-left truncate">{page.title}</span>
              {renderStatusIndicator(page.status)}
            </button>
          ))}
        </div>

        {/* Section Divider */}
        <div className="border-t border-gray-200 my-4" />

        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Sections
        </h3>

        {/* Sections with Collapsible Pages */}
        <div className="space-y-2">
          {sections?.map(section => {
            const SectionIcon = sectionIcons[section.id] || FileText;
            const sectionPages = getPagesForSection(section.id);
            const isExpanded = expandedSections[section.id];
            const hasSelectedPage = sectionPages.some(p => p.id === selectedPageId);

            return (
              <div key={section.id}>
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors ${
                    hasSelectedPage
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                  <SectionIcon className="w-4 h-4" style={{ color: '#0054A6' }} />
                  <span className="flex-1 text-left">{section.name}</span>
                  <span className="text-xs text-gray-400">({sectionPages.length})</span>
                </button>

                {/* Section Pages */}
                {isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {sectionPages.map(page => (
                      <button
                        key={page.id}
                        onClick={() => onPageSelect(page.id)}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
                          selectedPageId === page.id
                            ? 'bg-blue-100 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span className="flex-1 text-left truncate">{page.title}</span>
                        {renderStatusIndicator(page.status)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tools Section */}
      <div className="border-t border-gray-200 p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Tools
        </h3>
        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors">
            <Printer className="w-4 h-4 text-gray-500" />
            Print Report
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors">
            <Download className="w-4 h-4 text-gray-500" />
            Export PDF
          </button>
          <button
            onClick={() => onViewChange('reorder')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded transition-colors ${
              view === 'reorder'
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <GripVertical className="w-4 h-4 text-gray-500" />
            Reorder Pages
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors">
            <Plus className="w-4 h-4 text-gray-500" />
            Add New Page
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors">
            <Settings className="w-4 h-4 text-gray-500" />
            Report Settings
          </button>
        </div>
      </div>
    </aside>
  );
};

export default PrintSidebar;
