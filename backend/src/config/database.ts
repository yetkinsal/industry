import { Pool } from 'pg';
import dotenv from 'dotenv';
import dns from 'dns';

// Force IPv4 resolution to avoid IPv6 connection issues
dns.setDefaultResultOrder('ipv4first');

dotenv.config();

// Application database pool (Supabase PostgreSQL)
// Using DATABASE_URL for Supabase connection
export const appDbPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: {
    rejectUnauthorized: false, // Required for Supabase
  },
});

// Handle pool errors
appDbPool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test connection
export async function testAppDbConnection(): Promise<boolean> {
  try {
    const client = await appDbPool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✓ Connected to application database');
    return true;
  } catch (error) {
    console.error('✗ Failed to connect to application database:', error);
    return false;
  }
}

// Customer database connection pool cache
// Key: connectionId, Value: Pool instance
const customerDbPools = new Map<string, Pool>();

export interface CustomerDbConfig {
  dbType: 'postgres' | 'mysql' | 'mssql';
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

/**
 * Get or create a connection pool for a customer database
 */
export function getCustomerDbPool(connectionId: string, config: CustomerDbConfig): Pool {
  if (customerDbPools.has(connectionId)) {
    return customerDbPools.get(connectionId)!;
  }

  // Currently only supporting PostgreSQL, but can extend to MySQL/MSSQL
  if (config.dbType !== 'postgres') {
    throw new Error(`Database type ${config.dbType} not yet supported`);
  }

  const pool = new Pool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    max: 5, // Limit connections per customer database
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  pool.on('error', (err) => {
    console.error(`Error on customer database pool ${connectionId}:`, err);
    // Remove from cache if error occurs
    customerDbPools.delete(connectionId);
  });

  customerDbPools.set(connectionId, pool);
  return pool;
}

/**
 * Test a customer database connection
 */
export async function testCustomerDbConnection(config: CustomerDbConfig): Promise<{ success: boolean; error?: string }> {
  if (config.dbType !== 'postgres') {
    return { success: false, error: `Database type ${config.dbType} not yet supported` };
  }

  const pool = new Pool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    max: 1,
    connectionTimeoutMillis: 5000,
  });

  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    await pool.end();
    return { success: true };
  } catch (error: any) {
    await pool.end();
    return { success: false, error: error.message };
  }
}

/**
 * Close a customer database pool
 */
export async function closeCustomerDbPool(connectionId: string): Promise<void> {
  const pool = customerDbPools.get(connectionId);
  if (pool) {
    await pool.end();
    customerDbPools.delete(connectionId);
  }
}

/**
 * Close all database connections
 */
export async function closeAllConnections(): Promise<void> {
  // Close customer pools
  for (const [connectionId, pool] of customerDbPools.entries()) {
    await pool.end();
    customerDbPools.delete(connectionId);
  }

  // Close app pool
  await appDbPool.end();
  console.log('All database connections closed');
}
