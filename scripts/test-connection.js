// scripts/test-connection.js
import sequelize from '../config/database.js';
import config from '../config/config.js';

async function testConnection() {
  console.log('🔍 Testing MySQL Database Connection...\n');
  
  console.log('📋 Configuration:');
  console.log(`   Host: ${config.mysql.host}`);
  console.log(`   Port: ${config.mysql.port}`);
  console.log(`   Database: ${config.mysql.database}`);
  console.log(`   User: ${config.mysql.username}`);
  console.log(`   Dialect: ${config.mysql.dialect}\n`);

  try {
    // Test authentication
    await sequelize.authenticate();
    console.log('✅ Connection has been established successfully!\n');

    // Get database version
    const [results] = await sequelize.query('SELECT VERSION() as version');
    console.log(`📊 MySQL Version: ${results[0].version}\n`);

    // List existing tables
    const [tables] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = '${config.mysql.database}'
    `);
    
    if (tables.length > 0) {
      console.log('📁 Existing Tables:');
      tables.forEach(table => {
        console.log(`   - ${table.TABLE_NAME}`);
      });
    } else {
      console.log('📁 No tables found. Run "npm run db:init" to create tables.');
    }

    console.log('\n✅ Connection test completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Unable to connect to the database:');
    console.error(`   Error: ${error.message}\n`);
    
    console.log('💡 Troubleshooting tips:');
    console.log('   1. Make sure MySQL server is running');
    console.log('   2. Verify database credentials in .env file');
    console.log('   3. Check if database exists: CREATE DATABASE kimono_shop;');
    console.log('   4. Verify user has proper permissions\n');
    
    process.exit(1);
  }
}

testConnection();
