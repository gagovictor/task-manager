import SequelizeTask from "@src/models/sequelize/task";
import { Task } from "@src/models/task";
import SequelizeTaskRepository from "@src/repositories/sequelize/taskRepository";
import TaskEncryptionService from "@src/services/taskEncryptionService";

jest.mock('@src/models/sequelize/task');

describe('SequelizeTaskRepository', () => {
  let encryptionServiceMock: jest.Mocked<TaskEncryptionService>;
  let taskRepository: SequelizeTaskRepository;

  beforeEach(() => {
    jest.clearAllMocks();

    encryptionServiceMock = {
      encrypt: jest.fn((value: string) => `encrypted(${value})`),
      decrypt: jest.fn((value: string) =>
        value.replace('encrypted(', '').replace(')', '')
      ),
    } as unknown as jest.Mocked<TaskEncryptionService>;

    taskRepository = new SequelizeTaskRepository(encryptionServiceMock);
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

      const createMock = jest.fn().mockResolvedValue({
        get: jest.fn().mockReturnValue(encryptedTaskData),
        ...encryptedTaskData,
      });
      (SequelizeTask.create as jest.Mock) = createMock;

      // Act
      const result = await taskRepository.createTask(taskData);

      // Assert
      expect(encryptionServiceMock.encrypt).toHaveBeenCalledWith(
        taskData.title
      );
      expect(encryptionServiceMock.encrypt).toHaveBeenCalledWith(
        taskData.description
      );
      expect(encryptionServiceMock.encrypt).toHaveBeenCalledWith(
        JSON.stringify(taskData.checklist)
      );
      expect(SequelizeTask.create).toHaveBeenCalledWith(encryptedTaskData);
      expect(encryptionServiceMock.decrypt).toHaveBeenCalledTimes(3);
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
        dueDate: new Date(),
        createdAt: new Date(),
        modifiedAt: new Date(),
        archivedAt: null,
        deletedAt: null,
      };

      const error = new Error('Creation failed');
      (SequelizeTask.create as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(taskRepository.createTask(taskData)).rejects.toThrow(
        'Task creation failed'
      );
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
          get: jest.fn().mockReturnValue({}),
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
          get: jest.fn().mockReturnValue({}),
        },
      ];

      (SequelizeTask.findAll as jest.Mock).mockResolvedValue(encryptedTasks);

      // Act
      const result = await taskRepository.getTasksByUser(userId);

      // Assert
      expect(SequelizeTask.findAll).toHaveBeenCalledWith({
        where: { userId, deletedAt: null },
      });
      expect(encryptionServiceMock.decrypt).toHaveBeenCalledTimes(6);
      expect(result).toEqual(
        encryptedTasks.map((task) => ({
          ...task.get(),
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
      (SequelizeTask.findAll as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(taskRepository.getTasksByUser(userId)).rejects.toThrow(
        'Failed to fetch tasks'
      );
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

      const existingTask = {
        id,
        userId: 'user123',
        title: 'encrypted(Old Title)',
        description: 'encrypted(Old Description)',
        checklist: 'encrypted([])',
        status: 'new',
        dueDate: new Date(),
        createdAt: new Date(),
        modifiedAt: new Date(),
        archivedAt: null,
        deletedAt: null,
        get: jest.fn().mockReturnValue({}),
        update: jest.fn().mockResolvedValue(undefined),
      };

      (SequelizeTask.findOne as jest.Mock).mockResolvedValue(existingTask);

      // Act
      const result = await taskRepository.updateTask(id, updates);

      // Assert
      expect(SequelizeTask.findOne).toHaveBeenCalledWith({
        where: { id, deletedAt: null },
      });
      expect(encryptionServiceMock.encrypt).toHaveBeenCalledWith(updates.title);
      expect(encryptionServiceMock.encrypt).toHaveBeenCalledWith(
        updates.description
      );
      expect(existingTask.update).toHaveBeenCalledWith(
        expect.objectContaining(encryptedUpdates)
      );
      expect(encryptionServiceMock.decrypt).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        ...existingTask.get(),
        title: updates.title,
        description: updates.description,
        checklist: [],
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
      (SequelizeTask.findOne as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(taskRepository.updateTask(id, updates)).rejects.toThrow(
        'Task update failed'
      );
    });

    it('should handle exceptions during update', async () => {
      // Arrange
      const id = '1';
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
      const error = new Error('Update failed');

      (SequelizeTask.findOne as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(taskRepository.updateTask(id, updates)).rejects.toThrow(
        'Task update failed'
      );
    });
  });

  describe('deleteTask', () => {
    it('should delete the task', async () => {
      // Arrange
      const id = '1';
      const userId = 'user123';
      const existingTask = {
        id,
        userId,
        deletedAt: null,
        update: jest.fn().mockResolvedValue(undefined),
      };

      (SequelizeTask.findOne as jest.Mock).mockResolvedValue(existingTask);

      // Act
      await taskRepository.deleteTask(id, userId);

      // Assert
      expect(SequelizeTask.findOne).toHaveBeenCalledWith({
        where: { id, userId, deletedAt: null },
      });
      expect(existingTask.update).toHaveBeenCalledWith({
        deletedAt: expect.any(Date),
      });
    });

    it('should throw an error when task is not found', async () => {
      // Arrange
      const id = 'nonexistent';
      const userId = 'user123';
      (SequelizeTask.findOne as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(taskRepository.deleteTask(id, userId)).rejects.toThrow(
        'Task deletion failed'
      );
    });
  });

  describe('archiveTask', () => {
    it('should archive the task', async () => {
      // Arrange
      const id = '1';
      const userId = 'user123';
      const existingTask = {
        id,
        userId,
        archivedAt: null,
        deletedAt: null,
        update: jest.fn().mockResolvedValue(undefined),
      };

      (SequelizeTask.findOne as jest.Mock).mockResolvedValue(existingTask);

      // Act
      await taskRepository.archiveTask(id, userId);

      // Assert
      expect(SequelizeTask.findOne).toHaveBeenCalledWith({
        where: { id, userId, deletedAt: null },
      });
      expect(existingTask.update).toHaveBeenCalledWith({
        archivedAt: expect.any(Date),
      });
    });

    it('should throw an error when task is not found', async () => {
      // Arrange
      const id = 'nonexistent';
      const userId = 'user123';
      (SequelizeTask.findOne as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(taskRepository.archiveTask(id, userId)).rejects.toThrow(
        'Task archive failed'
      );
    });
  });

  describe('unarchiveTask', () => {
    it('should unarchive the task', async () => {
      // Arrange
      const id = '1';
      const userId = 'user123';
      const existingTask = {
        id,
        userId,
        archivedAt: new Date(),
        deletedAt: null,
        update: jest.fn().mockResolvedValue(undefined),
      };

      (SequelizeTask.findOne as jest.Mock).mockResolvedValue(existingTask);

      // Act
      await taskRepository.unarchiveTask(id, userId);

      // Assert
      expect(SequelizeTask.findOne).toHaveBeenCalledWith({
        where: { id, userId, deletedAt: null },
      });
      expect(existingTask.update).toHaveBeenCalledWith({ archivedAt: null });
    });

    it('should throw an error when task is not found', async () => {
      // Arrange
      const id = 'nonexistent';
      const userId = 'user123';
      (SequelizeTask.findOne as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(taskRepository.unarchiveTask(id, userId)).rejects.toThrow(
        'Task unarchive failed'
      );
    });
  });

  describe('updateTaskStatus', () => {
    it('should update the task status and return the updated task', async () => {
      // Arrange
      const taskId = '1';
      const userId = 'user123';
      const status = 'completed';
    
      const existingTask = {
        id: taskId,
        userId,
        status: 'new',
        title: 'encrypted(Title)',
        description: 'encrypted(Description)',
        checklist: 'encrypted([])',
        get: jest.fn().mockReturnValue({
          id: taskId,
          userId,
          status: 'completed',
          title: 'encrypted(Title)',
          description: 'encrypted(Description)',
          checklist: 'encrypted([])',
        }),
        save: jest.fn().mockResolvedValue(undefined),
      };
    
      (SequelizeTask.findOne as jest.Mock).mockResolvedValue(existingTask);
    
      // Mock decryption service
      encryptionServiceMock.decrypt.mockImplementation((value: string) => {
        if (value === 'encrypted(Title)') return 'Title';
        if (value === 'encrypted(Description)') return 'Description';
        if (value === 'encrypted([])') return '[]';
        return ''; // Ensure it always returns a string
      });
    
      // Act
      const result = await taskRepository.updateTaskStatus(
        taskId,
        status,
        userId
      );
    
      // Assert
      expect(SequelizeTask.findOne).toHaveBeenCalledWith({
        where: { id: taskId, userId },
      });
      expect(existingTask.save).toHaveBeenCalled();
      expect(encryptionServiceMock.decrypt).toHaveBeenCalledTimes(3); // Decrypts title, description, and checklist
      console.log(`result`, result);
      expect(result).toEqual({
        id: taskId,
        userId,
        status, // Updated status
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

      (SequelizeTask.findOne as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await taskRepository.updateTaskStatus(
        taskId,
        status,
        userId
      );

      // Assert
      expect(result).toBeNull();
    });

    it('should handle exceptions during status update', async () => {
      // Arrange
      const taskId = '1';
      const userId = 'user123';
      const status = 'completed';
      const error = new Error('Update failed');

      (SequelizeTask.findOne as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(
        taskRepository.updateTaskStatus(taskId, status, userId)
      ).rejects.toThrow('Could not update task status');
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

      (SequelizeTask.bulkCreate as jest.Mock).mockResolvedValue(createdTasks);

      // Act
      const result = await taskRepository.bulkCreateTasks(tasks);

      // Assert
      expect(encryptionServiceMock.encrypt).toHaveBeenCalledTimes(6);
      expect(SequelizeTask.bulkCreate).toHaveBeenCalledWith(encryptedTasks, {
        returning: true,
      });
      expect(encryptionServiceMock.decrypt).toHaveBeenCalledTimes(6);
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
      const error = new Error('Bulk creation failed');

      (SequelizeTask.bulkCreate as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(taskRepository.bulkCreateTasks(tasks)).rejects.toThrow(
        'Bulk task creation failed.'
      );
    });
  });
});
