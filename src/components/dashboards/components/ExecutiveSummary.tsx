import React from 'react';
import { I9Metrics, PreviousMetrics } from '../../../types';
import { BaseComponentProps } from '../../../types/components';

interface ExecutiveSummaryProps extends BaseComponentProps {
  currentMetrics: I9Metrics;
  previousMetrics?: PreviousMetrics;
  customSummary?: string;
  showMetrics?: boolean;
  loading?: boolean;
  error?: string | null;
}

const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  currentMetrics,
  previousMetrics,
  customSummary,
  showMetrics = true,
  loading = false,
  error = null,
  className = '',
  ...ariaProps
}) => {
  // Calculate key changes
  const complianceChange = previousMetrics 
    ? currentMetrics.overallCompliance - previousMetrics.overallCompliance
    : 0;
  
  const formsChange = previousMetrics 
    ? currentMetrics.totalI9s - previousMetrics.totalI9s
    : 0;

  // Generate dynamic summary based on metrics
  const generateSummary = () => {
    const currentQuarter = "Q2 2025";
    const institution = "Creighton University";
    
    return {
      currentStatus: `${institution} processed ${currentMetrics.totalI9s} I-9 forms in ${currentQuarter}, achieving a ${currentMetrics.overallCompliance}% overall compliance rate and ${currentMetrics.section2Compliance}% Section 2 timeliness. This represents a ${complianceChange >= 0 ? '+' : ''}${complianceChange}% ${complianceChange >= 0 ? 'improvement' : 'decline'} from the previous quarter, demonstrating ${complianceChange >= 0 ? 'steady progress toward' : 'challenges in reaching'} our 95% target.`,
      
      achievements: currentMetrics.overallCompliance >= 90 
        ? `Implementation of SOP v2 has improved process consistency. Phoenix Campus maintains 100% compliance. Training program enrollment is at 79% completion with all I-9 completers on track for certification by year-end.`
        : `While facing compliance challenges, the team has maintained process improvements through SOP v2 implementation. Training program continues with 79% enrollment to strengthen future compliance.`,
      
      improvements: `Faculty/Staff operations show ${Math.round((currentMetrics.section2Late / currentMetrics.totalI9s) * 100)}% late completion rate (${currentMetrics.section2Late}/${currentMetrics.totalI9s} forms), while student worker processing requires attention. The Interfolio pilot for faculty onboarding is underway to address systemic delays.`,
      
      nextSteps: `Complete annual training rollout, finalize Interfolio integration pilot, and implement enhanced monitoring for high-volume hiring periods to achieve and maintain 95% compliance target.`
    };
  };

  const summary = generateSummary();

  if (loading) {
    return (
      <div className={className} {...ariaProps}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className} {...ariaProps}>
        <h2 className="text-xl font-bold text-gray-700 mb-3">Executive Summary</h2>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-600">Error loading executive summary: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={className}
      role="region"
      aria-label="Executive Summary of I-9 Compliance Status"
      {...ariaProps}
    >
      <h2 className="text-xl print:text-lg font-bold text-blue-700 print:text-black mb-3 print:mb-2">
        I-9 COMPLIANCE EXECUTIVE SUMMARY
      </h2>

      {showMetrics && (
        <div className="mb-4 p-3 bg-blue-50 print:bg-white border border-blue-200 print:border-gray-300 rounded">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-blue-700 print:text-black">
                {currentMetrics.overallCompliance}%
              </div>
              <div className="text-xs text-blue-600 print:text-black">
                Overall Compliance
              </div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-700 print:text-black">
                {currentMetrics.totalI9s}
              </div>
              <div className="text-xs text-blue-600 print:text-black">
                Forms Processed
              </div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-700 print:text-black">
                {currentMetrics.section2Compliance}%
              </div>
              <div className="text-xs text-blue-600 print:text-black">
                Section 2 Timeliness
              </div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-700 print:text-black">
                {currentMetrics.auditReady}%
              </div>
              <div className="text-xs text-blue-600 print:text-black">
                Audit Readiness
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3 print:space-y-2 text-sm print:text-xs">
        <div>
          <h3 className="font-semibold text-gray-900 print:text-black mb-1">
            Current Status:
          </h3>
          <p className="text-gray-700 print:text-black leading-relaxed">
            {customSummary || summary.currentStatus}
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 print:text-black mb-1">
            Key Achievements:
          </h3>
          <p className="text-gray-700 print:text-black leading-relaxed">
            {summary.achievements}
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 print:text-black mb-1">
            Areas for Improvement:
          </h3>
          <p className="text-gray-700 print:text-black leading-relaxed">
            {summary.improvements}
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 print:text-black mb-1">
            Next Quarter Focus:
          </h3>
          <p className="text-gray-700 print:text-black leading-relaxed">
            {summary.nextSteps}
          </p>
        </div>
      </div>

      {/* Risk assessment summary */}
      <div className="mt-4 pt-3 border-t border-gray-200 print:border-gray-400">
        <h3 className="font-semibold text-gray-900 print:text-black mb-2 text-sm">
          Risk Assessment:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600 print:text-black">
          <div>
            <span className="font-medium">Compliance Risk:</span>{' '}
            <span className={`${
              currentMetrics.overallCompliance >= 95 
                ? 'text-green-600 print:text-black' 
                : currentMetrics.overallCompliance >= 90 
                ? 'text-yellow-600 print:text-black' 
                : 'text-red-600 print:text-black'
            }`}>
              {currentMetrics.overallCompliance >= 95 ? 'Low' : currentMetrics.overallCompliance >= 90 ? 'Medium' : 'High'}
            </span>
          </div>
          <div>
            <span className="font-medium">Audit Readiness:</span>{' '}
            <span className={`${
              currentMetrics.auditReady >= 90 
                ? 'text-green-600 print:text-black' 
                : currentMetrics.auditReady >= 85 
                ? 'text-yellow-600 print:text-black' 
                : 'text-red-600 print:text-black'
            }`}>
              {currentMetrics.auditReady >= 90 ? 'Ready' : currentMetrics.auditReady >= 85 ? 'Needs Attention' : 'Not Ready'}
            </span>
          </div>
        </div>
      </div>

      {/* Generated timestamp */}
      <div className="mt-4 pt-2 border-t border-gray-200 print:border-gray-400 text-xs text-gray-500 print:text-black">
        <p>
          Report generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </p>
      </div>

      {/* Screen reader summary */}
      <div className="sr-only">
        <h3>Executive Summary - Key Points</h3>
        <ul>
          <li>Overall compliance: {currentMetrics.overallCompliance}%</li>
          <li>Forms processed: {currentMetrics.totalI9s}</li>
          <li>Section 2 timeliness: {currentMetrics.section2Compliance}%</li>
          <li>Audit readiness: {currentMetrics.auditReady}%</li>
          <li>Change from previous quarter: {complianceChange >= 0 ? '+' : ''}{complianceChange}%</li>
        </ul>
      </div>
    </div>
  );
};

export default ExecutiveSummary;