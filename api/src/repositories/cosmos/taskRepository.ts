import { Container, CosmosClient } from '@azure/cosmos';
import ITaskRepository from '../taskRepository';
import { Task } from '../../models/task';
import TaskEncryptionService from '../../services/taskEncryptionService';
import { ICosmosTask } from '../../models/cosmos/task';

export default class CosmosTaskRepository implements ITaskRepository {
    private container: Container;
    private encryptionService: TaskEncryptionService;

    constructor(cosmosClient: CosmosClient, databaseId: string, containerId: string, encryptionService: TaskEncryptionService) {
        this.container = cosmosClient.database(databaseId).container(containerId);
        this.encryptionService = encryptionService;
    }

    private parseTask(task: ICosmosTask): Task {
        return {
            ...task,
            title: this.encryptionService.decrypt(task.title),
            description: task.description ? this.encryptionService.decrypt(task.description) : '',
            checklist: task.checklist ? JSON.parse(this.encryptionService.decrypt(task.checklist)) : [],
        };
    }
    async bulkCreateTasks(tasks: Partial<Task>[]): Promise<Task[]> {
        if (!tasks || !Array.isArray(tasks)) {
            throw new Error('Invalid tasks data provided.');
        }

        // Encrypt fields for each task
        const encryptedTasks = tasks.map(task => ({
            ...task,
            title: task.title ? this.encryptionService.encrypt(task.title) : '',
            description: task.description ? this.encryptionService.encrypt(task.description) : '',
            checklist: task.checklist ? this.encryptionService.encrypt(JSON.stringify(task.checklist)) : '',
        }));

        try {
            const bulkPromises = encryptedTasks.map(encryptedTask => this.container.items.create(encryptedTask));
            const results = await Promise.all(bulkPromises);

            // Decrypt and parse tasks
            return results.map(result => this.parseTask(result.resource as ICosmosTask));
        } catch (error: any) {
            console.error('Bulk task creation error:', error);
            throw new Error('Bulk task creation failed.');
        }
    }

    async createTask(task: Task): Promise<Task> {
        try {
            const encryptedTask = {
                ...task,
                title: task.title ? this.encryptionService.encrypt(task.title) : '',
                description: task.description ? this.encryptionService.encrypt(task.description) : '',
                checklist: task.checklist ? this.encryptionService.encrypt(JSON.stringify(task.checklist)) : '',
            };

            const { resource: newTask } = await this.container.items.create<ICosmosTask>(encryptedTask);
            return this.parseTask(newTask as ICosmosTask);
        } catch (error: any) {
            console.error('Task creation error:', error);
            throw new Error('Task creation failed');
        }
    }

    async getTasksByUser(userId: string): Promise<Task[]> {
        try {
            const query = "SELECT * FROM c WHERE c.userId = @userId AND c.deletedAt = null";
            const parameters = [{ name: '@userId', value: userId }];
            const { resources: tasks } = await this.container.items.query<ICosmosTask>({ query, parameters }).fetchAll();

            return tasks.map(task => this.parseTask(task));
        } catch (error: any) {
            console.error('Fetching tasks error:', error);
            throw new Error('Failed to fetch tasks');
        }
    }

    async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
        try {
            const { resource: task } = await this.container.item(id).read<ICosmosTask>();
            if (!task) throw new Error('Task not found');

            const encryptedUpdates: Partial<ICosmosTask> = { modifiedAt: new Date() };

            if (updates.title) {
                encryptedUpdates.title = this.encryptionService.encrypt(updates.title);
            }

            if (updates.description) {
                encryptedUpdates.description = this.encryptionService.encrypt(updates.description);
            }

            if (updates.checklist) {
                encryptedUpdates.checklist = this.encryptionService.encrypt(JSON.stringify(updates.checklist));
            }

            const { resource: updatedTask } = await this.container.item(id).replace(encryptedUpdates);
            return this.parseTask(updatedTask as ICosmosTask);
        } catch (error: any) {
            console.error('Task update error:', error);
            throw new Error('Task update failed');
        }
    }
    
    async deleteTask(id: string, userId: string): Promise<void> {
        try {
            const { resource: task } = await this.container.item(id).read<ICosmosTask>();
            if (!task || task.userId !== userId) throw new Error('Task not found');

            await this.container.item(id).delete();
        } catch (error: any) {
            console.error('Task deletion error:', error);
            throw new Error('Task deletion failed');
        }
    }

    async archiveTask(id: string, userId: string): Promise<void> {
        try {
            const { resource: task } = await this.container.item(id).read<ICosmosTask>();
            if (!task || task.userId !== userId) throw new Error('Task not found');

            const updatedTask = { ...task, archivedAt: new Date().toISOString() };
            await this.container.item(id).replace(updatedTask);
        } catch (error: any) {
            console.error('Task archive error:', error);
            throw new Error('Task archive failed');
        }
    }

    async unarchiveTask(id: string, userId: string): Promise<void> {
        try {
            const { resource: task } = await this.container.item(id).read<ICosmosTask>();
            if (!task || task.userId !== userId) throw new Error('Task not found');

            const updatedTask = { ...task, archivedAt: null };
            await this.container.item(id).replace(updatedTask);
        } catch (error: any) {
            console.error('Task unarchive error:', error);
            throw new Error('Task unarchive failed');
        }
    }

    async updateTaskStatus(taskId: string, status: string, userId: string): Promise<Task | null> {
        try {
            const { resource: task } = await this.container.item(taskId).read<ICosmosTask>();
            if (!task || task.userId !== userId) return null;

            const updatedTask = { ...task, status };
            await this.container.item(taskId).replace(updatedTask);
            return this.parseTask(updatedTask as ICosmosTask);
        } catch (error: any) {
            console.error('Update task status error:', error);
            throw new Error('Could not update task status');
        }
    }
}
