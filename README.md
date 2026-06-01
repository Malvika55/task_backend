# TaskFlow — Scalable REST API with Auth, RBAC & React UI

Full-stack intern assignment project: secure backend APIs, role-based access, task CRUD, Swagger docs, Postman collection, and a **warm editorial React UI** for testing all flows.

## What’s included

| Requirement | Implementation |
|-------------|----------------|
| Register / login | `POST /api/v1/auth/register`, `POST /api/v1/auth/login` |
| Password hashing | bcrypt |
| JWT auth | Signed JWT in **httpOnly cookie** (+ optional `Bearer` header) |
| Roles | `USER` vs `ADMIN` — admin-only user management |
| CRUD entity | **Tasks** with status, priority, ownership |
| Versioning | `/api/v1/*` |
| Validation & errors | Zod + centralized error handler |
| API docs | Swagger UI at `/api/docs`, OpenAPI JSON at `/api/openapi.json` |
| Postman | [`docs/postman/Task-Platform.postman_collection.json`](docs/postman/Task-Platform.postman_collection.json) |
| Database | PostgreSQL (Prisma); SQLite fallback for quick local dev |
| Frontend | React + Vite — login/register, protected dashboard, kanban CRUD, toasts |
| Scalability note | [`docs/SCALABILITY.md`](docs/SCALABILITY.md) |

## Tech stack

- **Backend**: Express 5, TypeScript, Prisma, Zod, JWT, bcrypt, Helmet, rate limiting
- **Frontend**: React 19, Vite, TypeScript — three-column dashboard UI
- **DB**: PostgreSQL 16 (Docker) or SQLite file for Windows dev without Docker

## Quick start (recommended: SQLite, no Docker)

```bash
npm install

# API env
copy apps\api\.env.example apps\api\.env
# Edit JWT_SECRET to a random 32+ char string

# Web env
copy apps\web\.env.example apps\web\.env

# SQLite database (PowerShell: set file URL first)
$env:DATABASE_URL="file:./apps/api/prisma/dev.db"
npm run prisma:generate:sqlite --workspace @p5/api
npm run prisma:push:sqlite --workspace @p5/api

# Run API + frontend together
npm run dev
```

- **API**: http://localhost:4000  
- **Swagger**: http://localhost:4000/api/docs  
- **Frontend**: http://localhost:5173  

### PostgreSQL (Docker)

```bash
docker compose up -d db
copy apps\api\.env.example apps\api\.env
npm run db:generate
npm run db:push
npm run dev
```

## Demo accounts

Set in `apps/api/.env`:

```env
ADMIN_EMAIL=admin@taskplatform.dev
ADMIN_PASSWORD=Admin@12345!
```

The API auto-creates this admin on startup. Use it to test admin routes and the user-role panel in the UI.

## API endpoints

| Method | Path | Access |
|--------|------|--------|
| POST | `/api/v1/auth/register` | Public |
| POST | `/api/v1/auth/login` | Public |
| POST | `/api/v1/auth/logout` | Authenticated |
| GET | `/api/v1/auth/me` | Authenticated |
| GET | `/api/v1/tasks` | Authenticated (own tasks; admin sees all) |
| POST | `/api/v1/tasks` | Authenticated |
| PATCH | `/api/v1/tasks/:id` | Owner or admin |
| DELETE | `/api/v1/tasks/:id` | Owner or admin |
| GET | `/api/v1/users` | Admin |
| PATCH | `/api/v1/users/:id/role` | Admin |

## Project structure

```
apps/api/src/
  modules/auth/     # Registration, login, JWT cookies
  modules/tasks/    # Task CRUD + ownership
  modules/users/    # Admin user management
  middleware/       # Auth, validation, errors
  docs/openapi.ts   # Swagger spec
apps/web/src/
  components/       # Auth screen, kanban, admin panel
  api.ts            # Typed fetch client (credentials: include)
```

## Testing with Postman

1. Import `docs/postman/Task-Platform.postman_collection.json`
2. Run **Login** — Postman stores the `access_token` cookie automatically
3. Call **List tasks**, **Create task**, etc.

For Bearer auth, copy the cookie value or login via browser and use `Authorization: Bearer <token>`.

## Frontend highlights

- Three-column layout: product hero, auth/dashboard panel, API checklist sidebar  
- Register/login toggle, protected dashboard, task list with status updates  
- Admin user-role panel for `ADMIN` accounts  
- Success/error banners driven by live API responses  

## Security practices

- Passwords hashed with bcrypt (never stored plain text)
- JWT in httpOnly, `sameSite=lax` cookies (CSRF-aware SPA setup)
- Helmet security headers, request size limits, rate limiting
- Zod input validation on all mutating routes
- Task access enforced server-side (users cannot read others’ tasks unless admin)

## License

MIT — built for Primetrade.ai backend intern assignment submission.
