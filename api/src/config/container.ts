import TaskController from "../controllers/taskController";
import AuthController from "../controllers/authController";
import SequelizeTaskRepository from "../repositories/sequelize/taskRepository";
import SequelizeUserRepository from "../repositories/sequelize/userRepository";
import CosmosTaskRepository from "../repositories/cosmos/taskRepository";
import CosmosUserRepository from "../repositories/cosmos/userRepository";
import TaskService from "../services/taskService";
import AuthService from "../services/authService";
import ITaskRepository from "../repositories/taskRepository";
import IUserRepository from "../repositories/userRepository";
import DatabaseConnection from "./db";
import MongooseTaskRepository from "../repositories/mongoose/taskRepository";
import MongooseUserRepository from "../repositories/mongoose/userRepository";

class Container {
    private static taskController: TaskController;
    private static authController: AuthController;
    
    private static taskRepository: ITaskRepository;
    private static userRepository: IUserRepository;
    
    private static taskService: TaskService;
    private static authService: AuthService;
    
    private static dbConnection: DatabaseConnection = DatabaseConnection.getInstance();
    
    private static async ensureDatabaseConnection(): Promise<void> {
        await this.dbConnection.connectToDatabase();
    }
    
    static async getTaskRepository(): Promise<ITaskRepository> {
        if (!this.taskRepository) {
            await this.ensureDatabaseConnection();
            const dbType = this.dbConnection.getDbType();
            switch(dbType) {
                case 'sequelize':
                    this.taskRepository = new SequelizeTaskRepository();
                    break;
                case 'cosmos':
                    const cosmosClient = this.dbConnection.getCosmosClient();
                    const cosmosDatabaseId = this.dbConnection.getCosmosDatabaseId();
                    const cosmosContainerId = this.dbConnection.getCosmosContainerId();
                    this.taskRepository = new CosmosTaskRepository(cosmosClient, cosmosDatabaseId, cosmosContainerId);
                    break;
                case 'mongodb':
                    this.taskRepository = new MongooseTaskRepository();
                    break;
                default:
                    throw new Error(`Unsupported database type ${dbType}`);
            }
        }
        return this.taskRepository;
    }
    
    static async getUserRepository(): Promise<IUserRepository> {
        if (!this.userRepository) {
            await this.ensureDatabaseConnection();
            const dbType = this.dbConnection.getDbType();
            switch(this.dbConnection.getDbType()) {
                case 'sequelize':
                    this.userRepository = new SequelizeUserRepository();
                    break;
                case 'cosmos':
                    const cosmosClient = this.dbConnection.getCosmosClient();
                    const cosmosDatabaseId = this.dbConnection.getCosmosDatabaseId();
                    const cosmosContainerId = this.dbConnection.getCosmosContainerId();
                    this.userRepository = new CosmosUserRepository(cosmosClient, cosmosDatabaseId, cosmosContainerId);
                    break;
                case 'mongodb':
                    this.userRepository = new MongooseUserRepository();
                    break;
                default:
                    throw new Error(`Unsupported database type ${dbType}`);
            }
        }
        return this.userRepository;
    }
    
    static async getAuthService(): Promise<AuthService> {
        if (!this.authService) {
            const userRepository = await this.getUserRepository();
            this.authService = new AuthService(userRepository, process.env.JWT_SECRET!);
        }
        return this.authService;
    }
    
    static async getTaskService(): Promise<TaskService> {
        if (!this.taskService) {
            const taskRepository = await this.getTaskRepository();
            this.taskService = new TaskService(taskRepository);
        }
        return this.taskService;
    }
    
    static async getAuthController(): Promise<AuthController> {
        if (!this.authController) {
            const authService = await this.getAuthService();
            this.authController = new AuthController(authService);
        }
        return this.authController;
    }
    
    static async getTaskController(): Promise<TaskController> {
        if (!this.taskController) {
            const taskService = await this.getTaskService();
            this.taskController = new TaskController(taskService);
        }
        return this.taskController;
    }
}

export default Container;