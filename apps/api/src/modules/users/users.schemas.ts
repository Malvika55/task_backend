import { z } from 'zod';

const roleValues = ['USER', 'ADMIN'] as const;

export const roleUpdateSchema = {
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    role: z.enum(roleValues),
  }),
};
