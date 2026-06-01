import type { Request, Response } from 'express';
import { createTask, deleteTask, getTaskForUser, listTasks, updateTask } from './task.service';

export const getTasks = async (req: Request, res: Response) => {
  const tasks = await listTasks(req.auth!.id, req.auth!.role);
  return res.json({ tasks });
};

export const createNewTask = async (req: Request, res: Response) => {
  const task = await createTask(req.auth!.id, req.body);
  return res.status(201).json({ message: 'Task created', task });
};

export const getTask = async (req: Request, res: Response) => {
  const task = await getTaskForUser(req.params.id as string, req.auth!.id, req.auth!.role);
  return res.json({ task });
};

export const editTask = async (req: Request, res: Response) => {
  const task = await updateTask(req.params.id as string, req.auth!.id, req.auth!.role, req.body);
  return res.json({ message: 'Task updated', task });
};

export const removeTask = async (req: Request, res: Response) => {
  await deleteTask(req.params.id as string, req.auth!.id, req.auth!.role);
  return res.json({ message: 'Task deleted' });
};
