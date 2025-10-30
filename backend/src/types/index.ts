// Shared types for backend API
export interface Factory {
  id: string;
  name: string;
  location: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Connection {
  id: string;
  factoryId: string;
  name: string;
  dbType: 'postgres' | 'mysql' | 'mssql';
  host: string;
  port: number;
  database: string;
  userEnc: string; // Encrypted username
  passEnc: string; // Encrypted password
  optionsEnc?: string; // Encrypted additional options JSON
  createdAt: Date;
  updatedAt: Date;
}

export interface Dashboard {
  id: string;
  factoryId: string;
  name: string;
  description?: string;
  layout: LayoutItem[];
  filters: FilterState;
  createdAt: Date;
  updatedAt: Date;
}

export interface Widget {
  id: string;
  dashboardId: string;
  type: 'KPI' | 'LINE' | 'BAR' | 'GAUGE' | 'TABLE' | 'HEATMAP' | 'AREA' | 'HORIZONTAL_BAR';
  title: string;
  description?: string;
  connectionId: string;
  query: string; // SQL query with parameter placeholders
  params: Record<string, any>; // Default parameter values
  refreshInterval?: number; // Auto-refresh in seconds
  vizOptions?: Record<string, any>; // Chart-specific visualization options
  createdAt: Date;
  updatedAt: Date;
}

export interface LayoutItem {
  i: string; // Widget ID
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export interface FilterState {
  site: string;
  range: string;
  lines: string[];
  sku: string;
  shifts: string[];
  productName: string;
}

// Request/Response types
export interface CreateFactoryRequest {
  name: string;
  location: string;
  timezone: string;
}

export interface CreateConnectionRequest {
  factoryId: string;
  name: string;
  dbType: 'postgres' | 'mysql' | 'mssql';
  host: string;
  port: number;
  database: string;
  username: string; // Will be encrypted before storage
  password: string; // Will be encrypted before storage
  options?: Record<string, any>; // Will be encrypted before storage
}

export interface TestConnectionRequest {
  dbType: 'postgres' | 'mysql' | 'mssql';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

export interface CreateDashboardRequest {
  factoryId: string;
  name: string;
  description?: string;
  filters?: FilterState;
}

export interface UpdateDashboardRequest {
  name?: string;
  description?: string;
  layout?: LayoutItem[];
  filters?: FilterState;
}

export interface CreateWidgetRequest {
  dashboardId: string;
  type: Widget['type'];
  title: string;
  description?: string;
  connectionId: string;
  query: string;
  params?: Record<string, any>;
  refreshInterval?: number;
  vizOptions?: Record<string, any>;
  layout?: { x: number; y: number; w: number; h: number };
}

export interface UpdateWidgetRequest {
  title?: string;
  description?: string;
  query?: string;
  params?: Record<string, any>;
  refreshInterval?: number;
  vizOptions?: Record<string, any>;
}

export interface ExecuteWidgetRequest {
  filters?: FilterState; // Current filter state to merge with widget params
}

export interface QueryResult {
  rows: any[];
  fields: string[];
  rowCount: number;
}

// Error response
export interface ApiError {
  error: string;
  message: string;
  details?: any;
}
