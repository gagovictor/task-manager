// container.test.ts

import Container from '@src/config/container';
import DatabaseConnection from '@src/config/db';
import SequelizeTaskRepository from '@src/repositories/sequelize/taskRepository';
import CosmosTaskRepository from '@src/repositories/cosmos/taskRepository';
import MongooseTaskRepository from '@src/repositories/mongoose/taskRepository';
import SequelizeUserRepository from '@src/repositories/sequelize/userRepository';
import CosmosUserRepository from '@src/repositories/cosmos/userRepository';
import MongooseUserRepository from '@src/repositories/mongoose/userRepository';
import TaskService from '@src/services/taskService';
import AuthService from '@src/services/authService';
import TaskController from '@src/controllers/taskController';
import AuthController from '@src/controllers/authController';
import { CosmosClient } from '@azure/cosmos'; // Import CosmosClient

beforeAll(() => {
  process.env.ENCRYPTION_KEY = 'test_encryption_key';
  process.env.JWT_SECRET = 'test_jwt_secret';
});

afterAll(() => {
  delete process.env.ENCRYPTION_KEY;
  delete process.env.JWT_SECRET;
});

describe('Container', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset singleton instances in Container
    (Container as any).taskRepository = undefined;
    (Container as any).userRepository = undefined;
    (Container as any).taskService = undefined;
    (Container as any).authService = undefined;
    (Container as any).taskController = undefined;
    (Container as any).authController = undefined;

    // Reset environment variables
    delete process.env.DB_TYPE;
    delete process.env.DB_DIALECT;
    delete process.env.POSTGRESQL_HOST;
    delete process.env.POSTGRESQL_PORT;
    delete process.env.POSTGRESQL_DATABASE;
    delete process.env.POSTGRESQL_USER;
    delete process.env.POSTGRESQL_PASSWORD;
    delete process.env.SQL_HOST;
    delete process.env.SQL_PORT;
    delete process.env.SQL_DATABASE;
    delete process.env.SQL_USER;
    delete process.env.SQL_PASSWORD;
    delete process.env.COSMOS_CONNECTION_STRING;
    delete process.env.COSMOS_DATABASE_ID;
    delete process.env.COSMOS_CONTAINER_ID;
    delete process.env.MONGO_URI;
  });

  describe('getTaskRepository', () => {
    it('should return SequelizeTaskRepository when dbType is sequelize', async () => {
      // Arrange
      setupSequelize();

      jest.spyOn(DatabaseConnection.prototype, 'connectToDatabase').mockResolvedValue(undefined);
      jest.spyOn(DatabaseConnection.prototype, 'getDbType').mockReturnValue('sequelize');

      // Act
      const taskRepository = await Container.getTaskRepository();

      // Assert
      expect(taskRepository).toBeInstanceOf(SequelizeTaskRepository);
    });

    it('should return CosmosTaskRepository when dbType is cosmos', async () => {
      // Arrange
      setupCosmos();

      jest.spyOn(DatabaseConnection.prototype, 'connectToDatabase').mockResolvedValue(undefined);
      jest.spyOn(DatabaseConnection.prototype, 'getDbType').mockReturnValue('cosmos');

      // Create a mock CosmosClient with the required methods
      const mockCosmosClient = {
        database: jest.fn().mockReturnValue({
          container: jest.fn().mockReturnValue({
            // Include any methods used by your repository code, if necessary
          }),
        }),
        // Include other properties/methods if necessary
      } as unknown as CosmosClient;

      jest.spyOn(DatabaseConnection.prototype, 'getCosmosClient').mockReturnValue(mockCosmosClient);

      jest.spyOn(DatabaseConnection.prototype, 'getCosmosDatabaseId').mockReturnValue('test_database_id');
      jest.spyOn(DatabaseConnection.prototype, 'getCosmosContainerId').mockReturnValue('test_container_id');

      // Act
      const taskRepository = await Container.getTaskRepository();

      // Assert
      expect(taskRepository).toBeInstanceOf(CosmosTaskRepository);
    });

    it('should return MongooseTaskRepository when dbType is mongodb', async () => {
      // Arrange
      setupMongo();

      jest.spyOn(DatabaseConnection.prototype, 'connectToDatabase').mockResolvedValue(undefined);
      jest.spyOn(DatabaseConnection.prototype, 'getDbType').mockReturnValue('mongodb');

      // Act
      const taskRepository = await Container.getTaskRepository();

      // Assert
      expect(taskRepository).toBeInstanceOf(MongooseTaskRepository);
    });

    it('should throw an error for unsupported dbType', async () => {
      // Arrange
      process.env.DB_TYPE = 'unsupported_db';

      jest.spyOn(DatabaseConnection.prototype, 'connectToDatabase').mockResolvedValue(undefined);
      jest.spyOn(DatabaseConnection.prototype, 'getDbType').mockReturnValue('unsupported_db');

      // Act & Assert
      await expect(Container.getTaskRepository()).rejects.toThrow('Unsupported database type unsupported_db');
    });
  });

  describe('getUserRepository', () => {
    it('should return SequelizeUserRepository when dbType is sequelize', async () => {
      // Arrange
      setupSequelize();

      jest.spyOn(DatabaseConnection.prototype, 'connectToDatabase').mockResolvedValue(undefined);
      jest.spyOn(DatabaseConnection.prototype, 'getDbType').mockReturnValue('sequelize');

      // Act
      const userRepository = await Container.getUserRepository();

      // Assert
      expect(userRepository).toBeInstanceOf(SequelizeUserRepository);
    });

    it('should return CosmosUserRepository when dbType is cosmos', async () => {
      // Arrange
      setupCosmos();

      jest.spyOn(DatabaseConnection.prototype, 'connectToDatabase').mockResolvedValue(undefined);
      jest.spyOn(DatabaseConnection.prototype, 'getDbType').mockReturnValue('cosmos');

      // Create a mock CosmosClient with the required methods
      const mockCosmosClient = {
        database: jest.fn().mockReturnValue({
          container: jest.fn().mockReturnValue({
            // Include any methods used by your repository code, if necessary
          }),
        }),
        // Include other properties/methods if necessary
      } as unknown as CosmosClient;

      jest.spyOn(DatabaseConnection.prototype, 'getCosmosClient').mockReturnValue(mockCosmosClient);

      jest.spyOn(DatabaseConnection.prototype, 'getCosmosDatabaseId').mockReturnValue('test_database_id');
      jest.spyOn(DatabaseConnection.prototype, 'getCosmosContainerId').mockReturnValue('test_container_id');

      // Act
      const userRepository = await Container.getUserRepository();

      // Assert
      expect(userRepository).toBeInstanceOf(CosmosUserRepository);
    });

    it('should return MongooseUserRepository when dbType is mongodb', async () => {
      // Arrange
      setupMongo();

      jest.spyOn(DatabaseConnection.prototype, 'connectToDatabase').mockResolvedValue(undefined);
      jest.spyOn(DatabaseConnection.prototype, 'getDbType').mockReturnValue('mongodb');

      // Act
      const userRepository = await Container.getUserRepository();

      // Assert
      expect(userRepository).toBeInstanceOf(MongooseUserRepository);
    });

    it('should throw an error for unsupported dbType', async () => {
      // Arrange
      process.env.DB_TYPE = 'unsupported_db';

      jest.spyOn(DatabaseConnection.prototype, 'connectToDatabase').mockResolvedValue(undefined);
      jest.spyOn(DatabaseConnection.prototype, 'getDbType').mockReturnValue('unsupported_db');

      // Act & Assert
      await expect(Container.getUserRepository()).rejects.toThrow('Unsupported database type unsupported_db');
    });
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance of TaskRepository', async () => {
      // Arrange
      setupSequelize();

      jest.spyOn(DatabaseConnection.prototype, 'connectToDatabase').mockResolvedValue(undefined);
      jest.spyOn(DatabaseConnection.prototype, 'getDbType').mockReturnValue('sequelize');

      // Act
      const taskRepo1 = await Container.getTaskRepository();
      const taskRepo2 = await Container.getTaskRepository();

      // Assert
      expect(taskRepo1).toBe(taskRepo2);
    });

    it('should return the same instance of UserRepository', async () => {
      // Arrange
      setupCosmos();

      jest.spyOn(DatabaseConnection.prototype, 'connectToDatabase').mockResolvedValue(undefined);
      jest.spyOn(DatabaseConnection.prototype, 'getDbType').mockReturnValue('cosmos');

      // Create a mock CosmosClient with the required methods
      const mockCosmosClient = {
        database: jest.fn().mockReturnValue({
          container: jest.fn().mockReturnValue({
            // Include any methods used by your repository code, if necessary
          }),
        }),
        // Include other properties/methods if necessary
      } as unknown as CosmosClient;

      jest.spyOn(DatabaseConnection.prototype, 'getCosmosClient').mockReturnValue(mockCosmosClient);

      jest.spyOn(DatabaseConnection.prototype, 'getCosmosDatabaseId').mockReturnValue('test_database_id');
      jest.spyOn(DatabaseConnection.prototype, 'getCosmosContainerId').mockReturnValue('test_container_id');

      // Act
      const userRepo1 = await Container.getUserRepository();
      const userRepo2 = await Container.getUserRepository();

      // Assert
      expect(userRepo1).toBe(userRepo2);
    });

    it('should return the same instance of TaskService', async () => {
      // Arrange
      setupMongo();

      jest.spyOn(DatabaseConnection.prototype, 'connectToDatabase').mockResolvedValue(undefined);
      jest.spyOn(DatabaseConnection.prototype, 'getDbType').mockReturnValue('mongodb');

      // Act
      const taskService1 = await Container.getTaskService();
      const taskService2 = await Container.getTaskService();

      // Assert
      expect(taskService1).toBe(taskService2);
    });

    it('should return the same instance of AuthService', async () => {
      // Arrange
      setupSequelize();

      jest.spyOn(DatabaseConnection.prototype, 'connectToDatabase').mockResolvedValue(undefined);
      jest.spyOn(DatabaseConnection.prototype, 'getDbType').mockReturnValue('sequelize');

      // Act
      const authService1 = await Container.getAuthService();
      const authService2 = await Container.getAuthService();

      // Assert
      expect(authService1).toBe(authService2);
    });

    it('should return the same instance of TaskController', async () => {
      // Arrange
      setupCosmos();

      jest.spyOn(DatabaseConnection.prototype, 'connectToDatabase').mockResolvedValue(undefined);
      jest.spyOn(DatabaseConnection.prototype, 'getDbType').mockReturnValue('cosmos');

      // Create a mock CosmosClient with the required methods
      const mockCosmosClient = {
        database: jest.fn().mockReturnValue({
          container: jest.fn().mockReturnValue({
            // Include any methods used by your repository code, if necessary
          }),
        }),
        // Include other properties/methods if necessary
      } as unknown as CosmosClient;

      jest.spyOn(DatabaseConnection.prototype, 'getCosmosClient').mockReturnValue(mockCosmosClient);

      jest.spyOn(DatabaseConnection.prototype, 'getCosmosDatabaseId').mockReturnValue('test_database_id');
      jest.spyOn(DatabaseConnection.prototype, 'getCosmosContainerId').mockReturnValue('test_container_id');

      // Act
      const taskController1 = await Container.getTaskController();
      const taskController2 = await Container.getTaskController();

      // Assert
      expect(taskController1).toBe(taskController2);
    });

    it('should return the same instance of AuthController', async () => {
      // Arrange
      setupMongo();

      jest.spyOn(DatabaseConnection.prototype, 'connectToDatabase').mockResolvedValue(undefined);
      jest.spyOn(DatabaseConnection.prototype, 'getDbType').mockReturnValue('mongodb');

      // Act
      const authController1 = await Container.getAuthController();
      const authController2 = await Container.getAuthController();

      // Assert
      expect(authController1).toBe(authController2);
    });
  });
});

// Helper functions
function setupCosmos() {
  process.env.DB_TYPE = 'cosmos';
  process.env.COSMOS_CONNECTION_STRING = 'test_connection_string';
  process.env.COSMOS_DATABASE_ID = 'test_database_id';
  process.env.COSMOS_CONTAINER_ID = 'test_container_id';
}

function setupSequelize() {
  process.env.DB_TYPE = 'sequelize';
  process.env.DB_DIALECT = 'postgres';
  process.env.POSTGRESQL_HOST = 'localhost';
  process.env.POSTGRESQL_PORT = '5432';
  process.env.POSTGRESQL_DATABASE = 'test_db';
  process.env.POSTGRESQL_USER = 'test_user';
  process.env.POSTGRESQL_PASSWORD = 'test_password';
}

function setupMongo() {
  process.env.DB_TYPE = 'mongodb';
  process.env.MONGO_URI = 'mongodb://localhost:27017/test_db';
}
