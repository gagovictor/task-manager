import { IMongooseTask, MongooseTask } from "../../models/mongoose/task";
import { Task } from "../../models/task";
import TaskEncryptionService from "../../services/taskEncryptionService";
import ITaskRepository from "../taskRepository";

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

    async getTasksByUser(userId: string): Promise<Task[]> {
        const result = await MongooseTask.find({ userId, deletedAt: null }).exec();
        return result.map(taskDoc => this.parseTask(taskDoc));
    }

    async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
        const encryptedUpdates: Partial<IMongooseTask> = {
            status: updates.status,
            dueDate: updates.dueDate,
            modifiedAt: new Date(),
        };

        if (updates.title) {
            encryptedUpdates.title = this.encryptionService.encrypt(updates.title);
        }
        if (updates.description) {
            encryptedUpdates.description = this.encryptionService.encrypt(updates.description);
        }
        if (updates.checklist) {
            encryptedUpdates.checklist = this.encryptionService.encrypt(JSON.stringify(updates.checklist));
        }

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
            { status },
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