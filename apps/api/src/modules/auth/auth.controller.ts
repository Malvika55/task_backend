import type { Request, Response } from 'express';
import { Role } from '@prisma/client';
import { env } from '../../config/env';
import { prisma } from '../../config/prisma';
import { ApiError } from '../../lib/apiError';
import { comparePassword, hashPassword } from '../../lib/password';
import { signAuthToken } from '../../lib/jwt';

const authCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: env.NODE_ENV === 'production',
  path: '/',
};

const toPublicUser = (user: { id: string; name: string; email: string; role: Role; createdAt: Date }) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body as { name: string; email: string; password: string };
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
    },
  });

  const token = signAuthToken({ id: user.id, email: user.email, role: user.role });
  res.cookie('access_token', token, authCookieOptions);

  return res.status(201).json({
    message: 'Registration successful',
    user: toPublicUser(user),
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const passwordMatches = await comparePassword(password, user.passwordHash);

  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = signAuthToken({ id: user.id, email: user.email, role: user.role });
  res.cookie('access_token', token, authCookieOptions);

  return res.json({
    message: 'Login successful',
    user: toPublicUser(user),
  });
};

export const me = async (req: Request, res: Response) => {
  if (!req.auth) {
    throw new ApiError(401, 'Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { id: req.auth.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: { tasks: true },
      },
    },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return res.json({ user });
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie('access_token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    path: '/',
  });

  return res.json({ message: 'Logged out successfully' });
};
