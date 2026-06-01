import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler';
import { authenticate } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validate';
import { loginSchema, registerSchema } from './auth.schemas';
import { login, logout, me, register } from './auth.controller';

export const authRouter = Router();

authRouter.post('/register', validateRequest(registerSchema), asyncHandler(register));
authRouter.post('/login', validateRequest(loginSchema), asyncHandler(login));
authRouter.get('/me', authenticate, asyncHandler(me));
authRouter.post('/logout', authenticate, asyncHandler(logout));
