import { Pool } from 'pg';
import { createConnection, decryptCredentials, appDbPool } from '../config/database';

export interface QueryResult {
  columns: string[];
  rows: any[];
  rowCount: number;
  executionTime: number;
}

export interface ParsedQuery {
  query: string;
  type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'CREATE' | 'ALTER' | 'DROP' | 'OTHER';
  tables: string[];
}

export class SqlExecutorService {
  /**
   * Execute SQL query against a connection
   */
  async executeQuery(connectionId: string, query: string): Promise<QueryResult> {
    const connection = await this.getConnection(connectionId);
    const startTime = Date.now();

    try {
      const result = await connection.query(query);
      const executionTime = Date.now() - startTime;

      // Extract column names
      const columns = result.fields ? result.fields.map(f => f.name) : [];

      return {
        columns,
        rows: result.rows || [],
        rowCount: result.rowCount || 0,
        executionTime,
      };
    } finally {
      await connection.end();
    }
  }

  /**
   * Execute SQL file content (multiple statements)
   */
  async executeSqlFile(connectionId: string, sqlContent: string): Promise<{
    results: QueryResult[];
    totalQueries: number;
    successCount: number;
    failureCount: number;
    errors: Array<{ query: string; error: string }>;
  }> {
    const queries = this.parseSqlFile(sqlContent);
    const results: QueryResult[] = [];
    const errors: Array<{ query: string; error: string }> = [];
    let successCount = 0;
    let failureCount = 0;

    for (const parsedQuery of queries) {
      try {
        const result = await this.executeQuery(connectionId, parsedQuery.query);
        results.push(result);
        successCount++;
      } catch (error: any) {
        failureCount++;
        errors.push({
          query: parsedQuery.query.substring(0, 100) + '...',
          error: error.message,
        });
      }
    }

    return {
      results,
      totalQueries: queries.length,
      successCount,
      failureCount,
      errors,
    };
  }

  /**
   * Parse SQL file into individual queries
   */
  parseSqlFile(sqlContent: string): ParsedQuery[] {
    // Remove comments
    let cleaned = sqlContent
      .replace(/--.*$/gm, '') // Single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, ''); // Multi-line comments

    // Split by semicolon (basic approach)
    const statements = cleaned
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    return statements.map(query => ({
      query,
      type: this.detectQueryType(query),
      tables: this.extractTableNames(query),
    }));
  }

  /**
   * Detect query type
   */
  private detectQueryType(query: string): ParsedQuery['type'] {
    const upperQuery = query.trim().toUpperCase();

    if (upperQuery.startsWith('SELECT')) return 'SELECT';
    if (upperQuery.startsWith('INSERT')) return 'INSERT';
    if (upperQuery.startsWith('UPDATE')) return 'UPDATE';
    if (upperQuery.startsWith('DELETE')) return 'DELETE';
    if (upperQuery.startsWith('CREATE')) return 'CREATE';
    if (upperQuery.startsWith('ALTER')) return 'ALTER';
    if (upperQuery.startsWith('DROP')) return 'DROP';

    return 'OTHER';
  }

  /**
   * Extract table names from query (basic regex approach)
   */
  private extractTableNames(query: string): string[] {
    const tables: string[] = [];

    // FROM clause
    const fromMatch = query.match(/FROM\s+([a-zA-Z0-9_"'.]+)/i);
    if (fromMatch) tables.push(fromMatch[1]);

    // JOIN clauses
    const joinMatches = query.matchAll(/JOIN\s+([a-zA-Z0-9_"'.]+)/gi);
    for (const match of joinMatches) {
      tables.push(match[1]);
    }

    // INTO clause (INSERT)
    const intoMatch = query.match(/INTO\s+([a-zA-Z0-9_"'.]+)/i);
    if (intoMatch) tables.push(intoMatch[1]);

    // UPDATE clause
    const updateMatch = query.match(/UPDATE\s+([a-zA-Z0-9_"'.]+)/i);
    if (updateMatch) tables.push(updateMatch[1]);

    // Remove duplicates and clean
    return [...new Set(tables)].map(t => t.replace(/['"]/g, '').trim());
  }

  /**
   * Analyze query for visualization recommendations
   */
  async analyzeQuery(query: string, connectionId: string): Promise<{
    recommendedChartTypes: string[];
    dataShape: {
      hasTimeSeries: boolean;
      hasAggregation: boolean;
      hasMultipleSeries: boolean;
      columnCount: number;
      rowCount: number;
    };
    columns: {
      name: string;
      type: 'numeric' | 'text' | 'date' | 'boolean' | 'other';
      isAggregated: boolean;
    }[];
  }> {
    const result = await this.executeQuery(connectionId, query);

    // Analyze column types
    const columns = result.columns.map(col => {
      const sampleValue = result.rows[0]?.[col];
      let type: 'numeric' | 'text' | 'date' | 'boolean' | 'other' = 'other';

      if (typeof sampleValue === 'number') type = 'numeric';
      else if (typeof sampleValue === 'boolean') type = 'boolean';
      else if (typeof sampleValue === 'string') {
        if (!isNaN(Date.parse(sampleValue))) type = 'date';
        else type = 'text';
      }

      return {
        name: col,
        type,
        isAggregated: /count|sum|avg|min|max/i.test(col),
      };
    });

    // Detect data characteristics
    const hasTimeSeries = columns.some(c => c.type === 'date');
    const hasAggregation = columns.some(c => c.isAggregated) || /GROUP BY/i.test(query);
    const hasMultipleSeries = columns.filter(c => c.type === 'numeric').length > 1;

    // Recommend chart types based on data shape
    const recommendedChartTypes: string[] = [];

    if (result.rows.length === 1 && columns.filter(c => c.type === 'numeric').length === 1) {
      recommendedChartTypes.push('KPI');
    }

    if (hasTimeSeries && columns.filter(c => c.type === 'numeric').length > 0) {
      recommendedChartTypes.push('LINE', 'AREA');
    }

    if (hasAggregation && !hasTimeSeries) {
      recommendedChartTypes.push('BAR', 'HORIZONTAL_BAR');
    }

    if (columns.filter(c => c.type === 'numeric').length === 1 && result.rows.length <= 20) {
      recommendedChartTypes.push('BAR', 'HORIZONTAL_BAR');
    }

    if (columns.length >= 3) {
      recommendedChartTypes.push('TABLE');
    }

    if (columns.filter(c => c.type === 'numeric').length === 1 && result.rows.length === 1) {
      recommendedChartTypes.push('GAUGE');
    }

    // If no specific recommendations, default to table
    if (recommendedChartTypes.length === 0) {
      recommendedChartTypes.push('TABLE');
    }

    return {
      recommendedChartTypes,
      dataShape: {
        hasTimeSeries,
        hasAggregation,
        hasMultipleSeries,
        columnCount: columns.length,
        rowCount: result.rows.length,
      },
      columns,
    };
  }

  /**
   * Helper: Get connection from connection ID
   */
  private async getConnection(connectionId: string): Promise<Pool> {
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
