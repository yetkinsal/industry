import { appDbPool } from '../config/database';
import { Dashboard, CreateDashboardRequest, UpdateDashboardRequest } from '../types';

export class DashboardsService {
  /**
   * Get all dashboards for a factory
   */
  async getAllDashboards(factoryId?: string): Promise<Dashboard[]> {
    let query = `
      SELECT id, factory_id as "factoryId", name, description, layout, filters,
             created_at as "createdAt", updated_at as "updatedAt"
      FROM dashboards
    `;
    const params: any[] = [];

    if (factoryId) {
      query += ' WHERE factory_id = $1';
      params.push(factoryId);
    }

    query += ' ORDER BY created_at DESC';

    const result = await appDbPool.query(query, params);
    return result.rows;
  }

  /**
   * Get a single dashboard by ID with all its widgets
   */
  async getDashboardById(id: string): Promise<Dashboard | null> {
    const result = await appDbPool.query(
      `SELECT id, factory_id as "factoryId", name, description, layout, filters,
              created_at as "createdAt", updated_at as "updatedAt"
       FROM dashboards
       WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Create a new dashboard
   */
  async createDashboard(data: CreateDashboardRequest): Promise<Dashboard> {
    const defaultFilters = data.filters || {
      site: 'alpha',
      range: '24h',
      lines: [],
      sku: '',
      shifts: [],
      productName: 'cement',
    };

    const result = await appDbPool.query(
      `INSERT INTO dashboards (factory_id, name, description, layout, filters)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, factory_id as "factoryId", name, description, layout, filters,
                 created_at as "createdAt", updated_at as "updatedAt"`,
      [data.factoryId, data.name, data.description || null, JSON.stringify([]), JSON.stringify(defaultFilters)]
    );

    return result.rows[0];
  }

  /**
   * Update a dashboard
   */
  async updateDashboard(id: string, data: UpdateDashboardRequest): Promise<Dashboard | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(data.description);
    }
    if (data.layout !== undefined) {
      updates.push(`layout = $${paramIndex++}`);
      values.push(JSON.stringify(data.layout));
    }
    if (data.filters !== undefined) {
      updates.push(`filters = $${paramIndex++}`);
      values.push(JSON.stringify(data.filters));
    }

    if (updates.length === 0) {
      return this.getDashboardById(id);
    }

    values.push(id);
    const result = await appDbPool.query(
      `UPDATE dashboards
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING id, factory_id as "factoryId", name, description, layout, filters,
                 created_at as "createdAt", updated_at as "updatedAt"`,
      values
    );

    return result.rows[0] || null;
  }

  /**
   * Delete a dashboard
   */
  async deleteDashboard(id: string): Promise<boolean> {
    const result = await appDbPool.query(
      'DELETE FROM dashboards WHERE id = $1',
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Update dashboard layout (for drag-and-drop)
   */
  async updateLayout(id: string, layout: any[]): Promise<Dashboard | null> {
    return this.updateDashboard(id, { layout });
  }

  /**
   * Update dashboard filters
   */
  async updateFilters(id: string, filters: any): Promise<Dashboard | null> {
    return this.updateDashboard(id, { filters });
  }
}
