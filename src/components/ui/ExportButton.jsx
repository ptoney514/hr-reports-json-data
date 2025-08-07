import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, Printer, ChevronDown, FileDown, Loader2 } from 'lucide-react';
import { useDashboard } from '../../contexts/DashboardContext';
import { PDFExporter, DataExporter } from '../../utils/exportUtils';

const ExportButton = ({ 
  onExport,
  dashboardTitle = 'Dashboard',
  className = '',
  includeCharts = true,
  includeData = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState('');
  const dropdownRef = useRef(null);
  const { state } = useDashboard();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const exportOptions = [
    {
      id: 'pdf',
      label: 'Export as PDF',
      icon: FileText,
      action: () => handleExport('pdf'),
      description: 'Complete dashboard with charts and data'
    },
    {
      id: 'excel',
      label: 'Export to Excel',
      icon: FileSpreadsheet,
      action: () => handleExport('excel'),
      description: 'Data tables with filters and metadata'
    },
    {
      id: 'csv',
      label: 'Export to CSV',
      icon: FileDown,
      action: () => handleExport('csv'),
      description: 'Raw data in CSV format'
    },
    {
      id: 'print',
      label: 'Print Dashboard',
      icon: Printer,
      action: () => handleExport('print'),
      description: 'Print current dashboard view'
    }
  ];

  const handleExport = async (type) => {
    setIsOpen(false);
    setIsExporting(true);
    setExportStatus(`Preparing ${type.toUpperCase()} export...`);
    
    try {
      switch (type) {
        case 'pdf':
          await exportToPDF();
          break;
        case 'excel':
          await exportToExcel();
          break;
        case 'csv':
          await exportToCSV();
          break;
        case 'print':
          // Enhanced print with proper chart rendering
          setExportStatus('Preparing for print...');
          
          // Add print styles class
          document.body.classList.add('print-mode');
          
          // Wait for any dynamic content to settle
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          window.print();
          
          // Clean up after print
          setTimeout(() => {
            document.body.classList.remove('print-mode');
          }, 2000);
          break;
        default:
          console.log('Unknown export type:', type);
      }
      
      setExportStatus('Export completed successfully!');
      setTimeout(() => setExportStatus(''), 3000);
      
      // Call custom export handler if provided
      if (onExport) {
        onExport(type);
      }
    } catch (error) {
      console.error(`Export error (${type}):`, error);
      setExportStatus(`Export failed: ${error.message}`);
      setTimeout(() => setExportStatus(''), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    try {
      setExportStatus('Preparing dashboard for PDF export...');
      
      // Find the main dashboard container
      const dashboardContainer = document.querySelector('.dashboard-container, [data-dashboard-content], main, .main-content') || document.body;
      const dashboardId = dashboardContainer.id || 'dashboard-content';
      
      if (!dashboardContainer.id) {
        dashboardContainer.id = dashboardId;
      }
      
      setExportStatus('Using simplified PDF export for better chart rendering...');
      
      // Use the enhanced simplePdfExport utility
      const { simplePdfExport } = await import('../../utils/simplePdfExport');
      
      const result = await simplePdfExport.export(dashboardId, {
        title: dashboardTitle,
        orientation: 'portrait'
      });
      
      if (result.success) {
        setExportStatus(`PDF exported successfully: ${result.filename}`);
      } else {
        throw new Error(result.error || 'PDF export failed');
      }
      
    } catch (error) {
      console.error('PDF export error:', error);
      setExportStatus(`PDF export failed: ${error.message}`);
      throw error;
    }
  };

  const exportToExcel = async () => {
    setExportStatus('Preparing Excel workbook...');
    
    const dataExporter = new DataExporter({
      includeFilters: true,
      includeMetadata: true
    });

    // Extract dashboard data
    const mainData = extractDashboardData();
    const additionalSheets = {
      'Applied Filters': extractFiltersData(),
      'Report Metadata': extractMetadata()
    };

    setExportStatus('Generating Excel file...');
    const filename = `${dashboardTitle.toLowerCase().replace(/\s+/g, '-')}-data-${new Date().toISOString().split('T')[0]}.xlsx`;
    dataExporter.exportToExcel(mainData, filename, additionalSheets);
  };

  const exportToCSV = async () => {
    setExportStatus('Preparing CSV data...');
    
    const dataExporter = new DataExporter({
      includeMetadata: true
    });

    const data = extractDashboardData();
    
    setExportStatus('Generating CSV file...');
    const filename = `${dashboardTitle.toLowerCase().replace(/\s+/g, '-')}-data-${new Date().toISOString().split('T')[0]}.csv`;
    dataExporter.exportToCSV(data, filename);
  };

  const addChartsToPDF = async (pdfExporter) => {
    // Enhanced chart detection for all dashboard types
    const chartSelectors = [
      '[data-chart-id]',
      '[data-chart-title]',
      '[id*="chart"]',
      '.recharts-wrapper',
      '.chart-container',
      '.chart-focusable'
    ];

    let chartCount = 0;
    const foundCharts = new Set(); // Prevent duplicate captures
    
    for (const selector of chartSelectors) {
      const charts = document.querySelectorAll(selector);
      for (const chart of charts) {
        // Get chart identifier - prefer data-chart-id, then id, then generate one
        const chartId = chart.dataset.chartId || chart.id || `chart-${chartCount + 1}`;
        
        // Skip if we've already processed this chart
        if (foundCharts.has(chartId)) continue;
        foundCharts.add(chartId);
        
        chartCount++;
        setExportStatus(`Capturing chart ${chartCount}: ${chartId}...`);
        
        const chartTitle = chart.dataset.chartTitle || chart.getAttribute('aria-label') || chart.querySelector('h3, h2, h1')?.textContent || `Chart ${chartCount}`;
        
        try {
          // Enhanced wait for Recharts specifically
          const isRechartsChart = chart.querySelector('.recharts-wrapper, .recharts-surface');
          if (isRechartsChart) {
            setExportStatus(`Waiting for Recharts to fully render...`);
            
            // Wait for SVG content to be present and non-empty
            let attempts = 0;
            const maxAttempts = 15;
            
            while (attempts < maxAttempts) {
              const svgs = chart.querySelectorAll('svg');
              let allSVGsReady = true;
              
              for (const svg of svgs) {
                const hasChartElements = svg.querySelectorAll('.recharts-bar, .recharts-area, .recharts-line, .recharts-pie, .recharts-text, path, rect, circle').length > 0;
                const hasValidSize = svg.clientWidth > 50 && svg.clientHeight > 50;
                
                if (!hasChartElements || !hasValidSize) {
                  allSVGsReady = false;
                  break;
                }
              }
              
              if (allSVGsReady && svgs.length > 0) {
                console.log(`Chart ${chartId} is ready after ${attempts * 200}ms`);
                break;
              }
              
              attempts++;
              await new Promise(resolve => setTimeout(resolve, 200));
            }
            
            // Extra wait to ensure animations have settled
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            // For non-Recharts components (static charts), shorter wait
            await new Promise(resolve => setTimeout(resolve, 300));
          }
          
          setExportStatus(`Adding chart ${chartCount} to PDF...`);
          
          // Use the simplePdfExport utility for better chart capture
          const { simplePdfExport } = await import('../../utils/simplePdfExport');
          
          // Try to capture just this chart element
          const result = await simplePdfExport.export(chartId, {
            title: chartTitle,
            filename: `temp-chart-${chartCount}.pdf`
          });
          
          if (result.success) {
            console.log(`Successfully captured chart: ${chartId}`);
          } else {
            console.warn(`Failed to capture chart ${chartId}:`, result.error);
          }
          
        } catch (chartError) {
          console.error(`Error capturing chart ${chartId}:`, chartError);
          setExportStatus(`Warning: Chart ${chartCount} may not render correctly in PDF`);
          // Continue with other charts even if one fails
        }
      }
    }
    
    console.log(`Found and processed ${chartCount} chart(s)`);
  };

  const extractDashboardData = () => {
    // Extract actual data from dashboard context or return sample data
    const baseData = {
      'Report Date': new Date().toLocaleDateString(),
      'Dashboard': dashboardTitle,
      'Reporting Period': state?.filters?.reportingPeriod || 'Current',
      'Location': state?.filters?.location || 'All Locations',
      'Division': state?.filters?.division || 'All Divisions',
      'Employee Type': state?.filters?.employeeType || 'All Types',
      'Generated By': 'HR Analytics System',
      'Export Time': new Date().toLocaleString()
    };

    return [baseData];
  };

  const extractFiltersData = () => {
    if (!state?.filters) return [];

    return Object.entries(state.filters)
      .filter(([key, value]) => value && value !== 'all' && value !== '')
      .map(([key, value]) => ({
        'Filter Name': key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        'Filter Value': Array.isArray(value) ? value.join(', ') : value.toString()
      }));
  };

  const extractMetadata = () => {
    return [
      { Property: 'Report Generated', Value: new Date().toLocaleString() },
      { Property: 'Dashboard Type', Value: dashboardTitle },
      { Property: 'User', Value: 'HR Analytics User' },
      { Property: 'Data Source', Value: 'HR Management System' },
      { Property: 'Export Format', Value: 'Excel Workbook' },
      { Property: 'Filters Applied', Value: Object.keys(state?.filters || {}).length.toString() },
      { Property: 'Charts Included', Value: includeCharts ? 'Yes' : 'No' },
      { Property: 'Data Included', Value: includeData ? 'Yes' : 'No' }
    ];
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Export Status */}
      {exportStatus && (
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded shadow-lg z-50 whitespace-nowrap">
          {exportStatus}
        </div>
      )}

      {/* Export Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className={`flex items-center gap-1 px-3 py-1 rounded shadow-sm transition-colors ${
          isExporting 
            ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isExporting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Download size={16} />
        )}
        <span className="text-sm">{isExporting ? 'Exporting...' : 'Export'}</span>
        {!isExporting && (
          <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && !isExporting && (
        <div className="absolute top-full right-0 z-50 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="py-1">
            {exportOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={option.action}
                  className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-start gap-3 transition-colors"
                >
                  <IconComponent size={16} className="text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-gray-500 mt-0.5">{option.description}</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          
          {/* Footer note */}
          <div className="border-t border-gray-200 p-3">
            <p className="text-xs text-gray-500 text-center">
              {dashboardTitle} Export Options
            </p>
            <p className="text-xs text-gray-400 text-center mt-1">
              Includes applied filters and company branding
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportButton; 