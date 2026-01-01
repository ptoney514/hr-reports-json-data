import React, { useState } from 'react';
import {
  ChevronLeft, ChevronRight, Check, Edit3, Archive,
  Copy, Trash2, MoreVertical
} from 'lucide-react';

/**
 * PrintPageViewer - Individual page view with full preview
 *
 * Features:
 * - Full page preview
 * - Page status controls
 * - Navigation between pages
 * - Page actions (duplicate, delete)
 * - Page metadata display
 */

// Import page components (will be created/connected later)
// For now, we'll render placeholder content based on page type

const statusOptions = [
  { id: 'published', label: 'Published', icon: Check, color: 'text-green-600' },
  { id: 'draft', label: 'Draft', icon: Edit3, color: 'text-yellow-600' },
  { id: 'archived', label: 'Archived', icon: Archive, color: 'text-gray-400' }
];

const PrintPageViewer = ({ reportData, pageId, pages, onPageSelect, onBack, onStatusChange }) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  // Get current page
  const currentPage = pages?.find(p => p.id === pageId);
  const currentIndex = pages?.findIndex(p => p.id === pageId);

  // Navigation
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < (pages?.length || 0) - 1;

  const goToPrev = () => {
    if (hasPrev) {
      onPageSelect(pages[currentIndex - 1].id);
    }
  };

  const goToNext = () => {
    if (hasNext) {
      onPageSelect(pages[currentIndex + 1].id);
    }
  };

  // Handle status change with save
  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentPage?.status) {
      setShowStatusMenu(false);
      return;
    }

    setIsSaving(true);
    setShowStatusMenu(false);

    try {
      if (onStatusChange) {
        const success = await onStatusChange(pageId, newStatus);
        if (success) {
          setSaveMessage({ type: 'success', text: `Status changed to ${newStatus}` });
        } else {
          setSaveMessage({ type: 'error', text: 'Failed to save status' });
        }
      }
    } catch (error) {
      console.error('Error changing status:', error);
      setSaveMessage({ type: 'error', text: 'Error saving status' });
    }

    setIsSaving(false);

    // Clear message after 2 seconds
    setTimeout(() => setSaveMessage(null), 2000);
  };

  // Get status config
  const currentStatus = statusOptions.find(s => s.id === currentPage?.status) || statusOptions[0];
  const StatusIcon = currentStatus.icon;

  if (!currentPage) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Page not found</p>
      </div>
    );
  }

  // Render page content placeholder based on type
  const renderPageContent = () => {
    switch (currentPage.type) {
      case 'cover':
        return (
          <div className="h-full flex">
            {/* Left - Image */}
            <div className="w-1/2 bg-gray-200 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 rounded-full bg-gray-300 flex items-center justify-center border-4 border-white shadow-lg">
                  <span className="text-2xl font-bold text-gray-500">CU</span>
                </div>
              </div>
            </div>

            {/* Right - Content */}
            <div className="w-1/2 bg-white flex flex-col">
              {/* Quarter Badge */}
              <div className="p-8">
                <span className="inline-block px-4 py-2 bg-[#00245D] text-white text-sm font-semibold rounded">
                  {reportData?.quarter} {reportData?.fiscalYear}
                </span>
              </div>

              {/* Title */}
              <div className="flex-1 flex flex-col justify-center px-8">
                <h1 className="text-4xl font-bold text-[#0054A6] mb-4">
                  {reportData?.title || 'HR Workforce Reports'}
                </h1>
                <p className="text-lg text-gray-600">
                  {reportData?.subtitle || 'Quarterly Analysis for Benefit Eligible Employees'}
                </p>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">
                    Table of Contents
                  </p>
                  {reportData?.sections?.map((section, i) => (
                    <div key={section.id} className="flex items-center justify-between py-1 text-sm">
                      <span className="text-gray-700">
                        <span className="text-[#0054A6] font-medium">{i + 1}.</span> {section.name}
                      </span>
                      <span className="text-[#0054A6]">{i * 3 + 2}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-8 text-sm text-gray-500">
                {reportData?.branding?.organization}
              </div>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="h-full bg-gray-50 overflow-auto">
            {/* Header Bar */}
            <div className="bg-[#00245D] text-white text-center py-2 text-sm font-medium tracking-wider">
              CREIGHTON UNIVERSITY
            </div>

            {/* Page Content */}
            <div className="p-8">
              {/* Title Section */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{currentPage.title}</h2>
                <p className="text-gray-500 mt-1">
                  {reportData?.dateRange?.label}
                </p>
              </div>

              {/* Metric Cards Placeholder */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="text-xs text-gray-500 uppercase mb-2">Metric {i}</div>
                    <div className="text-2xl font-bold text-gray-900">1,234</div>
                  </div>
                ))}
              </div>

              {/* Chart Placeholder */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Chart Title</h3>
                <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-gray-400">Chart Preview</span>
                </div>
              </div>
            </div>

            {/* Page Number */}
            <div className="absolute bottom-4 right-4 text-sm text-gray-400">
              {currentPage.order}
            </div>
          </div>
        );

      case 'trend':
        return (
          <div className="h-full bg-gray-50 overflow-auto">
            {/* Header Bar */}
            <div className="bg-[#00245D] text-white text-center py-2 text-sm font-medium tracking-wider">
              CREIGHTON UNIVERSITY
            </div>

            {/* Page Content */}
            <div className="p-8">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{currentPage.title}</h2>

                {/* Trend Chart Placeholder */}
                <div className="h-80 bg-gray-50 rounded border flex items-center justify-center">
                  <svg viewBox="0 0 400 200" className="w-full h-full p-8">
                    <polyline
                      fill="none"
                      stroke="#0054A6"
                      strokeWidth="3"
                      points="0,150 80,130 160,100 240,110 320,70 400,80"
                    />
                    <polyline
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      points="0,170 80,160 160,140 240,150 320,130 400,140"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Page Number */}
            <div className="absolute bottom-4 right-4 text-sm text-gray-400">
              {currentPage.order}
            </div>
          </div>
        );

      default:
        return (
          <div className="h-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <p className="text-gray-500 mb-2">Page Preview</p>
              <p className="text-sm text-gray-400">{currentPage.title}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Save Message Toast */}
      {saveMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${
          saveMessage.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {saveMessage.text}
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{currentPage.title}</h2>
            <p className="text-sm text-gray-500">
              Page {currentIndex + 1} of {pages?.length}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Selector */}
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <StatusIcon className={`w-4 h-4 ${currentStatus.color}`} />
                <span className="text-sm font-medium text-gray-700">{currentStatus.label}</span>
                <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showStatusMenu ? 'rotate-90' : ''}`} />
              </button>

              {showStatusMenu && (
                <div className="absolute top-full right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10 overflow-hidden">
                  {statusOptions.map(option => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleStatusChange(option.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 ${
                          option.id === currentPage.status ? 'bg-blue-50' : ''
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${option.color}`} />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions Menu */}
            <div className="relative">
              <button
                onClick={() => setShowActionsMenu(!showActionsMenu)}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>

              {showActionsMenu && (
                <div className="absolute top-full right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10 overflow-hidden">
                  <button
                    onClick={() => {
                      console.log('Duplicate page');
                      setShowActionsMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50"
                  >
                    <Copy className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Duplicate</span>
                  </button>
                  <button
                    onClick={() => {
                      console.log('Delete page');
                      setShowActionsMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-red-50 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm">Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Page Preview */}
      <div className="flex-1 p-6 overflow-auto bg-gray-200">
        <div className="max-w-4xl mx-auto">
          {/* Page Frame */}
          <div className="bg-white shadow-xl rounded-lg overflow-hidden" style={{ aspectRatio: '8.5/11' }}>
            {renderPageContent()}
          </div>
        </div>
      </div>

      {/* Page Navigation */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={goToPrev}
            disabled={!hasPrev}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              hasPrev
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-gray-50 text-gray-300 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>

          <span className="text-sm text-gray-500">
            Page {currentIndex + 1} of {pages?.length}
          </span>

          <button
            onClick={goToNext}
            disabled={!hasNext}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              hasNext
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-gray-50 text-gray-300 cursor-not-allowed'
            }`}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintPageViewer;
