import Task from '../../models/sql/task';
import TaskRepository from '../taskRepository';

class SqlTaskRepository implements TaskRepository {
    async createTask(task: Task): Promise<Task> {
        return Task.create(task);
    }
    
    async getTaskById(id: string): Promise<Task | null> {
        return Task.findByPk(id);
    }
    
    async updateTask(id: string, taskData: Partial<Task>): Promise<Task | null> {
        const task = await Task.findByPk(id);
        if (!task) return null;
        return task.update(taskData);
    }
    
    async deleteTask(id: string): Promise<Task | null> {
        const task = await Task.findByPk(id);
        if (!task) return null;
        await task.destroy();
        return task;
    }
    
    async getAllTasks(): Promise<Task[]> {
        return Task.findAll();
    }
}

export default SqlTaskRepository;
