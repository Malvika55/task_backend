import { Role } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { ApiError } from '../../lib/apiError';

export const listUsers = async () => {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { tasks: true },
      },
    },
  });
};

export const updateUserRole = async (userId: string, role: Role) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return prisma.user.update({
    where: { id: userId },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};
