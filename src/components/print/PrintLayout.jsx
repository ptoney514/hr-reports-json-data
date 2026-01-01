import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PrintSidebar from './PrintSidebar';
import PrintDashboard from './PrintDashboard';
import PrintPageViewer from './PrintPageViewer';
import PrintReorderView from './PrintReorderView';
import ReportSelector from './ReportSelector';
import reportsIndex from '../../data/reports/index.json';

/**
 * PrintLayout - Main layout component for the report builder
 *
 * Features:
 * - Left sidebar navigation (sticky)
 * - Dashboard view with page thumbnails
 * - Individual page view
 * - Reorder pages view
 * - Report selector for switching between quarters
 */
const PrintLayout = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [currentReport, setCurrentReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [view, setView] = useState('dashboard'); // dashboard | page | reorder
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // all | published | draft | archived
  const [isLoading, setIsLoading] = useState(true);

  // Load report data
  useEffect(() => {
    const loadReport = async () => {
      setIsLoading(true);
      try {
        // Get report ID from URL or use default
        const reportId = searchParams.get('report') || reportsIndex.settings.lastSelectedReport;

        // Find report in index
        const reportMeta = reportsIndex.reports.find(r => r.id === reportId);
        if (!reportMeta) {
          console.error('Report not found:', reportId);
          setIsLoading(false);
          return;
        }

        // Dynamic import of report data
        const reportModule = await import(`../../data/reports/${reportMeta.file}`);
        setReportData(reportModule.default || reportModule);
        setCurrentReport(reportId);

        // Check for page param
        const pageId = searchParams.get('page');
        if (pageId) {
          setSelectedPageId(pageId);
          setView('page');
        }
      } catch (error) {
        console.error('Error loading report:', error);
      }
      setIsLoading(false);
    };

    loadReport();
  }, [searchParams]);

  // Handle report change
  const handleReportChange = (reportId) => {
    setSearchParams({ report: reportId });
    setView('dashboard');
    setSelectedPageId(null);
  };

  // Handle page selection
  const handlePageSelect = (pageId) => {
    setSelectedPageId(pageId);
    setView('page');
    setSearchParams({ report: currentReport, page: pageId });
  };

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    setView('dashboard');
    setSelectedPageId(null);
    setSearchParams({ report: currentReport });
  };

  // Handle view change
  const handleViewChange = (newView) => {
    setView(newView);
    if (newView === 'dashboard') {
      setSelectedPageId(null);
    }
  };

  // Filter pages by status
  const getFilteredPages = () => {
    if (!reportData?.pages) return [];
    if (statusFilter === 'all') return reportData.pages;
    return reportData.pages.filter(page => page.status === statusFilter);
  };

  // Get page counts by status
  const getPageCounts = () => {
    if (!reportData?.pages) return { all: 0, published: 0, draft: 0, archived: 0 };
    return {
      all: reportData.pages.length,
      published: reportData.pages.filter(p => p.status === 'published').length,
      draft: reportData.pages.filter(p => p.status === 'draft').length,
      archived: reportData.pages.filter(p => p.status === 'archived').length
    };
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!reportData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load report data</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const pageCounts = getPageCounts();
  const filteredPages = getFilteredPages();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">HR Workforce Reports</h1>

          {/* Report Selector */}
          <ReportSelector
            reports={reportsIndex.reports}
            currentReportId={currentReport}
            onReportChange={handleReportChange}
          />
        </div>

        <div className="flex items-center gap-2">
          {view === 'page' && (
            <button
              onClick={handleBackToDashboard}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
          )}
          <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <PrintSidebar
          reportData={reportData}
          pages={reportData.pages}
          sections={reportData.sections}
          selectedPageId={selectedPageId}
          statusFilter={statusFilter}
          pageCounts={pageCounts}
          view={view}
          onPageSelect={handlePageSelect}
          onStatusFilterChange={setStatusFilter}
          onViewChange={handleViewChange}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {view === 'dashboard' && (
            <PrintDashboard
              reportData={reportData}
              pages={filteredPages}
              onPageSelect={handlePageSelect}
            />
          )}

          {view === 'page' && selectedPageId && (
            <PrintPageViewer
              reportData={reportData}
              pageId={selectedPageId}
              pages={filteredPages}
              onPageSelect={handlePageSelect}
              onBack={handleBackToDashboard}
            />
          )}

          {view === 'reorder' && (
            <PrintReorderView
              reportData={reportData}
              pages={reportData.pages}
              onSave={(newOrder) => {
                // TODO: Save new order to JSON
                console.log('New order:', newOrder);
                handleViewChange('dashboard');
              }}
              onCancel={() => handleViewChange('dashboard')}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default PrintLayout;
