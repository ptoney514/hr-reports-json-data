/**
 * Enhanced PDF Export Utility for HR Reports Dashboard
 * 
 * Features:
 * - Professional CLARITY header design
 * - High-quality 2x resolution rendering
 * - Automatic pagination and page numbering
 * - Portrait/landscape orientation support
 * - jsPDF with jspdf-autotable integration
 * - Company branding and confidentiality notices
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { formatDate } from './dateHelpers';
import 'jspdf-autotable';

// Professional CLARITY branding configuration
const CLARITY_BRANDING = {
  company: {
    name: 'CLARITY',
    fullName: 'CLARITY HR Analytics',
    tagline: 'Professional HR Analytics & Reporting',
    website: 'www.clarity-hr.com'
  },
  colors: {
    primary: '#1e293b',      // Dark slate
    secondary: '#3b82f6',    // Blue
    accent: '#10b981',       // Emerald
    text: '#374151',         // Gray-700
    lightGray: '#f8fafc',    // Gray-50
    white: '#ffffff'
  },
  header: {
    height: 60,
    logoHeight: 24,
    fontSize: {
      logo: 18,
      title: 16,
      subtitle: 12,
      date: 10
    }
  }
};

// Dashboard type configurations
const DASHBOARD_CONFIGS = {
  turnover: {
    title: 'Employee Turnover Analytics',
    subtitle: 'Workforce Movement & Retention Analysis',
    icon: '📊',
    defaultOrientation: 'landscape'
  },
  workforce: {
    title: 'Workforce Analytics Dashboard',
    subtitle: 'Employee Demographics & Distribution',
    icon: '👥',
    defaultOrientation: 'portrait'
  },
  i9compliance: {
    title: 'I-9 Compliance Health Dashboard',
    subtitle: 'Document Verification & Compliance Tracking',
    icon: '📋',
    defaultOrientation: 'landscape'
  },
  recruiting: {
    title: 'Recruiting Analytics Dashboard',
    subtitle: 'Talent Acquisition Performance Metrics',
    icon: '🎯',
    defaultOrientation: 'portrait'
  },
  exitsurvey: {
    title: 'Exit Survey Analytics',
    subtitle: 'Employee Feedback & Insights',
    icon: '💬',
    defaultOrientation: 'portrait'
  }
};

class PDFExportUtility {
  constructor(options = {}) {
    this.options = {
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
      scale: 2, // High quality 2x resolution
      quality: 2,
      backgroundColor: '#ffffff',
      includeBranding: true,
      includeHeader: true,
      includeFooter: true,
      includePageNumbers: true,
      includeTimestamp: true,
      includeConfidentialNotice: true,
      margins: {
        top: 80,
        right: 40,
        bottom: 60,
        left: 40
      },
      ...options
    };

    this.pdf = null;
    this.currentPage = 1;
    this.pageWidth = 0;
    this.pageHeight = 0;
    this.contentWidth = 0;
    this.contentHeight = 0;
    this.currentY = 0;
  }

  /**
   * Initialize PDF document with proper dimensions
   */
  initializePDF() {
    this.pdf = new jsPDF({
      orientation: this.options.orientation,
      unit: this.options.unit,
      format: this.options.format,
      compress: true
    });

    // Get page dimensions
    this.pageWidth = this.pdf.internal.pageSize.getWidth();
    this.pageHeight = this.pdf.internal.pageSize.getHeight();
    this.contentWidth = this.pageWidth - this.options.margins.left - this.options.margins.right;
    this.contentHeight = this.pageHeight - this.options.margins.top - this.options.margins.bottom;
    this.currentY = this.options.margins.top;

    console.log('PDF initialized:', {
      orientation: this.options.orientation,
      dimensions: `${this.pageWidth}x${this.pageHeight}`,
      contentArea: `${this.contentWidth}x${this.contentHeight}`
    });
  }

  /**
   * Add professional CLARITY header to PDF
   */
  addProfessionalHeader(dashboardType = 'default', customOptions = {}) {
    if (!this.options.includeHeader) return;

    const config = DASHBOARD_CONFIGS[dashboardType] || DASHBOARD_CONFIGS.workforce;
    const headerHeight = CLARITY_BRANDING.header.height;
    
    // Header background with gradient effect
    this.pdf.setFillColor(30, 41, 59); // Dark slate
    this.pdf.rect(0, 0, this.pageWidth, headerHeight, 'F');
    
    // Subtle gradient line
    this.pdf.setFillColor(59, 130, 246); // Blue accent
    this.pdf.rect(0, headerHeight - 3, this.pageWidth, 3, 'F');

    // Company logo/name (left side)
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(CLARITY_BRANDING.header.fontSize.logo);
    this.pdf.setFont('helvetica', 'bold');
    
    // Add icon if available
    const logoText = `${config.icon} ${CLARITY_BRANDING.company.name}`;
    this.pdf.text(logoText, this.options.margins.left, 25);
    
    // Tagline
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(200, 200, 200);
    this.pdf.text(CLARITY_BRANDING.company.tagline, this.options.margins.left, 40);

    // Dashboard title (center)
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(CLARITY_BRANDING.header.fontSize.title);
    this.pdf.setFont('helvetica', 'bold');
    
    const titleText = customOptions.title || config.title;
    const titleWidth = this.pdf.getTextWidth(titleText);
    const titleX = (this.pageWidth - titleWidth) / 2;
    this.pdf.text(titleText, titleX, 25);

    // Subtitle
    if (config.subtitle) {
      this.pdf.setFontSize(CLARITY_BRANDING.header.fontSize.subtitle);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(220, 220, 220);
      
      const subtitleWidth = this.pdf.getTextWidth(config.subtitle);
      const subtitleX = (this.pageWidth - subtitleWidth) / 2;
      this.pdf.text(config.subtitle, subtitleX, 40);
    }

    // Date and page info (right side)
    this.pdf.setFontSize(CLARITY_BRANDING.header.fontSize.date);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(200, 200, 200);
    
    const currentDate = formatDate(new Date(), 'MMMM dd, yyyy');
    const dateText = `Generated: ${currentDate}`;
    const dateWidth = this.pdf.getTextWidth(dateText);
    this.pdf.text(dateText, this.pageWidth - this.options.margins.right - dateWidth, 25);

    if (this.options.includePageNumbers) {
      const pageText = `Page ${this.currentPage}`;
      const pageWidth = this.pdf.getTextWidth(pageText);
      this.pdf.text(pageText, this.pageWidth - this.options.margins.right - pageWidth, 40);
    }

    // Update current Y position
    this.currentY = headerHeight + 20;
  }

  /**
   * Add professional footer with confidentiality notice
   */
  addProfessionalFooter() {
    if (!this.options.includeFooter) return;

    const footerY = this.pageHeight - 40;
    
    // Footer line
    this.pdf.setDrawColor(59, 130, 246); // Blue
    this.pdf.setLineWidth(1);
    this.pdf.line(this.options.margins.left, footerY - 10, 
                  this.pageWidth - this.options.margins.right, footerY - 10);

    // Company info (left)
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    
    const companyInfo = `${CLARITY_BRANDING.company.fullName} | ${CLARITY_BRANDING.company.website}`;
    this.pdf.text(companyInfo, this.options.margins.left, footerY);

    // Confidentiality notice (center)
    if (this.options.includeConfidentialNotice) {
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(220, 38, 38); // Red
      
      const confidentialText = 'CONFIDENTIAL - FOR INTERNAL USE ONLY';
      const confidentialWidth = this.pdf.getTextWidth(confidentialText);
      const confidentialX = (this.pageWidth - confidentialWidth) / 2;
      this.pdf.text(confidentialText, confidentialX, footerY);
    }

    // Timestamp (right)
    if (this.options.includeTimestamp) {
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(100, 100, 100);
      
      const timestamp = new Date().toLocaleString();
      const timestampWidth = this.pdf.getTextWidth(timestamp);
      this.pdf.text(timestamp, this.pageWidth - this.options.margins.right - timestampWidth, footerY);
    }
  }

  /**
   * Wait for charts and dynamic content to be fully rendered
   * Enhanced to support both Recharts (SVG) and static HTML components
   */
  async waitForChartsToRender(element, maxWaitTime = 10000) {
    console.log('Waiting for charts and dynamic content to render...');
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      let allChartsReady = true;
      
      // Check for Recharts components (SVG-based)
      const rechartsContainers = element.querySelectorAll('.recharts-wrapper, .recharts-surface');
      for (const rechartContainer of rechartsContainers) {
        const svgs = rechartContainer.querySelectorAll('svg');
        let rechartsReady = true;
        
        for (const svg of svgs) {
          const hasChartElements = svg.querySelectorAll('.recharts-bar, .recharts-area, .recharts-line, .recharts-pie, .recharts-text').length > 0;
          const hasValidSize = svg.clientWidth > 50 && svg.clientHeight > 50;
          
          if (!hasChartElements || !hasValidSize) {
            rechartsReady = false;
            console.log('Recharts SVG not ready:', svg.clientWidth, svg.clientHeight);
            break;
          }
        }
        
        if (!rechartsReady) {
          allChartsReady = false;
          break;
        }
      }
      
      // Check for static HTML chart containers (tables, progress bars, etc.)
      const staticChartContainers = element.querySelectorAll('[data-chart-title], .chart-container, #turnover-rates-table, #top-exit-reasons-chart');
      for (const chartContainer of staticChartContainers) {
        let staticContentReady = false;
        
        // Check for HTML tables
        const hasTable = chartContainer.querySelector('table');
        if (hasTable) {
          const tableRows = hasTable.querySelectorAll('tr');
          const tableCells = hasTable.querySelectorAll('td, th');
          staticContentReady = tableRows.length > 1 && tableCells.length > 0; // Header + data rows
          
          if (!staticContentReady) {
            console.log('Table not ready:', hasTable, 'rows:', tableRows.length, 'cells:', tableCells.length);
          }
        }
        
        // Check for progress bars (specific to turnover dashboard)
        const hasProgressBars = chartContainer.querySelectorAll('[style*="width:"], .h-8').length > 0;
        if (hasProgressBars && !staticContentReady) {
          const progressElements = chartContainer.querySelectorAll('[style*="width:"]');
          let progressReady = true;
          
          for (const progressEl of progressElements) {
            const style = progressEl.getAttribute('style') || '';
            const hasWidthStyle = style.includes('width:') && !style.includes('width: 0');
            const hasBackgroundColor = style.includes('background') || progressEl.className.includes('bg-');
            
            if (!hasWidthStyle || !hasBackgroundColor) {
              progressReady = false;
              console.log('Progress bar not ready:', progressEl.getAttribute('style'));
              break;
            }
          }
          
          staticContentReady = progressReady;
        }
        
        // Check for substantial text content as fallback
        if (!staticContentReady) {
          const textContent = chartContainer.textContent.trim();
          staticContentReady = textContent.length > 100; // Has meaningful content
        }
        
        if (!staticContentReady) {
          allChartsReady = false;
          console.log('Static chart container not ready:', chartContainer.id || chartContainer.className);
          break;
        }
      }
      
      // Check for loading states
      const hasLoadingSpinners = element.querySelectorAll('.animate-spin, [class*="loading"]').length > 0;
      const hasEmptyStates = element.querySelectorAll('[class*="empty"], .no-data').length > 0;
      
      if (allChartsReady && !hasLoadingSpinners && !hasEmptyStates) {
        console.log('All charts (Recharts and static) appear ready for capture');
        break;
      }
      
      // Wait before checking again
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Additional buffer time for final rendering - longer for static content
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Chart readiness check completed');
  }

  /**
   * Capture dashboard content with high quality
   */
  async captureDashboardContent(elementId) {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID '${elementId}' not found`);
    }

    console.log('Capturing element:', elementId, {
      offsetWidth: element.offsetWidth,
      offsetHeight: element.offsetHeight,
      scrollWidth: element.scrollWidth,
      scrollHeight: element.scrollHeight,
      innerHTML: element.innerHTML.substring(0, 100) + '...'
    });
    
    // Temporarily add PDF export mode class for styling
    document.body.classList.add('pdf-export-mode');
    element.classList.add('pdf-capture-target');

    try {
      // Wait for charts and dynamic content to be fully rendered
      await this.waitForChartsToRender(element);
      
      // Additional wait to ensure all layout calculations are complete
      await new Promise(resolve => setTimeout(resolve, 500));

      // Clone the element for capture to avoid modifying the original
      const clonedElement = element.cloneNode(true);
      clonedElement.id = 'pdf-clone-temp';
      
      // Create a temporary container
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '1200px';
      tempContainer.style.background = 'white';
      tempContainer.appendChild(clonedElement);
      document.body.appendChild(tempContainer);

      // Ensure element has content before capturing
      if (clonedElement.offsetHeight === 0 || clonedElement.offsetWidth === 0) {
        console.error('Element has zero dimensions:', {
          width: clonedElement.offsetWidth,
          height: clonedElement.offsetHeight
        });
        // Try using the original element instead
        document.body.removeChild(tempContainer);
        
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: true,
          width: element.scrollWidth || 1200,
          height: element.scrollHeight || 1600,
          x: 0,
          y: 0,
          scrollX: 0,
          scrollY: 0,
          windowWidth: 1200,
          windowHeight: 1600
        });

        console.log('Canvas captured from original element:', {
          width: canvas.width,
          height: canvas.height
        });

        return canvas;
      }

      const canvas = await html2canvas(clonedElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: true,
        width: clonedElement.scrollWidth || 1200,
        height: clonedElement.scrollHeight || 1600,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1200,
        windowHeight: 1600,
        onclone: function(clonedDoc) {
          // Ensure all dynamic content is visible in the cloned document
          console.log('Cloned document ready for capture');
          
          // Force all progress bars to show their full width
          const progressBars = clonedDoc.querySelectorAll('[style*="width:"]');
          progressBars.forEach(bar => {
            const currentStyle = bar.getAttribute('style');
            if (currentStyle && currentStyle.includes('width:')) {
              // Ensure the width styling is preserved
              bar.style.display = 'block';
              bar.style.visibility = 'visible';
            }
          });
          
          // Ensure tables are fully visible
          const tables = clonedDoc.querySelectorAll('table');
          tables.forEach(table => {
            table.style.width = '100%';
            table.style.visibility = 'visible';
            table.style.display = 'table';
          });
        }
      });

      // Remove temporary container
      document.body.removeChild(tempContainer);

      console.log('Canvas captured:', {
        width: canvas.width,
        height: canvas.height,
        hasContent: canvas.width > 0 && canvas.height > 0
      });

      // Validate canvas has content
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Generated canvas is empty');
      }

      return canvas;
    } catch (error) {
      console.error('Error during canvas capture:', error);
      
      // Fallback: Try a simple capture without cloning
      try {
        console.log('Attempting simple fallback capture...');
        const canvas = await html2canvas(element, {
          scale: 1, // Lower scale for fallback
          backgroundColor: '#ffffff',
          logging: true,
          useCORS: true,
          allowTaint: true,
          width: Math.max(element.offsetWidth, 1200),
          height: Math.max(element.offsetHeight, 800)
        });
        
        if (canvas && canvas.width > 0 && canvas.height > 0) {
          console.log('Simple fallback capture succeeded');
          return canvas;
        } else {
          throw new Error('Fallback canvas is empty');
        }
      } catch (fallbackError) {
        console.error('Fallback capture also failed:', fallbackError);
        throw fallbackError;
      }
    } finally {
      // Clean up classes
      document.body.classList.remove('pdf-export-mode');
      element.classList.remove('pdf-capture-target');
      
      // Clean up any temporary elements
      const tempClone = document.getElementById('pdf-clone-temp');
      if (tempClone && tempClone.parentNode) {
        tempClone.parentNode.removeChild(tempClone);
      }
    }
  }

  /**
   * Add canvas content to PDF with proper scaling and pagination
   */
  addCanvasToPDF(canvas) {
    // Check if canvas has actual content
    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      console.error('Canvas is empty or invalid');
      // Add a placeholder text if canvas is empty
      this.pdf.setFontSize(12);
      this.pdf.text('Error: Unable to capture dashboard content', this.options.margins.left, this.currentY);
      return;
    }

    const imgData = canvas.toDataURL('image/png', 1.0);
    
    // Calculate dimensions to fit content width
    const imgWidth = this.contentWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    console.log('Adding image to PDF:', {
      originalSize: `${canvas.width}x${canvas.height}`,
      pdfSize: `${imgWidth}x${imgHeight}`,
      availableHeight: this.contentHeight,
      currentY: this.currentY,
      margins: this.options.margins
    });

    // Check if content fits on current page
    if (imgHeight <= this.contentHeight) {
      // Single page content
      try {
        this.pdf.addImage(
          imgData, 
          'PNG', 
          this.options.margins.left, 
          this.currentY, 
          imgWidth, 
          imgHeight,
          undefined,
          'FAST'
        );
        console.log('Image added successfully to PDF');
      } catch (error) {
        console.error('Error adding image to PDF:', error);
        // Add error text if image fails
        this.pdf.setFontSize(10);
        this.pdf.text('Error rendering dashboard content', this.options.margins.left, this.currentY + 20);
      }
    } else {
      // Multi-page content - split the image
      this.addMultiPageContent(imgData, canvas.width, canvas.height);
    }
  }

  /**
   * Handle multi-page content by splitting large images
   */
  addMultiPageContent(imgData, originalWidth, originalHeight) {
    const imgWidth = this.contentWidth;
    const totalHeight = (originalHeight * imgWidth) / originalWidth;
    const pageContentHeight = this.contentHeight;
    
    let currentImageY = 0;
    let remainingHeight = totalHeight;
    let pageNum = 1;

    while (remainingHeight > 0) {
      const heightForThisPage = Math.min(pageContentHeight, remainingHeight);
      
      if (pageNum > 1) {
        this.pdf.addPage();
        this.currentPage++;
        this.addProfessionalHeader();
      }

      // Calculate source rectangle for this page
      const srcY = (currentImageY * originalHeight) / totalHeight;
      const srcHeight = (heightForThisPage * originalHeight) / totalHeight;

      // Create a temporary canvas for this page segment
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      
      tempCanvas.width = originalWidth;
      tempCanvas.height = srcHeight;

      const img = new Image();
      img.onload = () => {
        tempCtx.drawImage(
          img, 
          0, srcY, originalWidth, srcHeight,
          0, 0, originalWidth, srcHeight
        );

        const pageImgData = tempCanvas.toDataURL('image/png', 1.0);
        this.pdf.addImage(
          pageImgData,
          'PNG',
          this.options.margins.left,
          this.currentY,
          imgWidth,
          heightForThisPage,
          undefined,
          'FAST'
        );
      };
      
      img.src = imgData;

      currentImageY += heightForThisPage;
      remainingHeight -= heightForThisPage;
      pageNum++;
    }
  }

  /**
   * Export dashboard to PDF with professional formatting
   */
  async exportToPDF(elementId, options = {}) {
    try {
      // Merge options
      this.options = { ...this.options, ...options };
      
      console.log('Starting PDF export with options:', this.options);

      // Initialize PDF
      this.initializePDF();

      // Add header
      const dashboardType = options.dashboardType || 'default';
      this.addProfessionalHeader(dashboardType, options.customHeader);

      // Capture and add dashboard content
      const canvas = await this.captureDashboardContent(elementId);
      this.addCanvasToPDF(canvas);

      // Add footer to all pages
      const pageCount = this.pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        this.pdf.setPage(i);
        this.currentPage = i;
        this.addProfessionalFooter();
      }

      // Generate filename
      const timestamp = formatDate(new Date(), 'yyyy-MM-dd-HHmm');
      const dashboardConfig = DASHBOARD_CONFIGS[dashboardType] || DASHBOARD_CONFIGS.workforce;
      const filename = options.filename || 
        `${dashboardConfig.title.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.pdf`;

      // Save PDF
      this.pdf.save(filename);

      console.log('PDF exported successfully:', filename);
      
      return {
        success: true,
        filename,
        pageCount: this.pdf.internal.getNumberOfPages()
      };

    } catch (error) {
      console.error('PDF export failed:', error);
      throw new Error(`PDF export failed: ${error.message}`);
    }
  }

  /**
   * Get PDF as blob for other operations (email, preview, etc.)
   */
  async exportToPDFBlob(elementId, options = {}) {
    await this.exportToPDF(elementId, { ...options, save: false });
    return this.pdf.output('blob');
  }

  /**
   * Preview PDF before export
   */
  async previewPDF(elementId, options = {}) {
    const blob = await this.exportToPDFBlob(elementId, options);
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    return url;
  }
}

// Utility functions for easy integration
const pdfExporter = {
  /**
   * Quick export with default settings
   */
  exportDashboard: async (elementId, dashboardType = 'default', options = {}) => {
    const exporter = new PDFExportUtility({
      dashboardType,
      orientation: DASHBOARD_CONFIGS[dashboardType]?.defaultOrientation || 'portrait',
      ...options
    });
    
    return await exporter.exportToPDF(elementId, { dashboardType, ...options });
  },

  /**
   * Export with orientation selection
   */
  exportWithOrientation: async (elementId, dashboardType, orientation, options = {}) => {
    const exporter = new PDFExportUtility({
      orientation,
      ...options
    });
    
    return await exporter.exportToPDF(elementId, { dashboardType, ...options });
  },

  /**
   * Preview before export
   */
  previewDashboard: async (elementId, dashboardType = 'default', options = {}) => {
    const exporter = new PDFExportUtility({
      dashboardType,
      orientation: DASHBOARD_CONFIGS[dashboardType]?.defaultOrientation || 'portrait',
      ...options
    });
    
    return await exporter.previewPDF(elementId, { dashboardType, ...options });
  },

  // Expose dashboard configurations
  getDashboardConfig: (type) => DASHBOARD_CONFIGS[type],
  getAllDashboardTypes: () => Object.keys(DASHBOARD_CONFIGS),
  
  // Expose branding for consistency
  getBranding: () => CLARITY_BRANDING
};

export default pdfExporter;
export { PDFExportUtility, DASHBOARD_CONFIGS, CLARITY_BRANDING };