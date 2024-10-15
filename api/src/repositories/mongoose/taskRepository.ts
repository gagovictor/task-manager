import { PaginatedResponse, TaskFilter } from "@src/models/pagination";
import { IMongooseTask, MongooseTask } from "@src/models/mongoose/task";
import { Task } from "@src/models/task";
import TaskEncryptionService from "@src/services/TaskEncryptionService";
import ITaskRepository from "@src/abstractions/repositories/ITaskRepository";

export default class MongooseTaskRepository implements ITaskRepository {
    private encryptionService: TaskEncryptionService;
    
    constructor(encryptionService: TaskEncryptionService) {
        this.encryptionService = encryptionService;
    }
    
    private parseTask(doc: IMongooseTask): Task {
        return {
            id: doc.id.toString(),
            title: this.encryptionService.decrypt(doc.title),
            description: doc.description ? this.encryptionService.decrypt(doc.description) : '',
            checklist: doc.checklist ? JSON.parse(this.encryptionService.decrypt(doc.checklist)) : [],
            dueDate: doc.dueDate,
            status: doc.status,
            createdAt: doc.createdAt,
            modifiedAt: doc.modifiedAt,
            archivedAt: doc.archivedAt,
            deletedAt: doc.deletedAt,
            userId: doc.userId.toString(),
        };
    }
    
    async createTask(task: Task): Promise<Task> {
        const encryptedTask = {
            ...task,
            title: task.title ? this.encryptionService.encrypt(task.title) : '',
            description: task.description ? this.encryptionService.encrypt(task.description) : '',
            checklist: task.checklist ? this.encryptionService.encrypt(JSON.stringify(task.checklist)) : '',
        };
        const newTask = new MongooseTask(encryptedTask);
        const result = await newTask.save();
        return this.parseTask(result);
    }

    async getTasksByUser(userId: string, page: number, limit: number, filter?: TaskFilter): Promise<PaginatedResponse<Task>> {
        try {
            if (limit === 0) {
                throw new Error('Limit cannot be 0.');
            }
            const query: any = { userId, deletedAt: null };
    
            if (filter) {
                query.archivedAt = filter.archived ? { $ne: null } : null;
                if (filter.status) {
                    query.status = filter.status;
                }
                if (filter.dueDate) {
                    query.dueDate = { $lte: filter.dueDate };
                }
            }
    
            const offset = (page - 1) * limit;
    
            const totalItems = await MongooseTask.countDocuments(query).exec();
            const tasks = await MongooseTask.find(query)
                .sort({ createdAt: -1 })
                .skip(offset)
                .limit(limit)
                .exec();
    
            const totalPages = Math.ceil(totalItems / limit);
    
            return {
                items: tasks.map(taskDoc => this.parseTask(taskDoc)),
                totalItems,
                totalPages,
                currentPage: page,
            };
        } catch (error: any) {
            console.error('Fetching tasks error:', error);
            throw new Error('Failed to fetch tasks');
        }
    }
    
    async updateTask(id: string, updates: Task): Promise<Task> {
        const encryptedUpdates: Partial<IMongooseTask> = {
            status: updates.status,
            dueDate: updates.dueDate,
            modifiedAt: new Date(),
        };
        
        encryptedUpdates.title = updates.title ? this.encryptionService.encrypt(updates.title) : '';
        encryptedUpdates.description = updates.description ? this.encryptionService.encrypt(updates.description) : null;
        encryptedUpdates.checklist = updates.checklist ? this.encryptionService.encrypt(JSON.stringify(updates.checklist)) : null;
        
        const result = await MongooseTask.findByIdAndUpdate(
            id,
            encryptedUpdates,
            { new: true }
        ).exec();
        
        if (!result) {
            throw new Error('Task not found.');
        }
        
        return this.parseTask(result);
    }
    
    async deleteTask(id: string, userId: string): Promise<void> {
        await MongooseTask.findOneAndDelete({ _id: id, userId }).exec();
    }
    
    async archiveTask(id: string, userId: string): Promise<void> {
        await MongooseTask.findOneAndUpdate(
            { _id: id, userId },
            { archivedAt: new Date() }
        ).exec();
    }
    
    async unarchiveTask(id: string, userId: string): Promise<void> {
        await MongooseTask.findOneAndUpdate(
            { _id: id, userId },
            { archivedAt: null }
        ).exec();
    }
    
    async updateTaskStatus(taskId: string, status: string, userId: string): Promise<Task | null> {
        const result = await MongooseTask.findOneAndUpdate(
            { _id: taskId, userId },
            {
                status,
                modifiedAt: new Date(),
            },
            { new: true }
        ).exec();
        
        if (!result) {
            return null;
        }
        
        return this.parseTask(result);
    }
    
    /**
    * Bulk create tasks.
    * @param tasks Array of tasks to create.
    * @returns Array of created tasks.
    */
    async bulkCreateTasks(tasks: Task[]): Promise<Task[]> {
        if (!tasks || !Array.isArray(tasks)) {
            throw new Error('Invalid tasks data provided.');
        }
        
        // Encrypt fields for each task
        const encryptedTasks = tasks.map(task => ({
            ...task,
            title: this.encryptionService.encrypt(task.title),
            description: task.description ? this.encryptionService.encrypt(task.description) : '',
            checklist: task.checklist ? this.encryptionService.encrypt(JSON.stringify(task.checklist)) : '',
        }));
        
        try {
            // Insert multiple tasks at once
            const insertedTasks = await MongooseTask.insertMany(encryptedTasks, { ordered: false });
            
            // Parse and decrypt each task
            return insertedTasks.map(taskDoc => this.parseTask(taskDoc));
        } catch (error: any) {
            console.error('Bulk task creation error:', error);
            throw new Error('Bulk task creation failed.');
        }
    }
}