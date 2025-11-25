/**
 * Report Template Configurations
 * Defines the structure and content of automated PDF reports
 */

export const REPORT_TEMPLATES = {
  Q1_FY26_WORKFORCE: {
    id: 'q1-fy26-workforce',
    title: 'HR Workforce Reports Q1 FY26',
    subtitle: 'Quarterly Workforce, Turnover & Exit Survey Analysis',
    quarter: 'Q1 FY26',
    quarterDate: '2025-09-30',
    filename: 'HR_Workforce_Reports_Q1_FY26.pdf',

    // Cover page configuration
    cover: {
      enabled: true,
      title: 'HR Workforce Reports',
      subtitle: 'Q1 FY26 - Quarterly Analysis',
      period: 'July 1, 2025 - September 30, 2025',
      generatedDate: true, // Will show "Generated: [date]"
      branding: {
        organization: 'Creighton University',
        confidential: true,
        confidentialityText: 'CONFIDENTIAL - For Internal Use Only'
      }
    },

    // Table of contents
    tableOfContents: {
      enabled: true,
      title: 'Table of Contents',
      sections: [
        { title: 'Workforce & Headcount Analysis', page: 3 },
        { title: 'Turnover & Terminations Analysis', page: 4 },
        { title: 'Exit Survey Results', page: 5 }
      ]
    },

    // Dashboard pages to capture (in order)
    pages: [
      {
        id: 'workforce-q1-fy26',
        title: 'Workforce & Headcount Analysis',
        route: '/dashboards/workforce-q1',
        dashboardId: 'workforce-q1-fy26-dashboard',
        orientation: 'portrait',
        captureSettings: {
          waitForCharts: true,
          waitTime: 3000, // Wait 3 seconds for charts to render
          scale: 2, // High resolution
          backgroundColor: '#f9fafb'
        },
        pageNumber: 3
      },
      {
        id: 'turnover-q1-fy26',
        title: 'Turnover & Terminations Analysis',
        route: '/dashboards/turnover-q1',
        dashboardId: 'turnover-q1-fy26-dashboard',
        orientation: 'portrait',
        captureSettings: {
          waitForCharts: true,
          waitTime: 3000,
          scale: 2,
          backgroundColor: '#f9fafb'
        },
        pageNumber: 4
      },
      {
        id: 'exit-survey-q1-fy26',
        title: 'Exit Survey Results',
        route: '/dashboards/exit-survey-q1',
        dashboardId: 'exit-survey-q1-fy26-dashboard',
        orientation: 'portrait',
        captureSettings: {
          waitForCharts: true,
          waitTime: 2000,
          scale: 2,
          backgroundColor: '#f9fafb'
        },
        pageNumber: 5
      }
    ],

    // PDF settings
    pdfSettings: {
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter', // 8.5 x 11 inches
      compress: true,

      // Margins (in points)
      margins: {
        top: 40,
        right: 40,
        bottom: 60,
        left: 40
      },

      // Header/Footer on each page
      header: {
        enabled: true,
        text: 'Creighton University - HR Workforce Reports Q1 FY26',
        fontSize: 10,
        color: '#666666',
        align: 'center'
      },

      footer: {
        enabled: true,
        showPageNumbers: true,
        showConfidentiality: true,
        confidentialityText: 'CONFIDENTIAL - For Internal Use Only',
        fontSize: 8,
        color: '#999999'
      },

      // Quality settings
      quality: {
        imageCompression: 'FAST', // FAST, MEDIUM, SLOW
        imageQuality: 0.95, // 0-1
        precision: 2
      }
    },

    // Metadata
    metadata: {
      title: 'HR Workforce Reports Q1 FY26',
      author: 'Creighton University HR Analytics',
      subject: 'Quarterly Workforce, Turnover & Exit Survey Analysis',
      keywords: 'workforce, turnover, exit survey, Q1, FY26, HR analytics',
      creator: 'HR Reports Dashboard',
      producer: 'jsPDF + html2canvas'
    }
  }
};

/**
 * Get report template by ID
 * @param {string} templateId - Template identifier
 * @returns {Object} Report template configuration
 */
export const getReportTemplate = (templateId) => {
  return Object.values(REPORT_TEMPLATES).find(template => template.id === templateId);
};

/**
 * Get all available report templates
 * @returns {Array} Array of report templates
 */
export const getAllReportTemplates = () => {
  return Object.values(REPORT_TEMPLATES);
};

/**
 * Get templates for a specific quarter
 * @param {string} quarter - Quarter identifier (e.g., 'Q1 FY26')
 * @returns {Array} Templates for the specified quarter
 */
export const getTemplatesByQuarter = (quarter) => {
  return Object.values(REPORT_TEMPLATES).filter(
    template => template.quarter === quarter
  );
};

export default REPORT_TEMPLATES;
