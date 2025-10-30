import { appDbPool, testCustomerDbConnection, closeCustomerDbPool } from '../config/database';
import { Connection, CreateConnectionRequest, TestConnectionRequest } from '../types';
import { encrypt, decrypt, encryptJson, decryptJson } from '../utils/encryption';

export class ConnectionsService {
  /**
   * Get all connections for a factory (credentials encrypted)
   */
  async getAllConnections(factoryId?: string): Promise<Connection[]> {
    let query = `
      SELECT id, factory_id as "factoryId", name, db_type as "dbType",
             host, port, database, user_enc as "userEnc", pass_enc as "passEnc",
             options_enc as "optionsEnc", created_at as "createdAt", updated_at as "updatedAt"
      FROM connections
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
   * Get a single connection by ID (credentials encrypted)
   */
  async getConnectionById(id: string): Promise<Connection | null> {
    const result = await appDbPool.query(
      `SELECT id, factory_id as "factoryId", name, db_type as "dbType",
              host, port, database, user_enc as "userEnc", pass_enc as "passEnc",
              options_enc as "optionsEnc", created_at as "createdAt", updated_at as "updatedAt"
       FROM connections
       WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Get decrypted connection credentials (for internal use only)
   */
  async getDecryptedConnection(id: string): Promise<{
    id: string;
    dbType: string;
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    options?: any;
  } | null> {
    const connection = await this.getConnectionById(id);
    if (!connection) return null;

    return {
      id: connection.id,
      dbType: connection.dbType,
      host: connection.host,
      port: connection.port,
      database: connection.database,
      username: decrypt(connection.userEnc),
      password: decrypt(connection.passEnc),
      options: connection.optionsEnc ? decryptJson(connection.optionsEnc) : undefined,
    };
  }

  /**
   * Create a new connection with encrypted credentials
   */
  async createConnection(data: CreateConnectionRequest): Promise<Connection> {
    const userEnc = encrypt(data.username);
    const passEnc = encrypt(data.password);
    const optionsEnc = data.options ? encryptJson(data.options) : null;

    const result = await appDbPool.query(
      `INSERT INTO connections (factory_id, name, db_type, host, port, database, user_enc, pass_enc, options_enc)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, factory_id as "factoryId", name, db_type as "dbType",
                 host, port, database, user_enc as "userEnc", pass_enc as "passEnc",
                 options_enc as "optionsEnc", created_at as "createdAt", updated_at as "updatedAt"`,
      [data.factoryId, data.name, data.dbType, data.host, data.port, data.database, userEnc, passEnc, optionsEnc]
    );

    return result.rows[0];
  }

  /**
   * Update a connection
   */
  async updateConnection(id: string, data: Partial<CreateConnectionRequest>): Promise<Connection | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.dbType !== undefined) {
      updates.push(`db_type = $${paramIndex++}`);
      values.push(data.dbType);
    }
    if (data.host !== undefined) {
      updates.push(`host = $${paramIndex++}`);
      values.push(data.host);
    }
    if (data.port !== undefined) {
      updates.push(`port = $${paramIndex++}`);
      values.push(data.port);
    }
    if (data.database !== undefined) {
      updates.push(`database = $${paramIndex++}`);
      values.push(data.database);
    }
    if (data.username !== undefined) {
      updates.push(`user_enc = $${paramIndex++}`);
      values.push(encrypt(data.username));
    }
    if (data.password !== undefined) {
      updates.push(`pass_enc = $${paramIndex++}`);
      values.push(encrypt(data.password));
    }
    if (data.options !== undefined) {
      updates.push(`options_enc = $${paramIndex++}`);
      values.push(encryptJson(data.options));
    }

    if (updates.length === 0) {
      return this.getConnectionById(id);
    }

    values.push(id);
    const result = await appDbPool.query(
      `UPDATE connections
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING id, factory_id as "factoryId", name, db_type as "dbType",
                 host, port, database, user_enc as "userEnc", pass_enc as "passEnc",
                 options_enc as "optionsEnc", created_at as "createdAt", updated_at as "updatedAt"`,
      values
    );

    // Invalidate the connection pool if credentials changed
    if (data.username !== undefined || data.password !== undefined || data.host !== undefined || data.port !== undefined) {
      await closeCustomerDbPool(id);
    }

    return result.rows[0] || null;
  }

  /**
   * Delete a connection
   */
  async deleteConnection(id: string): Promise<boolean> {
    // Close the connection pool first
    await closeCustomerDbPool(id);

    const result = await appDbPool.query(
      'DELETE FROM connections WHERE id = $1',
      [id]
    );
    return result.rowCount > 0;
  }

  /**
   * Test a database connection
   */
  async testConnection(data: TestConnectionRequest): Promise<{ success: boolean; error?: string }> {
    return testCustomerDbConnection({
      dbType: data.dbType,
      host: data.host,
      port: data.port,
      database: data.database,
      user: data.username,
      password: data.password,
    });
  }

  /**
   * Test an existing saved connection
   */
  async testSavedConnection(id: string): Promise<{ success: boolean; error?: string }> {
    const connection = await this.getDecryptedConnection(id);
    if (!connection) {
      return { success: false, error: 'Connection not found' };
    }

    return testCustomerDbConnection({
      dbType: connection.dbType as any,
      host: connection.host,
      port: connection.port,
      database: connection.database,
      user: connection.username,
      password: connection.password,
    });
  }
}
