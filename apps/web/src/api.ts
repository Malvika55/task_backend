import type { SessionUser, Task } from './types';

const apiBase = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';

type ApiResponse<T> = {
  message?: string;
  user?: SessionUser;
  users?: SessionUser[];
  task?: Task;
  tasks?: Task[];
  data?: T;
};

async function request<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

  const payload = (await response.json().catch(() => ({}))) as ApiResponse<T>;

  if (!response.ok) {
    throw new Error(payload.message ?? `Request failed with status ${response.status}`);
  }

  return payload;
}

export const api = {
  register: (input: { name: string; email: string; password: string }) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  login: (input: { email: string; password: string }) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),
  listTasks: () => request('/tasks'),
  createTask: (input: { title: string; description: string; status: string; priority: string }) =>
    request('/tasks', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  updateTask: (id: string, input: Partial<{ title: string; description: string; status: string; priority: string }>) =>
    request(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  deleteTask: (id: string) => request(`/tasks/${id}`, { method: 'DELETE' }),
  listUsers: () => request('/users'),
  updateUserRole: (id: string, role: 'USER' | 'ADMIN') =>
    request(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
};
