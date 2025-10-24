// models/index.js
import sequelize from '../config/database.js';
import User from './User.js';
import Order from './Order.js';

// Initialize associations
User.associate = (models) => {
  // User associations can be added here if needed
};

Order.associate = (models) => {
  Order.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
  });
};

// Define associations
Object.keys({ User, Order }).forEach((modelName) => {
  if ({ User, Order }[modelName].associate) {
    { User, Order }[modelName].associate({ User, Order });
  }
});

export { sequelize, User, Order };
export default { sequelize, User, Order };
