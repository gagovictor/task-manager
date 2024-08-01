const Task = require('../models/task');

exports.createTask = async ({ title, description, dueDate, userId }) => {
  try {
    const task = await Task.create({ title, description, dueDate, userId });
    return task;
  } catch (error) {
    console.error('Task creation error:', error);
    throw new Error('Task creation failed');
  }
};

exports.getTasksByUser = async (userId) => {
  try {
    const tasks = await Task.findAll({ where: { userId } });
    return tasks;
  } catch (error) {
    console.error('Fetching tasks error:', error);
    throw new Error('Failed to fetch tasks');
  }
};

exports.updateTask = async (id, { title, description, dueDate, status, userId }) => {
  try {
    const task = await Task.findOne({ where: { id, userId } });
    if (!task) throw new Error('Task not found');
    await task.update({ title, description, dueDate, status });
    return task;
  } catch (error) {
    console.error('Task update error:', error);
    throw new Error('Task update failed');
  }
};

exports.deleteTask = async (id, userId) => {
  try {
    const task = await Task.findOne({ where: { id, userId } });
    if (!task) throw new Error('Task not found');
    await task.destroy();
  } catch (error) {
    console.error('Task deletion error:', error);
    throw new Error('Task deletion failed');
  }
};
