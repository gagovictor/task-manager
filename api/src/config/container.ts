import ITaskRepository from "@src/abstractions/repositories/ITaskRepository";
import IUserRepository from "@src/abstractions/repositories/IUserRepository";
import AuthController from "@src/controllers/authController";
import TaskController from "@src/controllers/taskController";
import CosmosTaskRepository from "@src/repositories/cosmos/taskRepository";
import CosmosUserRepository from "@src/repositories/cosmos/userRepository";
import SequelizeTaskRepository from "@src/repositories/sequelize/taskRepository";
import SequelizeUserRepository from "@src/repositories/sequelize/userRepository";
import AuthService from "@src/services/AuthService";
import TaskService from "@src/services/TaskService";
import MongooseTaskRepository from "../repositories/mongoose/taskRepository";
import MongooseUserRepository from "../repositories/mongoose/userRepository";
import TaskEncryptionService from "../services/TaskEncryptionService";
import DatabaseConnection from "./db";
import { IMailService } from "@src/abstractions/services/IMailService";
import { IEmailNotificationService } from "@src/abstractions/services/IEmailNotificationService";
import EmailNotificationService from "@src/services/EmailNotificationService";
import MailService from "@src/services/MailService";

class Container {
    private static taskController: TaskController;
    private static authController: AuthController;
    
    private static taskRepository: ITaskRepository;
    private static userRepository: IUserRepository;
    
    private static TaskService: TaskService;
    private static AuthService: AuthService;
    private static mailService: IMailService;
    private static emailNotificationService: IEmailNotificationService;
    
    private static dbConnection: DatabaseConnection = DatabaseConnection.getInstance();

    // Create an instance of TaskEncryptionService with the secret key from environment
    private static encryptionService: TaskEncryptionService = new TaskEncryptionService(process.env.ENCRYPTION_KEY!);

    private static async ensureDatabaseConnection(): Promise<void> {
        await this.dbConnection.connectToDatabase();
    }
    
    static async getTaskRepository(): Promise<ITaskRepository> {
        if (!this.taskRepository) {
            await this.ensureDatabaseConnection();
            const dbType = this.dbConnection.getDbType();
            switch (dbType) {
                case 'sequelize':
                    this.taskRepository = new SequelizeTaskRepository(this.encryptionService);
                    break;
                case 'cosmos':
                    const cosmosClient = this.dbConnection.getCosmosClient();
                    const cosmosDatabaseId = this.dbConnection.getCosmosDatabaseId();
                    const cosmosContainerId = this.dbConnection.getCosmosContainerId();
                    this.taskRepository = new CosmosTaskRepository(cosmosClient, cosmosDatabaseId, cosmosContainerId, this.encryptionService);
                    break;
                case 'mongodb':
                    this.taskRepository = new MongooseTaskRepository(this.encryptionService);
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
            switch (dbType) {
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
        if (!this.AuthService) {
            const userRepository = await this.getUserRepository();
            this.AuthService = new AuthService(userRepository, await this.getEmailNotificationService(), process.env.JWT_SECRET!);
        }
        return this.AuthService;
    }
    
    static async getTaskService(): Promise<TaskService> {
        if (!this.TaskService) {
            const taskRepository = await this.getTaskRepository();
            this.TaskService = new TaskService(taskRepository);
        }
        return this.TaskService;
    }
    
    static async getMailService(): Promise<IMailService> {
        if (!this.mailService) {
            this.mailService = new MailService();
        }
        return this.mailService;
    }
    
    static async getEmailNotificationService(): Promise<IEmailNotificationService> {
        if (!this.emailNotificationService) {
            this.emailNotificationService = new EmailNotificationService(await this.getMailService());
        }
        return this.emailNotificationService;
    }
    
    static async getAuthController(): Promise<AuthController> {
        if (!this.authController) {
            const AuthService = await this.getAuthService();
            this.authController = new AuthController(AuthService);
        }
        return this.authController;
    }
    
    static async getTaskController(): Promise<TaskController> {
        if (!this.taskController) {
            const TaskService = await this.getTaskService();
            this.taskController = new TaskController(TaskService);
        }
        return this.taskController;
    }
}

export default Container;
