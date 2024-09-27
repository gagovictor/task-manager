import express from 'express';
import authMiddleware from '../middlewares/auth';
import createTaskRouter from './tasks';
import Container from '../config/container';

const getProtectedRouter = async () => {
    const protectedRouter = express.Router();
    
    protectedRouter.use(authMiddleware(await Container.getUserRepository()));
    
    protectedRouter.use('/tasks', createTaskRouter());
    
    return protectedRouter;
}

export default getProtectedRouter;