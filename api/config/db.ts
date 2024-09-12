import { DataTypes, Sequelize } from 'sequelize';
import { CosmosClient } from '@azure/cosmos';
import User from '../models/sql/user';
import { Task } from '../models/sql/task';

export const dbType: string = process.env.DB_TYPE || '';

let sequelize: Sequelize;
let cosmosClient: CosmosClient;
let cosmosContainerId: string;
let cosmosDatabaseId: string;

async function connectToDatabase() {
  switch (dbType) {
    case 'sequelize':
      const dialect: string = process.env.DB_DIALECT || '';

      let host: string | undefined;
      let port: string | undefined;
      let database: string | undefined;
      let user: string | undefined;
      let password: string | undefined;

      switch(dialect) {
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
          throw new Error(`Unsupported dialect for ${dbType}: ${dialect}.`);
      }
      
      if (!host || !port || !database || !user || !password) {
        throw new Error('Missing database configuration values for SQL.');
      }

      sequelize = new Sequelize(database, user, password, {
        dialect,
        host,
        port: Number(port),
        logging: process.env.DB_QUERY_LOGGING?.toLowerCase() === 'true',
      });

      try {
        await sequelize.authenticate();
        console.log('Connection to the SQL database has been established successfully.');
        await sequelize.sync();
        console.log('Database & tables created!');


        User.init({
          id: {
              type: DataTypes.UUID,
              defaultValue: DataTypes.UUIDV4,
              primaryKey: true,
          },
          username: {
              type: DataTypes.STRING,
              unique: true,
              allowNull: false,
          },
          password: {
              type: DataTypes.STRING,
              allowNull: false,
          },
          email: {
              type: DataTypes.STRING,
              unique: true,
              allowNull: false,
          },
        }, {
            sequelize,
            tableName: 'Users',
            modelName: 'User',
            timestamps: true,
        });
        
        Task.init({
          id: {
              type: DataTypes.UUID,
              defaultValue: DataTypes.UUIDV4,
              primaryKey: true,
          },
          title: {
              type: DataTypes.STRING,
              allowNull: false,
          },
          description: {
              type: DataTypes.STRING,
              allowNull: true,
              defaultValue: null,
          },
          dueDate: {
              type: DataTypes.DATE,
              allowNull: true,
              defaultValue: null,
          },
          status: {
              type: DataTypes.STRING,
          },
          archivedAt: {
              type: DataTypes.DATE,
              allowNull: true,
              defaultValue: null,
          },
          deletedAt: {
              type: DataTypes.DATE,
              allowNull: true,
              defaultValue: null,
          },
        }, {
            sequelize,
            tableName: 'Tasks',
            modelName: 'Task',
            timestamps: true,
        });

        Task.belongsTo(User, { foreignKey: 'userId' });
        User.hasMany(Task, { foreignKey: 'userId' });
      } catch (err) {
        console.error('Unable to connect to the SQL database:', err);
        throw err;
      }
      break;

    case 'cosmos':
      const cosmosConnectionString = process.env.COSMOS_CONNECTION_STRING;
      cosmosDatabaseId = process.env.COSMOS_DATABASE_ID || '';
      cosmosContainerId = process.env.COSMOS_CONTAINER_ID || '';

      if (!cosmosConnectionString || !cosmosDatabaseId || !cosmosContainerId) {
        throw new Error('Missing CosmosDB configuration values.');
      }

      cosmosClient = new CosmosClient(cosmosConnectionString);

      try {
        const { database } = await cosmosClient.databases.createIfNotExists({ id: cosmosContainerId });
        console.log(`Connected to CosmosDB. Database: ${database.id}`);
      } catch (err) {
        console.error('Unable to connect to CosmosDB:', err);
        throw err;
      }
      break;

    default:
      throw new Error(`Unsupported database type ${dbType}`);
  }
}

export { connectToDatabase, sequelize, cosmosClient, cosmosDatabaseId, cosmosContainerId };
