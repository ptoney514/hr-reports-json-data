/**
 * Export Utilities for Dashboard Reports
 * Handles PDF generation, JSON exports, and report formatting
 * Note: Excel functionality disabled - use JSON export instead
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
// import * as XLSX from 'xlsx'; // Disabled - Excel functionality removed
import { saveAs } from 'file-saver';
import { formatDate, formatDateShort, getCurrentQuarter } from './dateHelpers';
import { formatNumber, formatPercentage, formatCurrency } from './dataFormatters';

// Company branding configuration
const COMPANY_BRANDING = {
  name: 'University System HR Analytics',
  logo: '/logo192.png', // Path to company logo
  colors: {
    primary: '#1e40af', // Blue
    secondary: '#059669', // Green
    accent: '#d97706', // Orange
    text: '#374151', // Gray
    light: '#f8fafc' // Light gray
  },
  address: {
    line1: '123 University Drive',
    line2: 'Academic City, State 12345',
    phone: '(555) 123-4567',
    email: 'hr-analytics@university.edu'
  },
  website: 'www.university.edu/hr-analytics'
};

/**
 * PDF Export Class
 */
export class PDFExporter {
  constructor(options = {}) {
    this.options = {
      format: 'a4',
      orientation: 'portrait',
      unit: 'mm',
      margins: { top: 20, right: 15, bottom: 20, left: 15 },
      includeHeader: true,
      includeFooter: true,
      includeBranding: true,
      ...options
    };
    
    this.pdf = new jsPDF({
      orientation: this.options.orientation,
      unit: this.options.unit,
      format: this.options.format
    });
    
    this.pageWidth = this.pdf.internal.pageSize.getWidth();
    this.pageHeight = this.pdf.internal.pageSize.getHeight();
    this.currentY = this.options.margins.top;
  }

  /**
   * Add company header to PDF
   */
  addHeader(title, subtitle = '') {
    if (!this.options.includeHeader) return;

    const headerHeight = 25;
    
    // Background for header
    this.pdf.setFillColor(30, 64, 175); // Blue color
    this.pdf.rect(0, 0, this.pageWidth, headerHeight, 'F');
    
    // Company name
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(COMPANY_BRANDING.name, this.options.margins.left, 12);
    
    // Report title
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(title, this.options.margins.left, 20);
    
    // Date
    const currentDate = formatDate(new Date());
    const dateWidth = this.pdf.getTextWidth(currentDate);
    this.pdf.setFontSize(10);
    this.pdf.text(currentDate, this.pageWidth - this.options.margins.right - dateWidth, 12);
    
    // Subtitle if provided
    if (subtitle) {
      this.pdf.setFontSize(10);
      this.pdf.text(subtitle, this.pageWidth - this.options.margins.right - this.pdf.getTextWidth(subtitle), 20);
    }
    
    this.currentY = headerHeight + 10;
  }

  /**
   * Add company footer to PDF
   */
  addFooter() {
    if (!this.options.includeFooter) return;

    const footerY = this.pageHeight - 15;
    
    // Footer line
    this.pdf.setDrawColor(30, 64, 175);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(this.options.margins.left, footerY - 5, this.pageWidth - this.options.margins.right, footerY - 5);
    
    // Company info
    this.pdf.setTextColor(55, 65, 81);
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    
    const footerText = `${COMPANY_BRANDING.address.line1}, ${COMPANY_BRANDING.address.line2} | ${COMPANY_BRANDING.address.phone} | ${COMPANY_BRANDING.website}`;
    this.pdf.text(footerText, this.options.margins.left, footerY);
    
    // Page number
    const pageNum = `Page ${this.pdf.internal.getNumberOfPages()}`;
    const pageNumWidth = this.pdf.getTextWidth(pageNum);
    this.pdf.text(pageNum, this.pageWidth - this.options.margins.right - pageNumWidth, footerY);
  }

  /**
   * Add filter summary section
   */
  addFilterSummary(filters) {
    if (!filters || Object.keys(filters).length === 0) return;

    this.pdf.setTextColor(55, 65, 81);
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Applied Filters:', this.options.margins.left, this.currentY);
    this.currentY += 8;

    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        const filterText = `• ${this.formatFilterName(key)}: ${this.formatFilterValue(key, value)}`;
        this.pdf.text(filterText, this.options.margins.left + 5, this.currentY);
        this.currentY += 5;
      }
    });
    
    this.currentY += 5;
  }

  /**
   * Format filter names for display
   */
  formatFilterName(key) {
    const nameMap = {
      reportingPeriod: 'Reporting Period',
      location: 'Location',
      division: 'Division',
      employeeType: 'Employee Type',
      fiscalYear: 'Fiscal Year',
      grade: 'Grade',
      dateRange: 'Date Range'
    };
    return nameMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
  }

  /**
   * Format filter values for display
   */
  formatFilterValue(key, value) {
    if (key === 'dateRange' && typeof value === 'object') {
      return `${formatDateShort(value.start)} - ${formatDateShort(value.end)}`;
    }
    return Array.isArray(value) ? value.join(', ') : value;
  }

  /**
   * Add summary metrics section
   */
  addSummaryMetrics(metrics) {
    if (!metrics || metrics.length === 0) return;

    this.pdf.setTextColor(COMPANY_BRANDING.colors.text);
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Key Metrics:', this.options.margins.left, this.currentY);
    this.currentY += 10;

    // Create metrics table
    const metricsPerRow = 2;
    const colWidth = (this.pageWidth - this.options.margins.left - this.options.margins.right) / metricsPerRow;
    
    metrics.forEach((metric, index) => {
      const row = Math.floor(index / metricsPerRow);
      const col = index % metricsPerRow;
      const x = this.options.margins.left + (col * colWidth);
      const y = this.currentY + (row * 25);

      // Metric box
      this.pdf.setFillColor(COMPANY_BRANDING.colors.light);
      this.pdf.rect(x, y - 5, colWidth - 5, 20, 'F');
      
      // Metric title
      this.pdf.setFontSize(9);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(COMPANY_BRANDING.colors.text);
      this.pdf.text(metric.title, x + 3, y + 2);
      
      // Metric value
      this.pdf.setFontSize(14);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(COMPANY_BRANDING.colors.primary);
      this.pdf.text(this.formatMetricValue(metric), x + 3, y + 10);
      
      // Change indicator
      if (metric.change) {
        this.pdf.setFontSize(8);
        this.pdf.setTextColor(metric.change > 0 ? '#059669' : '#dc2626');
        const changeText = `${metric.change > 0 ? '+' : ''}${formatPercentage(metric.change)}`;
        this.pdf.text(changeText, x + 3, y + 14);
      }
    });

    const rows = Math.ceil(metrics.length / metricsPerRow);
    this.currentY += (rows * 25) + 10;
  }

  /**
   * Format metric values based on type
   */
  formatMetricValue(metric) {
    switch (metric.format) {
      case 'currency':
        return formatCurrency(metric.value);
      case 'percentage':
        return formatPercentage(metric.value);
      case 'number':
        return formatNumber(metric.value);
      default:
        return metric.value.toString();
    }
  }

  /**
   * Capture and add chart/component to PDF
   */
  async addComponentCapture(elementId, title = '') {
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`Element with ID ${elementId} not found`);
      return;
    }

    try {
      // Add title if provided
      if (title) {
        this.pdf.setTextColor(55, 65, 81);
        this.pdf.setFontSize(12);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.text(title, this.options.margins.left, this.currentY);
        this.currentY += 10;
      }

      // Capture element as canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Calculate dimensions to fit page
      const imgWidth = this.pageWidth - this.options.margins.left - this.options.margins.right;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Check if we need a new page
      if (this.currentY + imgHeight > this.pageHeight - this.options.margins.bottom - 20) {
        this.pdf.addPage();
        this.currentY = this.options.margins.top;
      }

      // Add image to PDF
      const imgData = canvas.toDataURL('image/png');
      this.pdf.addImage(imgData, 'PNG', this.options.margins.left, this.currentY, imgWidth, imgHeight);
      
      this.currentY += imgHeight + 10;
    } catch (error) {
      console.error('Error capturing component:', error);
      
      // Add error message to PDF
      this.pdf.setTextColor(220, 38, 38);
      this.pdf.setFontSize(10);
      this.pdf.text(`Error capturing ${title || 'component'}: ${error.message}`, this.options.margins.left, this.currentY);
      this.currentY += 15;
    }
  }

  /**
   * Add data table to PDF
   */
  addDataTable(data, columns, title = '') {
    if (!data || data.length === 0) return;

    // Add title if provided
    if (title) {
      this.pdf.setTextColor(COMPANY_BRANDING.colors.text);
      this.pdf.setFontSize(12);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(title, this.options.margins.left, this.currentY);
      this.currentY += 10;
    }

    const tableWidth = this.pageWidth - this.options.margins.left - this.options.margins.right;
    const colWidth = tableWidth / columns.length;
    const rowHeight = 8;

    // Table headers
    this.pdf.setFillColor(COMPANY_BRANDING.colors.primary);
    this.pdf.rect(this.options.margins.left, this.currentY - 5, tableWidth, rowHeight, 'F');
    
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(9);
    this.pdf.setFont('helvetica', 'bold');
    
    columns.forEach((col, index) => {
      const x = this.options.margins.left + (index * colWidth) + 2;
      this.pdf.text(col.header, x, this.currentY);
    });
    
    this.currentY += rowHeight;

    // Table rows
    this.pdf.setTextColor(COMPANY_BRANDING.colors.text);
    this.pdf.setFont('helvetica', 'normal');
    
    data.slice(0, 20).forEach((row, rowIndex) => { // Limit to 20 rows
      if (this.currentY > this.pageHeight - this.options.margins.bottom - 30) {
        this.pdf.addPage();
        this.currentY = this.options.margins.top;
      }

      // Alternating row colors
      if (rowIndex % 2 === 1) {
        this.pdf.setFillColor(248, 250, 252);
        this.pdf.rect(this.options.margins.left, this.currentY - 5, tableWidth, rowHeight, 'F');
      }

      columns.forEach((col, colIndex) => {
        const x = this.options.margins.left + (colIndex * colWidth) + 2;
        const value = this.formatTableValue(row[col.key], col.format);
        this.pdf.text(value, x, this.currentY);
      });
      
      this.currentY += rowHeight;
    });

    if (data.length > 20) {
      this.pdf.setFontSize(8);
      this.pdf.setTextColor('#6b7280');
      this.pdf.text(`... and ${data.length - 20} more rows`, this.options.margins.left, this.currentY + 5);
    }

    this.currentY += 15;
  }

  /**
   * Format table values based on column format
   */
  formatTableValue(value, format) {
    if (value === null || value === undefined) return '';
    
    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return formatPercentage(value);
      case 'number':
        return formatNumber(value);
      case 'date':
        return formatDateShort(value);
      default:
        return value.toString();
    }
  }

  /**
   * Generate and save PDF
   */
  async save(filename) {
    // Add footer to all pages
    const pageCount = this.pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.pdf.setPage(i);
      this.addFooter();
    }

    // Save PDF
    const finalFilename = filename || `dashboard-report-${formatDate(new Date(), 'YYYY-MM-DD')}.pdf`;
    this.pdf.save(finalFilename);
  }

  /**
   * Get PDF as blob for other operations
   */
  getBlob() {
    return this.pdf.output('blob');
  }
}

/**
 * JSON/CSV Export Class (Excel functionality disabled)
 */
export class DataExporter {
  constructor(options = {}) {
    this.options = {
      includeFilters: true,
      includeMetadata: true,
      sheetName: 'Dashboard Data',
      ...options
    };
  }

  /**
   * Export data to Excel format
   */
  exportToExcel(data, filename, additionalSheets = {}) {
    console.warn('Excel export disabled - use JSON export instead');
    return { success: false, message: 'Excel export disabled - use JSON export instead' };
  }

  /**
   * Export data to CSV format
   */
  exportToCSV(data, filename) {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    // Convert data to CSV
    const csv = this.convertToCSV(data);
    
    // Create and save file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const finalFilename = filename || `dashboard-data-${formatDate(new Date(), 'YYYY-MM-DD')}.csv`;
    saveAs(blob, finalFilename);
  }

  /**
   * Create worksheet with metadata and branding
   */
  createWorksheet(data) {
    console.warn('Excel worksheet creation disabled');
    return null;
  }

  /**
   * Add metadata and branding to worksheet
   */
  addWorksheetMetadata(worksheet) {
    console.warn('Excel worksheet metadata disabled');
    return;
    /*
    // Insert company branding at the top
    const brandingRows = [
      [COMPANY_BRANDING.name],
      [`Report generated on: ${formatDate(new Date())}`],
      [`Generated by: ${COMPANY_BRANDING.website}`],
      [] // Empty row for spacing
    ];

    // Shift existing data down
    const existingRange = XLSX.utils.decode_range(worksheet['!ref']);
    const newRange = {
      s: { r: 0, c: 0 },
      e: { r: existingRange.e.r + brandingRows.length, c: existingRange.e.c }
    };

    // Move existing data
    for (let row = existingRange.e.r; row >= existingRange.s.r; row--) {
      for (let col = existingRange.s.c; col <= existingRange.e.c; col++) {
        const oldAddr = XLSX.utils.encode_cell({ r: row, c: col });
        const newAddr = XLSX.utils.encode_cell({ r: row + brandingRows.length, c: col });
        if (worksheet[oldAddr]) {
          worksheet[newAddr] = worksheet[oldAddr];
          delete worksheet[oldAddr];
        }
      }
    }

    // Add branding rows
    brandingRows.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const addr = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
        worksheet[addr] = { v: cell, t: 's' };
      });
    });

    worksheet['!ref'] = XLSX.utils.encode_range(newRange);
    */
  }

  /**
   * Convert data array to CSV string
   */
  convertToCSV(data) {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Add company branding header
    if (this.options.includeMetadata) {
      csvRows.push(`"${COMPANY_BRANDING.name}"`);
      csvRows.push(`"Report generated on: ${formatDate(new Date())}"`);
      csvRows.push(`"Generated by: ${COMPANY_BRANDING.website}"`);
      csvRows.push(''); // Empty row
    }

    // Add headers
    csvRows.push(headers.map(header => `"${header}"`).join(','));

    // Add data rows
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '""';
        return `"${value.toString().replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  }
}

/**
 * Main Export Manager
 */
export class ExportManager {
  constructor(dashboardContext) {
    this.context = dashboardContext;
    this.pdfExporter = null;
    this.dataExporter = new DataExporter();
  }

  /**
   * Export dashboard as PDF
   */
  async exportDashboardPDF(options = {}) {
    const {
      title = 'Dashboard Report',
      subtitle = '',
      includeCharts = true,
      includeData = true,
      filename = null
    } = options;

    try {
      this.pdfExporter = new PDFExporter({
        orientation: 'portrait',
        includeBranding: true
      });

      // Add header
      this.pdfExporter.addHeader(title, subtitle);

      // Add filter summary
      if (this.context?.state?.filters) {
        this.pdfExporter.addFilterSummary(this.context.state.filters);
      }

      // Add summary metrics
      const metrics = this.extractSummaryMetrics();
      if (metrics.length > 0) {
        this.pdfExporter.addSummaryMetrics(metrics);
      }

      // Add charts if requested
      if (includeCharts) {
        await this.addChartsToPDF();
      }

      // Add data tables if requested
      if (includeData) {
        await this.addDataTablesToPDF();
      }

      // Save PDF
      await this.pdfExporter.save(filename);
      
      return { success: true, message: 'PDF exported successfully' };
    } catch (error) {
      console.error('PDF export error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Export dashboard data to Excel
   */
  async exportDashboardExcel(options = {}) {
    console.warn('Excel export disabled - use JSON export instead');
    return { success: false, message: 'Excel export disabled - use JSON export instead' };
    /*
    const {
      filename = null,
      includeCharts = false // Charts as images in Excel require additional processing
    } = options;

    try {
      const data = this.extractDashboardData();
      const additionalSheets = this.extractAdditionalSheets();
      
      this.dataExporter.exportToExcel(data, filename, additionalSheets);
      
      return { success: true, message: 'Excel file exported successfully' };
    } catch (error) {
      console.error('Excel export error:', error);
      return { success: false, error: error.message };
    }
    */
  }

  /**
   * Export dashboard data to CSV
   */
  async exportDashboardCSV(options = {}) {
    const { filename = null } = options;

    try {
      const data = this.extractDashboardData();
      this.dataExporter.exportToCSV(data, filename);
      
      return { success: true, message: 'CSV file exported successfully' };
    } catch (error) {
      console.error('CSV export error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Extract summary metrics from dashboard
   */
  extractSummaryMetrics() {
    // This would be customized based on your dashboard structure
    // For now, return sample metrics
    return [
      {
        title: 'Total Employees',
        value: 2847,
        format: 'number',
        change: 0.025
      },
      {
        title: 'Vacancy Rate',
        value: 0.035,
        format: 'percentage',
        change: -0.005
      },
      {
        title: 'Turnover Rate',
        value: 0.125,
        format: 'percentage',
        change: -0.015
      },
      {
        title: 'Avg. Tenure',
        value: 8.5,
        format: 'number',
        change: 0.1
      }
    ];
  }

  /**
   * Add charts to PDF
   */
  async addChartsToPDF() {
    const chartIds = [
      'headcount-chart',
      'turnover-chart',
      'location-chart',
      'divisions-chart'
    ];

    for (const chartId of chartIds) {
      const element = document.getElementById(chartId);
      if (element) {
        const title = element.getAttribute('data-chart-title') || '';
        await this.pdfExporter.addComponentCapture(chartId, title);
      }
    }
  }

  /**
   * Add data tables to PDF
   */
  async addDataTablesToPDF() {
    // Sample data table - customize based on your data structure
    const sampleData = [
      { division: 'Academic Affairs', employees: 567, vacancies: 12, rate: '2.1%' },
      { division: 'Student Affairs', employees: 234, vacancies: 8, rate: '3.4%' },
      { division: 'Research & Innovation', employees: 189, vacancies: 5, rate: '2.6%' }
    ];

    const columns = [
      { header: 'Division', key: 'division' },
      { header: 'Employees', key: 'employees', format: 'number' },
      { header: 'Vacancies', key: 'vacancies', format: 'number' },
      { header: 'Vacancy Rate', key: 'rate' }
    ];

    this.pdfExporter.addDataTable(sampleData, columns, 'Division Summary');
  }

  /**
   * Extract main dashboard data for export
   */
  extractDashboardData() {
    // This would extract actual data from your dashboard context
    // For now, return sample data
    return [
      {
        Period: 'Q2-2025',
        'Total Employees': 2847,
        Faculty: 1234,
        Staff: 1456,
        Students: 157,
        'Vacancy Rate': '3.5%',
        'Turnover Rate': '12.5%'
      }
    ];
  }

  /**
   * Extract additional sheets data
   */
  extractAdditionalSheets() {
    return {
      'Filters Applied': this.extractFiltersData(),
      'Metadata': this.extractMetadata()
    };
  }

  /**
   * Extract filters data for export
   */
  extractFiltersData() {
    if (!this.context?.state?.filters) return [];

    return Object.entries(this.context.state.filters)
      .filter(([key, value]) => value && value !== 'all' && value !== '')
      .map(([key, value]) => ({
        Filter: key,
        Value: Array.isArray(value) ? value.join(', ') : value
      }));
  }

  /**
   * Extract metadata for export
   */
  extractMetadata() {
    return [
      {
        Property: 'Report Generated',
        Value: formatDate(new Date())
      },
      {
        Property: 'Generated By',
        Value: COMPANY_BRANDING.name
      },
      {
        Property: 'Data Source',
        Value: 'HR Analytics System'
      },
      {
        Property: 'Report Type',
        Value: 'Dashboard Export'
      }
    ];
  }
}

// Utility functions for common export operations
export const exportUtils = {
  /**
   * Quick PDF export of current dashboard
   */
  quickPDFExport: async (title = 'Dashboard Report') => {
    const manager = new ExportManager();
    return await manager.exportDashboardPDF({ title });
  },

  /**
   * Quick Excel export of current dashboard
   */
  quickExcelExport: async () => {
    console.warn('Excel export disabled - use JSON export instead');
    return { success: false, message: 'Excel export disabled - use JSON export instead' };
  },

  /**
   * Quick CSV export of current dashboard
   */
  quickCSVExport: async () => {
    const manager = new ExportManager();
    return await manager.exportDashboardCSV();
  },

  /**
   * Export specific chart as PDF
   */
  exportChartPDF: async (chartId, title) => {
    const pdfExporter = new PDFExporter();
    pdfExporter.addHeader(title);
    await pdfExporter.addComponentCapture(chartId, title);
    await pdfExporter.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  },

  /**
   * Get export filename with timestamp
   */
  getTimestampedFilename: (base, extension) => {
    const timestamp = formatDate(new Date(), 'YYYY-MM-DD-HHmm');
    return `${base}-${timestamp}.${extension}`;
  }
};

export default {
  PDFExporter,
  DataExporter,
  ExportManager,
  exportUtils,
  COMPANY_BRANDING
}; 