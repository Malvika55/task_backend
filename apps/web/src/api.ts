import type { SessionUser, Task } from './types';

const apiBase = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';

type ApiResponse<T> = {
  message?: string;
  errors?: Record<string, string[] | undefined>;
  user?: SessionUser;
  users?: SessionUser[];
  task?: Task;
  tasks?: Task[];
  data?: T;
};

function formatApiError(payload: ApiResponse<unknown>, status: number) {
  if (payload.message && payload.message !== 'Validation failed') {
    return payload.message;
  }

  const fieldMessages = payload.errors
    ? Object.entries(payload.errors)
        .flatMap(([field, msgs]) => (msgs ?? []).map((m) => `${field}: ${m}`))
    : [];

  if (fieldMessages.length) {
    return fieldMessages[0];
  }

  if (payload.message) {
    return payload.message;
  }

  if (status === 401) return 'Please sign in again.';
  if (status === 403) return 'You do not have permission for this action.';
  if (status === 0 || status >= 500) return 'Cannot reach the API. Start the backend with npm run dev.';

  return `Request failed (${status})`;
}

async function request<T>(path: string, init: RequestInit = {}) {
  let response: Response;

  try {
    response = await fetch(`${apiBase}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
    });
  } catch {
    throw new Error(
      window.location.hostname.includes('github.io')
        ? 'API is not reachable from GitHub Pages. Run the project locally (npm run dev) or deploy the API and set API_URL in GitHub Actions.'
        : 'Cannot reach the API. Start the backend: npm run dev',
    );
  }

  const payload = (await response.json().catch(() => ({}))) as ApiResponse<T>;

  if (!response.ok) {
    throw new Error(formatApiError(payload, response.status));
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
