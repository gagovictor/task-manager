import { PaginatedResponse, TaskFilter } from '@src/models/pagination';
import { CreateTaskDto, Task, TaskStatus, UpdateTaskDto } from '@src/models/task';
import ITaskRepository from '@src/repositories/taskRepository';
import { v4 as uuidv4 } from 'uuid';

class TaskService {
    private repository: ITaskRepository;
    
    constructor(repository: ITaskRepository) {
        this.repository = repository;
    }
    
    async createTask(params: CreateTaskDto): Promise<Task> {
        const task: Task = {
            id: uuidv4(),
            userId: params.userId,
            title: params.title,
            description: params.description || null,
            checklist: params.checklist || null,
            status: params.status,
            dueDate: params.dueDate || null,
            createdAt: new Date(),
            archivedAt: null,
            modifiedAt: null,
            deletedAt: null,
        };
        return this.repository.createTask(task);
    }
    
    async getTasksByUser(userId: string, page: number, limit: number, filter?: TaskFilter): Promise<PaginatedResponse<Task>> {
        return this.repository.getTasksByUser(userId, page, limit, filter);
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
            title: task.title!,
            description: task.description || null,
            checklist: task.checklist || null,
            dueDate: task.dueDate ? new Date(task.dueDate) : null,
            status: task.status || TaskStatus.New,
            createdAt: new Date(),
            modifiedAt: new Date(),
            archivedAt: task.archivedAt || null,
            deletedAt: task.deletedAt || null,
        }));
        
        return this.repository.bulkCreateTasks(preparedTasks);
    }
}

export default TaskService;
