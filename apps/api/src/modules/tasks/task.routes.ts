import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler';
import { authenticate } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validate';
import { createNewTask, editTask, getTask, getTasks, removeTask } from './task.controller';
import { createTaskSchema, taskIdSchema, updateTaskSchema } from './task.schemas';

export const taskRouter = Router();

taskRouter.use(authenticate);
taskRouter.get('/', asyncHandler(getTasks));
taskRouter.post('/', validateRequest(createTaskSchema), asyncHandler(createNewTask));
taskRouter.get('/:id', validateRequest(taskIdSchema), asyncHandler(getTask));
taskRouter.patch('/:id', validateRequest(updateTaskSchema), asyncHandler(editTask));
taskRouter.delete('/:id', validateRequest(taskIdSchema), asyncHandler(removeTask));
