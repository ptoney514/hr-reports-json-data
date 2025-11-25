import React, { useState } from 'react';
import { FileText, Download, Eye, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import MultiDashboardPDFGenerator from '../../utils/multiDashboardPDFGenerator';
import { REPORT_TEMPLATES } from '../../config/reportTemplates';

const ReportGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleGenerateReport = async (action = 'download') => {
    setIsGenerating(true);
    setProgress(null);
    setError(null);
    setSuccess(false);

    try {
      // Get Q1 FY26 template
      const template = REPORT_TEMPLATES.Q1_FY26_WORKFORCE;

      // Create generator
      const generator = new MultiDashboardPDFGenerator(template);

      // Set progress callback
      generator.setProgressCallback((progressData) => {
        setProgress(progressData);
      });

      // Generate based on action
      if (action === 'preview') {
        await generator.preview();
        setSuccess(true);
      } else {
        await generator.save();
        setSuccess(true);
      }

    } catch (err) {
      console.error('Error generating report:', err);
      setError(err.message || 'Failed to generate report');
    } finally {
      setIsGenerating(false);
      setTimeout(() => {
        setProgress(null);
        setSuccess(false);
      }, 3000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="h-8 w-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Automated Report Generator</h2>
        </div>
        <p className="text-gray-600">
          Generate a complete PDF report with all Q1 FY26 dashboards in one click
        </p>
      </div>

      {/* Report Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-3">Q1 FY26 Workforce Report</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-center justify-between">
            <span>Report Period:</span>
            <span className="font-medium">July 1, 2025 - September 30, 2025</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Total Pages:</span>
            <span className="font-medium">5 pages (Cover, TOC, 3 dashboards)</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Filename:</span>
            <span className="font-medium font-mono text-xs">HR_Workforce_Reports_Q1_FY26.pdf</span>
          </div>
        </div>

        {/* Included Dashboards */}
        <div className="mt-4 pt-4 border-t border-blue-200">
          <h4 className="text-xs font-semibold text-blue-900 mb-2">INCLUDED DASHBOARDS:</h4>
          <ul className="space-y-1 text-xs text-blue-800">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
              Workforce & Headcount Analysis
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
              Turnover & Terminations Analysis
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
              Exit Survey Results
            </li>
          </ul>
        </div>
      </div>

      {/* Progress Bar */}
      {progress && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{progress.message}</span>
            <span className="text-sm text-gray-600">{progress.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            ></div>
          </div>
          {progress.current > 0 && progress.total > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              Page {progress.current} of {progress.total}
            </div>
          )}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Report generated successfully!</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <div>
              <div className="font-medium">Error generating report</div>
              <div className="text-sm mt-1">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => handleGenerateReport('download')}
          disabled={isGenerating}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isGenerating ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              Generate & Download PDF
            </>
          )}
        </button>

        <button
          onClick={() => handleGenerateReport('preview')}
          disabled={isGenerating}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
        >
          <Eye className="h-5 w-5" />
          Preview
        </button>
      </div>

      {/* How It Works */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">How It Works</h4>
        <ol className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span className="font-semibold text-blue-600">1.</span>
            <span>Captures high-resolution screenshots of each Q1 FY26 dashboard</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-blue-600">2.</span>
            <span>Generates professional cover page with Creighton University branding</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-blue-600">3.</span>
            <span>Creates table of contents with page numbers</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-blue-600">4.</span>
            <span>Stitches all pages together with headers, footers, and page numbers</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-blue-600">5.</span>
            <span>Downloads the complete PDF report ready to share with leadership</span>
          </li>
        </ol>
      </div>

      {/* Note */}
      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-xs text-yellow-800">
          <strong>Note:</strong> Make sure all three Q1 FY26 dashboards are accessible before generating the report.
          The generator will navigate to each dashboard to capture screenshots.
        </p>
      </div>
    </div>
  );
};

export default ReportGenerator;
