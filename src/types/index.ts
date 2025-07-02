// Core application types for the HR Reports Project

// ===== METRICS AND DASHBOARD TYPES =====

export interface I9Metrics {
  totalI9s: number;
  section2OnTime: number;
  section2Late: number;
  section2Compliance: number;
  overallCompliance: number;
  reverifications: number;
  auditReady: number;
}

export interface PreviousMetrics {
  totalI9s: number;
  section2Compliance: number;
  overallCompliance: number;
}

export interface ComplianceByType {
  name: string;
  total: number;
  onTime: number;
  late: number;
  rate: number;
}

export interface TrendData {
  quarter: string;
  compliance: number;
  processed: number;
}

export interface RiskMetric {
  category: string;
  count: number;
  risk: 'Low' | 'Medium' | 'High' | 'Critical';
  color: string;
}

export interface ProcessImprovement {
  initiative: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  progress: number;
  target: string;
  owner: string;
}

// ===== CHART DATA TYPES =====

export interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface BarChartData extends ChartData {
  total?: number;
  onTime?: number;
  late?: number;
  rate?: number;
}

export interface LineChartData extends ChartData {
  quarter?: string;
  compliance?: number;
  processed?: number;
}

export interface PieChartData extends ChartData {
  employees?: number;
  contractors?: number;
  fill?: string;
}

// ===== WORKFORCE DATA TYPES =====

export interface WorkforceData {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  division: string;
  location: string;
  employeeType: 'Faculty' | 'Staff' | 'Student' | 'Contractor';
  hireDate: string;
  status: 'Active' | 'Inactive' | 'Terminated';
  i9ComplianceStatus: 'Compliant' | 'Non-Compliant' | 'Pending';
  section2CompletionDate?: string;
  reverificationDate?: string;
}

export interface TurnoverData {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  division: string;
  location: string;
  employeeType: 'Faculty' | 'Staff' | 'Student' | 'Contractor';
  hireDate: string;
  terminationDate: string;
  reason: string;
  voluntary: boolean;
  tenure: number;
}

// ===== COMPONENT PROPS TYPES =====

export interface SummaryCardProps {
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  format?: 'number' | 'percentage' | 'currency';
  className?: string;
  icon?: React.ComponentType<any>;
  loading?: boolean;
}

export interface ChartProps {
  data: ChartData[];
  title?: string;
  height?: number;
  width?: number;
  className?: string;
  loading?: boolean;
  error?: string | null;
}

export interface ComplianceChartProps extends ChartProps {
  data: BarChartData[];
  showLegend?: boolean;
  showTooltip?: boolean;
}

export interface TrendChartProps extends ChartProps {
  data: LineChartData[];
  showGrid?: boolean;
  showDots?: boolean;
}

export interface RiskIndicatorsProps {
  riskMetrics: RiskMetric[];
  className?: string;
  loading?: boolean;
}

export interface ProcessImprovementsProps {
  improvements: ProcessImprovement[];
  className?: string;
  loading?: boolean;
}

export interface MetricsGridProps {
  currentMetrics: I9Metrics;
  previousMetrics: PreviousMetrics;
  loading?: boolean;
  className?: string;
}

// ===== FILTER AND STATE TYPES =====

export interface DateRange {
  type: 'quarter' | 'month' | 'custom';
  startDate: Date;
  endDate: Date;
  quarter?: string;
  year?: number;
}

export interface FilterState {
  reportingPeriod: string;
  locationFilter: string;
  divisionFilter: string;
  departmentFilter: string;
  employeeTypeFilter: string;
  dateRange: DateRange;
  customDateRange?: {
    start: Date;
    end: Date;
  };
}

export interface DashboardState extends FilterState {
  loading: boolean;
  error: string | null;
  dashboardType: string;
  lastUpdated: Date | null;
}

// ===== ACTION TYPES FOR REDUCERS =====

export interface DashboardAction {
  type: string;
  payload?: any;
}

export interface SetLoadingAction extends DashboardAction {
  type: 'SET_LOADING';
  payload: boolean;
}

export interface SetErrorAction extends DashboardAction {
  type: 'SET_ERROR';
  payload: string | null;
}

export interface SetFiltersAction extends DashboardAction {
  type: 'SET_FILTERS';
  payload: Partial<FilterState>;
}

export type DashboardActionTypes = 
  | SetLoadingAction 
  | SetErrorAction 
  | SetFiltersAction;

// ===== API RESPONSE TYPES =====

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  timestamp: string;
  version?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface I9MetricsResponse extends ApiResponse<I9Metrics> {
  metadata?: {
    calculatedAt: string;
    includesData: string[];
    excludesData?: string[];
  };
}

export interface WorkforceDataResponse extends PaginatedResponse<WorkforceData> {
  filters?: FilterState;
  aggregates?: {
    totalEmployees: number;
    byDepartment: Record<string, number>;
    byLocation: Record<string, number>;
    byEmployeeType: Record<string, number>;
  };
}

// ===== EXPORT AND UTILITY TYPES =====

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  includeCharts: boolean;
  includeFilters: boolean;
  fileName?: string;
  dateRange?: DateRange;
  customFields?: string[];
}

export interface ExportResult {
  success: boolean;
  fileName: string;
  filePath?: string;
  downloadUrl?: string;
  error?: string;
  fileSize?: number;
  generatedAt: string;
}

// ===== ERROR TYPES =====

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  context?: {
    component?: string;
    function?: string;
    userId?: string;
    sessionId?: string;
  };
}

export interface ValidationError extends AppError {
  field: string;
  value: any;
  rule: string;
}

// ===== ACCESSIBILITY TYPES =====

export interface AccessibilityOptions {
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  screenReaderMode: boolean;
  keyboardNavigation: boolean;
}

export interface AriaProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  'aria-checked'?: boolean;
  'aria-disabled'?: boolean;
  'aria-hidden'?: boolean;
  role?: string;
  tabIndex?: number;
}

// ===== PERFORMANCE MONITORING TYPES =====

export interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  mountTime: number;
  updateTime: number;
  memoryUsage?: number;
  timestamp: string;
}

export interface WebVitals {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
}

// ===== DATABASE SCHEMA TYPES =====

export interface DatabaseRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface TurnoverRecord extends DatabaseRecord, TurnoverData {}
export interface WorkforceRecord extends DatabaseRecord, WorkforceData {}

// ===== UTILITY TYPES =====

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ===== COMPONENT REF TYPES =====

export interface ChartRef {
  exportChart: (format: 'png' | 'svg' | 'pdf') => Promise<ExportResult>;
  refreshData: () => Promise<void>;
  updateData: (newData: ChartData[]) => void;
}

export interface DashboardRef {
  exportDashboard: (options: ExportOptions) => Promise<ExportResult>;
  refreshAllData: () => Promise<void>;
  applyFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
}

// ===== EVENT TYPES =====

export interface ChartClickEvent {
  dataKey: string;
  value: number;
  payload: ChartData;
  index: number;
}

export interface FilterChangeEvent {
  filterType: keyof FilterState;
  value: any;
  previousValue: any;
}

export interface ExportEvent {
  format: ExportOptions['format'];
  componentName: string;
  success: boolean;
  duration: number;
  fileSize?: number;
}

// ===== DASHBOARD COMPONENT PROPS =====

export interface I9HealthDashboardProps extends AriaProps {
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
  loading?: boolean;
  error?: string | null;
  className?: string;
}