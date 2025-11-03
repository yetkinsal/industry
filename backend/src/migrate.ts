import { appDbPool } from './config/database';
import fs from 'fs';
import path from 'path';

/**
 * Run database migrations on startup
 */
export async function runMigrations(): Promise<void> {
  try {
    console.log('🔄 Running database migrations...');

    // Read the schema.sql file
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    // Execute the schema
    await appDbPool.query(schemaSql);

    console.log('✅ Database migrations completed successfully');
  } catch (error) {
    console.error('❌ Failed to run migrations:', error);
    throw error;
  }
}
