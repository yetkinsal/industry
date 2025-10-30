const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.APP_DB_HOST || 'localhost',
  port: parseInt(process.env.APP_DB_PORT || '5432'),
  database: process.env.APP_DB_NAME || 'industrial_dashboard',
  user: process.env.APP_DB_USER || 'postgres',
  password: process.env.APP_DB_PASSWORD,
});

async function initializeDatabase() {
  console.log('🔧 Initializing database...');

  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute the schema
    await pool.query(schema);

    console.log('✓ Database schema created successfully');
    console.log('✓ Seed data inserted');
    console.log('\n📊 Database is ready!');
    console.log('\nDefault factories created:');
    console.log('  - Alpha Factory (Detroit, MI)');
    console.log('  - Beta Factory (Austin, TX)');
    console.log('\nNext steps:');
    console.log('  1. Generate an encryption key: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    console.log('  2. Add ENCRYPTION_KEY to your .env file');
    console.log('  3. Start the server: npm run dev');

  } catch (error) {
    console.error('✗ Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initializeDatabase();
