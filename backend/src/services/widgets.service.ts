import { appDbPool, getCustomerDbPool } from '../config/database';
import { Widget, CreateWidgetRequest, UpdateWidgetRequest, ExecuteWidgetRequest, QueryResult } from '../types';
import { ConnectionsService } from './connections.service';
import { DashboardsService } from './dashboards.service';

export class WidgetsService {
  private connectionsService = new ConnectionsService();
  private dashboardsService = new DashboardsService();

  /**
   * Get all widgets for a dashboard
   */
  async getWidgetsByDashboardId(dashboardId: string): Promise<Widget[]> {
    const result = await appDbPool.query(
      `SELECT id, dashboard_id as "dashboardId", type, title, description,
              connection_id as "connectionId", query, params, refresh_interval as "refreshInterval",
              viz_options as "vizOptions", created_at as "createdAt", updated_at as "updatedAt"
       FROM widgets
       WHERE dashboard_id = $1
       ORDER BY created_at ASC`,
      [dashboardId]
    );
    return result.rows;
  }

  /**
   * Get a single widget by ID
   */
  async getWidgetById(id: string): Promise<Widget | null> {
    const result = await appDbPool.query(
      `SELECT id, dashboard_id as "dashboardId", type, title, description,
              connection_id as "connectionId", query, params, refresh_interval as "refreshInterval",
              viz_options as "vizOptions", created_at as "createdAt", updated_at as "updatedAt"
       FROM widgets
       WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Create a new widget
   */
  async createWidget(data: CreateWidgetRequest): Promise<Widget> {
    const result = await appDbPool.query(
      `INSERT INTO widgets (dashboard_id, type, title, description, connection_id, query, params, refresh_interval, viz_options)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, dashboard_id as "dashboardId", type, title, description,
                 connection_id as "connectionId", query, params, refresh_interval as "refreshInterval",
                 viz_options as "vizOptions", created_at as "createdAt", updated_at as "updatedAt"`,
      [
        data.dashboardId,
        data.type,
        data.title,
        data.description || null,
        data.connectionId,
        data.query,
        JSON.stringify(data.params || {}),
        data.refreshInterval || null,
        JSON.stringify(data.vizOptions || {})
      ]
    );

    const widget = result.rows[0];

    // Update dashboard layout if layout position provided
    if (data.layout) {
      const dashboard = await this.dashboardsService.getDashboardById(data.dashboardId);
      if (dashboard) {
        const layout = Array.isArray(dashboard.layout) ? dashboard.layout : [];
        layout.push({
          i: widget.id,
          x: data.layout.x,
          y: data.layout.y,
          w: data.layout.w,
          h: data.layout.h,
        });
        await this.dashboardsService.updateLayout(data.dashboardId, layout);
      }
    }

    return widget;
  }

  /**
   * Update a widget
   */
  async updateWidget(id: string, data: UpdateWidgetRequest): Promise<Widget | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(data.description);
    }
    if (data.query !== undefined) {
      updates.push(`query = $${paramIndex++}`);
      values.push(data.query);
    }
    if (data.params !== undefined) {
      updates.push(`params = $${paramIndex++}`);
      values.push(JSON.stringify(data.params));
    }
    if (data.refreshInterval !== undefined) {
      updates.push(`refresh_interval = $${paramIndex++}`);
      values.push(data.refreshInterval);
    }
    if (data.vizOptions !== undefined) {
      updates.push(`viz_options = $${paramIndex++}`);
      values.push(JSON.stringify(data.vizOptions));
    }

    if (updates.length === 0) {
      return this.getWidgetById(id);
    }

    values.push(id);
    const result = await appDbPool.query(
      `UPDATE widgets
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING id, dashboard_id as "dashboardId", type, title, description,
                 connection_id as "connectionId", query, params, refresh_interval as "refreshInterval",
                 viz_options as "vizOptions", created_at as "createdAt", updated_at as "updatedAt"`,
      values
    );

    return result.rows[0] || null;
  }

  /**
   * Delete a widget
   */
  async deleteWidget(id: string): Promise<boolean> {
    // Get widget to find dashboard ID
    const widget = await this.getWidgetById(id);
    if (!widget) return false;

    // Remove from dashboard layout
    const dashboard = await this.dashboardsService.getDashboardById(widget.dashboardId);
    if (dashboard && Array.isArray(dashboard.layout)) {
      const layout = dashboard.layout.filter((item: any) => item.i !== id);
      await this.dashboardsService.updateLayout(widget.dashboardId, layout);
    }

    // Delete widget
    const result = await appDbPool.query(
      'DELETE FROM widgets WHERE id = $1',
      [id]
    );
    return result.rowCount > 0;
  }

  /**
   * Execute a widget's SQL query with parameters
   * This is the core function that runs SQL queries against customer databases
   */
  async executeWidget(widgetId: string, request: ExecuteWidgetRequest): Promise<QueryResult> {
    // Get widget configuration
    const widget = await this.getWidgetById(widgetId);
    if (!widget) {
      throw new Error('Widget not found');
    }

    // Get decrypted connection credentials
    const connection = await this.connectionsService.getDecryptedConnection(widget.connectionId);
    if (!connection) {
      throw new Error('Connection not found');
    }

    // Merge widget params with filter overrides
    const finalParams = { ...widget.params, ...request.filters };

    // Get connection pool for customer database
    const pool = getCustomerDbPool(connection.id, {
      dbType: connection.dbType as any,
      host: connection.host,
      port: connection.port,
      database: connection.database,
      user: connection.username,
      password: connection.password,
    });

    try {
      // Replace named parameters in query with positional parameters for PostgreSQL
      const { query, values } = this.replaceNamedParameters(widget.query, finalParams);

      // Execute query with timeout
      const result = await pool.query({
        text: query,
        values: values,
        rowMode: 'array',
      });

      // Extract field names
      const fields = result.fields.map(f => f.name);

      // Convert rows to objects
      const rows = result.rows.map((row: any[]) => {
        const obj: any = {};
        fields.forEach((field, index) => {
          obj[field] = row[index];
        });
        return obj;
      });

      return {
        rows,
        fields,
        rowCount: result.rowCount,
      };
    } catch (error: any) {
      throw new Error(`Query execution failed: ${error.message}`);
    }
  }

  /**
   * Replace named parameters (:paramName) with positional parameters ($1, $2, etc.)
   * This provides SQL injection protection through parameterized queries
   */
  private replaceNamedParameters(query: string, params: Record<string, any>): { query: string; values: any[] } {
    const values: any[] = [];
    let paramIndex = 1;

    // Match :paramName patterns
    const replacedQuery = query.replace(/:(\w+)/g, (match, paramName) => {
      if (paramName in params) {
        values.push(params[paramName]);
        return `$${paramIndex++}`;
      }
      // If parameter not provided, keep as is (will cause error)
      return match;
    });

    return { query: replacedQuery, values };
  }

  /**
   * Test a SQL query without saving it
   */
  async testQuery(
    connectionId: string,
    query: string,
    params: Record<string, any> = {}
  ): Promise<QueryResult> {
    // Get decrypted connection credentials
    const connection = await this.connectionsService.getDecryptedConnection(connectionId);
    if (!connection) {
      throw new Error('Connection not found');
    }

    // Get connection pool for customer database
    const pool = getCustomerDbPool(connection.id, {
      dbType: connection.dbType as any,
      host: connection.host,
      port: connection.port,
      database: connection.database,
      user: connection.username,
      password: connection.password,
    });

    try {
      // Replace named parameters
      const { query: finalQuery, values } = this.replaceNamedParameters(query, params);

      // Execute query with timeout (limit to 100 rows for testing)
      const result = await pool.query({
        text: `${finalQuery} LIMIT 100`,
        values: values,
        rowMode: 'array',
      });

      // Extract field names
      const fields = result.fields.map(f => f.name);

      // Convert rows to objects
      const rows = result.rows.map((row: any[]) => {
        const obj: any = {};
        fields.forEach((field, index) => {
          obj[field] = row[index];
        });
        return obj;
      });

      return {
        rows,
        fields,
        rowCount: result.rowCount,
      };
    } catch (error: any) {
      throw new Error(`Query test failed: ${error.message}`);
    }
  }
}
