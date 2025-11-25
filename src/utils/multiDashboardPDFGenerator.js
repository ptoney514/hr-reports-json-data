/**
 * Multi-Dashboard PDF Generator
 * Orchestrates capture of multiple dashboards and stitches them into a single PDF report
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import {
  createHiddenDashboardFrame,
  removeFrame,
  waitForDashboardElement,
  waitForCharts,
  captureDashboardFromCurrentPage
} from './dashboardCaptureHelper';

class MultiDashboardPDFGenerator {
  constructor(template) {
    this.template = template;
    this.pdf = null;
    this.currentPage = 1;
    this.capturedPages = [];
    this.progressCallback = null;
  }

  /**
   * Set progress callback for UI updates
   * @param {Function} callback - Progress callback function
   */
  setProgressCallback(callback) {
    this.progressCallback = callback;
  }

  /**
   * Update progress
   * @param {string} message - Progress message
   * @param {number} current - Current page number
   * @param {number} total - Total pages
   */
  updateProgress(message, current = 0, total = 0) {
    if (this.progressCallback) {
      this.progressCallback({
        message,
        current,
        total,
        percentage: total > 0 ? Math.round((current / total) * 100) : 0
      });
    }
  }

  /**
   * Initialize PDF document
   */
  initializePDF() {
    const { pdfSettings, metadata } = this.template;

    this.pdf = new jsPDF({
      orientation: pdfSettings.orientation,
      unit: pdfSettings.unit,
      format: pdfSettings.format,
      compress: pdfSettings.compress
    });

    // Set metadata
    this.pdf.setProperties({
      title: metadata.title,
      subject: metadata.subject,
      author: metadata.author,
      keywords: metadata.keywords,
      creator: metadata.creator,
      producer: metadata.producer
    });

    this.currentPage = 0; // Will increment when we add pages
  }

  /**
   * Add cover page to PDF
   */
  addCoverPage() {
    if (!this.template.cover.enabled) return;

    this.updateProgress('Generating cover page...', 1, this.getTotalPages());

    const { cover } = this.template;
    const pageWidth = this.pdf.internal.pageSize.getWidth();
    const pageHeight = this.pdf.internal.pageSize.getHeight();

    // Background - Creighton Blue
    this.pdf.setFillColor(0, 84, 166); // #0054A6
    this.pdf.rect(0, 0, pageWidth, pageHeight * 0.4, 'F');

    // Title - White on Blue
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(32);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(cover.title, pageWidth / 2, pageHeight * 0.15, { align: 'center' });

    // Subtitle
    this.pdf.setFontSize(18);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(cover.subtitle, pageWidth / 2, pageHeight * 0.22, { align: 'center' });

    // Period
    this.pdf.setFontSize(14);
    this.pdf.text(cover.period, pageWidth / 2, pageHeight * 0.28, { align: 'center' });

    // White section
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.rect(0, pageHeight * 0.4, pageWidth, pageHeight * 0.6, 'F');

    // Organization name - Dark gray on white
    this.pdf.setTextColor(51, 51, 51);
    this.pdf.setFontSize(24);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(
      cover.branding.organization,
      pageWidth / 2,
      pageHeight * 0.55,
      { align: 'center' }
    );

    // Generated date
    if (cover.generatedDate) {
      this.pdf.setTextColor(102, 102, 102);
      this.pdf.setFontSize(12);
      this.pdf.setFont('helvetica', 'normal');
      const generatedText = `Generated: ${format(new Date(), 'MMMM d, yyyy')}`;
      this.pdf.text(generatedText, pageWidth / 2, pageHeight * 0.65, { align: 'center' });
    }

    // Confidentiality notice at bottom
    if (cover.branding.confidential) {
      this.pdf.setTextColor(153, 153, 153);
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'italic');
      this.pdf.text(
        cover.branding.confidentialityText,
        pageWidth / 2,
        pageHeight * 0.9,
        { align: 'center' }
      );
    }

    this.currentPage++;
  }

  /**
   * Add table of contents
   */
  addTableOfContents() {
    if (!this.template.tableOfContents.enabled) return;

    this.updateProgress('Generating table of contents...', 2, this.getTotalPages());

    this.pdf.addPage();

    const { tableOfContents } = this.template;
    const pageWidth = this.pdf.internal.pageSize.getWidth();
    const { margins } = this.template.pdfSettings;

    // Title
    this.pdf.setTextColor(0, 84, 166);
    this.pdf.setFontSize(24);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(tableOfContents.title, margins.left, margins.top + 30);

    // Sections
    this.pdf.setTextColor(51, 51, 51);
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'normal');

    let yPosition = margins.top + 70;
    const lineHeight = 30;

    tableOfContents.sections.forEach((section, index) => {
      // Section title
      this.pdf.text(section.title, margins.left + 20, yPosition);

      // Dotted line
      this.pdf.setDrawColor(200, 200, 200);
      this.pdf.setLineDash([2, 2]);
      const titleWidth = this.pdf.getTextWidth(section.title);
      const dotsStartX = margins.left + 30 + titleWidth;
      const dotsEndX = pageWidth - margins.right - 30;
      this.pdf.line(dotsStartX, yPosition - 2, dotsEndX, yPosition - 2);
      this.pdf.setLineDash(); // Reset dash

      // Page number
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(String(section.page), pageWidth - margins.right, yPosition, { align: 'right' });
      this.pdf.setFont('helvetica', 'normal');

      yPosition += lineHeight;
    });

    this.currentPage++;
  }

  /**
   * Capture a dashboard element as image
   * @param {HTMLElement} element - Dashboard element to capture
   * @param {Object} captureSettings - Capture settings
   * @returns {Promise<HTMLCanvasElement>} Canvas with captured content
   */
  async captureDashboard(element, captureSettings) {
    // Wait for charts to render if specified
    if (captureSettings.waitForCharts) {
      await this.waitForChartsToRender(element, captureSettings.waitTime);
    }

    // Capture element with html2canvas
    const canvas = await html2canvas(element, {
      scale: captureSettings.scale,
      backgroundColor: captureSettings.backgroundColor,
      logging: false,
      useCORS: true,
      allowTaint: true,
      scrollY: -window.scrollY,
      scrollX: -window.scrollX,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

    return canvas;
  }

  /**
   * Wait for charts to fully render
   * @param {HTMLElement} element - Dashboard element
   * @param {number} waitTime - Time to wait in milliseconds
   */
  async waitForChartsToRender(element, waitTime = 2000) {
    // Wait for Recharts SVG elements
    await new Promise(resolve => {
      const checkCharts = () => {
        const svgs = element.querySelectorAll('svg');
        const hasValidCharts = Array.from(svgs).every(svg => {
          const width = svg.getAttribute('width') || svg.style.width;
          const height = svg.getAttribute('height') || svg.style.height;
          return width && height && width !== '0' && height !== '0';
        });

        if (hasValidCharts || svgs.length === 0) {
          setTimeout(resolve, waitTime);
        } else {
          setTimeout(checkCharts, 100);
        }
      };

      checkCharts();
    });
  }

  /**
   * Add dashboard page to PDF
   * @param {HTMLCanvasElement} canvas - Captured dashboard canvas
   * @param {Object} pageConfig - Page configuration
   */
  addDashboardPage(canvas, pageConfig) {
    const { margins } = this.template.pdfSettings;
    const pageWidth = this.pdf.internal.pageSize.getWidth();
    const pageHeight = this.pdf.internal.pageSize.getHeight();

    // Add new page if not the first dashboard page
    if (this.currentPage > 0) {
      this.pdf.addPage();
    }

    this.currentPage++;

    // Calculate dimensions to fit page with margins
    const contentWidth = pageWidth - margins.left - margins.right;
    const contentHeight = pageHeight - margins.top - margins.bottom;

    // Calculate scaling to fit while maintaining aspect ratio
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const widthRatio = contentWidth / imgWidth;
    const heightRatio = contentHeight / imgHeight;
    const scale = Math.min(widthRatio, heightRatio);

    const scaledWidth = imgWidth * scale;
    const scaledHeight = imgHeight * scale;

    // Center the image
    const xOffset = margins.left + (contentWidth - scaledWidth) / 2;
    const yOffset = margins.top;

    // Add image to PDF
    const imgData = canvas.toDataURL('image/jpeg', this.template.pdfSettings.quality.imageQuality);
    this.pdf.addImage(
      imgData,
      'JPEG',
      xOffset,
      yOffset,
      scaledWidth,
      scaledHeight,
      undefined,
      this.template.pdfSettings.quality.imageCompression
    );

    // Add header
    this.addPageHeader();

    // Add footer with page number
    this.addPageFooter();
  }

  /**
   * Add header to current page
   */
  addPageHeader() {
    if (!this.template.pdfSettings.header.enabled) return;

    const { header } = this.template.pdfSettings;
    const pageWidth = this.pdf.internal.pageSize.getWidth();

    this.pdf.setTextColor(header.color);
    this.pdf.setFontSize(header.fontSize);
    this.pdf.setFont('helvetica', 'normal');

    const yPosition = 20;

    if (header.align === 'center') {
      this.pdf.text(header.text, pageWidth / 2, yPosition, { align: 'center' });
    } else if (header.align === 'right') {
      this.pdf.text(header.text, pageWidth - 40, yPosition, { align: 'right' });
    } else {
      this.pdf.text(header.text, 40, yPosition);
    }

    // Horizontal line below header
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.line(40, 25, pageWidth - 40, 25);
  }

  /**
   * Add footer to current page
   */
  addPageFooter() {
    const { footer } = this.template.pdfSettings;
    if (!footer.enabled) return;

    const pageWidth = this.pdf.internal.pageSize.getWidth();
    const pageHeight = this.pdf.internal.pageSize.getHeight();

    this.pdf.setTextColor(footer.color);
    this.pdf.setFontSize(footer.fontSize);
    this.pdf.setFont('helvetica', 'normal');

    const yPosition = pageHeight - 30;

    // Horizontal line above footer
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.line(40, pageHeight - 40, pageWidth - 40, pageHeight - 40);

    // Page number (right side)
    if (footer.showPageNumbers) {
      const pageNumText = `Page ${this.currentPage}`;
      this.pdf.text(pageNumText, pageWidth - 40, yPosition, { align: 'right' });
    }

    // Confidentiality notice (left side)
    if (footer.showConfidentiality) {
      this.pdf.setFont('helvetica', 'italic');
      this.pdf.text(footer.confidentialityText, 40, yPosition);
    }
  }

  /**
   * Get total number of pages in report
   * @returns {number} Total pages
   */
  getTotalPages() {
    let total = this.template.pages.length;
    if (this.template.cover.enabled) total++;
    if (this.template.tableOfContents.enabled) total++;
    return total;
  }

  /**
   * Generate the complete PDF report
   * @returns {Promise<jsPDF>} Generated PDF document
   */
  async generateReport() {
    try {
      this.updateProgress('Initializing PDF...', 0, this.getTotalPages());

      // Initialize PDF
      this.initializePDF();

      // Add cover page
      if (this.template.cover.enabled) {
        this.addCoverPage();
      }

      // Add table of contents
      if (this.template.tableOfContents.enabled) {
        this.addTableOfContents();
      }

      // Capture and add each dashboard page
      for (let i = 0; i < this.template.pages.length; i++) {
        const pageConfig = this.template.pages[i];
        const pageNum = (this.template.cover.enabled ? 1 : 0) +
                       (this.template.tableOfContents.enabled ? 1 : 0) +
                       i + 1;

        this.updateProgress(
          `Capturing ${pageConfig.title}...`,
          pageNum,
          this.getTotalPages()
        );

        let iframe = null;
        let element = null;

        try {
          // Try to capture from current page first (faster if already there)
          element = await captureDashboardFromCurrentPage(pageConfig.dashboardId);

          if (!element) {
            // Dashboard not on current page, load it in hidden iframe
            this.updateProgress(
              `Loading ${pageConfig.title}...`,
              pageNum,
              this.getTotalPages()
            );

            iframe = await createHiddenDashboardFrame(pageConfig.route);
            element = await waitForDashboardElement(iframe, pageConfig.dashboardId);

            if (!element) {
              console.warn(`Dashboard element not found: ${pageConfig.dashboardId}`);
              continue;
            }
          }

          // Wait for charts to render
          await waitForCharts(element, pageConfig.captureSettings.waitTime);

          // Capture dashboard
          const canvas = await this.captureDashboard(element, pageConfig.captureSettings);

          // Add to PDF
          this.addDashboardPage(canvas, pageConfig);

        } finally {
          // Clean up iframe if it was created
          if (iframe) {
            removeFrame(iframe);
          }
        }
      }

      this.updateProgress('Finalizing PDF...', this.getTotalPages(), this.getTotalPages());

      return this.pdf;

    } catch (error) {
      console.error('Error generating PDF report:', error);
      throw error;
    }
  }

  /**
   * Save PDF to file
   * @returns {Promise<void>}
   */
  async save() {
    const pdf = await this.generateReport();
    this.updateProgress('Downloading...', this.getTotalPages(), this.getTotalPages());
    pdf.save(this.template.filename);
  }

  /**
   * Get PDF as blob
   * @returns {Promise<Blob>} PDF blob
   */
  async getBlob() {
    const pdf = await this.generateReport();
    return pdf.output('blob');
  }

  /**
   * Preview PDF in new tab
   * @returns {Promise<void>}
   */
  async preview() {
    const pdf = await this.generateReport();
    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }
}

export default MultiDashboardPDFGenerator;
