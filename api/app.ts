import 'dotenv/config';
import express, { Application } from 'express';
import cors, { CorsOptions } from 'cors';
import { swaggerUi, swaggerSpec } from './config/swagger';
import sequelize from './config/db';
import morgan from 'morgan';
import logger from './config/logger';
import publicRouter from './routes/public';
import protectedRouter from './routes/protected';

const app: Application = express();

// CORS configuration
const corsOptions: CorsOptions = {
  origin: process.env.CORS_ALLOWED_ORIGINS || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware setup
app.use(cors(corsOptions));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.json());
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}));

// API Routes
app.use(publicRouter);
app.use(protectedRouter);

// Sync database and start server
async function connectToDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful.');

    sequelize.sync()
      .then(() => console.log('Database & tables created!'))
      .catch(err => console.error('Unable to connect to the database:', err));
  } catch (err) {
    console.error('Unable to connect to the database:', err);
  }
}

connectToDatabase();

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});