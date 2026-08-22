import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import messageRoutes from './routes/messages.js';
import configRoutes from './routes/config.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 login attempts per window
  message: { message: 'Too many login attempts. Please try again after 15 minutes.' },
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // max 10 contact submissions per window
  message: { message: 'Too many messages sent. Please wait a bit before trying again.' },
});

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount Routes
app.use('/api/auth/login', authLimiter);
app.use('/api/messages', (req, res, next) => {
  if (req.method === 'POST') return contactLimiter(req, res, next);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/config', configRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.env.UPTIME || process.uptime(),
    timestamp: new Date().toISOString(),
    owner: 'Nuthan Prasad KG',
  });
});

// 404 Route
app.use((req, res) => {
  res.status(404).json({ message: 'API Endpoint Not Found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack || err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

// Connect Database & Start Server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 Steve's Portfolio Backend Running on Port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
    console.log(`=================================================`);
  });
};

startServer();
