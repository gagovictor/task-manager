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
import { cosmosClient, cosmosDatabaseId, cosmosContainerId, dbType } from "./db";
import MongooseTaskRepository from "../repositories/mongoose/taskRepository";
import MongooseUserRepository from "../repositories/mongoose/userRepository";

class Container {
    private static taskController: TaskController;
    private static authController: AuthController;

    private static taskRepository: ITaskRepository;
    private static userRepository: IUserRepository;
    
    private static taskService: TaskService;
    private static authService: AuthService;

    static getTaskRepository(): ITaskRepository {
        if (!this.taskRepository) {
            switch(dbType) {
                case 'sequelize':
                    this.taskRepository = new SequelizeTaskRepository();
                    break;
                case 'cosmos':
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

    static getUserRepository(): IUserRepository {
        if (!this.userRepository) {
            switch(dbType) {
                case 'sequelize':
                    this.userRepository = new SequelizeUserRepository();
                    break;
                case 'cosmos':
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

    static getAuthService(): AuthService {
        this.authService = this.authService || new AuthService(this.getUserRepository(), process.env.JWT_SECRET!);
        return this.authService;
    }

    static getTaskService(): TaskService {
        this.taskService = this.taskService || new TaskService(this.getTaskRepository());
        return this.taskService;
    }
    static getAuthController(): AuthController {
        this.authController = this.authController || new AuthController(this.getAuthService());
        return this.authController;
    }

    static getTaskController(): TaskController {
        if (!this.taskController) {
            this.taskController = new TaskController(this.getTaskService());
        }
        return this.taskController;
    }
}

export default Container;