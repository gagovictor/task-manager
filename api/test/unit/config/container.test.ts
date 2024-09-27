// import DatabaseConnection from "../../../src/config/db";

// jest.mock('./db', () => {
//   const mockDbConnection = {
//     connectToDatabase: jest.fn().mockResolvedValue(void 0),
//     getDbType: jest.fn(),
//     getCosmosClient: jest.fn(),
//     getCosmosDatabaseId: jest.fn(),
//     getCosmosContainerId: jest.fn(),
//   };
  
//   return {
//     getInstance: jest.fn(() => mockDbConnection),
//   };
// });

// describe('Container', () => {
//   let mockDbConnection: DatabaseConnection;

//   beforeEach(() => {
//     mockDbConnection = DatabaseConnection.getInstance();
//   });

//   it('should return SequelizeUserRepository for dbType "sequelize"', async () => {
//     mockDbConnection.getDbType.mockReturnValue('sequelize');
    
//     const Container = require('../../../src/config/container').default;
    
//     const userRepository = await Container.getUserRepository();
//     const ActualSequelizeUserRepository = jest.requireActual('../../../src/repositories/sequelize/userRepository').default;
    
//     expect(userRepository).toBeInstanceOf(ActualSequelizeUserRepository);
//   });

//   it('should return CosmosUserRepository for dbType "cosmos"', async () => {
//     mockDbConnection.getDbType.mockReturnValue('cosmos');
//     mockDbConnection.getCosmosClient.mockReturnValue({});
//     mockDbConnection.getCosmosDatabaseId.mockReturnValue('test-database-id');
//     mockDbConnection.getCosmosContainerId.mockReturnValue('test-container-id');
    
//     const Container = require('../../../src/config/container').default;

//     const userRepository = await Container.getUserRepository();
//     const ActualCosmosUserRepository = jest.requireActual('../../../src/repositories/cosmos/userRepository').default;

//     expect(userRepository).toBeInstanceOf(ActualCosmosUserRepository);
//   });

//   it('should return MongooseUserRepository for dbType "mongodb"', async () => {
//     mockDbConnection.getDbType.mockReturnValue('mongodb');
    
//     const Container = require('../../../src/config/container').default;
    
//     const userRepository = await Container.getUserRepository();
//     const ActualMongooseUserRepository = jest.requireActual('../../../src/repositories/mongoose/userRepository').default;
    
//     expect(userRepository).toBeInstanceOf(ActualMongooseUserRepository);
//   });

//   it('should return SequelizeTaskRepository for dbType "sequelize"', async () => {
//     mockDbConnection.getDbType.mockReturnValue('sequelize');
    
//     const Container = require('../../../src/config/container').default;
    
//     const taskRepository = await Container.getTaskRepository();
//     const ActualSequelizeTaskRepository = jest.requireActual('../../../src/repositories/sequelize/taskRepository').default;
    
//     expect(taskRepository).toBeInstanceOf(ActualSequelizeTaskRepository);
//   });

//   it('should return CosmosTaskRepository for dbType "cosmos"', async () => {
//     mockDbConnection.getDbType.mockReturnValue('cosmos');
//     mockDbConnection.getCosmosClient.mockReturnValue({});
//     mockDbConnection.getCosmosDatabaseId.mockReturnValue('test-database-id');
//     mockDbConnection.getCosmosContainerId.mockReturnValue('test-container-id');
    
//     const Container = require('../../../src/config/container').default;

//     const taskRepository = await Container.getTaskRepository();
//     const ActualCosmosTaskRepository = jest.requireActual('../../../src/repositories/cosmos/taskRepository').default;

//     expect(taskRepository).toBeInstanceOf(ActualCosmosTaskRepository);
//   });

//   it('should return MongooseTaskRepository for dbType "mongodb"', async () => {
//     mockDbConnection.getDbType.mockReturnValue('mongodb');
    
//     const Container = require('../../../src/config/container').default;
    
//     const taskRepository = await Container.getTaskRepository();
//     const ActualMongooseTaskRepository = jest.requireActual('../../../src/repositories/mongoose/taskRepository').default;
    
//     expect(taskRepository).toBeInstanceOf(ActualMongooseTaskRepository);
//   });

//   it('should throw an error for unsupported dbType', async () => {
//     mockDbConnection.getDbType.mockReturnValue('unsupported');
    
//     const Container = require('../../../src/config/container').default;
    
//     await expect(Container.getTaskRepository()).rejects.toThrowError('Unsupported database type unsupported');
//   });

//   it('should return AuthService', async () => {
//     mockDbConnection.getDbType.mockReturnValue('mongodb');
    
//     const Container = require('../../../src/config/container').default;
    
//     const authService = await Container.getAuthService();
//     const ActualAuthService = jest.requireActual('../../../src/services/authService').default;
    
//     expect(authService).toBeInstanceOf(ActualAuthService);
//   });

//   it('should return TaskService', async () => {
//     mockDbConnection.getDbType.mockReturnValue('mongodb');
    
//     const Container = require('../../../src/config/container').default;
    
//     const taskService = await Container.getTaskService();
//     const ActualTaskService = jest.requireActual('../../../src/services/taskService').default;
    
//     expect(taskService).toBeInstanceOf(ActualTaskService);
//   });

//   it('should return AuthController', async () => {
//     mockDbConnection.getDbType.mockReturnValue('mongodb');
    
//     const Container = require('../../../src/config/container').default;
    
//     const authController = await Container.getAuthController();
//     const ActualAuthController = jest.requireActual('../../../src/controllers/authController').default;
    
//     expect(authController).toBeInstanceOf(ActualAuthController);
//   });

//   it('should return TaskController', async () => {
//     mockDbConnection.getDbType.mockReturnValue('mongodb');
    
//     const Container = require('../../../src/config/container').default;
    
//     const taskController = await Container.getTaskController();
//     const ActualTaskController = jest.requireActual('../../../src/controllers/taskController').default;
    
//     expect(taskController).toBeInstanceOf(ActualTaskController);
//   });
// });
