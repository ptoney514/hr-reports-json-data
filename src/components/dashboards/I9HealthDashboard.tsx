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
      totalI9s: 619,
      section2OnTime: 579,
      section2Late: 40,
      section2Compliance: 94,
      overallCompliance: 90,
      reverifications: 10,
      auditReady: 88
    };

  const defaultPreviousMetrics: PreviousMetrics = previousMetrics || 
    ((firebaseData as any)?.previousMetrics) || 
    {
      totalI9s: 587,
      section2Compliance: 91,
      overallCompliance: 87
    };

  const defaultComplianceByType: ComplianceByType[] = complianceByType || 
    ((firebaseData as any)?.complianceByType) || 
    [
      { name: 'Faculty/Staff', total: 363, onTime: 340, late: 23, rate: 94 },
      { name: 'Students', total: 252, onTime: 235, late: 17, rate: 93 },
      { name: 'Phoenix Campus', total: 4, onTime: 4, late: 0, rate: 100 }
    ];

  const defaultTrendData: TrendData[] = trendData || 
    ((firebaseData as any)?.trendData) || 
    [
      { quarter: 'Q1-24', compliance: 85, processed: 532 },
      { quarter: 'Q2-24', compliance: 87, processed: 598 },
      { quarter: 'Q3-24', compliance: 89, processed: 612 },
      { quarter: 'Q4-24', compliance: 91, processed: 587 },
      { quarter: 'Q1-25', compliance: 87, processed: 645 },
      { quarter: 'Q2-25', compliance: 90, processed: 619 }
    ];

  const defaultRiskMetrics: RiskMetric[] = riskMetrics || 
    ((firebaseData as any)?.riskMetrics) || 
    [
      { category: 'Late Section 2', count: 40, risk: 'Medium', color: '#f59e0b' },
      { category: 'Missing Training', count: 12, risk: 'High', color: '#ef4444' },
      { category: 'Audit Findings', count: 3, risk: 'High', color: '#ef4444' },
      { category: 'Process Gaps', count: 8, risk: 'Medium', color: '#f59e0b' }
    ];

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