import TaskController from "../controllers/taskController";
import AuthController from "../controllers/authController";
import { SequelizeTaskRepository } from "../repositories/sql/taskRepository";
import { SequelizeUserRepository } from "../repositories/sql/userRepository";
import TaskService from "../services/taskService";
import AuthService from "../services/authService";

class Container {
    private static taskController: TaskController;
    private static authController: AuthController;

    // Instantiate services and controllers
    private static taskRepository = new SequelizeTaskRepository();
    private static userRepository = new SequelizeUserRepository();
    private static taskService = new TaskService(this.taskRepository);
    private static authService = new AuthService(this.userRepository, process.env.JWT_SECRET!);

    static getAuthController(): AuthController {
        if (!this.authController) {
            this.authController = new AuthController(this.authService);
        }
        return this.authController;
    }

    static getTaskController(): TaskController {
        if (!this.taskController) {
            this.taskController = new TaskController(this.taskService);
        }
        return this.taskController;
    }
}

export default Container;