import { useCallback } from 'react';

/**
 * Custom hook for managing dashboard export functionality
 * 
 * Provides standardized export capabilities for PDF, Excel, CSV, and print formats.
 * Uses the sophisticated exportUtils classes for professional output.
 * 
 * @param {Object} config - Export configuration
 * @param {string} config.dashboardTitle - Title for the dashboard
 * @param {Object} config.data - Dashboard data for export
 * @param {Object} config.filters - Current filter state
 * @param {Array} config.chartIds - Array of chart element IDs for PDF capture
 * @param {Object} config.metrics - Metrics data for export
 * @param {string} config.executiveSummary - Executive summary text
 * @returns {Object} Export functions and utilities
 */
const useDashboardExport = ({
  dashboardTitle = 'Dashboard Export',
  data = {},
  filters = {},
  chartIds = [],
  metrics = [],
  executiveSummary = ''
}) => {
  
  /**
   * Generate filter summary string for export headers
   */
  const getFilterSummary = useCallback(() => {
    const filterParts = [];
    
    if (filters.reportingPeriod) {
      filterParts.push(`Period: ${filters.reportingPeriod}`);
    }
    if (filters.location && filters.location !== 'all') {
      filterParts.push(`Location: ${filters.location}`);
    }
    if (filters.division && filters.division !== 'all') {
      filterParts.push(`Division: ${filters.division}`);
    }
    if (filters.employeeType && filters.employeeType !== 'all') {
      filterParts.push(`Employee Type: ${filters.employeeType}`);
    }
    if (filters.dateRange) {
      filterParts.push(`Date Range: ${filters.dateRange}`);
    }
    
    return filterParts.join(' | ') || 'All Filters Applied';
  }, [filters]);

  /**
   * Generate standardized filename with timestamp
   */
  const generateFilename = useCallback((type, customName) => {
    const baseFilename = customName || dashboardTitle
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    const timestamp = new Date().toISOString().slice(0, 10);
    const quarter = filters.reportingPeriod?.toLowerCase() || '';
    
    return `${baseFilename}${quarter ? `-${quarter}` : ''}-${timestamp}.${type}`;
  }, [dashboardTitle, filters.reportingPeriod]);

  /**
   * Export dashboard as PDF using PDFExporter
   */
  const exportPDF = useCallback(async () => {
    try {
      console.log('Exporting PDF with config:', { dashboardTitle, chartIds, filters });
      
      // Dynamic import to avoid loading PDF libraries unless needed
      const { PDFExporter } = await import('../utils/exportUtils');
      
      const pdfExporter = new PDFExporter({
        orientation: 'portrait',
        includeHeader: true,
        includeFooter: true,
        includeBranding: true
      });
      
      // Add header with filter information
      const filterSummary = getFilterSummary();
      pdfExporter.addHeader(dashboardTitle, filterSummary);
      
      // Add metrics if available
      if (metrics && metrics.length > 0) {
        const metricsData = metrics.map(metric => ({
          title: metric.title || metric.label,
          value: metric.value || 0,
          change: metric.change,
          format: metric.changeType || metric.format || 'number'
        }));
        
        pdfExporter.addMetrics(metricsData);
      }
      
      // Capture charts using html2canvas
      for (const chartId of chartIds) {
        const element = document.getElementById(chartId);
        if (element) {
          const title = element.getAttribute('data-chart-title') || chartId;
          await pdfExporter.addComponentCapture(chartId, title);
        } else {
          console.warn(`Chart element with ID '${chartId}' not found`);
        }
      }
      
      // Add executive summary if available
      if (executiveSummary) {
        const summaryParagraphs = Array.isArray(executiveSummary) 
          ? executiveSummary 
          : [executiveSummary];
        
        pdfExporter.addTextSection('Executive Summary', summaryParagraphs);
      }
      
      // Add raw data table if available
      if (data && Object.keys(data).length > 0) {
        // Convert data to table format for PDF
        const tableData = [];
        Object.entries(data).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach(item => {
              tableData.push({ Category: key, ...item });
            });
          }
        });
        
        if (tableData.length > 0) {
          pdfExporter.addDataTable(tableData, null, 'Dashboard Data');
        }
      }
      
      // Save the PDF
      const filename = generateFilename('pdf');
      await pdfExporter.save(filename);
      
      console.log(`PDF exported successfully: ${filename}`);
      return { success: true, filename };
      
    } catch (error) {
      console.error('PDF export error:', error);
      throw new Error(`PDF export failed: ${error.message}`);
    }
  }, [dashboardTitle, chartIds, filters, metrics, executiveSummary, data, getFilterSummary, generateFilename]);

  /**
   * Export dashboard data as Excel
   */
  const exportExcel = useCallback(async () => {
    try {
      console.log('Exporting Excel with data:', data);
      
      const { DataExporter } = await import('../utils/exportUtils');
      const exporter = new DataExporter();
      
      // Prepare Excel data
      const excelData = [];
      
      // Add metrics data
      if (metrics && metrics.length > 0) {
        metrics.forEach(metric => {
          excelData.push({
            Type: 'Metric',
            Name: metric.title || metric.label,
            Value: metric.value || 0,
            Change: metric.change || '',
            'Change Type': metric.changeType || ''
          });
        });
      }
      
      // Add dashboard data
      Object.entries(data).forEach(([category, categoryData]) => {
        if (Array.isArray(categoryData)) {
          categoryData.forEach(item => {
            excelData.push({
              Type: 'Data',
              Category: category,
              ...item
            });
          });
        }
      });
      
      // Fallback to basic metrics if no detailed data
      if (excelData.length === 0 && metrics.length > 0) {
        metrics.forEach(metric => {
          excelData.push({
            Metric: metric.title || metric.label,
            Value: metric.value || 0
          });
        });
      }
      
      const filename = generateFilename('xlsx');
      exporter.exportToExcel(excelData, filename);
      
      console.log(`Excel exported successfully: ${filename}`);
      return { success: true, filename };
      
    } catch (error) {
      console.error('Excel export error:', error);
      throw new Error(`Excel export failed: ${error.message}`);
    }
  }, [data, metrics, generateFilename]);

  /**
   * Export dashboard data as CSV
   */
  const exportCSV = useCallback(async () => {
    try {
      console.log('Exporting CSV with data:', data);
      
      const { DataExporter } = await import('../utils/exportUtils');
      const exporter = new DataExporter();
      
      // Prepare CSV data (similar to Excel but flattened)
      const csvData = [];
      
      if (metrics && metrics.length > 0) {
        metrics.forEach(metric => {
          csvData.push({
            Metric: metric.title || metric.label,
            Value: metric.value || 0,
            Change: metric.change || '',
            'Change Type': metric.changeType || ''
          });
        });
      }
      
      const filename = generateFilename('csv');
      exporter.exportToCSV(csvData, filename);
      
      console.log(`CSV exported successfully: ${filename}`);
      return { success: true, filename };
      
    } catch (error) {
      console.error('CSV export error:', error);
      throw new Error(`CSV export failed: ${error.message}`);
    }
  }, [data, metrics, generateFilename]);

  /**
   * Print dashboard with optimized styling
   */
  const printDashboard = useCallback(() => {
    try {
      console.log('Printing dashboard');
      
      // Add print mode class for specialized styling
      document.body.classList.add('print-mode');
      
      // Trigger browser print
      window.print();
      
      // Remove print mode class after print dialog
      setTimeout(() => {
        document.body.classList.remove('print-mode');
      }, 1000);
      
      return { success: true };
      
    } catch (error) {
      console.error('Print error:', error);
      document.body.classList.remove('print-mode');
      throw new Error(`Print failed: ${error.message}`);
    }
  }, []);

  /**
   * Main export handler that routes to appropriate export function
   */
  const handleExport = useCallback(async (exportType) => {
    try {
      console.log(`Starting ${exportType} export`);
      
      let result;
      switch (exportType.toLowerCase()) {
        case 'pdf':
          result = await exportPDF();
          break;
        case 'excel':
        case 'xlsx':
          result = await exportExcel();
          break;
        case 'csv':
          result = await exportCSV();
          break;
        case 'print':
          result = printDashboard();
          break;
        default:
          throw new Error(`Unknown export type: ${exportType}`);
      }
      
      return result;
      
    } catch (error) {
      console.error(`Export error (${exportType}):`, error);
      
      // Show user-friendly error message
      alert(`Export failed: ${error.message}`);
      
      return { success: false, error: error.message };
    }
  }, [exportPDF, exportExcel, exportCSV, printDashboard]);

  return {
    // Main export function
    handleExport,
    
    // Individual export functions
    exportPDF,
    exportExcel,
    exportCSV,
    printDashboard,
    
    // Utility functions
    getFilterSummary,
    generateFilename
  };
};

export default useDashboardExport;