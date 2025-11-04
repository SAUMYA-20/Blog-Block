import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors, { CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import authRoutes from './routes/authRoutes';
import blogRoutes from './routes/blogRoutes';

const app = express();

// Allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://blog-block.vercel.app',
  'https://blog-block-pkq9.vercel.app',
];

// CORS configuration
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some((allowed) => origin === allowed.trim())) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-auth-token'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Connect to MongoDB with retry logic
const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blogging', {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Basic route
app.get('/', (_req: Request, res: Response) => {
  res.send('Blog API is running');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

// Handle 404 routes
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, _promise) => {
  console.error('Unhandled Promise Rejection:', reason);
  // Note: In production, you might want to gracefully shut down here
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => {
    process.exit(1);
  });
});