import express from 'express';
import cors from 'cors';
import { seedDatabase } from './db/seed.js';
import locationsRouter from './routes/locations.js';
import routeRouter from './routes/route.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/locations', locationsRouter);
app.use('/api/route', routeRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Campus Navigation System API',
    version: '1.0.0'
  });
});

// Root friendly endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Campus Navigation System REST API',
    endpoints: {
      health: 'GET /api/health',
      locations: 'GET /api/locations',
      categories: 'GET /api/locations/categories',
      locationDetail: 'GET /api/locations/:id',
      createLocation: 'POST /api/locations',
      findRoute: 'POST /api/route',
      allEdges: 'GET /api/route/edges',
      resetSeed: 'POST /api/route/reset-seed'
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error occurred.'
  });
});

// Auto seed on boot if needed and listen
seedDatabase(false);

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(` Campus Navigation Backend Running on:`);
  console.log(` http://localhost:${PORT}`);
  console.log(` Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=================================================`);
});
