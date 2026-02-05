# TRD (기술 요구사항 정의서)

> 개발자/AI 코딩 파트너가 참조하는 기술 문서입니다.
> 기술 표현을 사용하되, "왜 이 선택인지"를 함께 설명합니다.

---

## MVP 캡슐

| # | 항목 | 내용 |
|---|------|------|
| 1 | 목표 | AI 인플루언서(패션 모델/아이돌) 섭외 마켓플레이스 |
| 2 | 페르소나 | 브랜드 마케팅 담당자 (1차), AI 모델 크리에이터 (2차) |
| 3 | 핵심 기능 | FEAT-1: AI 모델 탐색/검색, FEAT-2: 섭외 요청/AI 자동 매칭, FEAT-3: 콘텐츠 제작/전달 |
| 4 | 성공 지표 (노스스타) | 월간 성사된 섭외 건수 |
| 5 | 입력 지표 | 등록된 AI 모델 수, 활성 브랜드 수 |
| 6 | 비기능 요구 | 이미지 로딩 2초 이내, 채팅 메시지 실시간 전달 |
| 7 | Out-of-scope | SNS 자동 포스팅, 실시간 영상 생성, 모바일 앱 (웹 우선) |
| 8 | Top 리스크 | AI 매칭 품질이 기대에 못 미칠 수 있음 |
| 9 | 완화/실험 | 초기에 인기 모델 수동 큐레이션 + AI 매칭 AB 테스트 |
| 10 | 다음 단계 | 화면 상세 명세 (/screen-spec) |

---

## 1. 시스템 아키텍처

### 1.1 고수준 아키텍처

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Client     │────▶│   Server     │────▶│  Database    │
│  (Next.js)   │     │  (FastAPI)   │     │ (PostgreSQL) │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │
       │                    ├──────────────▶ Vector DB (Pinecone)
       │                    │
       │                    ├──────────────▶ S3/R2 + CDN
       │                    │
       └────── WebSocket ───┘ (실시간 채팅)
```

### 1.2 컴포넌트 설명

| 컴포넌트 | 역할 | 왜 이 선택? |
|----------|------|-------------|
| Frontend (Next.js) | SSR/SSG로 SEO 최적화, 이미지 로딩 성능 개선 | 랜딩 페이지와 모델 프로필의 검색 노출 필요 |
| Backend (FastAPI) | 고성능 비동기 API, 자동 문서 생성, Python AI 생태계 활용 | AI 매칭 로직과 이미지 처리에 Python 라이브러리 활용 |
| Database (PostgreSQL) | ACID 보장, JSONB 지원, 확장성 | 트랜잭션(결제/정산) 안정성 필요 |
| Vector DB (Pinecone) | AI 임베딩 기반 유사도 검색, 관리형 서비스 | 콘셉트-모델 매칭에 빠른 검색 필요 |
| S3/R2 + CDN | 대용량 이미지 저장 및 글로벌 배포 | 2초 이내 이미지 로딩 요구사항 충족 |
| WebSocket (Socket.IO) | 양방향 실시간 통신 | 주문별 채팅 실시간 전달 |

---

## 2. 권장 기술 스택

### 2.1 프론트엔드

| 항목 | 선택 | 이유 | 벤더 락인 리스크 |
|------|------|------|-----------------|
| 프레임워크 | Next.js 14 (App Router) | SSR/SSG, 이미지 최적화, SEO | 중간 (React 기반이라 마이그레이션 가능) |
| 언어 | TypeScript 5.x | 타입 안전성, 계약 기반 개발 지원 | - |
| 스타일링 | TailwindCSS | 빠른 프로토타이핑, 일관된 디자인 시스템 | 낮음 |
| 상태관리 | Zustand | 간단한 API, 보일러플레이트 최소화 | 낮음 |
| HTTP 클라이언트 | Axios | 인터셉터로 인증 토큰 자동 처리 | 낮음 |
| 실시간 통신 | Socket.IO Client | FastAPI와 연동 용이, 자동 재연결 | 낮음 |

### 2.2 백엔드

| 항목 | 선택 | 이유 | 벤더 락인 리스크 |
|------|------|------|-----------------|
| 프레임워크 | FastAPI 0.109+ | 비동기 처리, 자동 API 문서, Pydantic v2 통합 | 낮음 |
| 언어 | Python 3.11+ | AI 라이브러리 풍부, 빠른 개발 속도 | - |
| ORM | SQLAlchemy 2.0 | 성숙한 ORM, PostgreSQL 최적화 | 낮음 |
| 검증 | Pydantic v2 | FastAPI 네이티브 통합, 타입 안전성 | 낮음 |
| 인증 | JWT (python-jose) | 무상태 인증, 확장성 | 낮음 |
| 이미지 처리 | Pillow | Python 표준 이미지 라이브러리 | 낮음 |
| 실시간 통신 | python-socketio | Socket.IO 공식 Python 구현 | 낮음 |

### 2.3 데이터베이스

| 항목 | 선택 | 이유 |
|------|------|------|
| 메인 DB | PostgreSQL 15+ | 트랜잭션 안정성, JSONB로 유연한 메타데이터 저장 |
| 캐시 | Redis 7+ (선택) | 세션 저장, API 응답 캐싱 (v2에서 고려) |
| Vector DB | Pinecone | AI 임베딩 기반 모델 매칭, 관리형 서비스로 운영 부담 최소화 |

### 2.4 인프라

| 항목 | 선택 | 이유 |
|------|------|------|
| 컨테이너 | Docker + Docker Compose | 로컬 개발 일관성, 백엔드/DB 통합 환경 구성 |
| 프론트 호스팅 | Vercel | Next.js 최적화, 자동 배포, CDN 기본 제공 |
| 백엔드 호스팅 | Railway | FastAPI 배포 간편, PostgreSQL 관리형 제공 |
| 이미지 저장 | Cloudflare R2 | S3 호환 API, 저렴한 비용, 무료 egress |
| 결제 | 포트원 (PortOne) | 한국 PG 통합, 간편결제 지원 |

---

## 3. 비기능 요구사항

### 3.1 성능

| 항목 | 요구사항 | 측정 방법 |
|------|----------|----------|
| API 응답 시간 | < 500ms (P95) | FastAPI 미들웨어로 응답 시간 로깅 |
| 이미지 로딩 | < 2s (FCP) | Lighthouse, Next.js Image 컴포넌트 활용 |
| AI 매칭 추천 | < 3s | Pinecone 쿼리 시간 모니터링 |
| 채팅 메시지 전달 | < 100ms | Socket.IO 이벤트 타임스탬프 |

### 3.2 보안

| 항목 | 요구사항 |
|------|----------|
| 인증 | JWT Access Token (15분) + Refresh Token (7일) |
| 비밀번호 | bcrypt 해싱 (cost factor 12) |
| HTTPS | 필수 (Let's Encrypt 자동 갱신) |
| 입력 검증 | Pydantic 서버 측 검증 필수 |
| CORS | 화이트리스트 기반 (프론트 도메인만 허용) |
| SQL Injection | SQLAlchemy ORM 사용으로 방지 |
| XSS | Next.js 기본 이스케이핑, DOMPurify 추가 적용 |

### 3.3 확장성

| 항목 | 현재 | 목표 |
|------|------|------|
| 동시 사용자 | MVP: 100명 | v2: 1,000명 |
| 데이터 용량 | MVP: 10GB (이미지 포함) | v2: 100GB |
| AI 모델 수 | MVP: 100개 | v2: 1,000개 |

---

## 4. 외부 API 연동

### 4.1 인증

| 서비스 | 용도 | 필수/선택 | 연동 방식 |
|--------|------|----------|----------|
| Google OAuth | 소셜 로그인 | 선택 | OAuth 2.0 (authlib) |
| Kakao OAuth | 소셜 로그인 | 선택 | OAuth 2.0 (authlib) |

### 4.2 기타 서비스

| 서비스 | 용도 | 필수/선택 | 비고 |
|--------|------|----------|------|
| 포트원 (PortOne) | 결제 처리 | 필수 | REST API, Webhook으로 결제 상태 수신 |
| Pinecone | AI 임베딩 검색 | 필수 | REST API, Python SDK |
| Cloudflare R2 | 이미지 저장 | 필수 | S3 호환 API (boto3) |
| OpenAI Embedding | 콘셉트 텍스트 임베딩 | 필수 | text-embedding-3-small 모델 |

---

## 5. 접근제어·권한 모델

### 5.1 역할 정의

| 역할 | 설명 | 권한 |
|------|------|------|
| Guest | 비로그인 | 모델 프로필 조회 (읽기 전용) |
| Brand | 브랜드 담당자 | 모델 섭외, 주문 관리, 채팅 |
| Creator | AI 모델 크리에이터 | 모델 등록, 주문 수락, 콘텐츠 업로드, 정산 |
| Admin | 관리자 | 전체 데이터 접근, 사용자 관리 |

### 5.2 권한 매트릭스

| 리소스 | Guest | Brand | Creator | Admin |
|--------|-------|-------|---------|-------|
| 모델 프로필 조회 | O | O | O | O |
| 모델 등록/수정 | - | - | O (본인) | O |
| 섭외 요청 | - | O | - | O |
| 주문 조회 | - | O (본인) | O (본인) | O |
| 채팅 | - | O (주문 당사자) | O (주문 당사자) | O |
| 정산 요청 | - | - | O | O |

---

## 6. 데이터 생명주기

### 6.1 원칙

- **최소 수집**: 필요한 데이터만 수집 (이메일, 닉네임, 프로필 이미지만)
- **명시적 동의**: 개인정보 수집 전 동의 체크박스
- **보존 기한**: 계정 탈퇴 후 30일 보관 후 완전 삭제

### 6.2 데이터 흐름

```
수집 → 저장 → 사용 → 보관 → 삭제/익명화
```

| 데이터 유형 | 보존 기간 | 삭제/익명화 |
|------------|----------|------------|
| 계정 정보 (이메일, 비밀번호) | 탈퇴 후 30일 | 완전 삭제 (Hard delete) |
| 주문 내역 | 탈퇴 후 30일 | 사용자 ID 익명화 (주문 통계용) |
| 채팅 로그 | 주문 완료 후 1년 | 완전 삭제 |
| 이미지 파일 (포트폴리오) | 모델 삭제 시 | 완전 삭제 (R2에서 제거) |
| 이미지 파일 (납품물) | 주문 완료 후 1년 | 브랜드 다운로드 후 삭제 가능 |

---

## 7. 테스트 전략 (Contract-First TDD)

### 7.1 개발 방식: Contract-First Development

본 프로젝트는 **계약 우선 개발(Contract-First Development)** 방식을 채택합니다.
BE/FE가 독립적으로 병렬 개발하면서도 통합 시 호환성을 보장합니다.

```
┌─────────────────────────────────────────────────────────────────┐
│                    Contract-First 흐름                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. 계약 정의 (Phase 0)                                         │
│     ├─ API 계약: contracts/*.contract.ts                       │
│     ├─ BE 스키마: backend/app/schemas/*.py                     │
│     └─ 타입 동기화: TypeScript ↔ Pydantic                      │
│                                                                 │
│  2. 테스트 선행 작성 (RED)                                      │
│     ├─ BE 테스트: tests/api/*.py                               │
│     ├─ FE 테스트: src/__tests__/**/*.test.ts                   │
│     └─ 모든 테스트가 실패하는 상태 (정상!)                      │
│                                                                 │
│  3. Mock 생성 (FE 독립 개발용)                                  │
│     └─ MSW 핸들러: src/mocks/handlers/*.ts                     │
│                                                                 │
│  4. 병렬 구현 (RED→GREEN)                                       │
│     ├─ BE: 테스트 통과 목표로 구현                              │
│     └─ FE: Mock API로 개발 → 나중에 실제 API 연결              │
│                                                                 │
│  5. 통합 검증                                                   │
│     └─ Mock 제거 → E2E 테스트                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 테스트 피라미드

| 레벨 | 도구 | 커버리지 목표 | 위치 |
|------|------|-------------|------|
| Unit | pytest / Vitest | ≥ 80% | backend/tests/unit/, frontend/src/__tests__/ |
| Integration | pytest / Vitest + MSW | Critical paths | backend/tests/integration/ |
| E2E | Playwright | Key user flows | e2e/ |

### 7.3 테스트 도구

**백엔드:**
| 도구 | 용도 |
|------|------|
| pytest | 테스트 실행 |
| pytest-asyncio | 비동기 테스트 |
| httpx | API 클라이언트 (TestClient) |
| Factory Boy | 테스트 데이터 생성 (User, Model, Order) |
| pytest-cov | 커버리지 측정 |

**프론트엔드:**
| 도구 | 용도 |
|------|------|
| Vitest | 테스트 실행 (Jest 호환) |
| React Testing Library | 컴포넌트 테스트 |
| MSW (Mock Service Worker) | API 모킹 |
| Playwright | E2E 테스트 |

### 7.4 계약 파일 구조

```
project/
├── contracts/                    # API 계약 (BE/FE 공유)
│   ├── types.ts                 # 공통 타입 정의
│   ├── auth.contract.ts         # 인증 API 계약
│   ├── models.contract.ts       # AI 모델 API 계약
│   ├── booking.contract.ts      # 섭외 API 계약
│   └── orders.contract.ts       # 주문 API 계약
│
├── backend/
│   ├── app/schemas/             # Pydantic 스키마 (계약과 동기화)
│   │   ├── auth.py
│   │   ├── models.py
│   │   ├── booking.py
│   │   └── orders.py
│   └── tests/
│       └── api/                 # API 테스트 (계약 기반)
│           ├── test_auth.py
│           ├── test_models.py
│           └── test_booking.py
│
└── frontend/
    ├── src/
    │   ├── mocks/
    │   │   ├── handlers/        # MSW Mock 핸들러
    │   │   │   ├── auth.ts
    │   │   │   ├── models.ts
    │   │   │   └── booking.ts
    │   │   └── data/            # Mock 데이터
    │   └── __tests__/
    │       └── api/             # API 테스트 (계약 기반)
    └── e2e/                     # E2E 테스트
        ├── auth.spec.ts
        ├── model-explore.spec.ts
        └── booking-flow.spec.ts
```

### 7.5 TDD 사이클

모든 기능 개발은 다음 사이클을 따릅니다:

```
RED    → 실패하는 테스트 먼저 작성
GREEN  → 테스트를 통과하는 최소한의 코드 구현
REFACTOR → 테스트 통과 유지하며 코드 개선
```

### 7.6 품질 게이트

**병합 전 필수 통과:**
- [ ] 모든 단위 테스트 통과
- [ ] 커버리지 ≥ 80%
- [ ] 린트 통과 (ruff / ESLint)
- [ ] 타입 체크 통과 (mypy / tsc)
- [ ] E2E 테스트 통과 (해당 기능)

**검증 명령어:**
```bash
# 백엔드
pytest --cov=app --cov-report=term-missing --cov-fail-under=80
ruff check .
mypy app/

# 프론트엔드
npm run test -- --coverage
npm run lint
npm run type-check

# E2E
npx playwright test
```

---

## 8. API 설계 원칙

### 8.1 RESTful 규칙

| 메서드 | 용도 | 예시 |
|--------|------|------|
| GET | 조회 | GET /api/v1/models/{id} |
| POST | 생성 | POST /api/v1/models |
| PUT | 전체 수정 | PUT /api/v1/models/{id} |
| PATCH | 부분 수정 | PATCH /api/v1/orders/{id}/status |
| DELETE | 삭제 | DELETE /api/v1/models/{id} |

### 8.2 응답 형식

**성공 응답:**
```json
{
  "data": {
    "id": "uuid",
    "name": "AI Model Name"
  },
  "meta": {
    "page": 1,
    "total": 100
  }
}
```

**에러 응답:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력 값이 올바르지 않습니다.",
    "details": [
      { "field": "email", "message": "유효한 이메일을 입력하세요" }
    ]
  }
}
```

### 8.3 API 버저닝

| 방식 | 예시 | 채택 여부 |
|------|------|----------|
| URL 경로 | /api/v1/models | 권장 (채택) |
| 헤더 | Accept: application/vnd.api+json; version=1 | 선택 |

---

## 9. 병렬 개발 지원 (Git Worktree)

### 9.1 개요

BE/FE를 완전히 독립된 환경에서 병렬 개발할 때 Git Worktree를 사용합니다.

### 9.2 Worktree 구조

```
~/projects/
├── make_model/                # 메인 (main 브랜치)
├── make_model-auth-be/        # Worktree: feature/auth-be
├── make_model-auth-fe/        # Worktree: feature/auth-fe
├── make_model-models-be/      # Worktree: feature/models-be
└── make_model-models-fe/      # Worktree: feature/models-fe
```

### 9.3 명령어

```bash
# Worktree 생성
git worktree add ../make_model-auth-be -b feature/auth-be
git worktree add ../make_model-auth-fe -b feature/auth-fe

# 각 Worktree에서 독립 작업
cd ../make_model-auth-be && pytest tests/api/test_auth.py
cd ../make_model-auth-fe && npm run test -- src/__tests__/auth/

# 테스트 통과 후 병합
git checkout main
git merge --no-ff feature/auth-be
git merge --no-ff feature/auth-fe

# Worktree 정리
git worktree remove ../make_model-auth-be
git worktree remove ../make_model-auth-fe
```

### 9.4 병합 규칙

| 조건 | 병합 가능 |
|------|----------|
| 단위 테스트 통과 (GREEN) | 필수 |
| 커버리지 ≥ 80% | 필수 |
| 린트/타입 체크 통과 | 필수 |
| E2E 테스트 통과 | 권장 |

---

## Decision Log 참조

- DL-T001: FastAPI + Next.js 조합 선택 (비동기 성능 + SEO) (2026-02-05)
- DL-T002: Pinecone Vector DB 채택 (관리형 서비스, AI 매칭 최적화) (2026-02-05)
- DL-T003: Cloudflare R2 선택 (S3 호환 + 무료 egress) (2026-02-05)
- DL-T004: Socket.IO 채택 (실시간 채팅, 자동 재연결) (2026-02-05)
