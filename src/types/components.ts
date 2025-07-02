// Component-specific types for the HR Reports Project

import React from 'react';
import { 
  I9Metrics, 
  PreviousMetrics, 
  ComplianceByType, 
  TrendData, 
  RiskMetric, 
  ProcessImprovement,
  FilterState,
  ExportOptions,
  AccessibilityOptions,
  AriaProps
} from './index';

// ===== COMMON COMPONENT PROPS =====

export interface BaseComponentProps extends AriaProps {
  className?: string;
  id?: string;
  children?: React.ReactNode;
  testId?: string;
}

export interface LoadableComponentProps extends BaseComponentProps {
  loading?: boolean;
  error?: string | null;
  skeleton?: React.ComponentType;
}

export interface InteractiveComponentProps extends BaseComponentProps {
  disabled?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  onFocus?: (event: React.FocusEvent) => void;
  onBlur?: (event: React.FocusEvent) => void;
}

// ===== DASHBOARD COMPONENT PROPS =====

export interface DashboardLayoutProps extends BaseComponentProps {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  navigation?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  fullWidth?: boolean;
  fluid?: boolean;
}

export interface DashboardHeaderProps extends BaseComponentProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
  exportButton?: boolean;
  printButton?: boolean;
  lastUpdated?: Date;
  refreshAction?: () => void;
}

export interface I9HealthDashboardProps extends LoadableComponentProps {
  currentMetrics?: I9Metrics;
  previousMetrics?: PreviousMetrics;
  complianceByType?: ComplianceByType[];
  trendData?: TrendData[];
  riskMetrics?: RiskMetric[];
  improvements?: ProcessImprovement[];
  filters?: FilterState;
  onFilterChange?: (filters: Partial<FilterState>) => void;
  onExport?: (options: ExportOptions) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

// ===== METRICS COMPONENT PROPS =====

export interface MetricsGridProps extends LoadableComponentProps {
  currentMetrics: I9Metrics;
  previousMetrics?: PreviousMetrics;
  layout?: 'grid' | 'row' | 'column';
  cardSize?: 'small' | 'medium' | 'large';
  showComparison?: boolean;
  showTrends?: boolean;
  animateChanges?: boolean;
}

export interface SummaryCardProps extends InteractiveComponentProps {
  title: string;
  value: number | string;
  previousValue?: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  format?: 'number' | 'percentage' | 'currency' | 'duration';
  prefix?: string;
  suffix?: string;
  icon?: React.ComponentType<any>;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'small' | 'medium' | 'large';
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
  skeleton?: boolean;
}

// ===== CHART COMPONENT PROPS =====

export interface ComplianceChartProps extends LoadableComponentProps {
  data: ComplianceByType[];
  title?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  height?: number;
  interactive?: boolean;
  exportable?: boolean;
  onBarClick?: (data: ComplianceByType) => void;
}

export interface TrendChartProps extends LoadableComponentProps {
  data: TrendData[];
  title?: string;
  showGrid?: boolean;
  showDots?: boolean;
  height?: number;
  timeRange?: string;
  interactive?: boolean;
  exportable?: boolean;
  onDataPointClick?: (data: TrendData) => void;
}

export interface RiskIndicatorsProps extends LoadableComponentProps {
  riskMetrics: RiskMetric[];
  layout?: 'grid' | 'list' | 'cards';
  showCounts?: boolean;
  showColors?: boolean;
  interactive?: boolean;
  onRiskClick?: (risk: RiskMetric) => void;
}

export interface ProcessImprovementsProps extends LoadableComponentProps {
  improvements: ProcessImprovement[];
  layout?: 'table' | 'cards' | 'timeline';
  showProgress?: boolean;
  showOwners?: boolean;
  showTargets?: boolean;
  sortBy?: 'progress' | 'status' | 'target' | 'owner';
  filterBy?: ProcessImprovement['status'][];
  onImprovementClick?: (improvement: ProcessImprovement) => void;
}

// ===== UI COMPONENT PROPS =====

export interface NavigationProps extends BaseComponentProps {
  items: NavigationItem[];
  orientation?: 'horizontal' | 'vertical';
  variant?: 'tabs' | 'pills' | 'links' | 'breadcrumb';
  currentPath?: string;
  onNavigate?: (path: string) => void;
  collapsible?: boolean;
  collapsed?: boolean;
}

export interface NavigationItem {
  label: string;
  path: string;
  icon?: React.ComponentType<any>;
  children?: NavigationItem[];
  disabled?: boolean;
  badge?: string | number;
  exact?: boolean;
}

export interface FilterButtonProps extends InteractiveComponentProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  availableFilters?: string[];
  showClearAll?: boolean;
  showApplyButton?: boolean;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'click' | 'hover';
}

export interface ExportButtonProps extends InteractiveComponentProps {
  onExport: (options: ExportOptions) => void;
  availableFormats?: ExportOptions['format'][];
  defaultFormat?: ExportOptions['format'];
  includeOptions?: boolean;
  downloadImmediately?: boolean;
  showProgress?: boolean;
}

export interface LoadingSkeletonProps extends BaseComponentProps {
  variant?: 'text' | 'rectangular' | 'circular' | 'card' | 'chart';
  animation?: 'pulse' | 'wave' | 'none';
  lines?: number;
  height?: number | string;
  width?: number | string;
  showHeader?: boolean;
  showSummaryCards?: boolean;
  showCharts?: boolean;
  summaryCardCount?: number;
  chartCount?: number;
}

// ===== ERROR BOUNDARY PROPS =====

export interface ErrorBoundaryProps extends BaseComponentProps {
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onRetry?: () => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
  isolate?: boolean;
  showHomeButton?: boolean;
  showRetryButton?: boolean;
}

export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  retry?: () => void;
  showHomeButton?: boolean;
  showRetryButton?: boolean;
}

export interface ChartErrorBoundaryProps extends ErrorBoundaryProps {
  chartType?: string;
  fallbackChart?: React.ComponentType;
  showDataTable?: boolean;
}

export interface NetworkErrorBoundaryProps extends ErrorBoundaryProps {
  retryAttempts?: number;
  retryDelay?: number;
  exponentialBackoff?: boolean;
  onlineOnly?: boolean;
}

export interface DataErrorBoundaryProps extends ErrorBoundaryProps {
  dataSource?: string;
  fallbackData?: any;
  validateData?: (data: any) => boolean;
}

// ===== ACCESSIBILITY COMPONENT PROPS =====

export interface AccessibilityToggleProps extends InteractiveComponentProps {
  options: AccessibilityOptions;
  onOptionsChange: (options: Partial<AccessibilityOptions>) => void;
  showLabels?: boolean;
  orientation?: 'horizontal' | 'vertical';
  compact?: boolean;
}

export interface AccessibleDataTableProps extends BaseComponentProps {
  data: any[];
  columns: TableColumn[];
  caption?: string;
  summary?: string;
  sortable?: boolean;
  filterable?: boolean;
  searchable?: boolean;
  pagination?: TablePaginationProps;
  selection?: TableSelectionProps;
  onRowClick?: (row: any, index: number) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, any>) => void;
}

export interface TableColumn {
  key: string;
  label: string;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: any, index: number) => React.ReactNode;
  format?: (value: any) => string;
  headerRender?: () => React.ReactNode;
}

export interface TablePaginationProps {
  enabled: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  showPageInfo?: boolean;
  showPageSizeSelector?: boolean;
  position?: 'top' | 'bottom' | 'both';
}

export interface TableSelectionProps {
  enabled: boolean;
  mode?: 'single' | 'multiple';
  selectedRows?: any[];
  onSelectionChange?: (selectedRows: any[]) => void;
  selectAllEnabled?: boolean;
}

// ===== PRINT COMPONENT PROPS =====

export interface PrintUtilitiesProps extends BaseComponentProps {
  target: React.RefObject<HTMLElement>;
  title?: string;
  styles?: string;
  removeAfterPrint?: boolean;
  pageStyle?: string;
  bodyClass?: string;
  onBeforePrint?: () => void;
  onAfterPrint?: () => void;
  trigger?: () => React.ReactNode;
}

export interface PrintButtonProps extends InteractiveComponentProps {
  target: React.RefObject<HTMLElement>;
  title?: string;
  variant?: 'button' | 'link' | 'icon';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ComponentType<any>;
  text?: string;
  onPrintStart?: () => void;
  onPrintComplete?: () => void;
}

export interface PrintSectionProps extends BaseComponentProps {
  title?: string;
  pageBreakBefore?: boolean;
  pageBreakAfter?: boolean;
  avoidBreakInside?: boolean;
  printOnly?: boolean;
  screenOnly?: boolean;
}

// ===== FORM COMPONENT PROPS =====

export interface DatePickerProps extends InteractiveComponentProps {
  value?: Date;
  onChange: (date: Date | null) => void;
  format?: string;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  showTime?: boolean;
  clearable?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'outlined' | 'filled' | 'standard';
}

export interface FilterSelectProps extends InteractiveComponentProps {
  options: SelectOption[];
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  multiple?: boolean;
  clearable?: boolean;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'outlined' | 'filled' | 'standard';
}

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
  group?: string;
  icon?: React.ComponentType<any>;
}

// ===== MODAL AND OVERLAY PROPS =====

export interface ModalProps extends BaseComponentProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  closable?: boolean;
  maskClosable?: boolean;
  keyboard?: boolean;
  centered?: boolean;
  destroyOnClose?: boolean;
  footer?: React.ReactNode;
  zIndex?: number;
}

export interface TooltipProps extends BaseComponentProps {
  content: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click' | 'focus' | 'manual';
  delay?: number;
  arrow?: boolean;
  interactive?: boolean;
  maxWidth?: number;
}

// ===== TESTING COMPONENT PROPS =====

export interface TestSuiteProps extends BaseComponentProps {
  tests?: TestConfiguration[];
  autoRun?: boolean;
  showResults?: boolean;
  onTestComplete?: (results: TestResults) => void;
  onAllTestsComplete?: (results: TestResults[]) => void;
}

export interface TestConfiguration {
  name: string;
  description?: string;
  component: React.ComponentType;
  props?: any;
  expectedResult?: any;
  timeout?: number;
  skip?: boolean;
}

export interface TestResults {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  result?: any;
  timestamp: string;
}

// ===== PERFORMANCE MONITORING PROPS =====

export interface PerformanceMonitorProps extends BaseComponentProps {
  componentName: string;
  trackRenders?: boolean;
  trackUpdates?: boolean;
  trackMemory?: boolean;
  reportInterval?: number;
  onReport?: (metrics: any) => void;
}