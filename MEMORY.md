# MEMORY.md - AI Agent Project Reference

## Project Overview

**Name**: Industrial SQL Dashboard
**Purpose**: A powerful, customizable dashboard application for industrial manufacturing analytics
**Repository**: https://github.com/yetkinsal/industry
**Frontend Deployment**: https://industr.netlify.app/
**Backend Deployment**: https://industry-production-dd27.up.railway.app/

This is a full-stack application that allows users to:
- Connect to their SQL databases (PostgreSQL, MySQL, MSSQL)
- Create custom visualizations using SQL queries
- Monitor production metrics in real-time
- Build drag-and-drop dashboards with various widget types

---

## Technology Stack

### Frontend
- **Framework**: React 19.2.0 with TypeScript
- **Build Tool**: Vite 6.2.0
- **Routing**: React Router DOM v7.9.5
- **UI Components**:
  - Recharts 3.3.0 (data visualization)
  - react-grid-layout 1.4.4 (drag-and-drop dashboard)
  - react-resizable 3.0.5 (resizable widgets)
- **Styling**: TailwindCSS (via index.html)
- **Dev Server**: Runs on port 3000 (localhost:3000)

### Backend
- **Runtime**: Node.js with Express 4.18.2
- **Language**: TypeScript 5.3.3
- **Database**: PostgreSQL (hosted on Supabase)
- **ORM**: pg (node-postgres) 8.11.3 - Direct SQL queries, no ORM
- **Security**:
  - bcrypt 5.1.1 (password hashing)
  - jsonwebtoken 9.0.2 (JWT authentication)
  - AES-256-GCM encryption for database credentials
- **Dev Tools**: tsx (TypeScript execution)
- **API Server**: Runs on port 3001 (localhost:3001)

---

## Project Structure

```
industrial-sql-dashboard/
├── backend/                          # Backend Express API
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts           # Database connection pool management
│   │   ├── controllers/              # Request handlers
│   │   │   ├── auth.controller.ts    # Auth endpoints
│   │   │   ├── factories.controller.ts
│   │   │   ├── connections.controller.ts
│   │   │   ├── dashboards.controller.ts
│   │   │   └── widgets.controller.ts
│   │   ├── services/                 # Business logic layer
│   │   │   ├── auth.service.ts       # JWT & bcrypt operations
│   │   │   ├── factories.service.ts
│   │   │   ├── connections.service.ts
│   │   │   ├── dashboards.service.ts
│   │   │   └── widgets.service.ts
│   │   ├── routes/                   # API route definitions
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts    # JWT verification
│   │   ├── utils/
│   │   │   └── encryption.ts         # AES-256-GCM crypto functions
│   │   ├── types/
│   │   │   └── index.ts              # Backend TypeScript types
│   │   └── index.ts                  # Express app entry point
│   ├── schema.sql                    # PostgreSQL database schema
│   ├── package.json
│   └── .env                          # Backend environment variables
│
├── components/                       # React components
│   ├── auth/
│   │   └── ProtectedRoute.tsx        # Route authentication wrapper
│   ├── layout/
│   │   ├── DashboardLayout.tsx       # Main app layout
│   │   ├── Sidebar.tsx               # Navigation sidebar
│   │   └── Topbar.tsx                # Top navigation bar
│   ├── builder/                      # Dashboard builder components
│   │   ├── WidgetLibrary.tsx         # Widget type selector
│   │   ├── WidgetEditor.tsx          # Widget configuration editor
│   │   └── SqlEditor.tsx             # SQL query editor
│   └── widgets/                      # Widget visualization components
│       ├── WidgetWrapper.tsx         # Common widget container
│       ├── KpiCard.tsx               # KPI number display
│       ├── OeeByHourChart.tsx        # Line chart
│       ├── DowntimeReasonsChart.tsx  # Bar chart
│       ├── RunTimeDowntimeChart.tsx  # Stacked bar chart
│       ├── ProductionCostChart.tsx   # Area chart
│       ├── GaugeChart.tsx            # Gauge/radial chart
│       ├── EventsTable.tsx           # Data table
│       ├── ScrapHeatmap.tsx          # Heatmap visualization
│       └── WidgetError.tsx           # Error display
│
├── pages/                            # Page components
│   ├── LandingPage.tsx               # Public landing page
│   ├── LoginPage.tsx                 # User login
│   ├── RegisterPage.tsx              # User registration
│   ├── DashboardsListPage.tsx        # List all dashboards
│   ├── DashboardPage.tsx             # View dashboard (read-only)
│   ├── BuilderPage.tsx               # Edit dashboard (drag-and-drop)
│   ├── NewFactoryPage.tsx            # 4-step factory onboarding wizard
│   └── ConnectionsPage.tsx           # Manage database connections
│
├── contexts/                         # React Context providers
│   └── AuthContext.tsx               # JWT token & user state management
│
├── services/                         # API client services
│   └── api.ts                        # Fetch wrappers for backend
│
├── types.ts                          # Frontend TypeScript types
├── constants.tsx                     # App constants and demo data
├── App.tsx                           # Main app component with routing
├── index.tsx                         # React app entry point
├── vite.config.ts                    # Vite build configuration
├── package.json                      # Frontend dependencies
├── .env.example                      # Environment variable template
├── .env.local                        # Frontend environment variables
├── README.md                         # Project documentation
├── vercel.json                       # Vercel deployment config
└── netlify.toml                      # Netlify deployment config
```

---

## Database Schema (PostgreSQL)

The application uses **PostgreSQL** hosted on **Supabase**. The schema is defined in `backend/schema.sql`.

### Tables:

1. **factories** (UUID primary key)
   - Represents manufacturing sites/facilities
   - Fields: id, name, location, timezone, created_at, updated_at
   - Seed data: Alpha Factory (Detroit), Beta Factory (Austin)

2. **connections** (UUID primary key)
   - Stores encrypted customer database credentials
   - Fields: id, factory_id (FK), name, db_type (postgres/mysql/mssql), host, port, database, user_enc, pass_enc, options_enc
   - Credentials are AES-256-GCM encrypted
   - Unique constraint: (factory_id, name)

3. **dashboards** (UUID primary key)
   - Dashboard configurations
   - Fields: id, factory_id (FK), name, description, layout (JSONB), filters (JSONB)
   - Default filters: {"site":"alpha","range":"24h","lines":[],"sku":"","shifts":[],"productName":"cement"}

4. **widgets** (UUID primary key)
   - Individual dashboard widgets with SQL queries
   - Fields: id, dashboard_id (FK), type (enum), title, description, connection_id (FK), query, params (JSONB), refresh_interval, viz_options (JSONB)
   - Widget types: 'KPI', 'LINE', 'BAR', 'GAUGE', 'TABLE', 'HEATMAP', 'AREA', 'HORIZONTAL_BAR'

5. **dataset_cache** (UUID primary key)
   - Cache query results for performance
   - Fields: id, widget_id (FK), param_hash, data (JSONB), expires_at
   - Currently not actively used in the application

### Important Notes:
- All tables use UUID primary keys with uuid_generate_v4()
- Timestamps use TIMESTAMP WITH TIME ZONE
- Triggers automatically update `updated_at` fields
- Indexes on foreign keys for performance
- Cascading deletes for factories → connections, dashboards, widgets

---

## Authentication System

**Implementation**: JWT-based authentication with bcrypt password hashing

### Flow:
1. User registers via `/api/auth/register` (POST)
   - Password hashed with bcrypt (10 salt rounds)
   - User stored in `users` table (must be added to schema.sql)

2. User logs in via `/api/auth/login` (POST)
   - Password verified with bcrypt.compare()
   - JWT token issued with 24h expiration
   - Token includes: userId, email

3. Protected routes use `auth.middleware.ts`
   - Verifies JWT token from Authorization header
   - Adds `req.user` object to request

### Frontend Auth:
- `AuthContext.tsx` manages JWT token in localStorage
- `ProtectedRoute.tsx` wrapper for authenticated pages
- Token automatically included in API requests

### Files:
- Backend: `backend/src/services/auth.service.ts`, `backend/src/middleware/auth.middleware.ts`
- Frontend: `contexts/AuthContext.tsx`, `components/auth/ProtectedRoute.tsx`

---

## Security Features

### 1. Database Credential Encryption (AES-256-GCM)
**File**: `backend/src/utils/encryption.ts`

- Algorithm: aes-256-gcm
- Key: 64-character hex string (32 bytes) from `ENCRYPTION_KEY` env var
- Format: `iv:authTag:encryptedData`
- Used for: connection.user_enc, connection.pass_enc, connection.options_enc

**Generate key**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. SQL Injection Prevention
- Parameterized queries using pg library
- Widget queries use parameter placeholders: `:siteId`, `:range`
- Parameters validated before execution

### 3. CORS Protection
**File**: `backend/src/index.ts`

Allowed origins:
- http://localhost:3000
- http://localhost:5173
- https://industry-production-dd27.up.railway.app
- Additional from `CORS_ORIGIN` env var

### 4. JWT Authentication
- Tokens expire after 24 hours
- Secret from `JWT_SECRET` env var
- Protected routes require valid token

---

## API Endpoints

**Base URL**: http://localhost:3001 (dev) or https://industry-production-dd27.up.railway.app (prod)

### Authentication (Public)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user (returns JWT)
- `GET /api/auth/me` - Get current user (protected)

### Factories (Protected)
- `GET /api/factories` - List all factories
- `POST /api/factories` - Create factory
- `GET /api/factories/:id` - Get factory by ID
- `PUT /api/factories/:id` - Update factory
- `DELETE /api/factories/:id` - Delete factory

### Connections (Protected)
- `GET /api/connections?factoryId=<uuid>` - List connections for factory
- `POST /api/connections` - Create connection (encrypts credentials)
- `GET /api/connections/:id` - Get connection (decrypts credentials)
- `PUT /api/connections/:id` - Update connection
- `DELETE /api/connections/:id` - Delete connection
- `POST /api/connections/test` - Test connection without saving

### Dashboards (Protected)
- `GET /api/dashboards?factoryId=<uuid>` - List dashboards for factory
- `POST /api/dashboards` - Create dashboard
- `GET /api/dashboards/:id` - Get dashboard by ID
- `PUT /api/dashboards/:id` - Update dashboard (layout, filters)
- `DELETE /api/dashboards/:id` - Delete dashboard
- `GET /api/dashboards/:dashboardId/widgets` - Get widgets for dashboard
- `POST /api/dashboards/:dashboardId/widgets` - Create widget

### Widgets (Protected)
- `POST /api/widgets/:id/execute` - Execute widget query with params
- `POST /api/query/test` - Test SQL query without saving widget

### Health Check (Public)
- `GET /health` - Server health status

---

## Key Features

### 1. Multi-Step Factory Onboarding
**File**: `pages/NewFactoryPage.tsx`

4-step wizard:
1. Factory Details (name, location, timezone)
2. Database Connection (type, host, port, credentials)
3. Test Connection
4. Create Dashboard

### 2. Dashboard Builder
**File**: `pages/BuilderPage.tsx`

- Drag-and-drop grid layout (react-grid-layout)
- Widget library with 8 widget types
- SQL editor with syntax highlighting
- Parameter binding (:siteId, :range, etc.)
- Auto-save functionality
- Resizable widgets

### 3. Widget Types
Supported visualizations:
- **KPI**: Single number with delta percentage
- **LINE**: Time-series line chart
- **BAR**: Vertical bar chart
- **HORIZONTAL_BAR**: Horizontal bar chart
- **AREA**: Area chart (filled line)
- **GAUGE**: Radial gauge/donut chart
- **TABLE**: Data table with sorting
- **HEATMAP**: Color-coded heatmap

### 4. Real-Time Data
- Widgets execute SQL queries against customer databases
- Support for PostgreSQL, MySQL, MSSQL
- Auto-refresh intervals (configurable per widget)
- Parameter substitution from dashboard filters

### 5. Responsive Layout
- Grid-based layout adapts to screen sizes
- Mobile-friendly dashboard views
- Collapsible sidebar

### 6. Multi-Product Comparison
**New Feature** - Compare multiple products on the same chart

- **Multi-Select Products**: Users can select multiple products (cement, iron, steel, concrete, aggregate) via checkboxes in the sidebar
- **Time-Series Comparison**: Display multiple product metrics on the same chart with time alignment
- **Auto-Detection**: Charts automatically detect and display all selected product columns
- **Color Coding**: Each product has a unique color for easy differentiation
  - Cement: Teal (#48C9B0)
  - Iron: Red (#E74C3C)
  - Steel: Blue (#3498DB)
  - Concrete: Orange (#F39C12)
  - Aggregate: Purple (#9B59B6)
- **Chart Types**: Supports line, area, and bar charts for multi-series data
- **Component**: `components/widgets/MultiProductChart.tsx`

**Usage Example - SQL Query for Multi-Product Comparison:**
```sql
SELECT
  timestamp,
  SUM(CASE WHEN product = 'cement' THEN quantity ELSE 0 END) as cement,
  SUM(CASE WHEN product = 'iron' THEN quantity ELSE 0 END) as iron
FROM production_data
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY timestamp
ORDER BY timestamp
```

**Filter Structure:**
- `filters.products`: Array of selected products (e.g., ['cement', 'iron'])
- `filters.productName`: Legacy single product (kept for backward compatibility)

---

## Environment Variables

### Backend (.env in backend/)
```bash
DATABASE_URL=postgresql://user:pass@host:port/database  # Supabase connection string
ENCRYPTION_KEY=<64-character-hex-string>                 # For credential encryption
JWT_SECRET=<random-string>                               # For JWT signing
NODE_ENV=development|production                          # Environment
PORT=3001                                                # Server port (optional)
CORS_ORIGIN=https://your-frontend.com                    # Additional CORS origin (optional)
```

### Frontend (.env.local)
```bash
VITE_API_BASE_URL=http://localhost:3001                  # Backend API URL
GEMINI_API_KEY=<your-key>                                # Optional (mentioned in vite.config.ts)
```

---

## Development Workflow

### Start Development Servers

**Backend** (Terminal 1):
```bash
cd backend
npm install
npm run dev  # Runs on http://localhost:3001
```

**Frontend** (Terminal 2):
```bash
npm install
npm run dev  # Runs on http://localhost:3000
```

### Build for Production

**Backend**:
```bash
cd backend
npm run build  # Compiles TypeScript to dist/
npm start      # Runs compiled code
```

**Frontend**:
```bash
npm run build  # Builds to dist/
npm run preview  # Preview production build
```

---

## Deployment

### Backend: Railway (Already Deployed)
**URL**: https://industry-production-dd27.up.railway.app

Environment variables set on Railway:
- `DATABASE_URL` (Supabase PostgreSQL)
- `ENCRYPTION_KEY`
- `JWT_SECRET`
- `NODE_ENV=production`

### Frontend: Vercel or Netlify

**Vercel** (Recommended):
- Auto-detects Vite configuration
- Config file: `vercel.json` (sets VITE_API_BASE_URL)
- Deploy: Push to GitHub → Import in Vercel

**Netlify**:
- Auto-detects build settings
- Config file: `netlify.toml` (sets build command and VITE_API_BASE_URL)
- Deploy: Push to GitHub → Import in Netlify

### Post-Deployment
Add frontend URL to backend CORS configuration in `backend/src/index.ts`:
```typescript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://industry-production-dd27.up.railway.app',
  'https://your-frontend.vercel.app',  // Add this
];
```

---

## Important Notes for AI Agents

### Code Style and Patterns

1. **Service Layer Pattern**:
   - Controllers handle HTTP requests/responses
   - Services contain business logic
   - Database queries in services, not controllers

2. **TypeScript Usage**:
   - Strict types throughout
   - Shared types in `types.ts` (frontend) and `backend/src/types/index.ts` (backend)
   - Interfaces for data models

3. **Error Handling**:
   - Try-catch blocks in services
   - Meaningful error messages returned to client
   - 500 errors for unhandled exceptions

4. **Database Connections**:
   - Connection pooling via `pg.Pool` in `backend/src/config/database.ts`
   - Separate pools for app database and customer databases
   - Proper connection cleanup on shutdown

### Common Tasks

**Adding a New Widget Type**:
1. Add type to `WidgetType` union in `types.ts`
2. Update `widgets` table CHECK constraint in `schema.sql`
3. Create widget component in `components/widgets/`
4. Add to widget library in `components/builder/WidgetLibrary.tsx`
5. Add rendering logic in `components/widgets/WidgetWrapper.tsx`

**Adding a New API Endpoint**:
1. Add service method in `backend/src/services/`
2. Add controller method in `backend/src/controllers/`
3. Add route in `backend/src/routes/`
4. Register route in `backend/src/index.ts`
5. Add client method in `services/api.ts` (frontend)

**Adding Authentication to a Route**:
1. Import `authenticateToken` from `backend/src/middleware/auth.middleware.ts`
2. Add middleware to route: `router.get('/path', authenticateToken, controller.method)`
3. Use `req.user` in controller for authenticated user info

### Known Limitations

1. **No Users Table**: Auth system implemented but users table not in schema.sql (needs to be added)
2. **Dataset Cache Unused**: Cache table exists but not actively used in application
3. **No Real-Time Updates**: Widgets refresh on interval or manual refresh only
4. **Limited Query Validation**: SQL queries not validated before execution (security risk)
5. **No Multi-Tenancy**: No isolation between different organizations

### Recent Commits
Based on git history:
- **b1fa8e1**: Complete authentication system with JWT
- **abe0937**: Frontend deployment configurations for Vercel and Netlify
- **e59d25d**: Phase 2 enhancements - auto-refresh, widget types, dashboard editing
- **2eb7d66**: Railway URL added to CORS configuration
- **3fe6eae**: Phase 1 critical fixes and features

### Testing Strategy
- Manual testing via Postman/curl for API endpoints
- Frontend testing in browser
- Connection testing via `/api/connections/test` endpoint
- No automated tests currently implemented

---

## Quick Reference

### Start Development:
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
npm run dev
```

### Access URLs:
- Frontend (Dev): http://localhost:3000
- Frontend (Prod): https://industr.netlify.app/
- Backend API (Dev): http://localhost:3001
- Backend API (Prod): https://industry-production-dd27.up.railway.app/
- Supabase Dashboard: https://supabase.com/dashboard/project/dzfgrfrswezeidizjefk

### Key Files:
- Database Schema: `backend/schema.sql`
- Backend Entry: `backend/src/index.ts`
- Frontend Entry: `App.tsx`
- Types: `types.ts`, `backend/src/types/index.ts`
- API Client: `services/api.ts`
- Auth Context: `contexts/AuthContext.tsx`
- Encryption: `backend/src/utils/encryption.ts`

---

**Last Updated**: October 31, 2025
**Current Branch**: main
**Status**: Active development with authentication system implemented
