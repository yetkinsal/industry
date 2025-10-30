# Industrial Dashboard Backend API

Node.js + Express + TypeScript backend for the Industrial SQL Dashboard application.

## Features

- RESTful API for factories, connections, dashboards, and widgets
- Secure credential encryption (AES-256-GCM)
- SQL injection prevention through parameterized queries
- Connection pooling for customer databases
- PostgreSQL support (MySQL/MSSQL coming soon)
- TypeScript for type safety

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+
- A running PostgreSQL instance for the application database

## Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Generate an encryption key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Edit `.env` and configure your settings:
```env
PORT=3001
NODE_ENV=development

# Application Database
APP_DB_HOST=localhost
APP_DB_PORT=5432
APP_DB_NAME=industrial_dashboard
APP_DB_USER=postgres
APP_DB_PASSWORD=your_password

# Encryption Key (generated from step 2)
ENCRYPTION_KEY=your_64_character_hex_key_here

# CORS
CORS_ORIGIN=http://localhost:3000
```

5. Create the application database:
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE industrial_dashboard;
\q
```

6. Initialize the database schema:
```bash
npm run db:init
```

## Development

Start the development server with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3001`

## Build for Production

```bash
npm run build
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Factories
- `GET /api/factories` - List all factories
- `GET /api/factories/:id` - Get factory by ID
- `POST /api/factories` - Create new factory
- `PUT /api/factories/:id` - Update factory
- `DELETE /api/factories/:id` - Delete factory

### Connections
- `GET /api/connections?factoryId=xxx` - List connections (optionally filtered by factory)
- `GET /api/connections/:id` - Get connection by ID
- `POST /api/connections` - Create new connection
- `PUT /api/connections/:id` - Update connection
- `DELETE /api/connections/:id` - Delete connection
- `POST /api/connections/test` - Test connection with credentials
- `POST /api/connections/:id/test` - Test saved connection

### Dashboards
- `GET /api/dashboards?factoryId=xxx` - List dashboards (optionally filtered by factory)
- `GET /api/dashboards/:id` - Get dashboard with widgets
- `POST /api/dashboards` - Create new dashboard
- `PUT /api/dashboards/:id` - Update dashboard
- `PATCH /api/dashboards/:id/layout` - Update dashboard layout
- `PATCH /api/dashboards/:id/filters` - Update dashboard filters
- `DELETE /api/dashboards/:id` - Delete dashboard

### Widgets
- `GET /api/dashboards/:dashboardId/widgets` - Get all widgets for dashboard
- `POST /api/dashboards/:dashboardId/widgets` - Create new widget
- `GET /api/widgets/:id` - Get widget by ID
- `PUT /api/widgets/:id` - Update widget
- `DELETE /api/widgets/:id` - Delete widget
- `POST /api/widgets/:id/execute` - Execute widget SQL query
- `POST /api/query/test` - Test SQL query without saving

## Request Examples

### Create a Factory
```bash
curl -X POST http://localhost:3001/api/factories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alpha Factory",
    "location": "Detroit, MI",
    "timezone": "America/Detroit"
  }'
```

### Create a Connection
```bash
curl -X POST http://localhost:3001/api/connections \
  -H "Content-Type: application/json" \
  -d '{
    "factoryId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Production DB",
    "dbType": "postgres",
    "host": "localhost",
    "port": 5432,
    "database": "production_data",
    "username": "dbuser",
    "password": "dbpass"
  }'
```

### Test a Connection
```bash
curl -X POST http://localhost:3001/api/connections/test \
  -H "Content-Type: application/json" \
  -d '{
    "dbType": "postgres",
    "host": "localhost",
    "port": 5432,
    "database": "production_data",
    "username": "dbuser",
    "password": "dbpass"
  }'
```

### Create a Dashboard
```bash
curl -X POST http://localhost:3001/api/dashboards \
  -H "Content-Type: application/json" \
  -d '{
    "factoryId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Production Analysis",
    "description": "Real-time production metrics"
  }'
```

### Create a Widget
```bash
curl -X POST http://localhost:3001/api/dashboards/DASHBOARD_ID/widgets \
  -H "Content-Type: application/json" \
  -d '{
    "type": "KPI",
    "title": "Overall Equipment Effectiveness",
    "connectionId": "CONNECTION_ID",
    "query": "SELECT oee FROM metrics WHERE site_id = :siteId",
    "params": { "siteId": "alpha" },
    "layout": { "x": 0, "y": 0, "w": 2, "h": 2 }
  }'
```

### Execute a Widget
```bash
curl -X POST http://localhost:3001/api/widgets/WIDGET_ID/execute \
  -H "Content-Type: application/json" \
  -d '{
    "filters": {
      "siteId": "alpha",
      "range": "24h"
    }
  }'
```

## Security

- **Credential Encryption**: All database credentials are encrypted using AES-256-GCM before storage
- **SQL Injection Prevention**: All queries use parameterized execution
- **CORS Protection**: Configured to only accept requests from the frontend origin
- **Environment Variables**: Sensitive data stored in `.env` file (never commit this!)

## Database Schema

The application uses PostgreSQL with the following main tables:

- `factories` - Manufacturing sites/facilities
- `connections` - Customer database connection configs (credentials encrypted)
- `dashboards` - Dashboard metadata and layout
- `widgets` - Widget configurations with SQL queries
- `dataset_cache` - Query result caching (optional)

See `schema.sql` for the complete schema.

## Troubleshooting

### Database connection fails
- Verify PostgreSQL is running: `pg_isready`
- Check credentials in `.env`
- Ensure database exists: `psql -l`

### Encryption key error
- Generate a new key: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Key must be exactly 64 characters (32 bytes in hex)

### CORS errors
- Update `CORS_ORIGIN` in `.env` to match your frontend URL
- Default is `http://localhost:3000`

## Next Steps

1. Start the backend server: `npm run dev`
2. Start the frontend: `cd .. && npm run dev`
3. Create a factory through the UI
4. Add a database connection
5. Build your first dashboard!
