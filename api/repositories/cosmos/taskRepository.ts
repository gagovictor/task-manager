import { Container, CosmosClient } from '@azure/cosmos'; 
import ITaskRepository from '../taskRepository';
import { Task } from '../../models/task';

export default class CosmosTaskRepository implements ITaskRepository {
    private container: Container;

    constructor(cosmosClient: CosmosClient, databaseId: string, containerId: string) {
        this.container = cosmosClient.database(databaseId).container(containerId);
    }

    async createTask(task: Task): Promise<Task> {
        try {
            const { resource: newTask } = await this.container.items.create(task);
            if (!newTask) {
                throw new Error('Failed to create the task.');
            }
            return newTask;
        } catch (error: any) {
            console.error('Task creation error:', error);
            throw new Error('Task creation failed');
        }
    }

    async getTasksByUser(userId: string): Promise<Task[]> {
        try {
            const query = `SELECT * FROM c WHERE c.userId = @userId AND c.deletedAt = null`;
            const parameters = [{ name: '@userId', value: userId }];
            const { resources: tasks } = await this.container.items.query<Task>({ query, parameters }).fetchAll();
            return tasks;
        } catch (error: any) {
            console.error('Fetching tasks error:', error);
            throw new Error('Failed to fetch tasks');
        }
    }

    async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
        try {
            const { resource: task } = await this.container.item(id).read<Task>();
            if (!task) throw new Error('Task not found');

            const updatedTask = { ...task, ...updates };
            const { resource: result } = await this.container.item(id).replace(updatedTask);
            if (!result) throw new Error('Failed to update the task');
            return result;
        } catch (error: any) {
            console.error('Task update error:', error);
            if (error.message === 'Task not found') {
                throw error;
            }
            throw new Error('Task update failed');
        }
    }

    async deleteTask(id: string, userId: string): Promise<void> {
        try {
            const { resource: task } = await this.container.item(id).read<Task>();
            if (!task || task.userId !== userId) throw new Error('Task not found');

            await this.container.item(id).delete();
        } catch (error: any) {
            console.error('Task deletion error:', error);
            if (error.message === 'Task not found') {
                throw error;
            }
            throw new Error('Task deletion failed');
        }
    }

    async archiveTask(id: string, userId: string): Promise<void> {
        try {
            const { resource: task } = await this.container.item(id).read<Task>();
            if (!task || task.userId !== userId) throw new Error('Task not found');

            const updatedTask = { ...task, archivedAt: new Date().toISOString() };
            const { resource: result } = await this.container.item(id).replace(updatedTask);
            if (!result) throw new Error('Failed to archive the task');
        } catch (error: any) {
            console.error('Task archive error:', error);
            if (error.message === 'Task not found') {
                throw error;
            }
            throw new Error('Task archive failed');
        }
    }

    async unarchiveTask(id: string, userId: string): Promise<void> {
        try {
            const { resource: task } = await this.container.item(id).read<Task>();
            if (!task || task.userId !== userId) throw new Error('Task not found');

            const updatedTask = { ...task, archivedAt: null };
            const { resource: result } = await this.container.item(id).replace(updatedTask);
            if (!result) throw new Error('Failed to unarchive the task');
        } catch (error: any) {
            console.error('Task unarchive error:', error);
            if (error.message === 'Task not found') {
                throw error;
            }
            throw new Error('Task unarchive failed');
        }
    }

    async updateTaskStatus(taskId: string, status: string, userId: string): Promise<Task | null> {
        try {
            const { resource: task } = await this.container.item(taskId).read<Task>();
            if (!task || task.userId !== userId) return null;

            const updatedTask = { ...task, status };
            const { resource: result } = await this.container.item(taskId).replace(updatedTask);
            if (!result) throw new Error('Failed to update task status');
            return result;
        } catch (error: any) {
            console.error('Update task status error:', error);
            throw new Error('Could not update task status');
        }
    }
}
