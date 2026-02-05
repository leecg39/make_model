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

### [2026-02-05] bcrypt 5.0 + passlib 1.7.4 incompatibility (bcrypt, passlib, password-hashing)
- **상황**: 회원가입 시 비밀번호 해싱 시도
- **문제**: `ValueError: password cannot be longer than 72 bytes, truncate manually if necessary`
- **원인**: bcrypt 4.1+ changed its API (`checkpw`/`hashpw` signature). passlib 1.7.4 is unmaintained and doesn't handle this correctly.
- **해결**: Replaced passlib.context with direct `bcrypt.checkpw()` / `bcrypt.hashpw()` calls in `app/core/security.py`.
- **교훈**: When bcrypt>=4.1, avoid passlib. Use bcrypt directly or pin `bcrypt<4.1`.

### [2026-02-05] httpx 0.28+ removed `app` parameter from AsyncClient (httpx, testing, ASGI)
- **상황**: pytest에서 httpx AsyncClient로 FastAPI 앱 테스트
- **문제**: `TypeError: __init__() got an unexpected keyword argument 'app'`
- **원인**: httpx 0.28+ moved ASGI app support to `ASGITransport`.
- **해결**: `AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver")`
- **교훈**: httpx 0.28+에서는 반드시 `ASGITransport`를 사용해야 함.

### [2026-02-05] User model column name vs service attribute mismatch (SQLAlchemy, ORM, naming)
- **상황**: Bootstrap 코드에서 User model은 `password_hash` 컬럼, 서비스는 `hashed_password` 속성 사용
- **문제**: `AttributeError` when accessing `user.hashed_password`
- **원인**: Model column과 service/deps 코드의 속성명 불일치
- **해결**: User model에 `@property hashed_password` + setter 추가하여 양쪽 호환
- **교훈**: Model 컬럼명과 서비스 코드 속성명 일치 여부를 Phase 0에서 반드시 확인
