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
          window.print();
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
    setExportStatus('Generating PDF...');
    
    const pdfExporter = new PDFExporter({
      orientation: 'portrait',
      includeBranding: true
    });

    // Add header with dashboard title
    const subtitle = state?.filters?.reportingPeriod || state?.filters?.fiscalYear || '';
    pdfExporter.addHeader(dashboardTitle, subtitle);

    // Add filter summary
    if (state?.filters) {
      setExportStatus('Adding filter information...');
      pdfExporter.addFilterSummary(state.filters);
    }

    // Add charts if requested
    if (includeCharts) {
      setExportStatus('Capturing dashboard charts...');
      await addChartsToPDF(pdfExporter);
    }

    // Save PDF
    setExportStatus('Saving PDF file...');
    const filename = `${dashboardTitle.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    await pdfExporter.save(filename);
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
    // Look for chart elements in the current dashboard
    const chartSelectors = [
      '[data-chart-id]',
      '[id*="chart"]',
      '.recharts-wrapper'
    ];

    let chartCount = 0;
    for (const selector of chartSelectors) {
      const charts = document.querySelectorAll(selector);
      for (const chart of charts) {
        if (chart.id || chart.dataset.chartId) {
          chartCount++;
          setExportStatus(`Capturing chart ${chartCount}...`);
          
          const chartId = chart.id || chart.dataset.chartId;
          const chartTitle = chart.dataset.chartTitle || chart.getAttribute('aria-label') || `Chart ${chartCount}`;
          
          // Wait a bit for chart to be fully rendered
          await new Promise(resolve => setTimeout(resolve, 500));
          await pdfExporter.addComponentCapture(chartId, chartTitle);
        }
      }
    }
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