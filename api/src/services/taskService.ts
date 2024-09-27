import { CreateTaskDto, CreateTaskRequestBody, Task, TaskStatus, UpdateTaskDto } from '../models/task';
import ITaskRepository from '../repositories/taskRepository';
import { v4 as uuidv4 } from 'uuid';

class TaskService {
    private repository: ITaskRepository;

    constructor(repository: ITaskRepository) {
        this.repository = repository;
    }

    async createTask(taskParams: CreateTaskDto): Promise<Task> {
        const task: Task = {
            id: uuidv4(),
            ...taskParams,
            createdAt: new Date()
        };
        return this.repository.createTask(task);
    }

    async getTasksByUser(userId: string): Promise<Task[]> {
        return this.repository.getTasksByUser(userId);
    }

    async updateTask(id: string, updates: UpdateTaskDto): Promise<Task> {
        const task: Partial<Task> = {
            ...updates,
            modifiedAt: new Date()
        }
        return this.repository.updateTask(id, task);
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

    /**
     * Bulk import tasks.
     * @param tasks Array of tasks to import.
     * @param userId The ID of the authenticated user.
     * @returns Array of imported tasks.
     */
    async bulkImportTasks(tasks: Partial<Task>[], userId: string): Promise<Task[]> {
        if (!tasks || !Array.isArray(tasks)) {
            throw new Error('Invalid tasks data provided.');
        }

        const preparedTasks: Task[] = tasks.map(task => ({
            id: uuidv4(), // Overwrite with new ID
            userId, // Overwrite with authenticated user's ID
            title: task.title || '',
            description: task.description || '',
            checklist: task.checklist || [],
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
            status: task.status || TaskStatus.New,
            createdAt: new Date(),
            modifiedAt: new Date(),
        }));

        return this.repository.bulkCreateTasks(preparedTasks);
    }
}

export default TaskService;
