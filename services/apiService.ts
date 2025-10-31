/**
 * API Service Layer for Industrial Dashboard
 * Handles all communication with the backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Types (matching backend)
export interface Factory {
  id: string;
  name: string;
  location: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface Connection {
  id: string;
  factoryId: string;
  name: string;
  dbType: 'postgres' | 'mysql' | 'mssql';
  host: string;
  port: number;
  database: string;
  createdAt: string;
  updatedAt: string;
}

export interface Dashboard {
  id: string;
  factoryId: string;
  name: string;
  description?: string;
  layout: any[];
  filters: any;
  widgets?: Widget[];
  createdAt: string;
  updatedAt: string;
}

export interface Widget {
  id: string;
  dashboardId: string;
  type: string;
  title: string;
  description?: string;
  connectionId: string;
  query: string;
  params: Record<string, any>;
  refreshInterval?: number;
  vizOptions?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface QueryResult {
  rows: any[];
  fields: string[];
  rowCount: number;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic fetch wrapper with error handling and auth token injection
   */
  private async fetch<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // Get auth token from localStorage
    const token = localStorage.getItem('auth_token');

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          error: 'Request failed',
          message: response.statusText,
        }));
        throw new Error(error.message || 'Request failed');
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error: any) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // ==================== FACTORIES ====================

  async getAllFactories(): Promise<Factory[]> {
    return this.fetch<Factory[]>('/api/factories');
  }

  async getFactoryById(id: string): Promise<Factory> {
    return this.fetch<Factory>(`/api/factories/${id}`);
  }

  async createFactory(data: { name: string; location: string; timezone: string }): Promise<Factory> {
    return this.fetch<Factory>('/api/factories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFactory(id: string, data: Partial<{ name: string; location: string; timezone: string }>): Promise<Factory> {
    return this.fetch<Factory>(`/api/factories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteFactory(id: string): Promise<void> {
    return this.fetch<void>(`/api/factories/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== CONNECTIONS ====================

  async getAllConnections(factoryId?: string): Promise<Connection[]> {
    const url = factoryId
      ? `/api/connections?factoryId=${factoryId}`
      : '/api/connections';
    return this.fetch<Connection[]>(url);
  }

  async getConnectionById(id: string): Promise<Connection> {
    return this.fetch<Connection>(`/api/connections/${id}`);
  }

  async createConnection(data: {
    factoryId: string;
    name: string;
    dbType: 'postgres' | 'mysql' | 'mssql';
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    options?: Record<string, any>;
  }): Promise<Connection> {
    return this.fetch<Connection>('/api/connections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateConnection(id: string, data: any): Promise<Connection> {
    return this.fetch<Connection>(`/api/connections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteConnection(id: string): Promise<void> {
    return this.fetch<void>(`/api/connections/${id}`, {
      method: 'DELETE',
    });
  }

  async testConnection(data: {
    dbType: 'postgres' | 'mysql' | 'mssql';
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
  }): Promise<{ success: boolean; error?: string }> {
    return this.fetch<{ success: boolean; error?: string }>('/api/connections/test', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async testSavedConnection(id: string): Promise<{ success: boolean; error?: string }> {
    return this.fetch<{ success: boolean; error?: string }>(`/api/connections/${id}/test`, {
      method: 'POST',
    });
  }

  // ==================== DASHBOARDS ====================

  async getAllDashboards(factoryId?: string): Promise<Dashboard[]> {
    const url = factoryId
      ? `/api/dashboards?factoryId=${factoryId}`
      : '/api/dashboards';
    return this.fetch<Dashboard[]>(url);
  }

  async getDashboardById(id: string): Promise<Dashboard> {
    return this.fetch<Dashboard>(`/api/dashboards/${id}`);
  }

  async createDashboard(data: {
    factoryId: string;
    name: string;
    description?: string;
    filters?: any;
  }): Promise<Dashboard> {
    return this.fetch<Dashboard>('/api/dashboards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDashboard(id: string, data: {
    name?: string;
    description?: string;
    layout?: any[];
    filters?: any;
  }): Promise<Dashboard> {
    return this.fetch<Dashboard>(`/api/dashboards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateDashboardLayout(id: string, layout: any[]): Promise<Dashboard> {
    return this.fetch<Dashboard>(`/api/dashboards/${id}/layout`, {
      method: 'PATCH',
      body: JSON.stringify({ layout }),
    });
  }

  async updateDashboardFilters(id: string, filters: any): Promise<Dashboard> {
    return this.fetch<Dashboard>(`/api/dashboards/${id}/filters`, {
      method: 'PATCH',
      body: JSON.stringify({ filters }),
    });
  }

  async deleteDashboard(id: string): Promise<void> {
    return this.fetch<void>(`/api/dashboards/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== WIDGETS ====================

  async getWidgetsByDashboardId(dashboardId: string): Promise<Widget[]> {
    return this.fetch<Widget[]>(`/api/dashboards/${dashboardId}/widgets`);
  }

  async getWidgetById(id: string): Promise<Widget> {
    return this.fetch<Widget>(`/api/widgets/${id}`);
  }

  async createWidget(dashboardId: string, data: {
    type: string;
    title: string;
    description?: string;
    connectionId: string;
    query: string;
    params?: Record<string, any>;
    refreshInterval?: number;
    vizOptions?: Record<string, any>;
    layout?: { x: number; y: number; w: number; h: number };
  }): Promise<Widget> {
    return this.fetch<Widget>(`/api/dashboards/${dashboardId}/widgets`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWidget(id: string, data: {
    title?: string;
    description?: string;
    query?: string;
    params?: Record<string, any>;
    refreshInterval?: number;
    vizOptions?: Record<string, any>;
  }): Promise<Widget> {
    return this.fetch<Widget>(`/api/widgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteWidget(id: string): Promise<void> {
    return this.fetch<void>(`/api/widgets/${id}`, {
      method: 'DELETE',
    });
  }

  async executeWidget(id: string, filters?: any): Promise<QueryResult> {
    return this.fetch<QueryResult>(`/api/widgets/${id}/execute`, {
      method: 'POST',
      body: JSON.stringify({ filters }),
    });
  }

  async testQuery(connectionId: string, query: string, params?: Record<string, any>): Promise<QueryResult> {
    return this.fetch<QueryResult>('/api/query/test', {
      method: 'POST',
      body: JSON.stringify({ connectionId, query, params }),
    });
  }

  // ==================== HEALTH CHECK ====================

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.fetch<{ status: string; timestamp: string }>('/health');
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
