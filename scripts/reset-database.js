// scripts/reset-database.js
import sequelize from '../config/database.js';
import { User, Order, Product } from '../model/index.js';

async function resetDatabase() {
  try {
    console.log('🔄 Resetting database...');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Drop all tables and recreate them
    await sequelize.sync({ force: true });
    console.log('✅ All tables dropped and recreated');

    console.log('\n📊 Database reset complete!');
    console.log('💡 Next step: Run "npm run db:seed" to populate products');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Database reset failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

resetDatabase();
