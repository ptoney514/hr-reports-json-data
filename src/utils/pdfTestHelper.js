/**
 * PDF Export Test Helper
 * 
 * This utility helps verify that charts are properly rendering in PDF exports
 * by providing diagnostic information about chart elements and their state
 */

export const pdfTestHelper = {
  /**
   * Check if Recharts elements are present and rendered
   */
  checkRechartsElements: () => {
    const results = {
      timestamp: new Date().toISOString(),
      hasRechartsWrapper: false,
      hasRechartsSurface: false,
      chartTypes: [],
      svgElements: 0,
      chartCount: 0,
      details: []
    };

    // Check for Recharts wrapper elements
    const wrappers = document.querySelectorAll('.recharts-wrapper');
    const surfaces = document.querySelectorAll('.recharts-surface');
    
    results.hasRechartsWrapper = wrappers.length > 0;
    results.hasRechartsSurface = surfaces.length > 0;
    results.chartCount = Math.max(wrappers.length, surfaces.length);

    // Check for specific chart types
    const chartTypes = [
      { selector: '.recharts-bar', type: 'Bar Chart' },
      { selector: '.recharts-pie', type: 'Pie Chart' },
      { selector: '.recharts-line', type: 'Line Chart' },
      { selector: '.recharts-area', type: 'Area Chart' }
    ];

    chartTypes.forEach(({ selector, type }) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        results.chartTypes.push(type);
        results.details.push(`Found ${elements.length} ${type} elements`);
      }
    });

    // Check SVG elements
    const svgElements = document.querySelectorAll('.recharts-wrapper svg, .recharts-surface svg');
    results.svgElements = svgElements.length;

    // Check if SVGs have actual content
    svgElements.forEach((svg, index) => {
      const hasContent = svg.innerHTML.length > 100; // Simple check for meaningful content
      const childElements = svg.querySelectorAll('*').length;
      results.details.push(`SVG ${index + 1}: ${hasContent ? 'Has content' : 'Empty'} (${childElements} child elements)`);
    });

    return results;
  },

  /**
   * Wait for charts to fully render with visual feedback
   */
  waitForChartsWithFeedback: async (maxWait = 15000) => {
    console.log('🔍 Starting chart rendering check...');
    
    const startTime = Date.now();
    const checkInterval = 500;
    let lastCheckResult = null;

    while (Date.now() - startTime < maxWait) {
      const result = pdfTestHelper.checkRechartsElements();
      
      // Log progress
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      console.log(`⏱️ [${elapsed}s] Charts found: ${result.chartCount}, SVGs: ${result.svgElements}, Types: ${result.chartTypes.join(', ') || 'None'}`);

      // Check if charts are ready
      if (result.chartCount > 0 && result.svgElements > 0 && result.chartTypes.length > 0) {
        // Additional check for content
        const hasSubstantialContent = result.details.some(detail => detail.includes('Has content'));
        
        if (hasSubstantialContent) {
          console.log('✅ Charts are ready for PDF export!');
          console.log('📊 Final chart status:', result);
          return { ready: true, result };
        }
      }

      lastCheckResult = result;
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }

    console.log('⚠️ Timeout reached. Current chart status:', lastCheckResult);
    return { ready: false, result: lastCheckResult };
  },

  /**
   * Diagnose PDF export issues
   */
  diagnosePDFExport: async () => {
    console.log('🔬 Running PDF Export Diagnostics...');
    console.log('=' .repeat(50));

    // 1. Check current page
    const currentPath = window.location.pathname;
    console.log('📍 Current page:', currentPath);

    // 2. Check for dashboard container
    const dashboardContainers = document.querySelectorAll('.dashboard-container, [data-dashboard-content]');
    console.log(`📦 Dashboard containers found: ${dashboardContainers.length}`);

    // 3. Check for charts
    const initialCheck = pdfTestHelper.checkRechartsElements();
    console.log('📊 Initial chart check:', initialCheck);

    // 4. Check for CSS classes
    const hasPrintMode = document.body.classList.contains('print-mode');
    const hasPDFExportMode = document.body.classList.contains('pdf-export-mode');
    console.log(`🎨 CSS Classes - Print Mode: ${hasPrintMode}, PDF Export Mode: ${hasPDFExportMode}`);

    // 5. Wait for charts and track progress
    console.log('\n⏳ Waiting for charts to render...');
    const waitResult = await pdfTestHelper.waitForChartsWithFeedback(10000);

    // 6. Final recommendations
    console.log('\n💡 Recommendations:');
    if (!waitResult.ready) {
      console.log('❌ Charts did not fully render. Possible issues:');
      console.log('   - Charts may need more time to load data');
      console.log('   - Check if data is being fetched correctly');
      console.log('   - Verify Recharts components are properly configured');
    } else {
      console.log('✅ Charts are ready for PDF export');
      console.log('   - Use the Export button in the dashboard');
      console.log('   - Or call simplePdfExport.export() directly');
    }

    console.log('=' .repeat(50));
    return waitResult;
  },

  /**
   * Quick test for PDF export readiness
   */
  quickTest: () => {
    const result = pdfTestHelper.checkRechartsElements();
    const ready = result.chartCount > 0 && result.svgElements > 0;
    
    console.log(ready ? '✅ Ready for PDF export' : '❌ Charts not ready');
    console.log(`Found ${result.chartCount} charts, ${result.svgElements} SVGs`);
    
    return ready;
  }
};

// Make available globally for testing
if (typeof window !== 'undefined') {
  window.pdfTestHelper = pdfTestHelper;
}