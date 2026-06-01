# Scalability & Production Readiness

This project is structured so it can grow from a single deployable monolith into a distributed system without rewriting core business logic.

## Current architecture

```
apps/
  api/          # Express + TypeScript, domain modules (auth, tasks, users)
  web/          # React SPA (static deploy)
prisma/         # PostgreSQL schema (SQLite fallback for local dev)
```

- **Modular routes**: Each domain (`auth`, `tasks`, `users`) owns routes, controllers, services, and Zod schemas. New entities (e.g. `products`, `notes`) follow the same pattern.
- **API versioning**: All business routes live under `/api/v1`, so v2 can be introduced without breaking clients.
- **Stateless API**: JWT in httpOnly cookies (or `Authorization: Bearer`) — any API instance can serve a request; no in-memory session store required.

## Horizontal scaling

| Layer | Approach |
|-------|----------|
| **API** | Run N Node replicas behind an ALB/nginx; sticky sessions not required (JWT is self-contained). |
| **Database** | PostgreSQL with read replicas for heavy read paths; connection pooling (PgBouncer). |
| **Frontend** | Build to static assets; serve from CDN (S3 + CloudFront, Vercel, etc.). |
| **Load balancer** | Health check `GET /health`; route traffic only to healthy instances. |

## Caching (Redis)

Recommended next step for production traffic:

1. **Session denylist** — store revoked JWT `jti` until expiry for instant logout invalidation.
2. **Rate limiting** — move from in-process `express-rate-limit` to Redis-backed limits shared across replicas.
3. **Hot reads** — cache `GET /tasks` list per user with short TTL (30–60s); invalidate on create/update/delete.

## Microservices (optional split)

When teams or traffic justify separation:

| Service | Responsibility |
|---------|----------------|
| **auth-service** | Register, login, token issue, role claims |
| **task-service** | Task CRUD, ownership checks |
| **user-service** | Admin user listing, role updates |

Use an API gateway for routing, TLS termination, and auth verification. Events (task created) can flow through a queue (SQS, RabbitMQ) for notifications or analytics.

## Observability & ops

- **Logging**: Structured JSON logs (request id, user id, latency) → CloudWatch / Datadog.
- **Metrics**: p95 latency, 4xx/5xx rates, DB pool saturation.
- **Docker**: `docker-compose.yml` already runs PostgreSQL; add a `Dockerfile` for the API and deploy to ECS/Kubernetes.

## Security at scale

- Rotate `JWT_SECRET` with dual-key verification during rotation.
- Enforce HTTPS in production (`secure` cookies already configured).
- WAF in front of the load balancer; keep Helmet, validation (Zod), and bcrypt password hashing.

## Summary

The codebase is **deployment-ready as a monolith** and **structured for incremental scale**: add Redis and a load balancer first, then split services only when organizational or traffic boundaries require it.
