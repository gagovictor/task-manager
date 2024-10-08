import { IMongooseTask, MongooseTask } from "@src/models/mongoose/task";
import { Task } from "@src/models/task";
import MongooseTaskRepository from "@src/repositories/mongoose/taskRepository";
import TaskEncryptionService from "@src/services/taskEncryptionService";

jest.mock('@src/models/mongoose/task');

describe('MongooseTaskRepository', () => {
    let encryptionServiceMock: jest.Mocked<TaskEncryptionService>;
    let taskRepository: MongooseTaskRepository;
    
    beforeEach(() => {
        jest.clearAllMocks();
        
        encryptionServiceMock = {
            encrypt: jest.fn((value: string) => `encrypted(${value})`),
            decrypt: jest.fn((value: string) =>
                value.replace('encrypted(', '').replace(')', '')
            ),
        } as unknown as jest.Mocked<TaskEncryptionService>;
        
        taskRepository = new MongooseTaskRepository(encryptionServiceMock);
    });

    describe('createTask', () => {
        it('should create and return a new task', async () => {
            // Arrange
            const taskData: Task = {
                id: '1',
                userId: 'user123',
                title: 'Test Task',
                description: 'Test Description',
                checklist: [{ id: 'item-1', text: 'Task item 1', completed: false }],
                status: 'new',
                dueDate: new Date(),
                createdAt: new Date(),
                modifiedAt: new Date(),
                archivedAt: null,
                deletedAt: null,
            };
            
            const encryptedTaskData = {
                ...taskData,
                title: `encrypted(${taskData.title})`,
                description: `encrypted(${taskData.description})`,
                checklist: `encrypted(${JSON.stringify(taskData.checklist)})`,
            };
            
            const saveMock = jest.fn().mockResolvedValue(encryptedTaskData);
            (MongooseTask.prototype.save as jest.Mock).mockImplementation(saveMock);
            
            // Act
            const result = await taskRepository.createTask(taskData);
            
            // Assert
            expect(encryptionServiceMock.encrypt).toHaveBeenCalledWith(taskData.title);
            expect(encryptionServiceMock.encrypt).toHaveBeenCalledWith(taskData.description);
            expect(encryptionServiceMock.encrypt).toHaveBeenCalledWith(JSON.stringify(taskData.checklist));
            expect(result).toEqual({
                ...taskData,
                checklist: taskData.checklist,
            });
        });
        
        it('should handle exceptions during task creation', async () => {
            // Arrange
            const taskData: Task = {
                id: '1',
                userId: 'user123',
                title: 'Test Task',
                description: 'Test Description',
                checklist: [{ id: 'item-1', text: 'Task item 1', completed: false }],
                status: 'new',
                dueDate: new Date(),
                createdAt: new Date(),
                modifiedAt: new Date(),
                archivedAt: null,
                deletedAt: null,
            };
            
            (MongooseTask.prototype.save as jest.Mock).mockRejectedValue(new Error('Creation failed'));
            
            // Act & Assert
            await expect(taskRepository.createTask(taskData)).rejects.toThrow('Creation failed');
        });
    });

    describe('getTasksByUser', () => {
        it('should retrieve tasks for a user', async () => {
            // Arrange
            const userId = 'user123';
            const encryptedTasks = [
                {
                    id: '1',
                    userId,
                    title: 'encrypted(Task 1)',
                    description: 'encrypted(Description 1)',
                    checklist: 'encrypted([])',
                    status: 'new',
                    dueDate: new Date(),
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                    archivedAt: null,
                    deletedAt: null,
                },
                {
                    id: '2',
                    userId,
                    title: 'encrypted(Task 2)',
                    description: 'encrypted(Description 2)',
                    checklist: 'encrypted([])',
                    status: 'completed',
                    dueDate: new Date(),
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                    archivedAt: null,
                    deletedAt: null,
                },
            ];
            
            (MongooseTask.find as jest.Mock).mockReturnValue({
                exec: jest.fn().mockResolvedValue(encryptedTasks),
            });
            
            // Act
            const result = await taskRepository.getTasksByUser(userId);
            
            // Assert
            expect(MongooseTask.find).toHaveBeenCalledWith({ userId, deletedAt: null });
            expect(encryptionServiceMock.decrypt).toHaveBeenCalledTimes(6);
            expect(result).toEqual(
                encryptedTasks.map((task) => ({
                    ...task,
                    title: task.title.replace('encrypted(', '').replace(')', ''),
                    description: task.description.replace('encrypted(', '').replace(')', ''),
                    checklist: [],
                }))
            );
        });
        
        it('should handle exceptions during task retrieval', async () => {
            // Arrange
            const userId = 'user123';
            const error = new Error('Fetch failed');
            (MongooseTask.find as jest.Mock).mockReturnValue({
                exec: jest.fn().mockRejectedValue(error),
            });
            
            // Act & Assert
            await expect(taskRepository.getTasksByUser(userId)).rejects.toThrow('Fetch failed');
        });
    });

    describe('updateTask', () => {
        it('should update and return the task', async () => {
            // Arrange
            const id = '1';
            const updates: Task = {
                id,
                title: 'Updated Title',
                description: 'Updated Description',
                checklist: null,
                userId: 'userId',
                dueDate: null,
                status: 'new',
                createdAt: new Date(),
                modifiedAt: null,
                archivedAt: null,
                deletedAt: null,
            };
        
            const encryptedUpdates = {
                title: 'encrypted(Updated Title)',
                description: 'encrypted(Updated Description)',
                modifiedAt: expect.any(Date),
            };
        
            const updatedTask = {
                ...updates,
                title: 'encrypted(Updated Title)',
                description: 'encrypted(Updated Description)',
                checklist: 'encrypted([])', // Assuming checklist is empty and encrypted
            };
        
            (MongooseTask.findByIdAndUpdate as jest.Mock).mockReturnValue({
                exec: jest.fn().mockResolvedValue(updatedTask),
            });
        
            // Act
            const result = await taskRepository.updateTask(id, updates);
        
            // Assert
            expect(MongooseTask.findByIdAndUpdate).toHaveBeenCalledWith(
                id,
                expect.objectContaining(encryptedUpdates),
                { new: true }
            );
            expect(encryptionServiceMock.encrypt).toHaveBeenCalledWith(updates.title);
            expect(encryptionServiceMock.encrypt).toHaveBeenCalledWith(updates.description);
            expect(result).toEqual({
                ...updatedTask,
                title: 'Updated Title', // Decrypted title
                description: 'Updated Description', // Decrypted description
                checklist: [], // Decrypted and parsed checklist
            });
        });
        
        it('should throw an error when task is not found', async () => {
            // Arrange
            const id = 'nonexistent';
            const updates: Task = {
                id,
                title: 'Updated Title',
                description: 'Updated Description',
                userId: 'userId',
                dueDate: null,
                status: 'new',
                checklist: null,
                createdAt: new Date(),
                modifiedAt: null,
                archivedAt: null,
                deletedAt: null,
            };
            
            (MongooseTask.findByIdAndUpdate as jest.Mock).mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });
            
            // Act & Assert
            await expect(taskRepository.updateTask(id, updates)).rejects.toThrow('Task not found.');
        });
    });

    describe('deleteTask', () => {
        it('should delete the task', async () => {
            // Arrange
            const id = '1';
            const userId = 'user123';
            
            (MongooseTask.findOneAndDelete as jest.Mock).mockReturnValue({
                exec: jest.fn().mockResolvedValue(undefined),
            });
            
            // Act
            await taskRepository.deleteTask(id, userId);
            
            // Assert
            expect(MongooseTask.findOneAndDelete).toHaveBeenCalledWith({ _id: id, userId });
        });
    });

    describe('archiveTask', () => {
        it('should archive the task', async () => {
            // Arrange
            const id = '1';
            const userId = 'user123';
            
            (MongooseTask.findOneAndUpdate as jest.Mock).mockReturnValue({
                exec: jest.fn().mockResolvedValue(undefined),
            });
            
            // Act
            await taskRepository.archiveTask(id, userId);
            
            // Assert
            expect(MongooseTask.findOneAndUpdate).toHaveBeenCalledWith({ _id: id, userId }, { archivedAt: expect.any(Date) });
        });
    });

    describe('unarchiveTask', () => {
        it('should unarchive the task', async () => {
            // Arrange
            const id = '1';
            const userId = 'user123';
            
            (MongooseTask.findOneAndUpdate as jest.Mock).mockReturnValue({
                exec: jest.fn().mockResolvedValue(undefined),
            });
            
            // Act
            await taskRepository.unarchiveTask(id, userId);
            
            // Assert
            expect(MongooseTask.findOneAndUpdate).toHaveBeenCalledWith({ _id: id, userId }, { archivedAt: null });
        });
    });

    describe('updateTaskStatus', () => {
        it('should update the task status and return the updated task', async () => {
            // Arrange
            const taskId = '1';
            const userId = 'user123';
            const status = 'completed';
            
            const updatedTask = {
                id: taskId,
                userId,
                status: 'completed', // The updated status
                title: 'encrypted(Title)',
                description: 'encrypted(Description)',
                checklist: 'encrypted([])',
                archivedAt: null,
                createdAt: new Date(),
                deletedAt: null,
                modifiedAt: expect.any(String),
                dueDate: null,
            };
            
            (MongooseTask.findOneAndUpdate as jest.Mock).mockReturnValue({
                exec: jest.fn().mockResolvedValue(updatedTask),
            });
            
            // Mock the decryption
            encryptionServiceMock.decrypt.mockImplementation((value: string) => {
                if (value === 'encrypted(Title)') return 'Title';
                if (value === 'encrypted(Description)') return 'Description';
                if (value === 'encrypted([])') return '[]';
                return ''; // Ensure it always returns a string
            });
            
            // Act
            const result = await taskRepository.updateTaskStatus(taskId, status, userId);
            
            // Assert
            expect(MongooseTask.findOneAndUpdate).toHaveBeenCalledWith(
                { _id: taskId, userId },
                { status, modifiedAt: expect.any(Date) },
                { new: true }
            );
            expect(result).toEqual({
                ...updatedTask,
                status, // Ensure the status is updated
                title: 'Title', // Decrypted title
                description: 'Description', // Decrypted description
                checklist: [], // Decrypted and parsed checklist
            });
        });
        
        it('should return null when task is not found', async () => {
            // Arrange
            const taskId = 'nonexistent';
            const userId = 'user123';
            const status = 'completed';
            
            (MongooseTask.findOneAndUpdate as jest.Mock).mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });
            
            // Act
            const result = await taskRepository.updateTaskStatus(taskId, status, userId);
            
            // Assert
            expect(result).toBeNull();
        });
    });

    describe('bulkCreateTasks', () => {
        it('should create multiple tasks and return them', async () => {
            // Arrange
            const tasks: Task[] = [
                {
                    id: '1',
                    userId: 'user123',
                    title: 'Task 1',
                    description: 'Description 1',
                    checklist: [{ id: 'item-1', text: 'Item 1', completed: false }],
                    status: 'new',
                    dueDate: new Date(),
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                    archivedAt: null,
                    deletedAt: null,
                },
                {
                    id: '2',
                    userId: 'user123',
                    title: 'Task 2',
                    description: 'Description 2',
                    checklist: [{ id: 'item-2', text: 'Item 2', completed: false }],
                    status: 'new',
                    dueDate: new Date(),
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                    archivedAt: null,
                    deletedAt: null,
                },
            ];
            
            const encryptedTasks = tasks.map((task) => ({
                ...task,
                title: `encrypted(${task.title})`,
                description: `encrypted(${task.description})`,
                checklist: `encrypted(${JSON.stringify(task.checklist)})`,
            }));
            
            const createdTasks = encryptedTasks.map((task) => ({
                ...task,
                get: jest.fn().mockReturnValue(task),
            }));
            
            (MongooseTask.insertMany as jest.Mock).mockResolvedValue(createdTasks);
            
            // Act
            const result = await taskRepository.bulkCreateTasks(tasks);
            
            // Assert
            expect(encryptionServiceMock.encrypt).toHaveBeenCalledTimes(6);
            expect(MongooseTask.insertMany).toHaveBeenCalledWith(encryptedTasks, { ordered: false });
            expect(result).toEqual(tasks);
        });
        
        it('should handle exceptions during bulk creation', async () => {
            // Arrange
            const tasks: Task[] = [
                {
                    id: '1',
                    userId: 'user123',
                    title: 'Task 1',
                    description: 'Description 1',
                    checklist: [{ id: 'item-1', text: 'Item 1', completed: false }],
                    status: 'new',
                    dueDate: new Date(),
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                    archivedAt: null,
                    deletedAt: null,
                },
            ];
            
            (MongooseTask.insertMany as jest.Mock).mockRejectedValue(new Error('Bulk creation failed'));
            
            // Act & Assert
            await expect(taskRepository.bulkCreateTasks(tasks)).rejects.toThrow('Bulk task creation failed.');
        });
    });
});
