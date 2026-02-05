# Architecture Patterns

## Backend
- FastAPI + SQLAlchemy 2.0 async pattern
- Pydantic v2 for request/response schemas
- Dependency Injection for services
- Alembic for DB migrations
- JWT auth with access/refresh tokens

## Frontend
- Next.js App Router (server components default)
- Client components for interactive UI
- Zustand for global state
- SWR/React Query for server state
- TailwindCSS utility-first
- Framer Motion for animations

## Database
- PostgreSQL with JSONB for flexible data
- Proper indexes on FK columns
- Enum types for status fields
- created_at/updated_at timestamps on all tables
