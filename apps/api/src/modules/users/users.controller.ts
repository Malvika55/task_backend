import type { Request, Response } from 'express';
import { listUsers, updateUserRole } from './users.service';

export const getUsers = async (_req: Request, res: Response) => {
  const users = await listUsers();
  return res.json({ users });
};

export const changeUserRole = async (req: Request, res: Response) => {
  const user = await updateUserRole(req.params.id as string, req.body.role);
  return res.json({ message: 'User role updated', user });
};
