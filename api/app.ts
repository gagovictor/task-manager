
import express, { Application } from 'express';
import cors, { CorsOptions } from 'cors';
import { swaggerUi, swaggerSpec } from './config/swagger';
import morgan from 'morgan';
import logger from './config/logger';
import { connectToDatabase } from './config/db';
import getPublicRouter from './routes/public';
import getProtectedRouter from './routes/protected';
const app: Application = express();

// CORS configuration
const corsOptions: CorsOptions = {
  origin: process.env.CORS_ALLOWED_ORIGINS,
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

// Connect to database and start server
connectToDatabase().then(() => {
  const port = process.env.PORT || 8080;

  // Init API Routes
  app.use(getPublicRouter());
  app.use(getProtectedRouter());

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}).catch((error) => {
  console.error('Failed to connect to the database:', error);
});