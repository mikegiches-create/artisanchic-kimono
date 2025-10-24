// scripts/start-server.js
import mongoose from 'mongoose';
import app from '../server.js';

const PORT = process.env.PORT || 3000;

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔻 Received SIGINT. Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔻 Received SIGTERM. Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`
🛍️  E-commerce Payment Server
─────────────────────────────
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV}
💳 PayPal Mode: ${process.env.PAYPAL_ENVIRONMENT}
📊 Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}
🚀 Server ready: http://localhost:${PORT}
  `)
});