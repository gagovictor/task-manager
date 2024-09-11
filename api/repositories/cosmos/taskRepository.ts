import { CosmosClient } from '@azure/cosmos';
import TaskRepository from '../taskRepository';
import Task from '../../models/task';

const cosmosClient = new CosmosClient(process.env.COSMOSDB_CONNECTION_STRING!);
const taskContainer = cosmosClient.database(process.env.COSMOSDB_DATABASE!).container('tasks');

class CosmosTaskRepository implements TaskRepository {
    async createTask(task: Task): Promise<Task> {
        const { resource } = await taskContainer.items.create(task);
        return resource;
    }
    
    async getTaskById(id: string): Promise<Task | null> {
        const { resource } = await taskContainer.item(id).read();
        return resource || null;
    }
    
    async updateTask(id: string, taskData: Partial<Task>): Promise<Task | null> {
        const { resource } = await taskContainer.item(id).read();
        if (!resource) return null;
        const updated = { ...resource, ...taskData };
        await taskContainer.item(id).replace(updated);
        return updated;
    }
    
    async deleteTask(id: string): Promise<Task | null> {
        const { resource } = await taskContainer.item(id).read();
        if (!resource) return null;
        await taskContainer.item(id).delete();
        return resource;
    }
    
    async getAllTasks(): Promise<Task[]> {
        const { resources } = await taskContainer.items.query('SELECT * FROM tasks').fetchAll();
        return resources;
    }
}

export default CosmosTaskRepository;
