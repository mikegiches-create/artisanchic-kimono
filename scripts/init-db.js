// scripts/init-db.js
import sequelize from '../config/database.js';
import { User, Order, Product } from '../model/index.js';

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    // Sync database (create tables)
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables created/updated successfully');

    // Test basic operations
    console.log('🧪 Testing basic database operations...');

    // Create a test user
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'testpassword123'
    });
    console.log('✅ Test user created:', testUser.id);

    // Create a test product
    const testProduct = await Product.create({
      name: 'Test Kimono',
      description: 'A beautiful test kimono',
      price: 99.99,
      currency: 'GBP',
      category: 'casual',
      inStock: true
    });
    console.log('✅ Test product created:', testProduct.id);

    // Create a test order
    const testOrder = await Order.create({
      orderId: 'TEST001',
      userId: testUser.id,
      products: [{ id: testProduct.id, name: testProduct.name, quantity: 1, price: testProduct.price }],
      total: testProduct.price,
      currency: 'GBP',
      status: 'Pending',
      paymentStatus: 'Pending'
    });
    console.log('✅ Test order created:', testOrder.id);

    // Fetch data
    const orders = await Order.findAll();
    const products = await Product.findAll();
    console.log('✅ Orders fetched:', orders.length);
    console.log('✅ Products fetched:', products.length);

    // Clean up test data
    await Order.destroy({ where: { orderId: 'TEST001' } });
    await Product.destroy({ where: { id: testProduct.id } });
    await User.destroy({ where: { email: 'test@example.com' } });
    console.log('🧹 Test data cleaned up');

    console.log('🎉 Database initialization completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Run "node scripts/seed-database.js" to populate products');
    console.log('   2. Start the server with "npm run dev"');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

initializeDatabase();
