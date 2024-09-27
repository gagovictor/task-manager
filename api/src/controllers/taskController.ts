import { Response } from 'express';
import TaskService from '../services/taskService';
import { AuthenticatedRequest } from '../middlewares/auth';
import { CreateTaskRequestBody, Task, UpdateTaskRequestBody, UpdateTaskStatusRequestBody } from '../models/task';

export default class TaskController {
  private taskService: TaskService;

  constructor(taskService: TaskService) {
    this.taskService = taskService;
  }

  public createTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { title, description, checklist, dueDate, status } = req.body as CreateTaskRequestBody;
    // TODO validate request payload

    try {
      const task = await this.taskService.createTask({ title, description, checklist, dueDate, status, userId: req.user!.id });
      res.status(201).json(task);
    } catch (error) {
      console.error('Task creation error:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  };

  public getTasks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const tasks = await this.taskService.getTasksByUser(req.user!.id);
      res.status(200).json(tasks);
    } catch (error) {
      console.error('Fetching tasks error:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  };

  public updateTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { title, description, checklist, dueDate, status } = req.body as UpdateTaskRequestBody;
    // TODO validate request payload

    try {
      const task = await this.taskService.updateTask(id, { title, description, checklist, dueDate, status, userId: req.user!.id });
      res.status(200).json(task);
    } catch (error) {
      console.error('Task update error:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  };

  public deleteTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      await this.taskService.deleteTask(id, req.user!.id);
      res.status(204).json();
    } catch (error) {
      console.error('Task deletion error:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  };

  public archiveTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      await this.taskService.archiveTask(id, req.user!.id);
      res.status(204).json();
    } catch (error) {
      console.error('Task archive error:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  };

  public unarchiveTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      await this.taskService.unarchiveTask(id, req.user!.id);
      res.status(204).json();
    } catch (error) {
      console.error('Task unarchive error:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  };

  public updateTaskStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status } = req.body as UpdateTaskStatusRequestBody;

    try {
      const updatedTask = await this.taskService.updateTaskStatus(id, status, req.user!.id);
      if (!updatedTask) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }
      res.status(200).json(updatedTask);
    } catch (error) {
      console.error('Task status update error:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  };

  public bulkImportTasks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const tasks: CreateTaskRequestBody[] = req.body;

    if (!Array.isArray(tasks)) {
      res.status(400).json({ error: 'Request body must be an array of tasks.' });
      return;
    }

    try {
      const importedTasks = await this.taskService.bulkImportTasks(tasks, req.user!.id);
      res.status(201).json(importedTasks);
    } catch (error) {
      console.error('Bulk import error:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  };
}
