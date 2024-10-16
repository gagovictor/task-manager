import { SequelizeTask } from '@src/models/sequelize/task';
import TaskEncryptionService from '@src/services/TaskEncryptionService';
import { Task } from '@src/models/task';
import { PaginatedResponse, TaskFilter } from '@src/models/pagination';
import { Op } from 'sequelize';
import ITaskRepository from '@src/abstractions/repositories/ITaskRepository';

export default class SequelizeTaskRepository implements ITaskRepository {
    private encryptionService: TaskEncryptionService;
    
    constructor(encryptionService: TaskEncryptionService) {
        this.encryptionService = encryptionService;
    }
    
    private parseTask(task: SequelizeTask): Task {
        const taskData = task.get();
        return {
            ...taskData,
            title: taskData.title ? this.encryptionService.decrypt(taskData.title) : '',
            description: taskData.description ? this.encryptionService.decrypt(taskData.description) : '',
            checklist: taskData.checklist ? JSON.parse(this.encryptionService.decrypt(taskData.checklist)) : [],
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
    
    
    async getTasksByUser(
        userId: string,
        page: number,
        limit: number,
        filter?: TaskFilter
    ): Promise<PaginatedResponse<Task>> {
        try {
            if(limit === 0) {
                throw new Error('Limit cannot be 0.');
            }
            const offset = (page - 1) * limit;
            const whereClause: any = { userId, deletedAt: null };
            
            if (filter) {
                if (filter.archived !== undefined) {
                    whereClause.archivedAt = filter.archived ? { [Op.ne]: null } : null;
                }
                if (filter.status) {
                    whereClause.status = filter.status;
                }
                if (filter.dueDate) {
                    whereClause.dueDate = { [Op.lte]: filter.dueDate };
                }
            }
            
            const totalItems = await SequelizeTask.count({ where: whereClause });
            
            const tasks = await SequelizeTask.findAll({
                where: whereClause,
                order: [['createdAt', 'DESC']],
                offset,
                limit,
            });
            
            const decryptedTasks = tasks.map((task) => this.parseTask(task));
            
            const totalPages = Math.ceil(totalItems / limit);
            
            return {
                items: decryptedTasks,
                totalItems,
                totalPages,
                currentPage: page,
            };
        } catch (error: any) {
            console.error('Sequelize Fetching tasks error:', error);
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
