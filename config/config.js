import dotenv from 'dotenv';
dotenv.config();

export default {
  // Server settings
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4243', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Database settings - MySQL
  mysql: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    database: process.env.DB_NAME || 'kimono_shop',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },

  // JWT settings
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRE || '24h',
    cookie: {
      expires: parseInt(process.env.JWT_COOKIE_EXPIRE || '24', 10),
      secure: process.env.SECURE_COOKIE === 'true',
      sameSite: 'strict',
      httpOnly: true
    }
  },

  // Email settings
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM
  },

  // Security settings
  cors: {
    // In development allow all origins for convenience. In production set CORS_ALLOWED_ORIGINS.
    allowedOrigins: process.env.NODE_ENV === 'development'
      ? ['*']
      : (process.env.CORS_ALLOWED_ORIGINS ? process.env.CORS_ALLOWED_ORIGINS.split(',') : []),
    credentials: true
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10)
  },

  // PayPal settings
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID,
    secret: process.env.PAYPAL_SECRET,
    api: process.env.PAYPAL_API
  }
};