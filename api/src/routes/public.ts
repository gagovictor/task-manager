import express from 'express';
import createAuthRouter from './auth';

const getPublicRouter = async () => {
    const publicRouter = express.Router();
    
    publicRouter.use('/', await createAuthRouter());

    return publicRouter;    
};

export default getPublicRouter;