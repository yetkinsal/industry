export type WidgetType = 'KPI' | 'LINE' | 'BAR' | 'HEATMAP' | 'TABLE';

export interface Widget {
  id: string;
  dashboardId: string;
  type: WidgetType;
  title: string;
  description?: string;
  query: string;
  params: Record<string, any>;
  refreshCron?: string;
  viz?: Record<string, any>;
  layout?: { x: number; y: number; w: number; h: number };
}

export interface Dashboard {
  id: string;
  tenantId?: string;
  name: string;
  layout: Widget['layout'][];
  filters: { siteId?: string; range?: '24h' | '7d' | 'mtd' | 'custom'; };
}

export interface Connection {
  id:string;
  siteId: string;
  engine: 'postgres' | 'mysql' | 'sqlserver' | 'oracle';
  host: string; port: number; db: string; userEnc: string; passEnc: string;
  optionsEnc?: string;
}

// Builder widget type
export interface BuilderWidget {
  // react-grid-layout properties
  i: string; // Unique identifier for the grid item
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;

  // Widget data
  id?: string; // From DB, optional for new widgets
  dashboardId: string;
  type: WidgetType;
  title: string;
  description?: string;
  query: string;
  params: Record<string, any>;
  refreshCron?: string;
  viz?: Record<string, any>;
}


// Demo data types
export interface KpiData {
  title: string;
  delta: number;
  value: string;
  previousValue?: string;
  valueLabel?: string;
  previousValueLabel?: string;
  isCurrency?: boolean;
}

export interface RunTimeDowntimeData {
  name: string;
  runTime: number;
  downtime: number;
}

export interface ProductionCostData {
  month: string;
  cost: number;
}

export interface GaugeData {
  name: string;
  value: number;
  color: string;
}

// FIX: Add missing type definitions for OeeData, DowntimeData, ScrapData, and EventData.
export interface OeeData {
  hour: string;
  oee: number;
}

export interface DowntimeData {
  reason: string;
  minutes: number;
}

export interface ScrapData {
  line: string;
  hour: number;
  value: number;
}

export interface EventData {
  id: string | number;
  timestamp: string;
  line: string;
  type: 'Downtime' | 'Scrap' | 'Quality' | 'Speed Loss';
  details: string;
  duration?: number;
}