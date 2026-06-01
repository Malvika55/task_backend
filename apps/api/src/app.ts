import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { authRouter } from './modules/auth/auth.routes';
import { taskRouter } from './modules/tasks/task.routes';
import { userRouter } from './modules/users/users.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { openApiSpec } from './docs/openapi';

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(morgan('dev'));
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 200 }));

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'task-platform-api' });
  });

  app.get('/api/v1/status', (_req, res) => {
    const url = process.env.DATABASE_URL ?? 'unknown';
    const db = url.startsWith('file:') ? 'sqlite' : url.startsWith('postgres') ? 'postgres' : 'unknown';
    res.json({ ok: true, db, url: url.startsWith('file:') ? url : undefined });
  });

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
  app.get('/api/openapi.json', (_req, res) => res.json(openApiSpec));

  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/tasks', taskRouter);
  app.use('/api/v1/users', userRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
