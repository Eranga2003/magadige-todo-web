import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// 1. Configure CORS with specific allowed origin (no wildcards for security)
app.use(
  cors({
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// 2. Body Parser (limit size to prevent denial of service attacks)
app.use(express.json({ limit: '10kb' }));

// 3. Security Rate Limiting on authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to auth endpoints
app.use('/api/auth', authLimiter);

// 4. Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// 5. Centralized Error Handling Middleware (Security checkup: do not leak db stack traces)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Error:', err.message || err);

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal Server Error' : err.message;

  res.status(statusCode).json({
    status: 'error',
    message,
    // only expose stack in development if needed, otherwise omit
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Security-hardened Auth Server running on http://localhost:${PORT}`);
  console.log(`🔒 Allowed CORS Origin: ${CORS_ORIGIN}`);
});
