// models/Product.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  originalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
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
  image: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  category: {
    type: DataTypes.ENUM('formal', 'casual', 'outerwear'),
    allowNull: false,
    defaultValue: 'casual',
  },
  inStock: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  colors: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  averageRating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5,
    },
  },
  reviewCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  verifiedPurchase: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  ratingBreakdown: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 },
  },
}, {
  tableName: 'products',
  timestamps: true,
  underscored: false, // Use camelCase for column names
  indexes: [
    {
      fields: ['category'],
    },
    {
      fields: ['inStock'],
    },
    {
      fields: ['price'],
    },
  ],
});

export default Product;
