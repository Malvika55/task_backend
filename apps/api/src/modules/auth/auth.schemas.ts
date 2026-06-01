import { z } from 'zod';

const passwordRules = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const registerSchema = {
  body: z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email(),
    password: passwordRules,
  }),
};

export const loginSchema = {
  body: z.object({
    email: z.string().trim().email(),
    password: z.string().min(1),
  }),
};
