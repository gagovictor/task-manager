require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authMiddleware = async (req, res, next) => {
  console.log(req.headers.authorization);
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    console.error('No authorization token provided');
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findByPk(decoded.userId);
    if (!req.user) {
      console.error('User not found for userId:', decoded.id);
      return res.status(401).json({ error: 'Unauthorized - user not found' });
    }
    
    console.log('User found:', req.user);
    next();
  } catch (err) {
    console.error('Error verifying token:', err.message);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

module.exports = authMiddleware;
