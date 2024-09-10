require('dotenv').config();
const { Sequelize } = require('sequelize');

const dialect = process.env.DB_DIALECT || 'postgres';
let host, port, database, user, password;

switch (dialect) {
  case 'postgres':
    host = process.env.AZURE_POSTGRESQL_HOST;
    port = process.env.AZURE_POSTGRESQL_PORT;
    database = process.env.AZURE_POSTGRESQL_DATABASE;
    user = process.env.AZURE_POSTGRESQL_USER;
    password = process.env.AZURE_POSTGRESQL_PASSWORD;
    break;

  case 'mssql':
    host = process.env.MYSQL_HOST;
    port = process.env.MYSQL_PORT;
    database = process.env.MYSQL_DATABASE;
    user = process.env.MYSQL_USER;
    password = process.env.MYSQL_PASSWORD;
    break;

  default:
    throw new Error('Unsupported database dialect');
}

const sequelize = new Sequelize(database, user, password, {
  dialect,
  host,
  port,
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
