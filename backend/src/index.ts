import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.router.js';
import { dashboardRouter } from './routes/dashboard.router.js';
import { reportingRouter } from './routes/reporting.router.js';
import { configRouter } from './routes/config.router.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, _res, next) => {
  console.log(`[Backend API] ${new Date().toISOString()} | ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'UP',
    service: 'MFE Microservice Node.js Express Backend',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/config', configRouter);
app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/reporting', reportingRouter);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Node.js Express Backend Server is running at http://localhost:${PORT}/api/health`);
});
