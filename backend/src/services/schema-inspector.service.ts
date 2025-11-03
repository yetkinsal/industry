import { Pool } from 'pg';
import { createConnection, decryptCredentials, appDbPool } from '../config/database';

export interface TableInfo {
  tableName: string;
  schemaName: string;
  tableType: 'table' | 'view';
  rowCount?: number;
}

export interface ColumnInfo {
  columnName: string;
  dataType: string;
  isNullable: boolean;
  defaultValue?: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  maxLength?: number;
}

export interface SchemaStructure {
  tables: TableInfo[];
  tableDetails: Map<string, ColumnInfo[]>;
}

export class SchemaInspectorService {
  /**
   * Get all tables and views from a connection
   */
  async getTables(connectionId: string): Promise<TableInfo[]> {
    const connection = await this.getConnection(connectionId);

    try {
      const query = `
        SELECT
          table_name as "tableName",
          table_schema as "schemaName",
          table_type as "tableType"
        FROM information_schema.tables
        WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
        ORDER BY table_schema, table_name
      `;

      const result = await connection.query(query);

      // Get row counts for each table
      const tablesWithCounts = await Promise.all(
        result.rows.map(async (table: any) => {
          try {
            const countQuery = `SELECT COUNT(*) FROM "${table.schemaName}"."${table.tableName}"`;
            const countResult = await connection.query(countQuery);
            return {
              ...table,
              tableType: table.tableType === 'BASE TABLE' ? 'table' as const : 'view' as const,
              rowCount: parseInt(countResult.rows[0].count),
            };
          } catch (error) {
            return {
              ...table,
              tableType: table.tableType === 'BASE TABLE' ? 'table' as const : 'view' as const,
              rowCount: 0,
            };
          }
        })
      );

      return tablesWithCounts;
    } finally {
      await connection.end();
    }
  }

  /**
   * Get columns for a specific table
   */
  async getTableColumns(connectionId: string, schemaName: string, tableName: string): Promise<ColumnInfo[]> {
    const connection = await this.getConnection(connectionId);

    try {
      // Get column information
      const columnsQuery = `
        SELECT
          c.column_name as "columnName",
          c.data_type as "dataType",
          c.is_nullable as "isNullable",
          c.column_default as "defaultValue",
          c.character_maximum_length as "maxLength",
          CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as "isPrimaryKey",
          CASE WHEN fk.column_name IS NOT NULL THEN true ELSE false END as "isForeignKey"
        FROM information_schema.columns c
        LEFT JOIN (
          SELECT ku.column_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage ku
            ON tc.constraint_name = ku.constraint_name
            AND tc.table_schema = ku.table_schema
          WHERE tc.constraint_type = 'PRIMARY KEY'
            AND tc.table_schema = $1
            AND tc.table_name = $2
        ) pk ON c.column_name = pk.column_name
        LEFT JOIN (
          SELECT ku.column_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage ku
            ON tc.constraint_name = ku.constraint_name
            AND tc.table_schema = ku.table_schema
          WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = $1
            AND tc.table_name = $2
        ) fk ON c.column_name = fk.column_name
        WHERE c.table_schema = $1
          AND c.table_name = $2
        ORDER BY c.ordinal_position
      `;

      const result = await connection.query(columnsQuery, [schemaName, tableName]);

      return result.rows.map(row => ({
        columnName: row.columnName,
        dataType: row.dataType,
        isNullable: row.isNullable === 'YES',
        defaultValue: row.defaultValue,
        isPrimaryKey: row.isPrimaryKey,
        isForeignKey: row.isForeignKey,
        maxLength: row.maxLength,
      }));
    } finally {
      await connection.end();
    }
  }

  /**
   * Get full schema structure (all tables and columns)
   */
  async getFullSchema(connectionId: string): Promise<SchemaStructure> {
    const tables = await this.getTables(connectionId);
    const tableDetails = new Map<string, ColumnInfo[]>();

    for (const table of tables) {
      const columns = await this.getTableColumns(connectionId, table.schemaName, table.tableName);
      tableDetails.set(`${table.schemaName}.${table.tableName}`, columns);
    }

    return {
      tables,
      tableDetails,
    };
  }

  /**
   * Preview table data (first 100 rows)
   */
  async previewTableData(
    connectionId: string,
    schemaName: string,
    tableName: string,
    limit: number = 100
  ): Promise<any[]> {
    const connection = await this.getConnection(connectionId);

    try {
      const query = `SELECT * FROM "${schemaName}"."${tableName}" LIMIT $1`;
      const result = await connection.query(query, [limit]);
      return result.rows;
    } finally {
      await connection.end();
    }
  }

  /**
   * Get foreign key relationships
   */
  async getRelationships(connectionId: string): Promise<any[]> {
    const connection = await this.getConnection(connectionId);

    try {
      const query = `
        SELECT
          tc.table_schema as "fromSchema",
          tc.table_name as "fromTable",
          kcu.column_name as "fromColumn",
          ccu.table_schema as "toSchema",
          ccu.table_name as "toTable",
          ccu.column_name as "toColumn",
          tc.constraint_name as "constraintName"
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema NOT IN ('pg_catalog', 'information_schema')
        ORDER BY tc.table_schema, tc.table_name
      `;

      const result = await connection.query(query);
      return result.rows;
    } finally {
      await connection.end();
    }
  }

  /**
   * Helper: Get connection from connection ID
   */
  private async getConnection(connectionId: string): Promise<Pool> {
    // Get connection details from database
    const query = `
      SELECT
        db_type as "dbType",
        host,
        port,
        database,
        user_enc as "userEnc",
        pass_enc as "passEnc",
        options_enc as "optionsEnc"
      FROM connections
      WHERE id = $1
    `;

    const result = await appDbPool.query(query, [connectionId]);
    if (result.rows.length === 0) {
      throw new Error('Connection not found');
    }

    const conn = result.rows[0];
    const credentials = decryptCredentials(conn.userEnc, conn.passEnc);

    return createConnection({
      dbType: conn.dbType,
      host: conn.host,
      port: conn.port,
      database: conn.database,
      username: credentials.username,
      password: credentials.password,
    });
  }
}
