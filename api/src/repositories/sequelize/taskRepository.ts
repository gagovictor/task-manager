import ITaskRepository from '../taskRepository';
import { SequelizeTask } from '../../models/sequelize/task';
import TaskEncryptionService from '../../services/taskEncryptionService';
import { Task } from '../../models/task';

export default class SequelizeTaskRepository implements ITaskRepository {
    private encryptionService: TaskEncryptionService;

    constructor(encryptionService: TaskEncryptionService) {
        this.encryptionService = encryptionService;
    }

    private parseTask(task: SequelizeTask): Task {
        return {
            ...task.get(),
            title: this.encryptionService.decrypt(task.title),
            description: task.description ? this.encryptionService.decrypt(task.description) : '',
            checklist: task.checklist ? JSON.parse(this.encryptionService.decrypt(task.checklist)) : [],
        };
    }


    async bulkCreateTasks(tasks: Task[]): Promise<Task[]> {
        if (!tasks || !Array.isArray(tasks)) {
            throw new Error('Invalid tasks data provided.');
        }

        const encryptedTasks = tasks.map(task => ({
            ...task,
            title: task.title ? this.encryptionService.encrypt(task.title) : '',
            description: task.description ? this.encryptionService.encrypt(task.description) : '',
            checklist: task.checklist ? this.encryptionService.encrypt(JSON.stringify(task.checklist)) : '',
        }));

        try {
            const createdTasks = await SequelizeTask.bulkCreate(encryptedTasks, { returning: true });

            return createdTasks.map(task => this.parseTask(task));
        } catch (error: any) {
            console.error('Bulk task creation error:', error);
            throw new Error('Bulk task creation failed.');
        }
    }

    async createTask(task: Task): Promise<Task> {
        const encryptedTask = {
            ...task,
            title: task.title ? this.encryptionService.encrypt(task.title) : '',
            description: task.description ? this.encryptionService.encrypt(task.description) : '',
            checklist: task.checklist ? this.encryptionService.encrypt(JSON.stringify(task.checklist)) : '',
        };
        try {
            const newTask = await SequelizeTask.create(encryptedTask);
            return this.parseTask(newTask);
        } catch (error: any) {
            console.error('Task creation error:', error);
            throw new Error('Task creation failed');
        }
    }

    async getTasksByUser(userId: string): Promise<Task[]> {
        try {
            const tasks = await SequelizeTask.findAll({
                where: {
                    userId,
                    deletedAt: null
                }
            });
            return tasks.map(task => this.parseTask(task));
        } catch (error: any) {
            console.error('Fetching tasks error:', error);
            throw new Error('Failed to fetch tasks');
        }
    }

    async updateTask(id: string, updates: Task): Promise<Task> {
        try {
            const task = await SequelizeTask.findOne({
                where: {
                    id,
                    deletedAt: null
                }
            });
            if (!task) {
                throw new Error('Task not found');
            }

            const encryptedUpdates: Partial<SequelizeTask> = {
                modifiedAt: new Date(),
                dueDate: updates.dueDate,
                status: updates.status,
            };

            encryptedUpdates.title = updates.title ? this.encryptionService.encrypt(updates.title) : '';
            encryptedUpdates.description = updates.description ? this.encryptionService.encrypt(updates.description) : null;
            encryptedUpdates.checklist = updates.checklist ? this.encryptionService.encrypt(JSON.stringify(updates.checklist)) : null;

            await task.update(encryptedUpdates);
            return this.parseTask(Object.assign(task, encryptedUpdates));
        } catch (error: any) {
            console.error('Task update error:', error);
            throw new Error('Task update failed');
        }
    }

    async deleteTask(id: string, userId: string): Promise<void> {
        try {
            const task = await SequelizeTask.findOne({
                where: {
                    id,
                    userId,
                    deletedAt: null
                }
            });
            if (!task) {
                throw new Error('Task not found');
            }
            await task.update({ deletedAt: new Date() });
        } catch (error: any) {
            console.error('Task deletion error:', error);
            throw new Error('Task deletion failed');
        }
    }

    async archiveTask(id: string, userId: string): Promise<void> {
        try {
            const task = await SequelizeTask.findOne({
                where: {
                    id,
                    userId,
                    deletedAt: null
                }
            });
            if (!task) {
                throw new Error('Task not found');
            }
            await task.update({ archivedAt: new Date() });
        } catch (error: any) {
            console.error('Task archive error:', error);
            throw new Error('Task archive failed');
        }
    }

    async unarchiveTask(id: string, userId: string): Promise<void> {
        try {
            const task = await SequelizeTask.findOne({
                where: {
                    id,
                    userId,
                    deletedAt: null
                }
            });
            if (!task) {
                throw new Error('Task not found');
            }
            await task.update({ archivedAt: null });
        } catch (error: any) {
            console.error('Task unarchive error:', error);
            throw new Error('Task unarchive failed');
        }
    }

    async updateTaskStatus(taskId: string, status: string, userId: string): Promise<Task | null> {
        try {
            const task = await SequelizeTask.findOne({
                where: {
                    id: taskId,
                    userId,
                }
            });
            if (!task) {
                return null;
            }
            
            task.status = status;
            task.modifiedAt = new Date();

            await task.save();
            const result = this.parseTask(task);
            return result;
        } catch (error: any) {
            console.error('Update task status error:', error);
            throw new Error('Could not update task status');
        }
    }
}
