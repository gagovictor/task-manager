const express = require('express');
const { swaggerUi, swaggerSpec } = require('./swagger');
const sequelize = require('./config/db');
const morgan = require('morgan');
const logger = require('./config/logger');

const publicRouter = require('./routes/public');
const protectedRouter = require('./routes/protected');

const app = express();

// Middleware setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.json());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Public routes (no authentication)
app.use(publicRouter);

// Protected routes (authentication required)
app.use(protectedRouter);

// Sync database and start server
sequelize.sync()
  .then(() => console.log('Database & tables created!'))
  .catch(err => console.error('Unable to connect to the database:', err));

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
