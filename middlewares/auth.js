const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findByPk(decoded.id);
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized - user not found' });
      }
      next();
    } catch (err) {
      console.error('Error verifying token:', err);
      res.status(401).json({ error: 'Unauthorized' });
    }
  } else {
    res.status(401).json({ error: 'No token provided' });
  }
};

module.exports = authMiddleware;
