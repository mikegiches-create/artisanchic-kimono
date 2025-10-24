// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
// mongodb-memory-server is a dev-time in-memory MongoDB used as a fallback
let MongoMemoryServer = null;
try {
  // require only when available (dev dependency)
  MongoMemoryServer = (await import('mongodb-memory-server')).MongoMemoryServer;
} catch (err) {
  // ignore if not installed
}
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import paymentRoutes from "./routes/payment.js";
import orderRoutes from "./routes/orders.js";
import productRoutes from "./routes/products.js";
import authRoutes from "./routes/auth.js";
import config from "./config/config.js";

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet()); // Set security headers
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(cookieParser()); // Parse cookies

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// CORS configuration -- robust handling
const allowedOrigins = config.cors.allowedOrigins || [];
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // If running in development and allowedOrigins contains '*', allow any origin
  if (allowedOrigins.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else if (!origin) {
    // No origin (e.g. same-origin or non-browser request) - allow
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (allowedOrigins.includes(origin)) {
    // Echo back the requesting origin when it's allowed
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection with enhanced error handling
const connectWithFallback = async () => {
  try {
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message || err);

    // If in development, try mongodb-memory-server fallback
    if (config.nodeEnv === 'development' && MongoMemoryServer) {
      console.warn('⚠️ Attempting to start in-memory MongoDB (mongodb-memory-server) as a fallback for development');
      try {
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('✅ Connected to in-memory MongoDB');
      } catch (memErr) {
        console.error('❌ Failed to start in-memory MongoDB:', memErr.message || memErr);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

// Start connection flow
connectWithFallback();

// Routes
app.use("/api/payment", paymentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);

// Debug endpoint to show what CORS header will be set for the incoming request
app.get('/debug/cors', (req, res) => {
  const origin = req.headers.origin;
  const allowed = config.cors.allowedOrigins || [];
  let acao = '';
  if (allowed.includes('*')) {
    acao = origin || '*';
  } else if (!origin) {
    acao = '*';
  } else if (allowed.includes(origin)) {
    acao = origin;
  }

  res.json({
    origin,
    accessControlAllowOrigin: acao,
    allowedOrigins: allowed
  });
});

// Health check with enhanced info
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Server is running",
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);
  
  // Don't leak error details in production
  const error = config.nodeEnv === 'production' 
    ? 'Internal server error' 
    : err.message;
    
  res.status(err.status || 500).json({
    success: false,
    error: error
  });
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED REJECTION! Shutting down...');
  console.error(err);
  process.exit(1);
});

// ***************************************************************
// UPDATED app.listen() FOR HOSTING
// ***************************************************************
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost'; 

// Start server
app.listen(config.port, HOST, () => {
  console.log(`🚀 Server running on host ${HOST} port ${config.port}`);
  console.log(`📍 API URL: http://${HOST}:${config.port}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`🔐 CORS allowed origins: ${JSON.stringify(config.cors.allowedOrigins)}`);
  if (process.env.PAYPAL_CLIENT_ID) {
    console.log(`💳 PayPal Mode: ${process.env.PAYPAL_ENVIRONMENT === "sandbox" ? "Sandbox" : "Live"}`);
  }
});