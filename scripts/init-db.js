// scripts/init-db.js
import sequelize from '../config/database.js';
import User from '../model/User.js';
import Order from '../model/Order.js';

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

    // Create a test order
    const testOrder = await Order.create({
      orderId: 'TEST001',
      userId: testUser.id,
      products: [{ id: 1, name: 'Test Product', quantity: 1, price: 10.00 }],
      total: 10.00,
      currency: 'GBP',
      status: 'Pending',
      paymentStatus: 'Pending'
    });
    console.log('✅ Test order created:', testOrder.id);

    // Fetch orders
    const orders = await Order.findAll();
    console.log('✅ Orders fetched:', orders.length);

    // Clean up test data
    await Order.destroy({ where: { orderId: 'TEST001' } });
    await User.destroy({ where: { email: 'test@example.com' } });
    console.log('🧹 Test data cleaned up');

    console.log('🎉 Database initialization completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

initializeDatabase();
