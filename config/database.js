// config/database.js
import { Sequelize } from 'sequelize';
import config from './config.js';

const sequelize = new Sequelize(
  config.mysql.database,
  config.mysql.username,
  config.mysql.password,
  {
    host: config.mysql.host,
    port: config.mysql.port,
    dialect: config.mysql.dialect,
    logging: config.mysql.logging,
    pool: config.mysql.pool,
    define: {
      timestamps: true,
      underscored: true,
    },
  }
);

export default sequelize;
