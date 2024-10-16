import { MongooseTask } from "@src/models/mongoose/task";
import { Task } from "@src/models/task";
import MongooseTaskRepository from "@src/repositories/mongoose/taskRepository";
import TaskEncryptionService from "@src/services/TaskEncryptionService";
import { TaskFilter, PaginatedResponse } from '@src/models/pagination';

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

  const mockMongooseFind = (resolvedValue: any) => ({
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(resolvedValue),
  });
  
  const mockMongooseCountDocuments = (count: number) => ({
    exec: jest.fn().mockResolvedValue(count),
  });

  describe('getTasksByUser', () => {
    it('should retrieve active tasks for a user without filters', async () => {
      const userId = 'user123';
      const page = 1;
      const limit = 10;
      const filter: TaskFilter = {};

      const encryptedTasks = [
        {
          id: '1',
          userId,
          title: 'encrypted(Task 1)',
          description: 'encrypted(Description 1)',
          checklist: null,
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
          checklist: null,
          status: 'completed',
          dueDate: new Date(),
          createdAt: new Date(),
          modifiedAt: new Date(),
          archivedAt: null,
          deletedAt: null,
        },
      ];

      const totalItems = 2;

      (MongooseTask.countDocuments as jest.Mock).mockReturnValue(
        mockMongooseCountDocuments(totalItems)
      );

      (MongooseTask.find as jest.Mock).mockReturnValue(mockMongooseFind(encryptedTasks));
      encryptionServiceMock.decrypt.mockImplementation((value: string) => value.replace('encrypted(', '').replace(')', ''))
    
      const result: PaginatedResponse<Task> = await taskRepository.getTasksByUser(userId, page, limit, filter);

      // Assertions
      expect(MongooseTask.find).toHaveBeenCalledWith({
        userId,
        deletedAt: null,
        archivedAt: null,
      });
      expect(MongooseTask.find().sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(MongooseTask.find().skip).toHaveBeenCalledWith((page - 1) * limit);
      expect(MongooseTask.find().limit).toHaveBeenCalledWith(limit);
      expect(MongooseTask.countDocuments).toHaveBeenCalledWith({
        userId,
        deletedAt: null,
        archivedAt: null,
      });
      expect(encryptionServiceMock.decrypt).toHaveBeenCalledTimes(4); // 2 fields per task * 2 tasks

      expect(result).toEqual({
        items: encryptedTasks.map(task => ({
          ...task,
          title: `Task ${task.id}`,
          description: `Description ${task.id}`,
          checklist: [], // Decrypted checklist
        })),
        totalItems,
        totalPages: 1,
        currentPage: 1,
      });
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
        title: 'Updated Title',
        description: 'Updated Description',
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
        title: 'Title',
        description: 'Description',
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
