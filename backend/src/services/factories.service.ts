import { appDbPool } from '../config/database';
import { Factory, CreateFactoryRequest } from '../types';

export class FactoriesService {
  /**
   * Get all factories
   */
  async getAllFactories(): Promise<Factory[]> {
    const result = await appDbPool.query(`
      SELECT id, name, location, timezone, created_at as "createdAt", updated_at as "updatedAt"
      FROM factories
      ORDER BY created_at DESC
    `);
    return result.rows;
  }

  /**
   * Get a single factory by ID
   */
  async getFactoryById(id: string): Promise<Factory | null> {
    const result = await appDbPool.query(
      `SELECT id, name, location, timezone, created_at as "createdAt", updated_at as "updatedAt"
       FROM factories
       WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Create a new factory
   */
  async createFactory(data: CreateFactoryRequest): Promise<Factory> {
    const result = await appDbPool.query(
      `INSERT INTO factories (name, location, timezone)
       VALUES ($1, $2, $3)
       RETURNING id, name, location, timezone, created_at as "createdAt", updated_at as "updatedAt"`,
      [data.name, data.location, data.timezone]
    );
    return result.rows[0];
  }

  /**
   * Update a factory
   */
  async updateFactory(id: string, data: Partial<CreateFactoryRequest>): Promise<Factory | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.location !== undefined) {
      updates.push(`location = $${paramIndex++}`);
      values.push(data.location);
    }
    if (data.timezone !== undefined) {
      updates.push(`timezone = $${paramIndex++}`);
      values.push(data.timezone);
    }

    if (updates.length === 0) {
      return this.getFactoryById(id);
    }

    values.push(id);
    const result = await appDbPool.query(
      `UPDATE factories
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING id, name, location, timezone, created_at as "createdAt", updated_at as "updatedAt"`,
      values
    );

    return result.rows[0] || null;
  }

  /**
   * Delete a factory
   */
  async deleteFactory(id: string): Promise<boolean> {
    const result = await appDbPool.query(
      'DELETE FROM factories WHERE id = $1',
      [id]
    );
    return result.rowCount > 0;
  }
}
