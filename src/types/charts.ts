// Chart-specific types for the HR Reports Project

import { ChartData, AriaProps } from './index';

// ===== RECHARTS SPECIFIC TYPES =====

export interface RechartsProps {
  width?: number;
  height?: number;
  data: ChartData[];
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

export interface BarChartProps extends RechartsProps {
  layout?: 'horizontal' | 'vertical';
  stackId?: string;
  maxBarSize?: number;
  barCategoryGap?: number;
  barGap?: number;
}

export interface LineChartProps extends RechartsProps {
  connectNulls?: boolean;
  syncId?: string;
}

export interface PieChartProps extends RechartsProps {
  cx?: number | string;
  cy?: number | string;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  paddingAngle?: number;
}

// ===== CHART CONFIGURATION TYPES =====

export interface ChartColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  neutral: string;
  background: string;
  text: string;
  border: string;
}

export interface ChartTheme {
  colors: ChartColors;
  fontSize: {
    small: number;
    medium: number;
    large: number;
  };
  fontFamily: string;
  borderRadius: number;
  spacing: {
    small: number;
    medium: number;
    large: number;
  };
}

export interface ChartTooltipConfig {
  enabled: boolean;
  formatter?: (value: any, name: string, props: any) => [string, string];
  labelFormatter?: (label: string) => string;
  contentStyle?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
  cursor?: boolean | object;
  position?: {
    x?: number;
    y?: number;
  };
}

export interface ChartLegendConfig {
  enabled: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  layout?: 'horizontal' | 'vertical';
  iconType?: 'line' | 'rect' | 'circle' | 'cross' | 'diamond' | 'square' | 'star' | 'triangle' | 'wye';
  formatter?: (value: string) => string;
}

export interface ChartGridConfig {
  enabled: boolean;
  horizontal?: boolean;
  vertical?: boolean;
  strokeDasharray?: string;
  strokeWidth?: number;
  stroke?: string;
}

export interface ChartAxisConfig {
  enabled: boolean;
  dataKey?: string;
  domain?: [number | string, number | string];
  type?: 'number' | 'category';
  scale?: 'auto' | 'linear' | 'pow' | 'sqrt' | 'log';
  tickFormatter?: (value: any) => string;
  tickCount?: number;
  minTickGap?: number;
  allowDecimals?: boolean;
  allowDuplicatedCategory?: boolean;
}

// ===== CHART COMPONENT PROPS =====

export interface BaseChartProps extends AriaProps {
  title?: string;
  subtitle?: string;
  data: ChartData[];
  loading?: boolean;
  error?: string | null;
  height?: number;
  width?: number;
  className?: string;
  theme?: Partial<ChartTheme>;
  tooltip?: Partial<ChartTooltipConfig>;
  legend?: Partial<ChartLegendConfig>;
  grid?: Partial<ChartGridConfig>;
  responsive?: boolean;
  onChartClick?: (event: any) => void;
  onDataPointClick?: (data: ChartData, index: number) => void;
  exportable?: boolean;
  printOptimized?: boolean;
}

export interface ComplianceBarChartProps extends BaseChartProps {
  xAxis?: Partial<ChartAxisConfig>;
  yAxis?: Partial<ChartAxisConfig>;
  barProps?: Partial<BarChartProps>;
  stackedBars?: boolean;
  showValues?: boolean;
  colorScheme?: 'default' | 'compliance' | 'status' | 'custom';
  customColors?: string[];
}

export interface TrendLineChartProps extends BaseChartProps {
  xAxis?: Partial<ChartAxisConfig>;
  yAxis?: Partial<ChartAxisConfig>;
  lineProps?: Partial<LineChartProps>;
  showDots?: boolean;
  showArea?: boolean;
  areaOpacity?: number;
  strokeWidth?: number;
  strokeType?: 'solid' | 'dashed' | 'dotted';
  multipleLines?: boolean;
  lineKeys?: string[];
}

export interface TurnoverPieChartProps extends BaseChartProps {
  pieProps?: Partial<PieChartProps>;
  showLabels?: boolean;
  showPercentages?: boolean;
  labelPosition?: 'inside' | 'outside';
  donutChart?: boolean;
  customLabelRender?: (entry: any) => string;
}

export interface HeadcountChartProps extends BaseChartProps {
  chartType?: 'bar' | 'line' | 'area';
  groupBy?: 'department' | 'location' | 'employeeType' | 'month' | 'quarter';
  showComparison?: boolean;
  comparisonPeriod?: 'previousMonth' | 'previousQuarter' | 'previousYear';
}

export interface DivisionsChartProps extends BaseChartProps {
  showHierarchy?: boolean;
  expandableNodes?: boolean;
  maxDepth?: number;
  nodeSize?: 'small' | 'medium' | 'large';
}

export interface LocationChartProps extends BaseChartProps {
  mapMode?: boolean;
  geographicData?: boolean;
  showRegions?: boolean;
  regionGrouping?: 'country' | 'state' | 'city' | 'custom';
}

export interface StartersLeaversChartProps extends BaseChartProps {
  timeGranularity?: 'weekly' | 'monthly' | 'quarterly';
  showNetChange?: boolean;
  showTrendline?: boolean;
  separateCharts?: boolean;
}

// ===== CHART DATA TRANSFORMATION TYPES =====

export interface ChartDataTransformer<T = any> {
  transform: (rawData: T[]) => ChartData[];
  aggregate?: (data: T[]) => any;
  filter?: (data: T[]) => T[];
  sort?: (data: T[]) => T[];
  group?: (data: T[]) => Record<string, T[]>;
}

export interface ComplianceDataTransformer extends ChartDataTransformer {
  calculateRates: boolean;
  includeTargets: boolean;
  comparisonPeriod?: string;
}

export interface TrendDataTransformer extends ChartDataTransformer {
  timeGranularity: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  fillGaps: boolean;
  smoothing?: 'none' | 'moving-average' | 'exponential';
}

// ===== CHART ANIMATION TYPES =====

export interface ChartAnimation {
  enabled: boolean;
  duration?: number;
  easing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  delay?: number;
  animateOnMount?: boolean;
  animateOnUpdate?: boolean;
}

export interface BarAnimation extends ChartAnimation {
  direction?: 'left-to-right' | 'right-to-left' | 'bottom-to-top' | 'top-to-bottom';
  staggerDelay?: number;
}

export interface LineAnimation extends ChartAnimation {
  drawingMode?: 'sequential' | 'simultaneous';
  showProgressIndicator?: boolean;
}

export interface PieAnimation extends ChartAnimation {
  rotationDirection?: 'clockwise' | 'counterclockwise';
  expandOnHover?: boolean;
  explodeOnClick?: boolean;
}

// ===== CHART INTERACTION TYPES =====

export interface ChartInteraction {
  hover?: {
    enabled: boolean;
    highlightColor?: string;
    showTooltip?: boolean;
    cursorStyle?: string;
  };
  click?: {
    enabled: boolean;
    action?: 'select' | 'drill-down' | 'filter' | 'custom';
    multiSelect?: boolean;
  };
  zoom?: {
    enabled: boolean;
    axis?: 'x' | 'y' | 'both';
    wheelZoom?: boolean;
    touchZoom?: boolean;
  };
  pan?: {
    enabled: boolean;
    axis?: 'x' | 'y' | 'both';
    mouseButton?: 'left' | 'middle' | 'right';
  };
}

// ===== CHART EXPORT TYPES =====

export interface ChartExportOptions {
  format: 'png' | 'svg' | 'pdf' | 'jpeg';
  quality?: number;
  width?: number;
  height?: number;
  backgroundColor?: string;
  includeTitle?: boolean;
  includeLegend?: boolean;
  includeTooltips?: boolean;
  fileName?: string;
}

export interface ChartExportResult {
  success: boolean;
  format: string;
  fileName: string;
  filePath?: string;
  base64Data?: string;
  error?: string;
  metadata?: {
    width: number;
    height: number;
    fileSize: number;
    generatedAt: string;
  };
}

// ===== RESPONSIVE CHART TYPES =====

export interface ResponsiveChartConfig {
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
    widescreen: number;
  };
  behavior: {
    mobile?: Partial<BaseChartProps>;
    tablet?: Partial<BaseChartProps>;
    desktop?: Partial<BaseChartProps>;
    widescreen?: Partial<BaseChartProps>;
  };
  aspectRatio?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    widescreen?: number;
  };
}

// ===== CHART ACCESSIBILITY TYPES =====

export interface ChartAccessibility extends AriaProps {
  screenReaderText?: string;
  keyboardNavigation?: boolean;
  focusIndicator?: {
    enabled: boolean;
    color?: string;
    width?: number;
    style?: 'solid' | 'dashed' | 'dotted';
  };
  highContrast?: boolean;
  colorBlindFriendly?: boolean;
  dataTable?: {
    enabled: boolean;
    caption?: string;
    summary?: string;
  };
  announcements?: {
    onDataChange?: boolean;
    onSelection?: boolean;
    onZoom?: boolean;
  };
}

// ===== CHART PERFORMANCE TYPES =====

export interface ChartPerformance {
  virtualization?: {
    enabled: boolean;
    threshold: number;
    itemHeight?: number;
  };
  lazy?: {
    enabled: boolean;
    placeholder?: React.ComponentType;
    rootMargin?: string;
  };
  memoization?: {
    enabled: boolean;
    dependencies?: string[];
  };
  dataOptimization?: {
    sampling?: boolean;
    aggregation?: boolean;
    compression?: boolean;
  };
}