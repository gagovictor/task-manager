import { Response } from 'express';
import { TaskFilter } from '@src/models/pagination';
import { AuthenticatedRequest } from '@src/middlewares/auth';
import { CreateTaskRequestBody, UpdateTaskRequestBody, UpdateTaskStatusRequestBody } from '@src/models/task';
import TaskService from '@src/services/TaskService';

export default class TaskController {
  private TaskService: TaskService;

  constructor(TaskService: TaskService) {
    this.TaskService = TaskService;
  }

  public createTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { title, description, checklist, dueDate, status } = req.body as CreateTaskRequestBody;
    // TODO validate request payload

    try {
      const task = await this.TaskService.createTask({ title, description, checklist, dueDate, status, userId: req.user!.id });
      res.status(201).json(task);
    } catch (error) {
      console.error('Task creation error:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  };

  public getTasks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
      const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 10;
      
      const archivedParam = req.query.archived as string | undefined;
      const statusParam = req.query.status as string | undefined;
  
      let filter: TaskFilter = {};
  
      if (archivedParam !== undefined) {
        if (archivedParam.toLowerCase() === 'true') {
          filter.archived = true;
        } else if (archivedParam.toLowerCase() === 'false') {
          filter.archived = false;
        } else {
          res.status(400).json({ error: "'archived' query parameter must be 'true' or 'false'." });
          return;
        }
      }
  
      if (statusParam) {
        filter.status = statusParam;
      }
  
      const paginatedTasks = await this.TaskService.getTasksByUser(req.user!.id, page, limit, filter);
      res.status(200).json(paginatedTasks);
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
      const task = await this.TaskService.updateTask(id, { title, description, checklist, dueDate, status, userId: req.user!.id });
      res.status(200).json(task);
    } catch (error) {
      console.error('Task update error:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  };

  public deleteTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      await this.TaskService.deleteTask(id, req.user!.id);
      res.status(204).json();
    } catch (error) {
      console.error('Task deletion error:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  };

  public archiveTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      await this.TaskService.archiveTask(id, req.user!.id);
      res.status(204).json();
    } catch (error) {
      console.error('Task archive error:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  };

  public unarchiveTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      await this.TaskService.unarchiveTask(id, req.user!.id);
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
      const updatedTask = await this.TaskService.updateTaskStatus(id, status, req.user!.id);
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
      const importedTasks = await this.TaskService.bulkImportTasks(tasks, req.user!.id);
      res.status(201).json(importedTasks);
    } catch (error) {
      console.error('Bulk import error:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  };
}
