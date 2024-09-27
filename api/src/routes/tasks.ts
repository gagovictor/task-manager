import { Request, Response, NextFunction, Router } from 'express';
import Container from '../config/container';

const createTaskRouter = (): Router => {
  const router = Router();

  /**
   * @swagger
   * components:
   *   schemas:
   *     Task:
   *       type: object
   *       required:
   *         - title
   *       properties:
   *         id:
   *           type: string
   *           description: The auto-generated ID of the task
   *         title:
   *           type: string
   *           description: The title of the task
   *         description:
   *           type: string
   *           description: The description of the task
   *         status:
   *           type: string
   *           description: The status of the task
   *           enum: [pending, in-progress, completed]
   *       example:
   *         id: 60c72b2f5f1b2c001c9d2f1a
   *         title: Learn Swagger
   *         description: Understand how to use Swagger to document an API
   *         status: pending
   */

  /**
   * @swagger
   * tags:
   *   name: Tasks
   *   description: Task management
   */

  /**
   * @swagger
   * /tasks:
   *   get:
   *     summary: Returns a list of tasks
   *     tags: [Tasks]
   *     responses:
   *       200:
   *         description: A list of tasks
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Task'
   */
  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const taskController = await Container.getTaskController();
      await taskController.getTasks(req, res);
    } catch (error) {
      next(error);
    }
  });

  /**
   * @swagger
   * /tasks/{id}:
   *   get:
   *     summary: Get a task by ID
   *     tags: [Tasks]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: The task ID
   *     responses:
   *       200:
   *         description: The task description by ID
   *         contents:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Task'
   *       404:
   *         description: Task not found
   */
//   router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
//     try {
      // const taskController = await Container.getTaskController();
//       await taskController.getTaskById(req, res);
//     } catch (error) {
//       next(error);
//     }
//   });

  /**
   * @swagger
   * /tasks:
   *   post:
   *     summary: Create a new task
   *     tags: [Tasks]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Task'
   *     responses:
   *       201:
   *         description: The task was successfully created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Task'
   *       400:
   *         description: Bad request
   */
  router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const taskController = await Container.getTaskController();
      await taskController.createTask(req, res);
    } catch (error) {
      next(error);
    }
  });

  /**
   * @swagger
   * /tasks/{id}:
   *   patch:
   *     summary: Update a task by ID
   *     tags: [Tasks]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: The task ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Task'
   *     responses:
   *       200:
   *         description: The task was updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Task'
   *       400:
   *         description: Bad request
   *       404:
   *         description: Task not found
   */
  router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const taskController = await Container.getTaskController();
      await taskController.updateTask(req, res);
    } catch (error) {
      next(error);
    }
  });

  /**
   * @swagger
   * /tasks/{id}:
   *   delete:
   *     summary: Delete a task by ID
   *     tags: [Tasks]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: The task ID
   *     responses:
   *       204:
   *         description: Task deleted successfully
   *       404:
   *         description: Task not found
   */
  router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const taskController = await Container.getTaskController();
      await taskController.deleteTask(req, res);
    } catch (error) {
      next(error);
    }
  });

  /**
   * @swagger
   * /tasks/{id}/archive:
   *   post:
   *     summary: Archive a task by ID
   *     tags: [Tasks]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: The task ID
   *     responses:
   *       204:
   *         description: Task archived successfully
   *       404:
   *         description: Task not found
   */
  router.post('/:id/archive', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const taskController = await Container.getTaskController();
      await taskController.archiveTask(req, res);
    } catch (error) {
      next(error);
    }
  });

  /**
   * @swagger
   * /tasks/{id}/unarchive:
   *   post:
   *     summary: Unarchive a task by ID
   *     tags: [Tasks]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: The task ID
   *     responses:
   *       204:
   *         description: Task unarchived successfully
   *       404:
   *         description: Task not found
   */
  router.post('/:id/unarchive', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const taskController = await Container.getTaskController();
      await taskController.unarchiveTask(req, res);
    } catch (error) {
      next(error);
    }
  });

  /**
   * @swagger
   * /tasks/{id}/status:
   *   post:
   *     summary: Update the status of a task by ID
   *     tags: [Tasks]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: The task ID
   *       - in: body
   *         name: status
   *         schema:
   *           type: object
   *           properties:
   *             status:
   *               type: string
   *               description: The new status of the task
   *         required: true
   *         description: The new status to be set for the task
   *     responses:
   *       200:
   *         description: Task status updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Task'
   *       404:
   *         description: Task not found
   *       401:
   *         description: User not authenticated
   */
  router.post('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const taskController = await Container.getTaskController();
      await taskController.updateTaskStatus(req, res);
    } catch (error) {
      next(error);
    }
  });

  /**
   * Bulk import tasks.
   * Expects an array of tasks in the request body.
   */
  router.post('/bulk-import', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const taskController = await Container.getTaskController();
      await taskController.bulkImportTasks(req, res);
    } catch (error) {
      next(error);
    }
  });
  
  return router;
};

export default createTaskRouter;
