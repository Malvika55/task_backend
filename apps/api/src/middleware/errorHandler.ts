import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../lib/apiError';

export const notFoundHandler = (_req: Request, _res: Response, next: NextFunction) => {
  next(new ApiError(404, 'Route not found'));
};

export const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ZodError) {
    const fieldErrors = error.flatten().fieldErrors;
    const firstMessage =
      Object.values(fieldErrors)
        .flat()
        .find((msg): msg is string => typeof msg === 'string') ?? 'Validation failed';

    return res.status(400).json({
      message: firstMessage,
      errors: fieldErrors,
    });
  }

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      message: error.message,
      details: error.details,
    });
  }

  console.error(error);
  return res.status(500).json({ message: 'Internal server error' });
};
