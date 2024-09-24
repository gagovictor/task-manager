import { Sequelize } from 'sequelize';
import { CosmosClient } from '@azure/cosmos';
import mongoose from 'mongoose';
import DatabaseConnection from '../../../src/config/db';

// Mock Sequelize, CosmosClient, and mongoose globally in the test
jest.mock('sequelize', () => {
  const actualSequelize = jest.requireActual('sequelize');

  // Mock Sequelize instance
  const SequelizeMock = {
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true),
  };

  // Mock Model class
  class Model {
    static init = jest.fn();
    static belongsTo = jest.fn();
    static hasMany = jest.fn();
  }

  return {
    Sequelize: jest.fn(() => SequelizeMock),
    DataTypes: actualSequelize.DataTypes,
    Model,
  };
});

jest.mock('@azure/cosmos', () => {
  return {
    CosmosClient: jest.fn().mockImplementation(() => ({
      databases: {
        createIfNotExists: jest.fn().mockResolvedValue({
          database: { id: 'mockDatabaseId' },
        }),
      },
    })),
  };
});

jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue(true),
}));

// Mock console.log to suppress logs during tests
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('DatabaseConnection', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should throw an error for unsupported database type', async () => {
    process.env.DB_TYPE = 'unsupported-db';

    const dbConnection = new DatabaseConnection();

    await expect(dbConnection.connectToDatabase()).rejects.toThrow('Unsupported database type unsupported-db');
  });

  it('should throw an error for unsupported Sequelize dialect', async () => {
    process.env.DB_TYPE = 'sequelize';
    process.env.DB_DIALECT = 'unsupported-dialect';

    const dbConnection = new DatabaseConnection();

    await expect(dbConnection.connectToDatabase()).rejects.toThrow('Unsupported dialect for sequelize: unsupported-dialect.');
  });

  it('should throw an error if required SQL configurations are missing', async () => {
    process.env.DB_TYPE = 'sequelize';
    process.env.DB_DIALECT = 'postgres';

    delete process.env.POSTGRESQL_HOST;

    const dbConnection = new DatabaseConnection();

    await expect(dbConnection.connectToDatabase()).rejects.toThrow('Missing database configuration values for SQL.');
  });

  it('should connect to Sequelize with valid configurations', async () => {
    process.env.DB_TYPE = 'sequelize';
    process.env.DB_DIALECT = 'postgres';
    process.env.POSTGRESQL_HOST = 'localhost';
    process.env.POSTGRESQL_PORT = '5432';
    process.env.POSTGRESQL_DATABASE = 'testdb';
    process.env.POSTGRESQL_USER = 'testuser';
    process.env.POSTGRESQL_PASSWORD = 'testpassword';

    const dbConnection = new DatabaseConnection();

    await expect(dbConnection.connectToDatabase()).resolves.not.toThrow();

    expect(Sequelize).toHaveBeenCalledWith('testdb', 'testuser', 'testpassword', expect.objectContaining({
      dialect: 'postgres',
      host: 'localhost',
      port: 5432,
    }));
  });

  it('should throw an error if CosmosDB configurations are missing', async () => {
    process.env.DB_TYPE = 'cosmos';
    process.env.COSMOS_CONNECTION_STRING = '';

    const dbConnection = new DatabaseConnection();

    await expect(dbConnection.connectToDatabase()).rejects.toThrow('Missing CosmosDB configuration values.');
  });

  it('should connect to CosmosDB with valid configurations', async () => {
    process.env.DB_TYPE = 'cosmos';
    process.env.COSMOS_CONNECTION_STRING = 'fake-connection-string';
    process.env.COSMOS_DATABASE_ID = 'mockDatabase';
    process.env.COSMOS_CONTAINER_ID = 'mockContainer';

    const dbConnection = new DatabaseConnection();

    await expect(dbConnection.connectToDatabase()).resolves.not.toThrow();

    expect(CosmosClient).toHaveBeenCalledWith('fake-connection-string');
  });

  it('should throw an error if MongoDB connection URI is missing', async () => {
    process.env.DB_TYPE = 'mongodb';
    process.env.MONGO_URI = '';

    const dbConnection = new DatabaseConnection();

    await expect(dbConnection.connectToDatabase()).rejects.toThrow('MongoDB connection URI is missing.');
  });

  it('should connect to MongoDB with valid configurations', async () => {
    process.env.DB_TYPE = 'mongodb';
    process.env.MONGO_URI = 'mongodb://localhost:27017/testdb';

    const dbConnection = new DatabaseConnection();

    await expect(dbConnection.connectToDatabase()).resolves.not.toThrow();

    expect(mongoose.connect).toHaveBeenCalledWith('mongodb://localhost:27017/testdb');
  });
});
