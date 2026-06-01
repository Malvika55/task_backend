export type Role = 'USER' | 'ADMIN';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  _count?: {
    tasks: number;
  };
};

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner: Pick<SessionUser, 'id' | 'name' | 'email' | 'role'>;
};
