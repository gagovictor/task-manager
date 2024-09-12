import { Sequelize } from 'sequelize';

const dialect: string = process.env.DB_DIALECT || 'postgres';
let host: string | undefined;
let port: string | undefined;
let database: string | undefined;
let user: string | undefined;
let password: string | undefined;

console.log(dialect);
switch (dialect) {
  case 'postgres':
    host = process.env.POSTGRESQL_HOST;
    port = process.env.POSTGRESQL_PORT;
    database = process.env.POSTGRESQL_DATABASE;
    user = process.env.POSTGRESQL_USER;
    password = process.env.POSTGRESQL_PASSWORD;
    break;

  case 'mssql':
    host = process.env.SQL_HOST;
    port = process.env.SQL_PORT;
    database = process.env.SQL_DATABASE;
    user = process.env.SQL_USER;
    password = process.env.SQL_PASSWORD;
    break;

  default:
    throw new Error('Unsupported database dialect');
}

// Ensure all required values are defined
console.log(`host`, host);
console.log(`port`, port);
console.log(`database`, database);
console.log(`user`, user);
console.log(`password`, password);
if (!host || !port || !database || !user || !password) {
  throw new Error('Missing database configuration values');
}

const sequelize = new Sequelize(database, user, password, {
  dialect,
  host,
  port: Number(port),
  logging: process.env.DB_QUERY_LOGGING?.toLowerCase() === 'true',
});

sequelize.authenticate()
  .then(() => {
    console.log('Connection to the database has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

export default sequelize;
