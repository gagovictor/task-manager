import ITaskRepository from '../taskRepository';
import { Task } from '../../models/sql/task';

export default class SequelizeTaskRepository implements ITaskRepository {
    async createTask(task: Task): Promise<Task> {
        try {
            const newTask = await Task.create({ ...task });
            return newTask;
        } catch (error: any) {
            console.error('Task creation error:', error);
            throw new Error('Task creation failed');
        }
    }

    async getTasksByUser(userId: string): Promise<Task[]> {
        try {
            const tasks = await Task.findAll({
                where: {
                    userId,
                    deletedAt: null
                }
            });
            return tasks;
        } catch (error: any) {
            console.error('Fetching tasks error:', error);
            throw new Error('Failed to fetch tasks');
        }
    }

    async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
        console.log(id, updates)
        try {
            const task = await Task.findOne({
                where: {
                    id,
                    deletedAt: null
                }
            });

            if (!task) {
                throw new Error('Task not found');
            }

            await task.update(updates);
            
            return task;
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
            const task = await Task.findOne({
                where: {
                    id,
                    userId,
                    deletedAt: null
                }
            });
            if (!task) {
                throw new Error('Task not found');
            }
            await task.update({
                deletedAt: new Date(),
            });
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
            const task = await Task.findOne({
                where: {
                    id,
                    userId,
                    deletedAt: null
                }
            });
            if (!task) throw new Error('Task not found');
            await task.update({
                archivedAt: new Date(),
            });
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
            const task = await Task.findOne({
                where: {
                    id,
                    userId,
                    deletedAt: null
                }
            });
            if (!task) throw new Error('Task not found');
            await task.update({
                archivedAt: null,
            });
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
            const task = await Task.findOne({
                where: {
                    id: taskId,
                    userId
                }
            });

            if (!task) {
                return null;
            }

            task.status = status;
            await task.save();

            return task;
        } catch (error: any) {
            console.error('Update task status error:', error);
            throw new Error('Could not update task status');
        }
    }
}