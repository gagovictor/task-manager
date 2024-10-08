import { DataTypes, Sequelize } from 'sequelize';
import { CosmosClient } from '@azure/cosmos';
import User from '../models/sequelize/user';
import { SequelizeTask } from '../models/sequelize/task';
import mongoose from 'mongoose';

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private sequelize!: Sequelize;
  private cosmosClient!: CosmosClient;
  private cosmosContainerId!: string;
  private cosmosDatabaseId!: string;
  private isConnected: boolean = false;

  public getDbType(): string {
    return process.env.DB_TYPE || '';
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }
  
  public async connectToDatabase(): Promise<void> {
    if (this.isConnected) {
      return;
    }
    
    switch (this.getDbType()) {
      case 'sequelize':
        await this.connectSequelize();
        break;
      case 'cosmos':
        await this.connectCosmosDB();
        break;
      case 'mongodb':
        await this.connectMongoDB();
        break;
      default:
        throw new Error(`Unsupported database type ${this.getDbType()}`);
    }

    this.isConnected = true;
  }
  
  public getCosmosClient(): CosmosClient {
    return this.cosmosClient;
  }
  
  public getCosmosContainerId(): string {
    return this.cosmosContainerId;
  }
  
  public getCosmosDatabaseId(): string {
    return this.cosmosDatabaseId;
  }
  
  private async connectSequelize(): Promise<void> {
    const dialect: string = process.env.DB_DIALECT || '';
    
    let host: string | undefined;
    let port: string | undefined;
    let database: string | undefined;
    let user: string | undefined;
    let password: string | undefined;
    
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
      throw new Error(`Unsupported dialect for ${this.getDbType()}: ${dialect}.`);
    }
    
    if (!host || !port || !database || !user || !password) {
      throw new Error('Missing database configuration values for SQL.');
    }
    
    this.sequelize = new Sequelize(database, user, password, {
      dialect,
      host,
      port: Number(port),
      logging: process.env.DB_QUERY_LOGGING?.toLowerCase() === 'true',
    });
    
    try {
      await this.sequelize.authenticate();
      console.log('Connection to the SQL database has been established successfully.');
      await this.sequelize.sync();
      console.log('Database & tables created!');
      
      // Initialize Sequelize models
      this.initializeSequelizeModels();
    } catch (err) {
      console.error('Unable to connect to the SQL database:', err);
      throw err;
    }
  }
  
  private initializeSequelizeModels(): void {
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
      sequelize: this.sequelize,
      tableName: 'Users',
      modelName: 'User',
      timestamps: true,
    });
    
    SequelizeTask.init({
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
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: new Date(),
      },
      modifiedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
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
      sequelize: this.sequelize,
      tableName: 'Tasks',
      modelName: 'Task',
      timestamps: true,
    });
    
    SequelizeTask.belongsTo(User, { foreignKey: 'userId' });
    User.hasMany(SequelizeTask, { foreignKey: 'userId' });
  }
  
  private async connectCosmosDB(): Promise<void> {
    const cosmosConnectionString = process.env.COSMOS_CONNECTION_STRING;
    this.cosmosDatabaseId = process.env.COSMOS_DATABASE_ID || '';
    this.cosmosContainerId = process.env.COSMOS_CONTAINER_ID || '';
    
    if (!cosmosConnectionString || !this.cosmosDatabaseId || !this.cosmosContainerId) {
      throw new Error('Missing CosmosDB configuration values.');
    }
    
    this.cosmosClient = new CosmosClient(cosmosConnectionString);
    
    try {
      const { database } = await this.cosmosClient.databases.createIfNotExists({ id: this.cosmosDatabaseId });
      console.log(`Connected to CosmosDB. Database: ${database.id}`);
    } catch (err) {
      console.error('Unable to connect to CosmosDB:', err);
      throw err;
    }
  }
  
  private async connectMongoDB(): Promise<void> {
    const mongoDbUri = process.env.MONGO_URI || '';
    if (!mongoDbUri) {
      throw new Error('MongoDB connection URI is missing.');
    }
    
    try {
      await mongoose.connect(mongoDbUri);
      console.log('Connected to MongoDB.');
    } catch (err) {
      console.error('Failed to connect to MongoDB:', err);
      throw err;
    }
  }
}

export default DatabaseConnection;
