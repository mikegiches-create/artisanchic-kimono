// models/Order.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  orderId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Allow guest orders
    references: {
      model: 'users',
      key: 'id',
    },
  },
  products: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      isValidProducts(value) {
        if (!Array.isArray(value) || value.length === 0) {
          throw new Error('Order must contain at least one product');
        }
      },
    },
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'GBP',
    validate: {
      len: [3, 3],
      isAlpha: true,
    },
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'),
    allowNull: false,
    defaultValue: 'Pending',
  },
  paypalOrderId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  shippingAddress: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  paymentStatus: {
    type: DataTypes.ENUM('Pending', 'Completed', 'Failed', 'Refunded'),
    allowNull: false,
    defaultValue: 'Pending',
  },
}, {
  tableName: 'orders',
  timestamps: true,
  underscored: false, // Use camelCase for column names
  indexes: [
    {
      fields: ['userId'],
    },
    {
      fields: ['orderId'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['createdAt'],
    },
  ],
});

// Associations
Order.associate = (models) => {
  Order.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
  });
};

export default Order;
