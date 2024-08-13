const taskService = require('../services/taskService');

exports.createTask = async (req, res) => {
  const { title, description, dueDate, status } = req.body;
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const task = await taskService.createTask({ title, description, dueDate, status, userId: req.user.id });
    res.status(201).json(task);
  } catch (error) {
    console.error('Task creation error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const tasks = await taskService.getTasksByUser(req.user.id);
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Fetching tasks error:', error);
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
    const task = await taskService.updateTask(id, { title, description, dueDate, status, userId: req.user.id });
    res.status(200).json(task);
  } catch (error) {
    console.error('Task update error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    await taskService.deleteTask(id, req.user.id);
    res.status(204).json();
  } catch (error) {
    console.error('Task deletion error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.archiveTask = async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    await taskService.archiveTask(id, req.user.id);
    res.status(204).json();
  } catch (error) {
    console.error('Task archive error:', error);
    res.status(500).json({ error: error.message });
  }
};


exports.unarchiveTask = async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    await taskService.unarchiveTask(id, req.user.id);
    res.status(204).json();
  } catch (error) {
    console.error('Task unarchive error:', error);
    res.status(500).json({ error: error.message });
  }
};
