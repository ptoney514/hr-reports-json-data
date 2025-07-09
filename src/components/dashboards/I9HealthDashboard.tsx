import React from 'react';
import { Filter, Calendar, Download, Wifi, WifiOff } from 'lucide-react';
import MetricsGrid from './components/MetricsGrid';
import ComplianceChart from './components/ComplianceChart';
import TrendChart from './components/TrendChart';
import RiskIndicators from './components/RiskIndicators';
import ProcessImprovements from './components/ProcessImprovements';
import ComplianceTable from './components/ComplianceTable';
import ExecutiveSummary from './components/ExecutiveSummary';
import useFirebaseComplianceData from '../../hooks/useFirebaseComplianceData';
import { 
  I9Metrics, 
  PreviousMetrics, 
  ComplianceByType, 
  TrendData, 
  RiskMetric, 
  ProcessImprovement,
  I9HealthDashboardProps 
} from '../../types';
import './I9Dashboard.css';

const I9HealthDashboard: React.FC<I9HealthDashboardProps> = ({
  currentMetrics,
  previousMetrics,
  complianceByType,
  trendData,
  riskMetrics,
  improvements,
  filters,
  onFilterChange,
  onExport,
  autoRefresh = false,
  refreshInterval = 300000, // 5 minutes
  loading: propLoading = false,
  error: propError = null,
  className = '',
  ...ariaProps
}) => {
  // Use Firebase data when props are not provided
  const { 
    data: firebaseData, 
    loading: firebaseLoading, 
    error: firebaseError, 
    isRealTime, 
    lastSyncTime 
  } = useFirebaseComplianceData('2025-Q1');

  // Determine if we should use Firebase data or props
  const shouldUseFirebase = !currentMetrics && !previousMetrics && !complianceByType;
  const loading = shouldUseFirebase ? firebaseLoading : propLoading;
  const error = shouldUseFirebase ? firebaseError : propError;
  // Use Firebase data or props with fallbacks (type assertions for Firebase data)
  const defaultCurrentMetrics: I9Metrics = currentMetrics || 
    ((firebaseData as any)?.currentMetrics) || 
    {
      totalI9s: 847,
      section2OnTime: 732,
      section2Late: 115,
      section2Compliance: 86,
      overallCompliance: 88,
      reverifications: 23,
      auditReady: 82
    };

  const defaultPreviousMetrics: PreviousMetrics = previousMetrics || 
    ((firebaseData as any)?.previousMetrics) || 
    {
      totalI9s: 798,
      section2Compliance: 89,
      overallCompliance: 91
    };

  const defaultComplianceByType: ComplianceByType[] = complianceByType || 
    ((firebaseData as any)?.complianceByType) || 
    [
      { name: 'Faculty', total: 245, onTime: 228, late: 17, rate: 93 },
      { name: 'Staff', total: 318, onTime: 285, late: 33, rate: 90 },
      { name: 'Graduate Students', total: 156, onTime: 142, late: 14, rate: 91 },
      { name: 'Undergraduate Students', total: 89, onTime: 71, late: 18, rate: 80 },
      { name: 'Contractors', total: 24, onTime: 18, late: 6, rate: 75 },
      { name: 'Temporary Workers', total: 12, onTime: 8, late: 4, rate: 67 },
      { name: 'Visiting Scholars', total: 8, onTime: 7, late: 1, rate: 88 },
      { name: 'Adjunct Faculty', total: 195, onTime: 173, late: 22, rate: 89 }
    ];

  const defaultTrendData: TrendData[] = trendData || 
    ((firebaseData as any)?.trendData) || 
    [
      { quarter: 'Q1-24', compliance: 92, processed: 723 },
      { quarter: 'Q2-24', compliance: 89, processed: 798 },
      { quarter: 'Q3-24', compliance: 91, processed: 765 },
      { quarter: 'Q4-24', compliance: 90, processed: 812 },
      { quarter: 'Q1-25', compliance: 88, processed: 847 },
      { quarter: 'Q2-25', compliance: 86, processed: 889 }
    ];

  // Enhanced risk data with severity percentages and additional metadata
  const enhancedRiskMetrics = [
    { category: 'Late Section 2', count: 115, risk: 'High', color: '#ef4444', severity: 78, trend: 'increasing', description: 'Section 2 forms completed after deadline' },
    { category: 'Missing Training', count: 34, risk: 'High', color: '#ef4444', severity: 72, trend: 'stable', description: 'HR staff without required I-9 training' },
    { category: 'Documentation Issues', count: 28, risk: 'Medium', color: '#f59e0b', severity: 45, trend: 'decreasing', description: 'Incomplete or incorrect form documentation' },
    { category: 'System Errors', count: 15, risk: 'Medium', color: '#f59e0b', severity: 38, trend: 'stable', description: 'Technical system processing errors' },
    { category: 'Verification Delays', count: 19, risk: 'Medium', color: '#f59e0b', severity: 42, trend: 'increasing', description: 'Delayed employee document verification' },
    { category: 'Audit Findings', count: 8, risk: 'Critical', color: '#dc2626', severity: 95, trend: 'stable', description: 'Critical compliance audit violations' },
    { category: 'Process Gaps', count: 22, risk: 'Medium', color: '#f59e0b', severity: 48, trend: 'decreasing', description: 'Identified workflow inefficiencies' },
    { category: 'Compliance Monitoring', count: 6, risk: 'Low', color: '#eab308', severity: 20, trend: 'stable', description: 'Routine monitoring alerts' }
  ];

  const defaultRiskMetrics: RiskMetric[] = riskMetrics || 
    ((firebaseData as any)?.riskMetrics) || enhancedRiskMetrics;


  const defaultImprovements: ProcessImprovement[] = improvements || 
    ((firebaseData as any)?.improvements) || 
    [
      { 
        initiative: 'SOP v2 Implementation', 
        status: 'Completed', 
        progress: 100,
        target: '+3% compliance',
        owner: 'HR Team'
      },
      { 
        initiative: 'Annual Training Program', 
        status: 'In Progress', 
        progress: 75,
        target: '100% completion',
        owner: 'Training Team'
      },
      { 
        initiative: 'Interfolio Integration', 
        status: 'In Progress', 
        progress: 60,
        target: 'Pilot completion',
        owner: 'IT Team'
      },
      { 
        initiative: 'Dashboard Automation', 
        status: 'Completed', 
        progress: 100,
        target: '+15% efficiency',
        owner: 'Analytics Team'
      }
    ];

  const handlePrint = (): void => {
    window.print();
  };

  const handleFilterClick = (): void => {
    // TODO: Implement filter functionality
    console.log('Filter clicked');
  };

  const handleCalendarClick = (): void => {
    // TODO: Implement calendar functionality
    console.log('Calendar clicked');
  };

  const handleExportClick = (): void => {
    if (onExport) {
      onExport({
        format: 'pdf',
        includeCharts: true,
        includeFilters: true,
        fileName: `I9-Compliance-Dashboard-${new Date().toISOString().split('T')[0]}`
      });
    } else {
      handlePrint();
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="bg-gray-50 p-4 min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-gray-50 p-4 min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`bg-gray-50 p-4 min-h-screen print:bg-white print:p-2 print:text-black ${className}`}
      {...ariaProps}
    >
      {/* Header */}
      <div className="mb-4 print:mb-2 flex justify-between items-center print:no-break">
        <div>
          <h1 className="text-2xl print:text-xl font-bold text-blue-700 print:text-black">
            I-9 Compliance Health Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-sm print:text-xs text-gray-600 print:text-black">
              Quarter: Q2 2025 | Generated: {new Date().toLocaleDateString()}
            </p>
            {shouldUseFirebase && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className={isRealTime ? 'text-green-600' : 'text-gray-400'}>
                  {isRealTime ? '🔴 Live' : '📊 Cached'} (Firebase)
                </span>
                {isRealTime && <Wifi size={14} className="text-green-500" />}
                {!isRealTime && <WifiOff size={14} className="text-gray-400" />}
                {lastSyncTime && (
                  <span className="text-xs">
                    | Last sync: {(lastSyncTime as Date).toLocaleTimeString()}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-3 no-print">
          <button 
            className="flex items-center gap-1 px-3 py-1 bg-white border rounded shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={handleFilterClick}
            aria-label="Open filters"
          >
            <Filter size={16} />
            <span>Filters</span>
          </button>
          <button 
            className="flex items-center gap-1 px-3 py-1 bg-white border rounded shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={handleCalendarClick}
            aria-label="Select time period"
          >
            <Calendar size={16} />
            <span>Q2 2025</span>
          </button>
          <button 
            className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={handleExportClick}
            aria-label="Export dashboard as PDF"
          >
            <Download size={16} />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <MetricsGrid 
        currentMetrics={defaultCurrentMetrics}
        previousMetrics={defaultPreviousMetrics}
        className="mb-4 print:mb-3"
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:gap-2 mb-4 print:mb-3 print:break-page">
        <ComplianceChart 
          data={defaultComplianceByType}
          title="Compliance by Employee Type"
          height={240}
          className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray"
        />
        
        <TrendChart 
          data={defaultTrendData}
          title="Quarterly Compliance Trend"
          height={240}
          className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray"
        />
      </div>

      {/* Risk and Improvements Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:gap-2 mb-4 print:mb-3 print:no-break">
        <RiskIndicators 
          riskMetrics={defaultRiskMetrics}
          className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray"
        />
        
        <ProcessImprovements 
          improvements={defaultImprovements}
          className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray"
        />
      </div>

      {/* Detailed Table */}
      <ComplianceTable 
        data={defaultComplianceByType}
        className="bg-white print:bg-white p-4 print:p-2 rounded-lg shadow-sm border print:border-gray mb-4 print:mb-3 print:no-break"
      />

      {/* Executive Summary */}
      <ExecutiveSummary 
        currentMetrics={defaultCurrentMetrics}
        previousMetrics={defaultPreviousMetrics}
        className="bg-gray-50 print:bg-white p-4 print:p-3 rounded-lg border border-gray-200 print:border-gray print:no-break"
      />
    </div>
  );
};

export default I9HealthDashboard;