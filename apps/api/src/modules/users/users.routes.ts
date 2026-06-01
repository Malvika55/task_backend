import { Role } from '@prisma/client';
import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler';
import { authenticate, authorizeRole } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validate';
import { changeUserRole, getUsers } from './users.controller';
import { roleUpdateSchema } from './users.schemas';

export const userRouter = Router();

userRouter.use(authenticate, authorizeRole(Role.ADMIN));
userRouter.get('/', asyncHandler(getUsers));
userRouter.patch('/:id/role', validateRequest(roleUpdateSchema), asyncHandler(changeUserRole));
