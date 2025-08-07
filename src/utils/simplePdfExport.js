/**
 * Simplified PDF Export Utility
 * 
 * This utility provides a robust approach to PDF export with multiple fallbacks:
 * 1. Primary: html2canvas with detailed debugging
 * 2. Secondary: Simple html2canvas with minimal options
 * 3. Tertiary: window.print() as final fallback
 * 
 * Features:
 * - Extensive error handling and logging
 * - Multiple capture strategies
 * - Validation of elements and content
 * - Graceful fallbacks when primary methods fail
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { formatDate } from './dateHelpers';

class SimplePDFExporter {
  constructor(options = {}) {
    this.options = {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: true,
      timeout: 30000, // 30 second timeout
      retryAttempts: 3,
      ...options
    };
    
    this.debugMode = true;
    this.log('SimplePDFExporter initialized', this.options);
  }

  /**
   * Enhanced logging function
   */
  log(message, data = null) {
    if (this.debugMode) {
      console.log(`[SimplePDFExporter] ${message}`, data || '');
    }
  }

  /**
   * Error logging function
   */
  logError(message, error = null) {
    console.error(`[SimplePDFExporter ERROR] ${message}`, error || '');
  }

  /**
   * Validate element exists and has content
   */
  validateElement(elementId) {
    this.log(`Validating element: ${elementId}`);
    
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID '${elementId}' not found`);
    }

    // Check element dimensions
    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);
    
    this.log('Element validation details:', {
      id: elementId,
      exists: !!element,
      offsetWidth: element.offsetWidth,
      offsetHeight: element.offsetHeight,
      scrollWidth: element.scrollWidth,
      scrollHeight: element.scrollHeight,
      boundingRect: rect,
      display: computedStyle.display,
      visibility: computedStyle.visibility,
      opacity: computedStyle.opacity,
      innerHTML: element.innerHTML.substring(0, 200) + '...'
    });

    // Check if element is visible
    if (computedStyle.display === 'none') {
      throw new Error(`Element '${elementId}' is hidden (display: none)`);
    }

    if (computedStyle.visibility === 'hidden') {
      throw new Error(`Element '${elementId}' is hidden (visibility: hidden)`);
    }

    // Check if element has dimensions
    if (element.offsetWidth === 0 && element.offsetHeight === 0) {
      this.log('Warning: Element has zero dimensions, checking scroll dimensions...');
      if (element.scrollWidth === 0 && element.scrollHeight === 0) {
        throw new Error(`Element '${elementId}' has zero dimensions`);
      }
    }

    // Check if element has content
    const hasTextContent = element.textContent && element.textContent.trim().length > 0;
    const hasChildElements = element.children && element.children.length > 0;
    
    if (!hasTextContent && !hasChildElements) {
      this.log('Warning: Element appears to have no content');
    }

    return element;
  }

  /**
   * Wait for element to be ready including charts and dynamic content
   */
  async waitForElement(element, maxWait = 15000) {
    this.log('Waiting for element to be ready...');
    
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWait) {
      // Check if charts/images are loaded
      const images = element.querySelectorAll('img');
      const svgs = element.querySelectorAll('svg');
      
      let allImagesLoaded = true;
      for (const img of images) {
        if (!img.complete) {
          allImagesLoaded = false;
          break;
        }
      }

      // Enhanced SVG readiness check for Recharts
      let allSVGsReady = true;
      for (const svg of svgs) {
        // Check if SVG has meaningful content (not just empty or loading)
        const hasElements = svg.children.length > 0;
        const hasPaths = svg.querySelectorAll('path, rect, circle, line, text').length > 0;
        const hasValidDimensions = svg.clientWidth > 0 && svg.clientHeight > 0;
        
        if (!hasElements || !hasPaths || !hasValidDimensions) {
          allSVGsReady = false;
          this.log('SVG not ready:', { hasElements, hasPaths, hasValidDimensions, width: svg.clientWidth, height: svg.clientHeight });
          break;
        }
      }

      // Enhanced chart container readiness check - supports both Recharts and static HTML
      const chartContainers = element.querySelectorAll('[data-chart-title], [data-chart-id], .chart-container, .recharts-wrapper, #turnover-rates-table, #top-exit-reasons-chart');
      let allChartsReady = true;
      
      for (const chartContainer of chartContainers) {
        let chartReady = false;
        
        // Check for HTML table content (TurnoverRatesTable)
        const hasTable = chartContainer.querySelector('table');
        if (hasTable) {
          const tableRows = hasTable.querySelectorAll('tr');
          const tableCells = hasTable.querySelectorAll('td, th');
          const hasTableData = tableRows.length > 1 && tableCells.length > 0; // Header + data
          
          if (hasTableData) {
            // Check if table cells have content
            let cellsHaveContent = true;
            const dataCells = hasTable.querySelectorAll('td');
            for (const cell of dataCells) {
              if (cell.textContent.trim().length === 0) {
                cellsHaveContent = false;
                break;
              }
            }
            chartReady = cellsHaveContent;
            
            if (!chartReady) {
              this.log('Table has structure but cells lack content:', chartContainer.id || 'unnamed table');
            }
          } else {
            this.log('Table structure not ready:', chartContainer.id || 'unnamed table', { rows: tableRows.length, cells: tableCells.length });
          }
        }
        
        // Check for progress bar content (TopExitReasonsStatic)
        if (!chartReady) {
          const hasProgressBars = chartContainer.querySelectorAll('[style*="width:"], .h-8').length > 0;
          if (hasProgressBars) {
            const progressElements = chartContainer.querySelectorAll('[style*="width:"]');
            let progressBarsReady = true;
            
            for (const progressEl of progressElements) {
              const style = progressEl.getAttribute('style') || '';
              const hasValidWidth = style.includes('width:') && !style.includes('width: 0%') && !style.includes('width: 0px');
              const hasBackgroundColor = style.includes('background') || progressEl.className.includes('bg-');
              
              if (!hasValidWidth || !hasBackgroundColor) {
                progressBarsReady = false;
                this.log('Progress bar not ready:', progressEl.getAttribute('style'));
                break;
              }
            }
            
            // Also check for progress bar labels/text
            const hasProgressLabels = chartContainer.querySelectorAll('span').length > 0;
            const hasProgressData = chartContainer.textContent.includes('%') || chartContainer.textContent.length > 100;
            
            chartReady = progressBarsReady && hasProgressLabels && hasProgressData;
            
            if (!chartReady) {
              this.log('Progress bars not fully ready:', chartContainer.id || 'unnamed progress chart', { 
                progressBarsReady, 
                hasProgressLabels, 
                hasProgressData,
                textLength: chartContainer.textContent.length 
              });
            }
          }
        }
        
        // Check for Recharts/SVG content (existing logic)
        if (!chartReady) {
          const hasRechartsContent = chartContainer.querySelectorAll('.recharts-surface, .recharts-layer').length > 0;
          const hasSVGContent = chartContainer.querySelectorAll('svg').length > 0;
          
          if (hasSVGContent || hasRechartsContent) {
            const svgsInChart = chartContainer.querySelectorAll('svg');
            let chartSVGsReady = true;
            
            for (const svg of svgsInChart) {
              const hasChartElements = svg.querySelectorAll('.recharts-bar, .recharts-area, .recharts-line, .recharts-pie, .recharts-text').length > 0;
              const hasValidSize = svg.clientWidth > 50 && svg.clientHeight > 50; // Minimum reasonable chart size
              
              if (!hasChartElements || !hasValidSize) {
                chartSVGsReady = false;
                this.log('Chart SVG not ready:', chartContainer.id || 'unnamed', { hasChartElements, width: svg.clientWidth, height: svg.clientHeight });
                break;
              }
            }
            
            chartReady = chartSVGsReady;
          }
        }
        
        // Fallback check for substantial text content
        if (!chartReady) {
          const hasTextContent = chartContainer.textContent.trim().length > 100; // Substantial content
          chartReady = hasTextContent;
          
          if (!chartReady) {
            this.log('Chart container lacks content entirely:', chartContainer.id || 'unnamed', { 
              textLength: chartContainer.textContent.trim().length,
              className: chartContainer.className 
            });
          }
        }
        
        if (!chartReady) {
          allChartsReady = false;
          break;
        }
      }

      // Check for loading states and animations
      const hasLoadingSpinners = element.querySelectorAll('.animate-spin, [class*="loading"]').length > 0;
      const hasActiveAnimations = element.querySelectorAll('[class*="animate-"]').length > 0;
      
      if (allImagesLoaded && allSVGsReady && allChartsReady && !hasLoadingSpinners) {
        this.log('All content appears ready');
        
        // If there were animations, wait a bit longer for them to settle
        if (hasActiveAnimations) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Extended wait specifically for SVG-based charts to fully render
    const hasSVGCharts = element.querySelectorAll('.recharts-wrapper, .recharts-surface').length > 0;
    if (hasSVGCharts) {
      this.log('Detected SVG charts, extending wait time for full render...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      // Standard additional wait for other content
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    this.log('Element readiness check completed');
  }

  /**
   * Primary capture method using html2canvas with detailed options
   */
  async captureWithHtml2Canvas(element, options = {}) {
    this.log('Attempting primary capture with html2canvas');
    
    // Apply PDF-specific classes for better capture
    const originalClasses = element.className;
    element.classList.add('pdf-export-mode', 'pdf-capture-target');
    
    // Disable animations and transitions for stable capture
    const style = document.createElement('style');
    style.textContent = `
      .pdf-export-mode * {
        animation-duration: 0s !important;
        transition-duration: 0s !important;
        animation-delay: 0s !important;
        transition-delay: 0s !important;
      }
      .pdf-export-mode .recharts-wrapper,
      .pdf-export-mode .recharts-surface {
        background: white !important;
      }
    `;
    document.head.appendChild(style);
    
    try {
      // Force a repaint to apply the new styles
      void element.offsetHeight;
      
      // Additional wait for style application
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const captureOptions = {
        scale: this.options.scale,
        useCORS: this.options.useCORS,
        allowTaint: this.options.allowTaint,
        backgroundColor: this.options.backgroundColor,
        logging: false, // We handle our own logging
        width: Math.max(element.offsetWidth, element.scrollWidth, 1200),
        height: Math.max(element.offsetHeight, element.scrollHeight, 800),
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        // Enhanced options for SVG rendering
        foreignObjectRendering: true,
        imageTimeout: 5000,
        removeContainer: false,
        ...options
      };

      this.log('Capture options:', captureOptions);

      const canvas = await html2canvas(element, captureOptions);
      
      this.log('Canvas created:', {
        width: canvas.width,
        height: canvas.height,
        hasData: canvas.width > 0 && canvas.height > 0
      });

      // Validate canvas has content
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Generated canvas has zero dimensions');
      }

      // Enhanced content validation - check multiple regions
      const ctx = canvas.getContext('2d');
      let hasValidContent = false;
      
      // Check multiple regions of the canvas for content
      const regions = [
        { x: 0, y: 0, w: Math.min(canvas.width, 100), h: Math.min(canvas.height, 100) }, // Top-left
        { x: Math.floor(canvas.width / 2) - 50, y: Math.floor(canvas.height / 2) - 50, w: 100, h: 100 }, // Center
        { x: Math.max(0, canvas.width - 100), y: Math.max(0, canvas.height - 100), w: 100, h: 100 } // Bottom-right
      ];
      
      for (const region of regions) {
        try {
          const imageData = ctx.getImageData(region.x, region.y, region.w, region.h);
          const hasPixels = imageData.data.some((pixel, index) => {
            // Check if it's not just white or transparent
            if (index % 4 === 3) return false; // Skip alpha channel
            return pixel !== 255 && pixel !== 0;
          });
          
          if (hasPixels) {
            hasValidContent = true;
            break;
          }
        } catch (regionError) {
          // Continue checking other regions if one fails
          continue;
        }
      }

      if (!hasValidContent) {
        this.log('Warning: Canvas appears to be blank or only contains white/transparent pixels');
      }

      return canvas;
    } catch (error) {
      this.logError('Primary capture failed', error);
      throw error;
    } finally {
      // Clean up: restore original classes and remove temporary styles
      element.className = originalClasses;
      document.head.removeChild(style);
    }
  }

  /**
   * Secondary capture method with minimal options
   */
  async captureWithMinimalOptions(element) {
    this.log('Attempting secondary capture with minimal options');
    
    try {
      const canvas = await html2canvas(element, {
        scale: 1,
        backgroundColor: '#ffffff',
        logging: false
      });

      this.log('Minimal capture successful:', {
        width: canvas.width,
        height: canvas.height
      });

      return canvas;
    } catch (error) {
      this.logError('Secondary capture failed', error);
      throw error;
    }
  }

  /**
   * Tertiary method: Clone element and capture
   */
  async captureClonedElement(element) {
    this.log('Attempting tertiary capture with cloned element');
    
    let tempContainer = null;
    
    try {
      // Create a temporary container
      tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '1200px';
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.padding = '20px';
      
      // Clone the element
      const clonedElement = element.cloneNode(true);
      clonedElement.id = 'pdf-clone-' + Date.now();
      
      tempContainer.appendChild(clonedElement);
      document.body.appendChild(tempContainer);
      
      // Wait for clone to render
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const canvas = await html2canvas(clonedElement, {
        scale: 1,
        backgroundColor: '#ffffff',
        width: 1200,
        height: Math.max(clonedElement.scrollHeight, 800)
      });

      this.log('Cloned element capture successful:', {
        width: canvas.width,
        height: canvas.height
      });

      return canvas;
    } catch (error) {
      this.logError('Tertiary capture failed', error);
      throw error;
    } finally {
      // Clean up temporary container
      if (tempContainer && document.body.contains(tempContainer)) {
        document.body.removeChild(tempContainer);
      }
    }
  }

  /**
   * Main capture method with multiple fallbacks
   */
  async captureElement(elementId) {
    this.log(`Starting capture process for element: ${elementId}`);
    
    const element = this.validateElement(elementId);
    
    // Wait for element to be ready
    await this.waitForElement(element);
    
    const strategies = [
      () => this.captureWithHtml2Canvas(element),
      () => this.captureWithMinimalOptions(element),
      () => this.captureClonedElement(element)
    ];

    let lastError = null;
    
    for (let i = 0; i < strategies.length; i++) {
      try {
        this.log(`Attempting capture strategy ${i + 1}/${strategies.length}`);
        const canvas = await strategies[i]();
        
        if (canvas && canvas.width > 0 && canvas.height > 0) {
          this.log(`Capture strategy ${i + 1} successful`);
          return canvas;
        } else {
          throw new Error('Canvas is empty or invalid');
        }
      } catch (error) {
        this.logError(`Capture strategy ${i + 1} failed`, error);
        lastError = error;
        
        // Wait before trying next strategy
        if (i < strategies.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    throw new Error(`All capture strategies failed. Last error: ${lastError?.message}`);
  }

  /**
   * Create PDF from canvas
   */
  createPDFFromCanvas(canvas, options = {}) {
    this.log('Creating PDF from canvas');
    
    const {
      orientation = 'portrait',
      title = 'Dashboard Report',
      filename = null
    } = options;
    
    try {
      // Create PDF with appropriate orientation
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: 'a4'
      });

      // Get PDF dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margins = 15;
      const contentWidth = pdfWidth - (margins * 2);
      
      // Add header
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, margins, 20);
      
      // Add date
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const dateStr = formatDate(new Date(), 'MMMM dd, yyyy');
      pdf.text(`Generated: ${dateStr}`, margins, 30);
      
      // Calculate image dimensions
      const imgAspectRatio = canvas.width / canvas.height;
      let imgWidth = contentWidth;
      let imgHeight = imgWidth / imgAspectRatio;
      
      // Check if image fits on page
      const maxImageHeight = pdfHeight - 50 - margins; // Leave space for header and footer
      if (imgHeight > maxImageHeight) {
        imgHeight = maxImageHeight;
        imgWidth = imgHeight * imgAspectRatio;
      }

      // Convert canvas to image data
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', margins, 40, imgWidth, imgHeight);
      
      // Add footer
      const footerY = pdfHeight - 10;
      pdf.setFontSize(8);
      pdf.text('Generated by HR Reports Dashboard', margins, footerY);
      
      const pageText = 'Page 1';
      const pageWidth = pdf.getStringUnitWidth(pageText) * 8;
      pdf.text(pageText, pdfWidth - margins - pageWidth, footerY);

      this.log('PDF created successfully');
      
      return {
        pdf: pdf,
        filename: filename || `dashboard-export-${formatDate(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`
      };
    } catch (error) {
      this.logError('PDF creation failed', error);
      throw new Error(`PDF creation failed: ${error.message}`);
    }
  }

  /**
   * Print fallback method
   */
  printFallback(elementId, options = {}) {
    this.log('Using print fallback method');
    
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element '${elementId}' not found for print fallback`);
    }

    // Create a new window with just the element content
    const printWindow = window.open('', '_blank');
    
    // Get all stylesheets
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map(el => el.outerHTML)
      .join('\n');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${options.title || 'Dashboard Export'}</title>
          <meta charset="utf-8">
          ${stylesheets}
          <style>
            body { 
              margin: 0; 
              padding: 20px; 
              font-family: Arial, sans-serif;
              background: white;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <h1>${options.title || 'Dashboard Export'}</h1>
          <p>Generated: ${formatDate(new Date(), 'MMMM dd, yyyy')}</p>
          <div style="margin-top: 20px;">
            ${element.outerHTML}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      // Don't close immediately - let user see the preview
    }, 1000);

    return {
      success: true,
      method: 'print',
      message: 'Print dialog opened. You can save as PDF from the print dialog.'
    };
  }

  /**
   * Main export function with all fallbacks
   */
  async exportToPDF(elementId, options = {}) {
    const startTime = Date.now();
    this.log(`Starting PDF export for element: ${elementId}`, options);
    
    try {
      // Try canvas-based export first
      try {
        const canvas = await this.captureElement(elementId);
        const { pdf, filename } = this.createPDFFromCanvas(canvas, options);
        
        // Save the PDF
        pdf.save(filename);
        
        const duration = Date.now() - startTime;
        this.log(`PDF export completed successfully in ${duration}ms`);
        
        return {
          success: true,
          method: 'canvas',
          filename: filename,
          duration: duration
        };
      } catch (canvasError) {
        this.logError('Canvas-based export failed, trying print fallback', canvasError);
        
        // Fall back to print method
        return this.printFallback(elementId, options);
      }
    } catch (error) {
      this.logError('All export methods failed', error);
      
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime,
        suggestion: 'Try refreshing the page and ensuring the dashboard content is fully loaded before exporting.'
      };
    }
  }

  /**
   * Test function to diagnose issues with enhanced Recharts detection
   */
  async diagnoseElement(elementId) {
    this.log(`Running diagnosis for element: ${elementId}`);
    
    const results = {
      elementExists: false,
      elementVisible: false,
      elementDimensions: null,
      hasContent: false,
      hasRechartsContent: false,
      rechartsDetails: {},
      canvasCapture: false,
      error: null
    };

    try {
      const element = this.validateElement(elementId);
      results.elementExists = true;
      
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      
      results.elementVisible = style.display !== 'none' && style.visibility !== 'hidden';
      results.elementDimensions = {
        offset: { width: element.offsetWidth, height: element.offsetHeight },
        scroll: { width: element.scrollWidth, height: element.scrollHeight },
        bounding: rect
      };
      
      results.hasContent = element.textContent.trim().length > 0 || element.children.length > 0;
      
      // Enhanced Recharts detection
      const rechartsElements = element.querySelectorAll('.recharts-wrapper, .recharts-surface');
      const svgElements = element.querySelectorAll('svg');
      
      results.hasRechartsContent = rechartsElements.length > 0;
      results.rechartsDetails = {
        rechartsWrappers: rechartsElements.length,
        svgElements: svgElements.length,
        chartElements: element.querySelectorAll('.recharts-bar, .recharts-area, .recharts-line, .recharts-pie').length,
        textElements: element.querySelectorAll('.recharts-text').length,
        svgDimensions: Array.from(svgElements).map(svg => ({
          width: svg.clientWidth,
          height: svg.clientHeight,
          hasContent: svg.children.length > 0
        }))
      };
      
      // Test canvas capture
      try {
        const canvas = await this.captureWithMinimalOptions(element);
        results.canvasCapture = canvas && canvas.width > 0 && canvas.height > 0;
        
        if (canvas) {
          results.canvasDetails = {
            width: canvas.width,
            height: canvas.height,
            hasVisualContent: this.testCanvasContent(canvas)
          };
        }
      } catch (captureError) {
        results.canvasCapture = false;
        results.captureError = captureError.message;
      }
      
    } catch (error) {
      results.error = error.message;
    }

    this.log('Diagnosis complete:', results);
    return results;
  }
  
  /**
   * Test if canvas has visual content beyond white/transparent
   */
  testCanvasContent(canvas) {
    try {
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, Math.min(canvas.width, 200), Math.min(canvas.height, 200));
      
      let colorPixels = 0;
      let totalPixels = 0;
      
      for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const a = imageData.data[i + 3];
        
        totalPixels++;
        
        // Count as colored if it's not white, not transparent, and not black
        if (a > 50 && (r !== 255 || g !== 255 || b !== 255) && (r !== 0 || g !== 0 || b !== 0)) {
          colorPixels++;
        }
      }
      
      const colorRatio = colorPixels / totalPixels;
      this.log(`Canvas content analysis: ${colorPixels}/${totalPixels} colored pixels (${(colorRatio * 100).toFixed(2)}%)`);
      
      return colorRatio > 0.001; // At least 0.1% colored pixels
    } catch (error) {
      this.logError('Canvas content test failed', error);
      return false;
    }
  }
}

// Export utility functions
export const simplePdfExport = {
  /**
   * Quick export function
   */
  export: async (elementId, options = {}) => {
    const exporter = new SimplePDFExporter();
    return await exporter.exportToPDF(elementId, options);
  },

  /**
   * Diagnose export issues
   */
  diagnose: async (elementId) => {
    const exporter = new SimplePDFExporter();
    return await exporter.diagnoseElement(elementId);
  },

  /**
   * Create exporter instance
   */
  createExporter: (options = {}) => {
    return new SimplePDFExporter(options);
  }
};

export default SimplePDFExporter;