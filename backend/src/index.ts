import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testAppDbConnection, closeAllConnections } from './config/database';

// Import routes
import authRoutes from './routes/auth.routes';
import factoriesRoutes from './routes/factories.routes';
import connectionsRoutes from './routes/connections.routes';
import dashboardsRoutes from './routes/dashboards.routes';
import widgetsRoutes from './routes/widgets.routes';
import { WidgetsController } from './controllers/widgets.controller';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration - support multiple origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://industry-production-dd27.up.railway.app',
  process.env.CORS_ORIGIN, // Additional origin from env if specified
].filter(Boolean); // Remove undefined/null values

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes); // Auth routes (public + protected)
app.use('/api/factories', factoriesRoutes);
app.use('/api/connections', connectionsRoutes);
app.use('/api/dashboards', dashboardsRoutes);
app.use('/api/widgets', widgetsRoutes);

// Dashboard widgets endpoint (nested route)
const widgetsController = new WidgetsController();
app.get('/api/dashboards/:dashboardId/widgets', widgetsController.getWidgetsByDashboardId.bind(widgetsController));
app.post('/api/dashboards/:dashboardId/widgets', widgetsController.createWidget.bind(widgetsController));

// Query test endpoint
app.post('/api/query/test', widgetsController.testQuery.bind(widgetsController));

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found', message: 'Endpoint not found' });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
async function startServer() {
  try {
    // Test database connection
    const connected = await testAppDbConnection();
    if (!connected) {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════╗
║   Industrial Dashboard API Server         ║
╚════════════════════════════════════════════╝

🚀 Server running on http://localhost:${PORT}
📊 Environment: ${process.env.NODE_ENV || 'development'}
🔗 CORS enabled for: ${allowedOrigins.join(', ')}

API Endpoints:
  GET    /health
  GET    /api/factories
  POST   /api/factories
  GET    /api/connections
  POST   /api/connections
  POST   /api/connections/test
  GET    /api/dashboards
  POST   /api/dashboards
  GET    /api/dashboards/:id
  GET    /api/dashboards/:id/widgets
  POST   /api/dashboards/:id/widgets
  POST   /api/widgets/:id/execute
  POST   /api/query/test

Press Ctrl+C to stop the server
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM received, closing server gracefully...');
  await closeAllConnections();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 SIGINT received, closing server gracefully...');
  await closeAllConnections();
  process.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();
