import { CreateTaskRequestBody, Task } from '../models/task';
import ITaskRepository from '../repositories/taskRepository';

class TaskService {
    private repository: ITaskRepository;

    constructor(repository: ITaskRepository) {
        this.repository = repository;
    }

    async createTask(taskParams: CreateTaskRequestBody): Promise<Task> {
        return this.repository.createTask(taskParams as Task);
    }

    async getTasksByUser(userId: string): Promise<Task[]> {
        return this.repository.getTasksByUser(userId);
    }

    async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
        return this.repository.updateTask(id, updates);
    }

    async deleteTask(id: string, userId: string): Promise<void> {
        return this.repository.deleteTask(id, userId);
    }

    async archiveTask(id: string, userId: string): Promise<void> {
        return this.repository.archiveTask(id, userId);
    }

    async unarchiveTask(id: string, userId: string): Promise<void> {
        return this.repository.unarchiveTask(id, userId);
    }

    async updateTaskStatus(taskId: string, status: string, userId: string): Promise<Task | null> {
        return this.repository.updateTaskStatus(taskId, status, userId);
    }
}

export default TaskService;
