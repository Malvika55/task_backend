import { z } from 'zod';

const statusValues = ['TODO', 'IN_PROGRESS', 'DONE'] as const;
const priorityValues = ['LOW', 'MEDIUM', 'HIGH'] as const;

const taskBodySchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
  status: z.enum(statusValues).optional(),
  priority: z.enum(priorityValues).optional(),
});

export const createTaskSchema = {
  body: taskBodySchema,
};

export const updateTaskSchema = {
  params: z.object({
    id: z.string().min(1),
  }),
  body: taskBodySchema.partial(),
};

export const taskIdSchema = {
  params: z.object({
    id: z.string().min(1),
  }),
};
