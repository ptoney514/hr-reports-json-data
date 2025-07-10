import React from 'react';
import { Filter, Calendar, Download, Wifi, WifiOff, ShieldCheck } from 'lucide-react';
import MetricsGrid from './components/MetricsGrid';
import RiskAssessmentCard from './components/RiskAssessmentCard';
import TrendChart from './components/TrendChart';
import ComplianceTable from './components/ComplianceTable';
import ExecutiveSummary from './components/ExecutiveSummary';
import useFirebaseComplianceData from '../../hooks/useFirebaseComplianceData';
import { 
  I9Metrics, 
  PreviousMetrics, 
  ComplianceByType, 
  TrendData, 
  I9HealthDashboardProps 
} from '../../types';
import './I9Dashboard.css';

const I9HealthDashboard: React.FC<I9HealthDashboardProps> = ({
  currentMetrics,
  previousMetrics,
  complianceByType,
  trendData,
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

  // Helper function to get compliance data with proper fallbacks
  const getComplianceData = (): ComplianceByType[] => {
    // First priority: props data
    if (complianceByType && complianceByType.length > 0) {
      return complianceByType;
    }
    
    // Second priority: Firebase data (only if not empty)
    const firebaseComplianceData = (firebaseData as any)?.complianceByType;
    if (firebaseComplianceData && firebaseComplianceData.length > 0) {
      return firebaseComplianceData;
    }
    
    // Third priority: comprehensive mock data
    return [
      // High Performers (95%+) - Green indicators
      { name: 'Full-Time Faculty', total: 342, onTime: 331, late: 11, rate: 96.8 },
      { name: 'Administrative Staff', total: 156, onTime: 151, late: 5, rate: 96.8 },
      { name: 'Research Associates', total: 89, onTime: 86, late: 3, rate: 96.6 },
      { name: 'Library Staff', total: 67, onTime: 65, late: 2, rate: 97.0 },
      { name: 'IT Support', total: 45, onTime: 44, late: 1, rate: 97.8 },
      { name: 'Department Heads', total: 28, onTime: 27, late: 1, rate: 96.4 },
      
      // Medium Performers (90-94%) - Orange indicators  
      { name: 'Graduate Assistants', total: 234, onTime: 218, late: 16, rate: 93.2 },
      { name: 'Part-Time Faculty', total: 189, onTime: 175, late: 14, rate: 92.6 },
      { name: 'Maintenance Staff', total: 78, onTime: 71, late: 7, rate: 91.0 },
      { name: 'Food Service', total: 124, onTime: 113, late: 11, rate: 91.1 },
      { name: 'Security Personnel', total: 52, onTime: 48, late: 4, rate: 92.3 },
      { name: 'Student Affairs', total: 36, onTime: 33, late: 3, rate: 91.7 },
      
      // Low Performers (<90%) - Red indicators
      { name: 'Student Workers', total: 412, onTime: 356, late: 56, rate: 86.4 },
      { name: 'Temporary Staff', total: 93, onTime: 79, late: 14, rate: 84.9 },
      { name: 'Contract Workers', total: 167, onTime: 142, late: 25, rate: 85.0 },
      { name: 'Seasonal Employees', total: 58, onTime: 48, late: 10, rate: 82.8 },
      { name: 'Visiting Scholars', total: 34, onTime: 27, late: 7, rate: 79.4 },
      { name: 'Adjunct Faculty', total: 195, onTime: 168, late: 27, rate: 86.2 },
      { name: 'Work Study Students', total: 278, onTime: 235, late: 43, rate: 84.5 },
      { name: 'Athletic Staff', total: 41, onTime: 35, late: 6, rate: 85.4 }
    ];
  };

  const defaultComplianceByType: ComplianceByType[] = getComplianceData();

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
    <div className={`min-h-screen bg-gray-50 py-8 dashboard-container print:bg-white print:py-0 ${className}`} {...ariaProps}>
      <div className="max-w-7xl mx-auto px-4 print:max-w-none print:px-0 print:mx-0">
        {/* Header with Title Above Filters */}
        <div className="mb-6">
          {/* Title Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-blue-600" size={24} />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">I-9 Compliance Health Dashboard</h1>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-gray-600 text-sm">
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
          </div>
        </div>

        {/* Key Metrics Cards */}
        <MetricsGrid 
          currentMetrics={defaultCurrentMetrics}
          previousMetrics={defaultPreviousMetrics}
          className="mb-6 print:mb-4"
        />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:gap-2 mb-6 print:mb-4 print:break-page">
          <RiskAssessmentCard 
            className="bg-white print:bg-white p-6 print:p-4 rounded-lg shadow-sm border print:border-gray"
          />
          
          <TrendChart 
            data={defaultTrendData}
            title="Quarterly Compliance Trend"
            height={240}
            className="bg-white print:bg-white p-6 print:p-4 rounded-lg shadow-sm border print:border-gray"
          />
        </div>


        {/* Detailed Table */}
        <ComplianceTable 
          data={defaultComplianceByType}
          className="bg-white print:bg-white p-6 print:p-4 rounded-lg shadow-sm border print:border-gray mb-6 print:mb-4 print:no-break"
        />

        {/* Executive Summary */}
        <ExecutiveSummary 
          currentMetrics={defaultCurrentMetrics}
          previousMetrics={defaultPreviousMetrics}
          className="bg-gray-50 print:bg-white p-6 print:p-4 rounded-lg border border-gray-200 print:border-gray print:no-break"
        />
      </div>
    </div>
  );
};

export default I9HealthDashboard;