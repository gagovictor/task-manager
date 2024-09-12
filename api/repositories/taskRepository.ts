import { Task } from '../models/task';

export default interface ITaskRepository {
    createTask(task: Task): Promise<Task>;
    getTasksByUser(userId: string): Promise<Task[]>;
    updateTask(id: string, updates: Partial<Task>): Promise<Task>;
    deleteTask(id: string, userId: string): Promise<void>;
    archiveTask(id: string, userId: string): Promise<void>;
    unarchiveTask(id: string, userId: string): Promise<void>;
    updateTaskStatus(taskId: string, status: string, userId: string): Promise<Task | null>;
}
