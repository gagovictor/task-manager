import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import IUserRepository from '@src/abstractions/repositories/IUserRepository';
import { User } from '@src/models/user';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

interface JwtPayload {
  userId: string;
}

const authMiddleware = (userRepository: IUserRepository) => async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    console.error('No authorization token provided');
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await userRepository.findById(decoded.userId);

    if (!user) {
      console.error('User not found for userId:', decoded.userId);
      return res.status(401).json({ error: 'Unauthorized - user not found' });
    }

    req.user = user;

    next();
  } catch (err) {
    console.error('Error verifying token:', (err as Error).message);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

export default authMiddleware;
