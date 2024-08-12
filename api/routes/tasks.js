const express = require('express');
const Task = require('../models/task'); // Ensure this path is correct
const router = express.Router();

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
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.findAll({ where: { userId: req.user.id } });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (task) {
      res.status(200).json(task);
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
router.post('/', async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    const task = await Task.create({ title, description, dueDate, userId: req.user.id });
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
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
router.patch('/:id', async (req, res) => {
  try {
    const { title, description, dueDate, status } = req.body;
    const task = await Task.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    await task.update({ title, description, dueDate, status });
    res.status(200).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
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
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    await task.destroy();
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
