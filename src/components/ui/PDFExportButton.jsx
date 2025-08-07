/**
 * Enhanced PDF Export Button Component
 * 
 * Features:
 * - Interactive modal for orientation selection
 * - Visual previews of portrait vs landscape
 * - Loading indicators during export process
 * - Integration with professional PDF export utility
 * - Customizable headers per dashboard type
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Loader2, 
  Settings, 
  Eye,
  X,
  Monitor,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Bug
} from 'lucide-react';
import pdfExporter, { DASHBOARD_CONFIGS } from '../../utils/pdfExportUtility';
import { simplePdfExport } from '../../utils/simplePdfExport';

const PDFExportButton = ({
  dashboardType = 'default',
  elementId,
  title = 'Export PDF',
  defaultOrientation = 'portrait',
  showPreview = true,
  showOrientationChoice = true,
  customHeader = {},
  className = ''
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedOrientation, setSelectedOrientation] = useState(defaultOrientation);
  const [exportStatus, setExportStatus] = useState('');
  const [exportResult, setExportResult] = useState(null);
  
  const modalRef = useRef(null);

  // Get dashboard configuration
  const dashboardConfig = DASHBOARD_CONFIGS[dashboardType] || DASHBOARD_CONFIGS.workforce;

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isModalOpen]);

  const handleExport = async (orientation = selectedOrientation, preview = false) => {
    if (!elementId) {
      setExportStatus('Error: Element ID not specified');
      return;
    }

    // Validate that the element exists before starting export
    const targetElement = document.getElementById(elementId);
    if (!targetElement) {
      setExportStatus(`Error: Element with ID '${elementId}' not found on page`);
      return;
    }

    console.log('Starting PDF export for element:', elementId, {
      dimensions: {
        width: targetElement.offsetWidth,
        height: targetElement.offsetHeight,
        scrollWidth: targetElement.scrollWidth,
        scrollHeight: targetElement.scrollHeight
      },
      visibility: getComputedStyle(targetElement).visibility,
      display: getComputedStyle(targetElement).display
    });

    setIsExporting(true);
    setIsPreviewMode(preview);
    setExportStatus(preview ? 'Generating preview...' : 'Preparing PDF export...');
    
    try {
      // Check for any loading states in the dashboard before starting export
      const hasLoadingIndicators = targetElement.querySelectorAll('.animate-spin, [class*="loading"]').length > 0;
      if (hasLoadingIndicators) {
        setExportStatus('Waiting for dashboard data to load...');
        // Wait up to 10 seconds for loading to complete
        let waitTime = 0;
        while (waitTime < 10000 && targetElement.querySelectorAll('.animate-spin, [class*="loading"]').length > 0) {
          await new Promise(resolve => setTimeout(resolve, 500));
          waitTime += 500;
        }
      }

      setExportStatus(preview ? 'Capturing dashboard content...' : 'Rendering charts and tables...');
      
      const exportOptions = {
        orientation,
        dashboardType,
        customHeader: {
          ...customHeader,
          title: customHeader.title || dashboardConfig.title
        }
      };

      let result;
      if (preview) {
        setExportStatus('Opening preview...');
        result = await pdfExporter.previewDashboard(elementId, dashboardType, exportOptions);
      } else {
        setExportStatus('Generating PDF...');
        result = await pdfExporter.exportDashboard(elementId, dashboardType, exportOptions);
      }

      setExportResult(result);
      setExportStatus(preview ? 'Preview opened successfully!' : 'PDF exported successfully!');
      
      if (!preview) {
        setIsModalOpen(false);
      }

    } catch (error) {
      console.error('Primary PDF Export error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        elementId,
        elementExists: !!document.getElementById(elementId)
      });
      
      // Try the simplified PDF export as fallback
      try {
        setExportStatus('Primary export failed, trying alternative method...');
        console.log('Attempting fallback with simplified PDF export');
        
        const fallbackOptions = {
          orientation,
          title: customHeader.title || dashboardConfig.title || 'Dashboard Export'
        };
        
        const fallbackResult = await simplePdfExport.export(elementId, fallbackOptions);
        
        if (fallbackResult.success) {
          setExportStatus('PDF exported successfully using alternative method!');
          setExportResult({
            success: true,
            method: fallbackResult.method,
            filename: fallbackResult.filename,
            message: fallbackResult.message || 'Export completed with fallback method'
          });
          
          if (!preview) {
            setIsModalOpen(false);
          }
        } else {
          throw new Error(fallbackResult.error || 'Fallback export also failed');
        }
      } catch (fallbackError) {
        console.error('Fallback PDF Export also failed:', fallbackError);
        
        // Final attempt: Run diagnostics and provide detailed error
        try {
          const diagnostics = await simplePdfExport.diagnose(elementId);
          console.log('PDF Export Diagnostics:', diagnostics);
          
          let errorMessage = `Both export methods failed. ${error.message}`;
          if (diagnostics.error) {
            errorMessage += ` Element issue: ${diagnostics.error}`;
          } else if (!diagnostics.elementVisible) {
            errorMessage += ' Element is not visible.';
          } else if (!diagnostics.hasContent) {
            errorMessage += ' Element appears to have no content.';
          }
          
          setExportStatus(errorMessage);
          setExportResult({ 
            success: false, 
            error: errorMessage,
            diagnostics: diagnostics,
            suggestion: 'Try refreshing the page and ensure the dashboard is fully loaded.'
          });
        } catch (diagError) {
          setExportStatus(`Export failed: ${error.message}`);
          setExportResult({ success: false, error: error.message });
        }
      }
    } finally {
      setIsExporting(false);
      setIsPreviewMode(false);
      
      // Clear status after delay
      setTimeout(() => {
        setExportStatus('');
        setExportResult(null);
      }, 4000);
    }
  };

  /**
   * Debug function to diagnose PDF export issues
   */
  const handleDebug = async () => {
    if (!elementId) {
      console.error('No element ID provided for debugging');
      return;
    }

    console.log('=== PDF Export Debug Session ===');
    console.log('Element ID:', elementId);
    console.log('Dashboard Type:', dashboardType);
    console.log('Selected Orientation:', selectedOrientation);

    try {
      setExportStatus('Running diagnostics...');
      const diagnostics = await simplePdfExport.diagnose(elementId);
      
      console.log('Diagnostics Results:', diagnostics);
      
      // Display results in a more user-friendly way
      let statusMessage = 'Debug complete - check console for details. ';
      if (!diagnostics.elementExists) {
        statusMessage += 'Element not found! ';
      } else if (!diagnostics.elementVisible) {
        statusMessage += 'Element not visible! ';
      } else if (!diagnostics.hasContent) {
        statusMessage += 'Element has no content! ';
      } else if (!diagnostics.canvasCapture) {
        statusMessage += 'Canvas capture failed! ';
      } else {
        statusMessage += 'All checks passed - export should work.';
      }
      
      setExportStatus(statusMessage);
      
      // Clear status after longer delay for debug messages
      setTimeout(() => {
        setExportStatus('');
      }, 8000);
      
    } catch (error) {
      console.error('Debug failed:', error);
      setExportStatus(`Debug failed: ${error.message}`);
      
      setTimeout(() => {
        setExportStatus('');
      }, 4000);
    }
  };

  const OrientationCard = ({ orientation, isSelected, onClick }) => {
    const isLandscape = orientation === 'landscape';
    
    return (
      <button
        onClick={onClick}
        className={`relative p-4 border-2 rounded-lg transition-all duration-200 ${
          isSelected 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 hover:border-gray-300 bg-white'
        }`}
      >
        {/* Visual representation */}
        <div className="flex justify-center mb-3">
          <div className={`border-2 border-gray-400 bg-white shadow-sm ${
            isLandscape ? 'w-16 h-12' : 'w-12 h-16'
          }`}>
            {/* Header */}
            <div className="bg-slate-800 h-2 w-full"></div>
            {/* Content lines */}
            <div className="p-1 space-y-1">
              <div className="bg-gray-300 h-1 w-full rounded"></div>
              <div className="bg-gray-200 h-1 w-3/4 rounded"></div>
              <div className="bg-gray-200 h-1 w-1/2 rounded"></div>
            </div>
          </div>
        </div>
        
        {/* Icon and label */}
        <div className="flex items-center justify-center gap-2 mb-2">
          {isLandscape ? (
            <Monitor size={16} className="text-gray-600" />
          ) : (
            <Smartphone size={16} className="text-gray-600" />
          )}
          <span className="font-medium text-sm capitalize">{orientation}</span>
        </div>
        
        {/* Description */}
        <p className="text-xs text-gray-500 text-center">
          {isLandscape 
            ? 'Best for wide charts and tables' 
            : 'Best for text and vertical content'
          }
        </p>
        
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute -top-2 -right-2">
            <CheckCircle className="w-6 h-6 text-blue-500 bg-white rounded-full" />
          </div>
        )}
      </button>
    );
  };

  const ExportModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Export PDF</h3>
              <p className="text-sm text-gray-500">{dashboardConfig.title}</p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {showOrientationChoice && (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose Orientation
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <OrientationCard
                    orientation="portrait"
                    isSelected={selectedOrientation === 'portrait'}
                    onClick={() => setSelectedOrientation('portrait')}
                  />
                  <OrientationCard
                    orientation="landscape"
                    isSelected={selectedOrientation === 'landscape'}
                    onClick={() => setSelectedOrientation('landscape')}
                  />
                </div>
              </div>
            </>
          )}

          {/* Dashboard info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{dashboardConfig.icon}</span>
              <h4 className="font-medium text-gray-900">{dashboardConfig.title}</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">{dashboardConfig.subtitle}</p>
            
            <div className="space-y-1 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Format:</span>
                <span className="font-medium">PDF</span>
              </div>
              <div className="flex justify-between">
                <span>Orientation:</span>
                <span className="font-medium capitalize">{selectedOrientation}</span>
              </div>
              <div className="flex justify-between">
                <span>Quality:</span>
                <span className="font-medium">High (2x Resolution)</span>
              </div>
              <div className="flex justify-between">
                <span>Branding:</span>
                <span className="font-medium">CLARITY Professional</span>
              </div>
            </div>
          </div>

          {/* Export status */}
          {exportStatus && (
            <div className={`rounded-lg p-3 mb-4 flex items-center gap-2 ${
              exportResult?.success === false 
                ? 'bg-red-50 text-red-700' 
                : 'bg-blue-50 text-blue-700'
            }`}>
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : exportResult?.success === false ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">{exportStatus}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t bg-gray-50 rounded-b-lg">
          {/* Debug Button */}
          <button
            onClick={handleDebug}
            disabled={isExporting}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 bg-gray-200 border border-gray-300 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Run diagnostics to identify export issues"
          >
            <Bug size={14} />
            Debug
          </button>

          {showPreview && (
            <button
              onClick={() => handleExport(selectedOrientation, true)}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPreviewMode && isExporting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Eye size={16} />
              )}
              Preview
            </button>
          )}
          
          <button
            onClick={() => handleExport(selectedOrientation, false)}
            disabled={isExporting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {!isPreviewMode && isExporting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            {isExporting && !isPreviewMode ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Main Export Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={isExporting}
        className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm ${className}`}
        title={`Export ${dashboardConfig.title} as PDF`}
      >
        {isExporting && !isModalOpen ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <FileText size={16} />
        )}
        <span className="text-sm font-medium">{title}</span>
        {!isExporting && (
          <Settings size={14} className="opacity-70" />
        )}
      </button>

      {/* Export status tooltip */}
      {exportStatus && !isModalOpen && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className={`rounded-lg p-3 shadow-lg flex items-center gap-2 ${
            exportResult?.success === false 
              ? 'bg-red-100 text-red-800 border border-red-200' 
              : 'bg-green-100 text-green-800 border border-green-200'
          }`}>
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : exportResult?.success === false ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{exportStatus}</span>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {isModalOpen && <ExportModal />}
    </>
  );
};

export default PDFExportButton;