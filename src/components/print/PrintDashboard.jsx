import React from 'react';
import { FileText, BarChart3, TrendingUp, Layout, Check, Edit3, Archive } from 'lucide-react';

/**
 * PrintDashboard - Grid view of all report pages with thumbnails
 *
 * Features:
 * - Grid layout of page cards
 * - Visual thumbnails/previews for each page
 * - Status badges
 * - Click to navigate to page view
 * - Page type indicators
 */

// Page type configurations
const pageTypeConfig = {
  cover: {
    icon: Layout,
    color: 'bg-purple-100 text-purple-700',
    label: 'Cover'
  },
  toc: {
    icon: FileText,
    color: 'bg-gray-100 text-gray-700',
    label: 'TOC'
  },
  data: {
    icon: BarChart3,
    color: 'bg-blue-100 text-blue-700',
    label: 'Data'
  },
  trend: {
    icon: TrendingUp,
    color: 'bg-green-100 text-green-700',
    label: 'Trend'
  },
  divider: {
    icon: Layout,
    color: 'bg-orange-100 text-orange-700',
    label: 'Divider'
  }
};

// Status configurations
const statusConfig = {
  published: {
    icon: Check,
    color: 'bg-green-100 text-green-700',
    borderColor: 'border-green-200',
    label: 'Published'
  },
  draft: {
    icon: Edit3,
    color: 'bg-yellow-100 text-yellow-700',
    borderColor: 'border-yellow-200',
    label: 'Draft'
  },
  archived: {
    icon: Archive,
    color: 'bg-gray-100 text-gray-500',
    borderColor: 'border-gray-200',
    label: 'Archived'
  }
};

const PrintDashboard = ({ reportData, pages, onPageSelect }) => {
  // Future: Group pages by section for section-based display
  // const groupedPages = pages?.reduce((acc, page) => { ... }, {});

  // Render page thumbnail
  const renderThumbnail = (page) => {
    const typeConfig = pageTypeConfig[page.type] || pageTypeConfig.data;
    const TypeIcon = typeConfig.icon;

    // Cover page thumbnail
    if (page.type === 'cover') {
      return (
        <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-white">
          {/* Header Bar */}
          <div className="h-6 bg-[#00245D]" />

          {/* Content Preview */}
          <div className="flex-1 flex">
            {/* Left side - image placeholder */}
            <div className="w-1/2 bg-gray-200 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-xs text-gray-500">CU</span>
              </div>
            </div>

            {/* Right side - content */}
            <div className="w-1/2 p-3 flex flex-col justify-center">
              <div className="text-[8px] font-bold text-blue-600 mb-1">
                {reportData?.quarter} {reportData?.fiscalYear}
              </div>
              <div className="text-[10px] font-bold text-[#00245D] leading-tight">
                HR Workforce Reports
              </div>
              <div className="text-[6px] text-gray-500 mt-1">
                {reportData?.dateRange?.label}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Data page thumbnail
    if (page.type === 'data') {
      return (
        <div className="h-full flex flex-col bg-gray-50 p-2">
          {/* Header */}
          <div className="h-4 bg-[#00245D] rounded-t mb-1" />

          {/* Title placeholder */}
          <div className="h-2 bg-gray-300 rounded w-3/4 mb-2" />

          {/* Metric cards placeholder */}
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex-1 h-6 bg-white border border-gray-200 rounded p-1">
                <div className="h-1 bg-blue-200 rounded w-1/2 mb-0.5" />
                <div className="h-2 bg-gray-200 rounded w-3/4" />
              </div>
            ))}
          </div>

          {/* Chart placeholder */}
          <div className="flex-1 bg-white border border-gray-200 rounded p-1">
            <div className="h-1 bg-gray-300 rounded w-1/2 mb-1" />
            <div className="flex items-end gap-1 h-full pb-2">
              {[40, 60, 35, 75, 50].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-blue-500 rounded-t"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Trend page thumbnail
    if (page.type === 'trend') {
      return (
        <div className="h-full flex flex-col bg-gray-50 p-2">
          {/* Header */}
          <div className="h-4 bg-[#00245D] rounded-t mb-1" />

          {/* Title placeholder */}
          <div className="h-2 bg-gray-300 rounded w-3/4 mb-2" />

          {/* Line chart placeholder */}
          <div className="flex-1 bg-white border border-gray-200 rounded p-2">
            <svg viewBox="0 0 100 50" className="w-full h-full">
              <polyline
                fill="none"
                stroke="#0054A6"
                strokeWidth="2"
                points="0,40 20,35 40,25 60,30 80,15 100,20"
              />
              <polyline
                fill="none"
                stroke="#10B981"
                strokeWidth="1.5"
                strokeDasharray="3,3"
                points="0,45 20,42 40,38 60,40 80,35 100,38"
              />
            </svg>
          </div>
        </div>
      );
    }

    // Table of contents thumbnail
    if (page.type === 'toc') {
      return (
        <div className="h-full flex flex-col bg-white p-3">
          <div className="text-[8px] font-bold text-gray-700 mb-2">Table of Contents</div>
          <div className="space-y-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-1">
                <span className="text-[6px] text-blue-600">{i}.</span>
                <div className="flex-1 h-1 bg-gray-200 rounded" />
                <span className="text-[6px] text-blue-600">{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Default thumbnail
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <TypeIcon className="w-8 h-8 text-gray-400" />
      </div>
    );
  };

  // Render page card
  const renderPageCard = (page) => {
    const typeConfig = pageTypeConfig[page.type] || pageTypeConfig.data;
    const status = statusConfig[page.status] || statusConfig.published;
    const StatusIcon = status.icon;

    return (
      <button
        key={page.id}
        onClick={() => onPageSelect(page.id)}
        className={`group bg-white rounded-lg border-2 ${status.borderColor} overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-200 text-left`}
      >
        {/* Thumbnail */}
        <div className="aspect-[8.5/11] bg-gray-100 relative overflow-hidden">
          {renderThumbnail(page)}

          {/* Status Badge Overlay */}
          {page.status !== 'published' && (
            <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-medium ${status.color}`}>
              {status.label}
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-white rounded-lg shadow-lg text-sm font-medium text-blue-600 transition-opacity">
              View Page
            </span>
          </div>
        </div>

        {/* Card Footer */}
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {page.title}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Page {page.order}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${typeConfig.color}`}>
                {typeConfig.label}
              </span>
              <StatusIcon className={`w-3.5 h-3.5 ${page.status === 'published' ? 'text-green-600' : page.status === 'draft' ? 'text-yellow-600' : 'text-gray-400'}`} />
            </div>
          </div>
        </div>
      </button>
    );
  };

  // Calculate published page count for print info
  const publishedCount = pages?.filter(p => p.status === 'published').length || 0;

  return (
    <div className="p-6">
      {/* Dashboard Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-sm text-gray-500 mt-1">
              {pages?.length || 0} pages total • {publishedCount} ready for print
            </p>
          </div>

          {/* View Toggle - Future: Grid/List */}
          <div className="flex items-center gap-2">
            <button className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Section: All Pages */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          All Pages ({pages?.length || 0})
        </h3>

        {/* Page Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {pages?.sort((a, b) => a.order - b.order).map(page => renderPageCard(page))}
        </div>
      </div>

      {/* Empty State */}
      {(!pages || pages.length === 0) && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pages found</h3>
          <p className="text-sm text-gray-500 mb-4">
            No pages match your current filter. Try adjusting your filters or create a new page.
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Add New Page
          </button>
        </div>
      )}
    </div>
  );
};

export default PrintDashboard;
