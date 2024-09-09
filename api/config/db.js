require('dotenv').config();
const { Sequelize } = require('sequelize');

const POSTGRES_URL = `postgres://${process.env.AZURE_POSTGRESQL_USER}:${process.env.AZURE_POSTGRESQL_PASSWORD}@${process.env.AZURE_POSTGRESQL_HOST}:${process.env.AZURE_POSTGRESQL_PORT}/${process.env.AZURE_POSTGRESQL_DATABASE}?sslmode=${process.env.AZURE_POSTGRESQL_SSL === 'true' ? 'require' : 'disable'}`;

const sequelize = new Sequelize(POSTGRES_URL, {
  dialect: 'postgres',
  logging: process.env.DB_QUERY_LOGGING.toLowerCase() === 'true',
});

sequelize.authenticate()
  .then(() => {
    console.log('Connection to the database has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = sequelize;
