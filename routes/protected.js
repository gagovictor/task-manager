const express = require('express');
const authMiddleware = require('../middlewares/auth');

const protectedRouter = express.Router();

protectedRouter.use(authMiddleware);

protectedRouter.use('/tasks', require('./tasks'));

module.exports = protectedRouter;
