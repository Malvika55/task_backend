import type { NextFunction, Request, Response } from 'express';
import { Role } from '@prisma/client';
import { ApiError } from '../lib/apiError';
import { verifyAuthToken } from '../lib/jwt';

const readToken = (req: Request) => {
  const authorization = req.headers.authorization;

  if (authorization?.startsWith('Bearer ')) {
    return authorization.slice(7);
  }

  return req.cookies?.access_token as string | undefined;
};

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const token = readToken(req);

  if (!token) {
    return next(new ApiError(401, 'Authentication required'));
  }

  try {
    req.auth = verifyAuthToken(token);
    return next();
  } catch {
    return next(new ApiError(401, 'Invalid or expired token'));
  }
};

export const authorizeRole = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      return next(new ApiError(401, 'Authentication required'));
    }

    if (!roles.includes(req.auth.role as Role)) {
      return next(new ApiError(403, 'You do not have access to this resource'));
    }

    return next();
  };
};
