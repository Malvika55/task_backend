import { Role } from '@prisma/client';
import { ApiError } from '../../lib/apiError';
import { prisma } from '../../config/prisma';

const taskSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
  owner: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
} as const;

export const listTasks = async (userId: string, role: Role) => {
  return prisma.task.findMany({
    where: role === Role.ADMIN ? {} : { ownerId: userId },
    orderBy: { createdAt: 'desc' },
    select: taskSelect,
  });
};

export const createTask = async (
  userId: string,
  input: { title: string; description?: string; status?: 'TODO' | 'IN_PROGRESS' | 'DONE'; priority?: 'LOW' | 'MEDIUM' | 'HIGH' },
) => {
  return prisma.task.create({
    data: {
      ownerId: userId,
      title: input.title,
      description: input.description || undefined,
      status: input.status,
      priority: input.priority,
    },
    select: taskSelect,
  });
};

export const getTaskForUser = async (taskId: string, userId: string, role: Role) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: taskSelect,
  });

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  if (role !== Role.ADMIN && task.ownerId !== userId) {
    throw new ApiError(403, 'You can only access your own tasks');
  }

  return task;
};

export const updateTask = async (
  taskId: string,
  userId: string,
  role: Role,
  input: { title?: string; description?: string | ''; status?: 'TODO' | 'IN_PROGRESS' | 'DONE'; priority?: 'LOW' | 'MEDIUM' | 'HIGH' },
) => {
  await getTaskForUser(taskId, userId, role);

  return prisma.task.update({
    where: { id: taskId },
    data: {
      title: input.title,
      description: input.description === '' ? null : input.description,
      status: input.status,
      priority: input.priority,
    },
    select: taskSelect,
  });
};

export const deleteTask = async (taskId: string, userId: string, role: Role) => {
  await getTaskForUser(taskId, userId, role);

  await prisma.task.delete({ where: { id: taskId } });
};
