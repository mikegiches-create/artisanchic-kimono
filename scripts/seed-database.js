// scripts/seed-database.js
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';
import { User, Order, Product } from '../model/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    // Sync database (create tables if they don't exist)
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Database tables synchronized');

    // Check if products already exist
    const existingProducts = await Product.count();
    if (existingProducts > 0) {
      console.log(`ℹ️  Database already has ${existingProducts} products. Skipping seed.`);
      console.log('💡 To re-seed, delete products first or use force sync.');
      process.exit(0);
    }

    // Load products from JSON file
    const productsPath = path.join(__dirname, '../data/products.json');
    const productsData = JSON.parse(readFileSync(productsPath, 'utf-8'));
    console.log(`📦 Loaded ${productsData.length} products from JSON file`);

    // Insert products into database
    for (const productData of productsData) {
      await Product.create(productData);
      console.log(`✅ Created product: ${productData.name}`);
    }

    console.log(`🎉 Successfully seeded ${productsData.length} products!`);

    // Display summary
    const totalProducts = await Product.count();
    const totalUsers = await User.count();
    const totalOrders = await Order.count();

    console.log('\n📊 Database Summary:');
    console.log(`   Products: ${totalProducts}`);
    console.log(`   Users: ${totalUsers}`);
    console.log(`   Orders: ${totalOrders}`);

    process.exit(0);

  } catch (error) {
    console.error('❌ Database seeding failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

seedDatabase();
