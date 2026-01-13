/**
 * Dashboard Capture Helper
 * Handles automatic navigation and capture of dashboards for PDF generation
 */

/**
 * Create hidden iframe for capturing dashboard
 * @param {string} route - Dashboard route
 * @returns {Promise<HTMLIFrameElement>} Loaded iframe element
 */
export const createHiddenDashboardFrame = (route) => {
  return new Promise((resolve, reject) => {
    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.top = '0';
    iframe.style.width = '1400px'; // Standard desktop width
    iframe.style.height = '4000px'; // Tall enough for full dashboard
    iframe.style.border = 'none';
    iframe.style.backgroundColor = '#f9fafb'; // gray-50

    // Set up load handler
    iframe.onload = () => {
      // Give extra time for React components and charts to render
      setTimeout(() => {
        resolve(iframe);
      }, 3000);
    };

    iframe.onerror = () => {
      reject(new Error(`Failed to load dashboard at ${route}`));
    };

    // Append to body and set source
    document.body.appendChild(iframe);
    iframe.src = route;
  });
};

/**
 * Remove iframe from DOM
 * @param {HTMLIFrameElement} iframe - Iframe to remove
 */
export const removeFrame = (iframe) => {
  if (iframe && iframe.parentNode) {
    iframe.parentNode.removeChild(iframe);
  }
};

/**
 * Wait for dashboard element to be ready in iframe
 * @param {HTMLIFrameElement} iframe - Iframe containing dashboard
 * @param {string} elementId - Dashboard element ID
 * @param {number} maxWaitTime - Maximum time to wait in ms
 * @returns {Promise<HTMLElement>} Dashboard element
 */
export const waitForDashboardElement = async (iframe, elementId, maxWaitTime = 10000) => {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const checkElement = () => {
      try {
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        const element = iframeDocument.getElementById(elementId);

        if (element) {
          // Element found, wait a bit more for charts
          setTimeout(() => {
            resolve(element);
          }, 2000);
        } else if (Date.now() - startTime > maxWaitTime) {
          reject(new Error(`Dashboard element ${elementId} not found after ${maxWaitTime}ms`));
        } else {
          // Check again in 100ms
          setTimeout(checkElement, 100);
        }
      } catch (error) {
        reject(new Error(`Error accessing iframe content: ${error.message}`));
      }
    };

    checkElement();
  });
};

/**
 * Wait for Recharts to fully render in element
 * @param {HTMLElement} element - Dashboard element
 * @param {number} waitTime - Additional wait time in ms
 */
export const waitForCharts = async (element, waitTime = 2000) => {
  // Check for Recharts SVG elements
  return new Promise((resolve) => {
    const checkCharts = () => {
      const svgs = element.querySelectorAll('svg');

      if (svgs.length === 0) {
        // No charts, just wait the standard time
        setTimeout(resolve, waitTime);
        return;
      }

      // Check if all SVGs have valid dimensions
      const allValid = Array.from(svgs).every(svg => {
        const width = svg.getAttribute('width') || svg.style.width;
        const height = svg.getAttribute('height') || svg.style.height;
        return width && height && width !== '0' && height !== '0';
      });

      if (allValid) {
        // All charts rendered, wait a bit more for animations
        setTimeout(resolve, waitTime);
      } else {
        // Not ready yet, check again
        setTimeout(checkCharts, 100);
      }
    };

    checkCharts();
  });
};

/**
 * Capture dashboard from current page (fallback method)
 * @param {string} dashboardId - Dashboard element ID
 * @returns {Promise<HTMLElement|null>} Dashboard element or null
 */
export const captureDashboardFromCurrentPage = async (dashboardId) => {
  const element = document.getElementById(dashboardId);

  if (element) {
    await waitForCharts(element);
    return element;
  }

  return null;
};

const dashboardCaptureHelper = {
  createHiddenDashboardFrame,
  removeFrame,
  waitForDashboardElement,
  waitForCharts,
  captureDashboardFromCurrentPage
};

export default dashboardCaptureHelper;
