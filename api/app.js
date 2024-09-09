const express = require('express');
const cors = require('cors'); // Import the cors package
const { swaggerUi, swaggerSpec } = require('./swagger');
const sequelize = require('./config/db');
const morgan = require('morgan');
const logger = require('./config/logger');

const publicRouter = require('./routes/public');
const protectedRouter = require('./routes/protected');

const app = express();

// CORS configuration
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
? process.env.CORS_ALLOWED_ORIGINS.split(',')
: [];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Allow specific methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
};

// Middleware setup
app.use(cors(corsOptions)); // Use the CORS middleware
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

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
