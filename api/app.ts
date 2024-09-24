
import express, { Application } from 'express';
import cors, { CorsOptions } from 'cors';
import { swaggerUi, swaggerSpec } from './src/config/swagger';
import morgan from 'morgan';
import logger from './src/config/logger';
import DatabaseConnection from './src/config/db';
import getPublicRouter from './src/routes/public';
import getProtectedRouter from './src/routes/protected';
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
const dbConnection: DatabaseConnection = DatabaseConnection.getInstance();

dbConnection.connectToDatabase().then(async () => {
  const port = process.env.PORT || 8080;

  // Init API Routes
  app.use(await getPublicRouter());
  app.use(await getProtectedRouter());

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}).catch((error: any) => {
  console.error('Failed to connect to the database:', error);
});