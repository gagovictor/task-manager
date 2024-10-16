import { Container, CosmosClient, SqlQuerySpec } from '@azure/cosmos';
import { ICosmosTask } from '@src/models/cosmos/task';
import { PaginatedResponse } from '@src/models/pagination';
import { Task } from '@src/models/task';
import CosmosTaskRepository from '@src/repositories/cosmos/taskRepository';
import TaskEncryptionService from '@src/services/TaskEncryptionService';

jest.mock('@azure/cosmos');

describe('CosmosTaskRepository', () => {
    let cosmosClientMock: jest.Mocked<CosmosClient>;
    let containerMock: jest.Mocked<Container>;
    let encryptionServiceMock: jest.Mocked<TaskEncryptionService>;
    let taskRepository: CosmosTaskRepository;
    
    const databaseId = 'testDatabase';
    const containerId = 'testContainer';
    
    beforeEach(() => {
        jest.clearAllMocks();
            
        cosmosClientMock = new CosmosClient('AccountEndpoint=https://localhost:8081/;AccountKey=your_account_key;') as jest.Mocked<CosmosClient>;
        containerMock = {
        items: {
            query: jest.fn(),
            create: jest.fn(),
        },
        item: jest.fn(),
        } as unknown as jest.Mocked<Container>;
        
        const databaseMock = {
            container: jest.fn().mockReturnValue(containerMock),
        };
        cosmosClientMock.database = jest.fn().mockReturnValue(databaseMock as any);
        
        encryptionServiceMock = {
            encrypt: jest.fn((value: string) => `encrypted(${value})`),
            decrypt: jest.fn((value: string) => value.replace('encrypted(', '').replace(')', '')),
        } as unknown as jest.Mocked<TaskEncryptionService>;
        
        taskRepository = new CosmosTaskRepository(cosmosClientMock, databaseId, containerId, encryptionServiceMock);
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
                dueDate: null,
                createdAt: expect.any(Date),
                modifiedAt: expect.any(Date),
                archivedAt: expect.any(Date),
                deletedAt: null,
            };
            const encryptedTaskData: ICosmosTask = {
                ...taskData,
                title: `encrypted(${taskData.title})`,
                description: `encrypted(${taskData.description})`,
                checklist: `encrypted(${JSON.stringify(taskData.checklist)})`,
                createdAt: expect.any(Date),
                modifiedAt: expect.any(Date),
                archivedAt: expect.any(Date),
                deletedAt: null,
            };
            
            const createdTaskResource = { resource: encryptedTaskData };
            (containerMock.items.create as jest.Mock).mockResolvedValue(createdTaskResource);
            
            // Act
            const result = await taskRepository.createTask(taskData);
            
            // Assert
            expect(encryptionServiceMock.encrypt).toHaveBeenCalledWith(taskData.title);
            expect(encryptionServiceMock.encrypt).toHaveBeenCalledWith(taskData.description);
            expect(encryptionServiceMock.encrypt).toHaveBeenCalledWith(JSON.stringify(taskData.checklist));
            
            expect(containerMock.items.create).toHaveBeenCalledWith({
                ...taskData,
                title: `encrypted(${taskData.title})`,
                description: `encrypted(${taskData.description})`,
                checklist: `encrypted(${JSON.stringify(taskData.checklist)})`,
            });
            
            expect(encryptionServiceMock.decrypt).toHaveBeenCalledWith(`encrypted(${taskData.title})`);
            expect(encryptionServiceMock.decrypt).toHaveBeenCalledWith(`encrypted(${taskData.description})`);
            expect(encryptionServiceMock.decrypt).toHaveBeenCalledWith(`encrypted(${JSON.stringify(taskData.checklist)})`);
            
            expect(result).toEqual(taskData);
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
                dueDate: null,
                createdAt: new Date(),
                modifiedAt: new Date(),
                archivedAt: new Date(),
                deletedAt: null,
            };
            const error = new Error('Creation failed');
            (containerMock.items.create as jest.Mock).mockRejectedValue(error);
            
            // Act & Assert
            await expect(taskRepository.createTask(taskData)).rejects.toThrow('Task creation failed');
        });
    });
    
    describe('getTasksByUser', () => {
        it('should retrieve tasks for a user', async () => {
            // Arrange
            const userId = 'user123';
            const page = 1;
            const limit = 10;
        
            const encryptedTasks: ICosmosTask[] = [
                {
                    id: '1',
                    userId,
                    title: 'encrypted(Task 1)',
                    description: 'encrypted(Description 1)',
                    checklist: 'encrypted([])',
                    status: 'new',
                    dueDate: null,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                    archivedAt: new Date(),
                    deletedAt: null,
                },
                {
                    id: '2',
                    userId,
                    title: 'encrypted(Task 2)',
                    description: 'encrypted(Description 2)',
                    checklist: 'encrypted([])',
                    status: 'completed',
                    dueDate: null,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                    archivedAt: new Date(),
                    deletedAt: null,
                },
            ];
        
            const decryptedTasks: Task[] = encryptedTasks.map(task => ({
                ...task,
                title: task.title.replace('encrypted(', '').replace(')', ''),
                description: task.description!.replace('encrypted(', '').replace(')', ''),
                checklist: [],
            }));
        
            const totalItems = encryptedTasks.length;
        
            const paginatedResponse: PaginatedResponse<Task> = {
                totalItems: totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: page,
                items: decryptedTasks,
            };
        
            // Mock count query result
            const countQueryResult = { resources: [totalItems] };
            (containerMock.items.query as jest.Mock).mockReturnValueOnce({
                fetchAll: jest.fn().mockResolvedValue(countQueryResult),
            } as any);
        
            // Mock tasks query result
            const tasksQueryResult = { resources: encryptedTasks };
            (containerMock.items.query as jest.Mock).mockReturnValueOnce({
                fetchAll: jest.fn().mockResolvedValue(tasksQueryResult),
            } as any);
        
            // Act
            const result = await taskRepository.getTasksByUser(userId, page, limit, { archived: false });
        
            // Assert
            expect(containerMock.items.query).toHaveBeenCalledWith(expect.any(Object));
            expect(encryptionServiceMock.decrypt).toHaveBeenCalledTimes(6); // 2 tasks x 3 fields
            expect(result).toEqual(paginatedResponse);
        });
    
        it('should handle exceptions during task retrieval', async () => {
            // Arrange
            const userId = 'user123';
            const error = new Error('Query failed');
            (containerMock.items.query as jest.Mock).mockReturnValue({
                fetchAll: jest.fn().mockRejectedValue(error),
            } as any);
            
            // Act & Assert
            await expect(taskRepository.getTasksByUser(userId, 0, 10, { archived: false })).rejects.toThrow('Failed to fetch tasks');
        });
    });
    
    describe('updateTask', () => {
        it('should update and return the task', async () => {
            // Arrange
            const taskId = '1';
            const existingTask: ICosmosTask = {
                id: taskId,
                userId: 'user123',
                title: 'encrypted(Old Title)',
                description: 'encrypted(Old Description)',
                checklist: 'encrypted([])',
                status: 'new',
                dueDate: null,
                createdAt: new Date(),
                modifiedAt: new Date(),
                archivedAt: new Date(),
                deletedAt: null,
            };
            const updates: Partial<Task> = {
                title: 'New Title',
                description: 'New Description',
            };
            const encryptedUpdates: Partial<ICosmosTask> = {
                modifiedAt: expect.any(Date),
                title: 'encrypted(New Title)',
                description: 'encrypted(New Description)',
            };
            const updatedTask: ICosmosTask = {
                ...existingTask,
                ...encryptedUpdates,
            };
            
            const itemMock = {
                read: jest.fn().mockResolvedValue({ resource: existingTask }),
                replace: jest.fn().mockResolvedValue({ resource: updatedTask }),
            };
            containerMock.item.mockReturnValue(itemMock as any);
            
            // Act
            const result = await taskRepository.updateTask(taskId, updates);
            
            // Assert
            expect(containerMock.item).toHaveBeenCalledWith(taskId);
            expect(itemMock.read).toHaveBeenCalled();
            expect(encryptionServiceMock.encrypt).toHaveBeenCalledWith('New Title');
            expect(encryptionServiceMock.encrypt).toHaveBeenCalledWith('New Description');
            expect(itemMock.replace).toHaveBeenCalledWith(expect.objectContaining(encryptedUpdates));
            expect(encryptionServiceMock.decrypt).toHaveBeenCalledWith(updatedTask.title);
            expect(encryptionServiceMock.decrypt).toHaveBeenCalledWith(updatedTask.description);
            expect(result).toEqual({
                ...existingTask,
                ...updates,
                modifiedAt: expect.any(Date),
                title: updates.title,
                description: updates.description,
                checklist: [],
            });
        });
        
        it('should throw an error when task is not found', async () => {
            // Arrange
            const taskId = 'nonexistent';
            const updates: Partial<Task> = {
                title: 'New Title',
            };
            const itemMock = {
                read: jest.fn().mockResolvedValue({ resource: null }),
            };
            containerMock.item.mockReturnValue(itemMock as any);
            
            // Act & Assert
            await expect(taskRepository.updateTask(taskId, updates)).rejects.toThrow('Task update failed');
        });
        
        it('should handle exceptions during update', async () => {
            // Arrange
            const taskId = '1';
            const existingTask: ICosmosTask = {
                id: taskId,
                userId: 'user123',
                title: 'encrypted(Old Title)',
                description: 'encrypted(Old Description)',
                checklist: 'encrypted([])',
                status: 'new',
                dueDate: null,
                createdAt: new Date(),
                modifiedAt: new Date(),
                archivedAt: new Date(),
                deletedAt: null,
            };
            const updates: Partial<Task> = {
                title: 'New Title',
            };
            const error = new Error('Replace failed');
            const itemMock = {
                read: jest.fn().mockResolvedValue({ resource: existingTask }),
                replace: jest.fn().mockRejectedValue(error),
            };
            containerMock.item.mockReturnValue(itemMock as any);
            
            // Act & Assert
            await expect(taskRepository.updateTask(taskId, updates)).rejects.toThrow('Task update failed');
        });
    });
    
    describe('deleteTask', () => {
        it('should delete the task', async () => {
            // Arrange
            const taskId = '1';
            const userId = 'user123';
            const existingTask: ICosmosTask = {
                id: taskId,
                userId,
                title: 'encrypted(Title)',
                description: 'encrypted(Description)',
                checklist: 'encrypted([])',
                status: 'new',
                dueDate: null,
                createdAt: new Date(),
                modifiedAt: new Date(),
                archivedAt: new Date(),
                deletedAt: null,
            };
            const itemMock = {
                read: jest.fn().mockResolvedValue({ resource: existingTask }),
                delete: jest.fn().mockResolvedValue({}),
            };
            containerMock.item.mockReturnValue(itemMock as any);
            
            // Act
            await taskRepository.deleteTask(taskId, userId);
            
            // Assert
            expect(containerMock.item).toHaveBeenCalledWith(taskId);
            expect(itemMock.read).toHaveBeenCalled();
            expect(itemMock.delete).toHaveBeenCalled();
        });
        
        it('should throw an error when task is not found or userId does not match', async () => {
            // Arrange
            const taskId = '1';
            const userId = 'user123';
            const existingTask: ICosmosTask = {
                id: taskId,
                userId: 'differentUser',
                title: 'encrypted(Title)',
                description: 'encrypted(Description)',
                checklist: 'encrypted([])',
                status: 'new',
                dueDate: null,
                createdAt: new Date(),
                modifiedAt: new Date(),
                archivedAt: new Date(),
                deletedAt: null,
            };
            const itemMock = {
                read: jest.fn().mockResolvedValue({ resource: existingTask }),
            };
            containerMock.item.mockReturnValue(itemMock as any);
            
            // Act & Assert
            await expect(taskRepository.deleteTask(taskId, userId)).rejects.toThrow('Task deletion failed');
        });
    });
    
    describe('archiveTask', () => {
        it('should archive the task', async () => {
            // Arrange
            const taskId = '1';
            const userId = 'user123';
            const archivedAt = new Date();
            const existingTask: ICosmosTask = {
                id: taskId,
                userId,
                title: 'encrypted(Title)',
                description: 'encrypted(Description)',
                checklist: 'encrypted([])',
                status: 'new',
                dueDate: null,
                createdAt: new Date(),
                modifiedAt: new Date(),
                deletedAt: null,
                archivedAt: null,
            };
            const itemMock = {
                read: jest.fn().mockResolvedValue({ resource: existingTask }),
                replace: jest.fn(),
            };
            containerMock.item.mockReturnValue(itemMock as any);
            
            // Act
            await taskRepository.archiveTask(taskId, userId);
            
            // Assert
            expect(containerMock.item).toHaveBeenCalledWith(taskId);
            expect(itemMock.read).toHaveBeenCalled();
            expect(itemMock.replace).toHaveBeenCalledWith(expect.objectContaining({
              ...existingTask,
              archivedAt: expect.any(String),
            }));
        });
        
        it('should throw an error when task is not found or userId does not match', async () => {
            // Arrange
            const taskId = '1';
            const userId = 'user123';
            const existingTask: ICosmosTask = {
                id: taskId,
                userId: 'differentUser',
                title: 'encrypted(Title)',
                description: 'encrypted(Description)',
                checklist: 'encrypted([])',
                status: 'new',
                dueDate: null,
                createdAt: new Date(),
                modifiedAt: new Date(),
                archivedAt: new Date(),
                deletedAt: null,
            };
            const itemMock = {
                read: jest.fn().mockResolvedValue({ resource: existingTask }),
            };
            containerMock.item.mockReturnValue(itemMock as any);
            
            // Act & Assert
            await expect(taskRepository.archiveTask(taskId, userId)).rejects.toThrow('Task archive failed');
        });
    });
    
    describe('unarchiveTask', () => {
        it('should unarchive the task', async () => {
            // Arrange
            const taskId = '1';
            const userId = 'user123';
            const existingTask: ICosmosTask = {
                id: taskId,
                userId,
                title: 'encrypted(Title)',
                description: 'encrypted(Description)',
                checklist: 'encrypted([])',
                status: 'new',
                dueDate: null,
                createdAt: new Date(),
                modifiedAt: new Date(),
                archivedAt: new Date(),
                deletedAt: null,
            };
            const updatedTask = {
                ...existingTask,
                archivedAt: null,
            };
            const itemMock = {
                read: jest.fn().mockResolvedValue({ resource: existingTask }),
                replace: jest.fn().mockResolvedValue({ resource: updatedTask }),
            };
            containerMock.item.mockReturnValue(itemMock as any);
            
            // Act
            await taskRepository.unarchiveTask(taskId, userId);
            
            // Assert
            expect(containerMock.item).toHaveBeenCalledWith(taskId);
            expect(itemMock.read).toHaveBeenCalled();
            expect(itemMock.replace).toHaveBeenCalledWith(updatedTask);
        });
        
        it('should throw an error when task is not found or userId does not match', async () => {
            // Arrange
            const taskId = '1';
            const userId = 'user123';
            const existingTask: ICosmosTask = {
                id: taskId,
                userId: 'differentUser',
                title: 'encrypted(Title)',
                description: 'encrypted(Description)',
                checklist: 'encrypted([])',
                status: 'new',
                dueDate: null,
                createdAt: new Date(),
                modifiedAt: new Date(),
                archivedAt: new Date(),
                deletedAt: null,
            };
            const itemMock = {
                read: jest.fn().mockResolvedValue({ resource: existingTask }),
            };
            containerMock.item.mockReturnValue(itemMock as any);
            
            // Act & Assert
            await expect(taskRepository.unarchiveTask(taskId, userId)).rejects.toThrow('Task unarchive failed');
        });
    });
    
    describe('updateTaskStatus', () => {
        it('should update the task status and return the updated task', async () => {
            // Arrange
            const taskId = '1';
            const userId = 'user123';
            const status = 'completed';
            const existingTask: ICosmosTask = {
                id: taskId,
                userId,
                title: 'encrypted(Title)',
                description: 'encrypted(Description)',
                checklist: 'encrypted([])',
                status: 'new',
                dueDate: null,
                createdAt: new Date(),
                modifiedAt: new Date(),
                archivedAt: new Date(),
                deletedAt: null,
            };
            const updatedTask = {
                ...existingTask,
                status,
                modifiedAt: expect.any(Date)
            };
            const itemMock = {
                read: jest.fn().mockResolvedValue({ resource: existingTask }),
                replace: jest.fn().mockResolvedValue({ resource: updatedTask }),
            };
            containerMock.item.mockReturnValue(itemMock as any);
            
            // Act
            const result = await taskRepository.updateTaskStatus(taskId, status, userId);
            
            // Assert
            expect(containerMock.item).toHaveBeenCalledWith(taskId);
            expect(itemMock.read).toHaveBeenCalled();
            expect(itemMock.replace).toHaveBeenCalledWith(updatedTask);
            expect(encryptionServiceMock.decrypt).toHaveBeenCalledWith(updatedTask.title);
            expect(encryptionServiceMock.decrypt).toHaveBeenCalledWith(updatedTask.description);
            expect(result).toEqual({
                ...updatedTask,
                title: existingTask.title.replace('encrypted(', '').replace(')', ''),
                description: existingTask.description!.replace('encrypted(', '').replace(')', ''),
                checklist: [],
            });
        });
        
        it('should return null when task is not found or userId does not match', async () => {
            // Arrange
            const taskId = '1';
            const userId = 'user123';
            const status = 'completed';
            const existingTask: ICosmosTask = {
                id: taskId,
                userId: 'differentUser',
                title: 'encrypted(Title)',
                description: 'encrypted(Description)',
                checklist: 'encrypted([])',
                status: 'new',
                dueDate: null,
                createdAt: new Date(),
                modifiedAt: new Date(),
                archivedAt: new Date(),
                deletedAt: null,
            };
            const itemMock = {
                read: jest.fn().mockResolvedValue({ resource: existingTask }),
            };
            containerMock.item.mockReturnValue(itemMock as any);
            
            // Act
            const result = await taskRepository.updateTaskStatus(taskId, status, userId);
            
            // Assert
            expect(result).toBeNull();
        });
        
        it('should handle exceptions during status update', async () => {
            // Arrange
            const taskId = '1';
            const userId = 'user123';
            const status = 'completed';
            const error = new Error('Replace failed');
            const existingTask: ICosmosTask = {
                id: taskId,
                userId,
                title: 'encrypted(Title)',
                description: 'encrypted(Description)',
                checklist: 'encrypted([])',
                status: 'new',
                dueDate: null,
                createdAt: new Date(),
                modifiedAt: new Date(),
                archivedAt: new Date(),
                deletedAt: null,
            };
            const itemMock = {
                read: jest.fn().mockResolvedValue({ resource: existingTask }),
                replace: jest.fn().mockRejectedValue(error),
            };
            containerMock.item.mockReturnValue(itemMock as any);
            
            // Act & Assert
            await expect(taskRepository.updateTaskStatus(taskId, status, userId)).rejects.toThrow('Could not update task status');
        });
    });
    
    describe('bulkCreateTasks', () => {
        it('should create multiple tasks and return them', async () => {
            // Arrange
            const tasks: Partial<Task>[] = [
                {
                    id: 'newId1',
                    userId: 'user123',
                    title: 'Task 1',
                    description: 'Description 1',
                    checklist: [{ id: 'item-1', text: 'Item 1', completed: true }],
                    status: 'new',
                },
                {
                    id: 'newId2',
                    userId: 'user123',
                    title: 'Task 2',
                    description: 'Description 2',
                    checklist: [{ id: 'item-2', text: 'Item 2', completed: false }],
                    status: 'new',
                },
            ];
            
            const encryptedTasks = tasks.map(task => ({
                ...task,
                title: `encrypted(${task.title})`,
                description: `encrypted(${task.description})`,
                checklist: `encrypted(${JSON.stringify(task.checklist)})`,
            }));
            
            const createdTaskResources = encryptedTasks.map(task => ({ resource: task }));
            
            (containerMock.items.create as jest.Mock).mockResolvedValueOnce(createdTaskResources[0]);
            (containerMock.items.create as jest.Mock).mockResolvedValueOnce(createdTaskResources[1]);
            
            // Act
            const result = await taskRepository.bulkCreateTasks(tasks);
            
            // Assert
            expect(encryptionServiceMock.encrypt).toHaveBeenCalledTimes(6); // 2 tasks x 3 fields
            expect(containerMock.items.create).toHaveBeenCalledTimes(2);
            expect(encryptionServiceMock.decrypt).toHaveBeenCalledTimes(6);
            expect(result).toEqual(tasks);
        });
        
        it('should handle exceptions during bulk creation', async () => {
            // Arrange
            const tasks: Partial<Task>[] = [
                {
                    userId: 'user123',
                    title: 'Task 1',
                    description: 'Description 1',
                    checklist: [{ id: 'item-1', text: 'Item 1', completed: false }],
                    status: 'new',
                },
            ];
            const error = new Error('Bulk creation failed');
            (containerMock.items.create as jest.Mock).mockRejectedValue(error);
            
            // Act & Assert
            await expect(taskRepository.bulkCreateTasks(tasks)).rejects.toThrow('Bulk task creation failed.');
        });
    });
});
