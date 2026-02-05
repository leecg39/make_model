# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

**Make Model** - AI 인플루언서 마켓플레이스. 브랜드가 AI 패션모델/아이돌을 탐색하고 섭외하는 양면 플랫폼.

## Tech Stack

- **Backend**: FastAPI (Python 3.11+) + SQLAlchemy 2.0 async + Alembic + asyncpg + JWT
- **Frontend**: Next.js 14+ (App Router) + TypeScript + TailwindCSS + Zustand + Framer Motion
- **Database**: PostgreSQL 15+ + Redis 7
- **Payment**: PortOne (한국 PG)
- **Real-time**: WebSocket (Socket.IO)

## Commands

```bash
# Backend
cd backend && source venv/bin/activate
uvicorn app.main:app --reload --port 8000
pytest tests/ -v

# Frontend
cd frontend
npm run dev    # http://localhost:3000
npm run build
npm run test

# Database
docker compose up -d            # PostgreSQL + Redis 시작
docker compose down             # 중지
cd backend && alembic upgrade head  # 마이그레이션 실행

# Git Worktree (Phase 1+)
git worktree add worktree/phase-N-name -b phase-N-name
git worktree list
```

## Architecture

```
make_model/
├── backend/              # FastAPI
│   ├── app/
│   │   ├── api/v1/       # API routes
│   │   ├── core/         # config, security, deps
│   │   ├── db/           # session, base
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   └── services/     # Business logic
│   ├── alembic/          # DB migrations
│   └── tests/
├── frontend/             # Next.js
│   └── src/
│       ├── app/          # App Router pages
│       ├── components/   # React components
│       ├── hooks/        # Custom hooks
│       ├── lib/          # Utilities
│       ├── services/     # API clients
│       ├── stores/       # Zustand stores
│       └── types/        # TypeScript types
├── specs/                # Screen specs (YAML)
│   ├── domain/resources.yaml
│   ├── screens/*.yaml
│   └── shared/
├── docs/planning/        # Planning docs (7 files)
├── TASKS.md              # 56 tasks across P0-P4
└── docker-compose.yml    # PostgreSQL + Redis
```

## Key Conventions

- TDD mandatory: RED → GREEN → REFACTOR
- Domain-Guarded: screens declare needs, backend provides resources independently
- Git Worktree: Phase 0 on main, Phase 1+ on separate worktrees
- Anti-AI design: no Inter/Roboto fonts, no purple gradients
- Korean UI text, English code/variable names

## Lessons Learned

(Auto-updated during development)
