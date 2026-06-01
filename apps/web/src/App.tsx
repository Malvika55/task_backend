import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { api } from './api';
import type { SessionUser, Task } from './types';

type AuthMode = 'login' | 'register';

const emptyTaskForm = {
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
};

export default function App() {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<SessionUser[]>([]);
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const isAdmin = currentUser?.role === 'ADMIN';
  const taskCount = tasks.length;
  const visibleTasks = useMemo(() => tasks, [tasks]);

  const apiDocsUrl =
    (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1').replace(/\/api\/v1\/?$/, '') +
    '/api/docs';

  const loadSession = async () => {
    try {
      const response = await api.me();
      if (response.user) setCurrentUser(response.user);
    } catch {
      setCurrentUser(null);
    }
  };

  const loadDashboard = async (role: SessionUser['role']) => {
    const taskResponse = await api.listTasks();
    setTasks(taskResponse.tasks ?? []);
    if (role === 'ADMIN') {
      const userResponse = await api.listUsers();
      setUsers(userResponse.users ?? []);
    } else {
      setUsers([]);
    }
  };

  const refreshDashboard = async () => {
    if (!currentUser) return;
    await loadDashboard(currentUser.role);
  };

  useEffect(() => {
    void loadSession();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    void loadDashboard(currentUser.role).catch((loadError: unknown) => {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load dashboard.');
    });
  }, [currentUser]);

  const handleAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const response =
        authMode === 'register'
          ? await api.register(authForm)
          : await api.login({ email: authForm.email, password: authForm.password });
      if (response.user) {
        setCurrentUser(response.user);
        setMessage(response.message ?? 'Success.');
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    setBusy(true);
    setError('');
    try {
      await api.logout();
      setCurrentUser(null);
      setTasks([]);
      setUsers([]);
      setMessage('Logged out successfully.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to log out.');
    } finally {
      setBusy(false);
    }
  };

  const handleTaskCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await api.createTask(taskForm);
      setTaskForm(emptyTaskForm);
      setMessage('Task created.');
      await refreshDashboard();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to create task.');
    } finally {
      setBusy(false);
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    setBusy(true);
    setError('');
    try {
      await api.deleteTask(taskId);
      setMessage('Task deleted.');
      await refreshDashboard();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to delete task.');
    } finally {
      setBusy(false);
    }
  };

  const handleTaskUpdate = async (task: Task, status: Task['status']) => {
    setBusy(true);
    setError('');
    try {
      await api.updateTask(task.id, { status });
      setMessage('Task updated.');
      await refreshDashboard();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update task.');
    } finally {
      setBusy(false);
    }
  };

  const handleRoleUpdate = async (userId: string, role: SessionUser['role']) => {
    setBusy(true);
    setError('');
    try {
      await api.updateUserRole(userId, role);
      setMessage('User role updated.');
      await refreshDashboard();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update role.');
    } finally {
      setBusy(false);
    }
  };

  const statusClass = (status: string) => `badge badge-${status.toLowerCase()}`;

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="logo">
          <div className="logo-icon">N</div>
          <div className="logo-text">
            Nest<span>Tasks</span>
          </div>
        </div>
        <span className="header-tag">REST · JWT · RBAC</span>
      </header>

      <main className={`layout ${currentUser ? 'layout--auth' : 'layout--guest'}`}>
        {!currentUser && (
          <section className="intro-card">
            <div>
              <h1>Build and test secure APIs without the boilerplate fatigue.</h1>
              <p>
                Register, sign in, and manage tasks through a real JWT-backed flow — versioned routes, hashed passwords,
                and role checks included.
              </p>
            </div>
            <div className="intro-pills">
              <span>v1 API</span>
              <span>httpOnly JWT</span>
              <span>Task CRUD</span>
              <span>Admin RBAC</span>
            </div>
          </section>
        )}

        <section className="card workspace-card">
          {!currentUser ? (
            <>
              <div className="panel-header">
                <div>
                  <h2>{authMode === 'login' ? 'Sign in' : 'Create account'}</h2>
                  <p>Connect to the protected API using the form below.</p>
                </div>
              </div>

              <div className="tab-switch">
                <button type="button" className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>
                  Login
                </button>
                <button
                  type="button"
                  className={authMode === 'register' ? 'active' : ''}
                  onClick={() => setAuthMode('register')}
                >
                  Register
                </button>
              </div>

              <form className="stack" onSubmit={handleAuth}>
                {authMode === 'register' && (
                  <label>
                    Full name
                    <input
                      value={authForm.name}
                      onChange={(e) => setAuthForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Your name"
                      required
                    />
                  </label>
                )}
                <label>
                  Email
                  <input
                    type="email"
                    value={authForm.email}
                    onChange={(e) => setAuthForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="you@email.com"
                    required
                  />
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    value={authForm.password}
                    onChange={(e) => setAuthForm((p) => ({ ...p, password: e.target.value }))}
                    placeholder="8+ chars, upper, lower, number"
                    required
                  />
                </label>
                <button className="btn btn-primary" type="submit" disabled={busy}>
                  {busy ? 'Please wait…' : authMode === 'login' ? 'Sign in' : 'Create account'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="panel-header">
                <div>
                  <h2>Your workspace</h2>
                  <p>
                    {currentUser.name} · <span className="badge badge-role">{currentUser.role}</span>
                  </p>
                </div>
                <button type="button" className="btn btn-outline" onClick={() => void handleLogout()} disabled={busy}>
                  Logout
                </button>
              </div>

              <form className="form-card stack" onSubmit={handleTaskCreate}>
                <h3>New task</h3>
                <div className="two-up">
                  <label>
                    Title
                    <input
                      value={taskForm.title}
                      onChange={(e) => setTaskForm((p) => ({ ...p, title: e.target.value }))}
                      placeholder="What needs doing?"
                      required
                    />
                  </label>
                  <label>
                    Priority
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm((p) => ({ ...p, priority: e.target.value }))}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </label>
                </div>
                <label>
                  Description
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Optional details"
                    rows={2}
                  />
                </label>
                <button className="btn btn-primary" type="submit" disabled={busy}>
                  Add task
                </button>
              </form>

              <div className="stack" style={{ marginTop: 20 }}>
                <div className="section-head">
                  <h3>Tasks</h3>
                  <span>{taskCount} total</span>
                </div>
                <div className="task-list">
                  {visibleTasks.length === 0 ? (
                    <p className="empty-note">No tasks yet — add one above.</p>
                  ) : (
                    visibleTasks.map((task) => (
                      <article className="task-item" key={task.id}>
                        <div className="task-row-top">
                          <div>
                            <h4>{task.title}</h4>
                            <p>{task.description || 'No description'}</p>
                          </div>
                          <span className={statusClass(task.status)}>{task.status.replace('_', ' ')}</span>
                        </div>
                        <div className="task-meta">
                          <span>{task.priority} priority</span>
                          <span>· {task.owner.name}</span>
                        </div>
                        <div className="task-actions">
                          <select
                            value={task.status}
                            onChange={(e) => void handleTaskUpdate(task, e.target.value as Task['status'])}
                            disabled={busy}
                          >
                            <option value="TODO">Todo</option>
                            <option value="IN_PROGRESS">In progress</option>
                            <option value="DONE">Done</option>
                          </select>
                          <button
                            type="button"
                            className="btn btn-outline btn-danger"
                            disabled={busy}
                            onClick={() => void handleTaskDelete(task.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>

              {isAdmin && (
                <div className="stack" style={{ marginTop: 24 }}>
                  <div className="section-head">
                    <h3>Admin</h3>
                    <span>{users.length} users</span>
                  </div>
                  <div className="task-list">
                    {users.map((user) => (
                      <article className="task-item" key={user.id}>
                        <div className="task-row-top">
                          <div>
                            <h4>{user.name}</h4>
                            <p>{user.email}</p>
                          </div>
                          <span className="badge badge-role">{user.role}</span>
                        </div>
                        <div className="task-meta">{user._count?.tasks ?? 0} tasks</div>
                        <div className="task-actions">
                          <select
                            value={user.role}
                            disabled={busy}
                            onChange={(e) => void handleRoleUpdate(user.id, e.target.value as SessionUser['role'])}
                          >
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        <aside className="card side-card">
          <h2>API features</h2>
          <ul className="check-list">
            <li>Routes under /api/v1</li>
            <li>JWT in secure cookies</li>
            <li>Ownership on tasks</li>
            <li>Admin user roles</li>
            <li>
              <a href={apiDocsUrl} target="_blank" rel="noreferrer">
                Open Swagger
              </a>
            </li>
          </ul>
          <div className={`alert ${message ? 'alert--ok' : ''}`}>{message || 'Status messages appear here.'}</div>
          <div className={`alert ${error ? 'alert--err' : ''}`}>{error || 'Errors from the API show here.'}</div>
          {!currentUser && (
            <p className="demo-hint">
              Try admin: <strong>admin@taskplatform.dev</strong> / <strong>Admin@12345!</strong>
            </p>
          )}
        </aside>
      </main>
    </div>
  );
}
