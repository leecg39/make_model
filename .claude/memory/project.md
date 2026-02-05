# Project: AI Model Marketplace (Make Model)

## Overview
AI 인플루언서 마켓플레이스 - 브랜드가 AI 패션모델/아이돌을 탐색하고 섭외하는 양면 플랫폼

## Tech Stack
- **Backend**: FastAPI (Python 3.11+) + SQLAlchemy 2.0+ + Alembic + asyncpg
- **Frontend**: Next.js 14+ (App Router) + TypeScript + TailwindCSS + Zustand + Framer Motion
- **Database**: PostgreSQL 15+
- **Auth**: JWT (access + refresh tokens)
- **Payment**: PortOne (한국 PG)
- **Real-time**: WebSocket (Socket.IO)
- **Storage**: S3/R2 + CDN
- **Vector DB**: Pinecone (AI 매칭용)

## Key Features
1. AI 모델 탐색/검색 (스타일, 성별, 나이대 필터)
2. 3단계 섭외 Wizard (컨셉 → AI 추천 → 패키지/결제)
3. 브랜드/크리에이터 대시보드
4. 주문별 실시간 채팅 (WebSocket)
5. 정산 시스템

## User Roles
- brand: 브랜드 (모델 탐색/섭외)
- creator: 크리에이터 (모델 등록/관리)
- admin: 관리자

## Package Types
- Basic: 3 images, non-exclusive
- Standard: 10 images, non-exclusive
- Premium: 20 images, 3-month exclusive
