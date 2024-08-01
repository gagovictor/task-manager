const Task = require('../models/task');

exports.createTask = async (req, res) => {
  const { title, description, dueDate } = req.body;
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const task = await Task.create({ title, description, dueDate, userId: req.user.id });
    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const tasks = await Task.findAll({ where: { userId: req.user.id } });
    res.status(200).json({ tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, dueDate, status } = req.body;
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const task = await Task.findOne({ where: { id, userId: req.user.id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    await task.update({ title, description, dueDate, status });
    res.status(200).json({ message: 'Task updated successfully', task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const task = await Task.findOne({ where: { id, userId: req.user.id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    await task.destroy();
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
