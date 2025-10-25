// models/index.js
import sequelize from '../config/database.js';
import User from './User.js';
import Order from './Order.js';
import Product from './Product.js';

// Initialize associations
User.associate = (models) => {
  User.hasMany(models.Order, {
    foreignKey: 'userId',
    as: 'orders',
  });
};

Order.associate = (models) => {
  Order.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
  });
};

Product.associate = (models) => {
  // Product associations can be added here if needed (e.g., reviews, categories)
};

// Define associations
const models = { User, Order, Product };
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

export { sequelize, User, Order, Product };
export default { sequelize, User, Order, Product };
