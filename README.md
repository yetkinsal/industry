# Industrial SQL Dashboard

A powerful, customizable dashboard application for industrial manufacturing analytics. Connect to your SQL databases, create custom visualizations with SQL queries, and monitor your production metrics in real-time.

## Features

- **Multi-Step Factory Onboarding**: Easy setup wizard for adding new factories and database connections
- **Visual Dashboard Builder**: Drag-and-drop interface to create custom dashboards
- **SQL-Powered Widgets**: Write custom SQL queries to power your visualizations
- **Real-Time Data**: Execute queries against your production databases
- **Secure Connections**: AES-256 encryption for stored database credentials
- **Multiple Widget Types**: KPIs, Charts (Line, Bar, Area, Gauge), Tables, and Heatmaps
- **Responsive Layout**: Grid-based layout that adapts to different screen sizes
- **Auto-Save**: Dashboard configurations automatically save as you work

## Tech Stack

**Frontend**: React 19, TypeScript, Vite, Recharts, react-grid-layout, TailwindCSS
**Backend**: Node.js, Express, TypeScript, PostgreSQL (Supabase)

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### 1. Clone & Install

```bash
git clone https://github.com/yetkinsal/industry.git
cd industrial-sql-dashboard
npm install
cd backend && npm install && cd ..
```

### 2. Set Up Supabase

1. Go to [https://supabase.com/dashboard/project/dzfgrfrswezeidizjefk](https://supabase.com/dashboard/project/dzfgrfrswezeidizjefk)
2. Copy `backend/schema.sql` content
3. Run in Supabase SQL Editor

### 3. Configure Environment

**Backend** (`backend/.env`):
```bash
cd backend
cp .env.example .env
# Edit .env and add your Supabase database password in DATABASE_URL
# Generate encryption key: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Frontend** (`.env`):
```bash
cp .env.example .env
# VITE_API_BASE_URL is pre-configured
```

### 4. Run

```bash
# Terminal 1 - Backend
cd backend
npm run dev  # Runs on http://localhost:3001

# Terminal 2 - Frontend
npm run dev  # Runs on http://localhost:3000
```

## Usage

1. **Add Factory**: Go to `/factory/new` and complete the 4-step wizard
2. **Build Dashboard**: Create widgets, write SQL queries, arrange layout
3. **View Live**: See real-time data from your production databases

### SQL Query Example
```sql
SELECT oee, timestamp
FROM production_metrics
WHERE site_id = :siteId
  AND timestamp >= NOW() - INTERVAL ':range'
```

## Project Structure

```
industrial-sql-dashboard/
├── backend/              # Express API + Supabase
│   ├── src/
│   │   ├── controllers/  # API endpoints
│   │   ├── services/     # Business logic
│   │   └── config/       # Database config
│   └── schema.sql        # Database schema
├── components/           # React components
├── pages/               # Page components
├── services/            # API client
└── types.ts             # TypeScript types
```

## API Endpoints

- **Factories**: `GET/POST/PUT/DELETE /api/factories`
- **Connections**: `GET/POST/PUT/DELETE /api/connections`
- **Dashboards**: `GET/POST/PUT/DELETE /api/dashboards`
- **Widgets**: `POST /api/widgets/:id/execute`

## Security

- AES-256-GCM credential encryption
- Parameterized SQL queries (injection prevention)
- CORS protection
- Environment-based secrets

## Deployment

**Backend** (Vercel/Railway/Render):
- Set `DATABASE_URL`, `ENCRYPTION_KEY`, `CORS_ORIGIN`

**Frontend** (Vercel/Netlify):
- Set `VITE_API_BASE_URL`

## GitHub
https://github.com/yetkinsal/industry

## License
MIT
