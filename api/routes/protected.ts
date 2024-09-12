import express from 'express';
import authMiddleware from '../middlewares/auth';
import createTaskRouter from './tasks';

const protectedRouter = express.Router();

protectedRouter.use(authMiddleware);

protectedRouter.use('/tasks', createTaskRouter());

export default protectedRouter;
