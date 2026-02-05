# Coding Convention & AI Collaboration Guide

> 고품질/유지보수/보안을 위한 인간-AI 협업 운영 지침서입니다.

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

## 1. 핵심 원칙

### 1.1 신뢰하되, 검증하라 (Don't Trust, Verify)

AI가 생성한 코드는 반드시 검증해야 합니다:

- [ ] 코드 리뷰: 생성된 코드 직접 확인 (특히 인증, 결제 로직)
- [ ] 테스트 실행: 자동화 테스트 통과 확인 (커버리지 80% 이상)
- [ ] 보안 검토: 민감 정보 노출 여부 확인 (.env, API 키)
- [ ] 동작 확인: 실제로 실행하여 기대 동작 확인

### 1.2 최종 책임은 인간에게

- AI는 도구이고, 최종 결정과 책임은 개발자에게 있습니다
- 이해하지 못하는 코드는 사용하지 않습니다
- 의심스러운 부분은 반드시 질문합니다

---

## 2. 프로젝트 구조

### 2.1 디렉토리 구조

```
make_model/
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js App Router 페이지
│   │   │   ├── (auth)/         # 인증 그룹 (로그인, 회원가입)
│   │   │   ├── (dashboard)/    # 대시보드 그룹 (브랜드, 크리에이터)
│   │   │   ├── explore/        # 모델 탐색
│   │   │   ├── models/         # 모델 프로필
│   │   │   └── page.tsx        # 홈 (랜딩)
│   │   ├── components/         # 재사용 컴포넌트
│   │   │   ├── ui/             # 기본 UI (Button, Input, Card)
│   │   │   ├── features/       # 기능별 컴포넌트
│   │   │   └── layout/         # 레이아웃 (Header, Footer)
│   │   ├── hooks/              # 커스텀 훅
│   │   ├── lib/                # 유틸리티 함수
│   │   ├── services/           # API 호출 (Axios)
│   │   ├── stores/             # Zustand 상태 관리
│   │   ├── types/              # TypeScript 타입
│   │   └── mocks/              # MSW Mock 핸들러
│   └── tests/                  # 테스트 (Vitest)
│       └── e2e/                # E2E 테스트 (Playwright)
│
├── backend/
│   ├── app/
│   │   ├── main.py             # FastAPI 엔트리포인트
│   │   ├── models/             # SQLAlchemy 모델
│   │   │   ├── user.py
│   │   │   ├── ai_model.py
│   │   │   └── order.py
│   │   ├── routes/             # API 라우트
│   │   │   ├── auth.py
│   │   │   ├── models.py
│   │   │   ├── booking.py
│   │   │   └── orders.py
│   │   ├── schemas/            # Pydantic 스키마 (요청/응답)
│   │   │   ├── auth.py
│   │   │   ├── models.py
│   │   │   └── orders.py
│   │   ├── services/           # 비즈니스 로직
│   │   │   ├── auth_service.py
│   │   │   ├── model_service.py
│   │   │   ├── matching_service.py (AI 매칭)
│   │   │   └── payment_service.py (포트원)
│   │   ├── utils/              # 유틸리티
│   │   │   ├── security.py     # JWT, bcrypt
│   │   │   └── file_upload.py  # R2 업로드
│   │   └── database.py         # DB 연결
│   └── tests/                  # pytest 테스트
│       ├── unit/
│       └── integration/
│
├── contracts/                  # API 계약 (BE/FE 공유)
│   ├── types.ts
│   ├── auth.contract.ts
│   ├── models.contract.ts
│   └── orders.contract.ts
│
├── docs/
│   └── planning/               # 기획 문서 (소크라테스 산출물)
│       ├── 01-prd.md
│       ├── 02-trd.md
│       ├── 03-user-flow.md
│       ├── 04-database-design.md
│       ├── 05-design-system.md
│       ├── 06-screens.md
│       └── 07-coding-convention.md
│
└── docker-compose.yml          # 로컬 개발 환경
```

### 2.2 네이밍 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 파일 (컴포넌트) | PascalCase | `ModelCard.tsx` |
| 파일 (유틸) | camelCase | `formatDate.ts` |
| 파일 (Python) | snake_case | `model_service.py` |
| 컴포넌트 | PascalCase | `ModelCard`, `BookingWizard` |
| 함수/변수 (TS) | camelCase | `getModelById`, `userName` |
| 함수/변수 (Py) | snake_case | `get_model_by_id`, `user_name` |
| 상수 | UPPER_SNAKE | `MAX_IMAGE_COUNT`, `JWT_SECRET` |
| CSS 클래스 | kebab-case | `model-card`, `booking-wizard` |
| API 엔드포인트 | kebab-case | `/api/v1/ai-models`, `/api/v1/booking-orders` |

---

## 3. 아키텍처 원칙

### 3.1 뼈대 먼저 (Skeleton First)

1. 전체 구조를 먼저 잡고
2. 빈 함수/컴포넌트로 스켈레톤 생성
3. 하나씩 구현 채워나가기

**예시:**
```typescript
// 먼저 스켈레톤 작성
export function ModelCard({ model }: ModelCardProps) {
  return (
    <div className="model-card">
      {/* TODO: 썸네일 이미지 */}
      {/* TODO: 모델 이름 */}
      {/* TODO: 찜하기 버튼 */}
    </div>
  );
}

// 이후 하나씩 구현
```

### 3.2 작은 모듈로 분해

- 한 파일에 200줄 이하 권장
- 한 함수에 50줄 이하 권장
- 한 컴포넌트에 100줄 이하 권장

### 3.3 관심사 분리

| 레이어 | 역할 | 예시 |
|--------|------|------|
| UI (Components) | 화면 표시 | `ModelCard.tsx`, `Button.tsx` |
| 상태 (Stores) | 데이터 관리 | `useAuthStore.ts`, `useModelStore.ts` |
| 서비스 (Services) | API 통신 | `modelService.ts`, `authService.ts` |
| 유틸 (Utils) | 순수 함수 | `formatDate.ts`, `validateEmail.ts` |

---

## 4. AI 소통 원칙

### 4.1 하나의 채팅 = 하나의 작업

- 한 번에 하나의 명확한 작업만 요청
- 작업 완료 후 다음 작업 진행
- 컨텍스트가 길어지면 새 대화 시작

### 4.2 컨텍스트 명시

**좋은 예:**
```
TASKS 문서의 T1.3 (AI 모델 목록 조회 API)을 구현해주세요.

참조:
- Database Design의 AI_MODEL 엔티티
- TRD의 FastAPI + SQLAlchemy 스택
- contracts/models.contract.ts의 GetModelsResponse 타입

조건:
- 필터링 지원: style, gender, age_range
- 페이지네이션: page, limit (기본 20개)
- 정렬: rating DESC, view_count DESC, created_at DESC
```

**나쁜 예:**
```
API 만들어줘
```

### 4.3 기존 코드 재사용

- 새로 만들기 전에 기존 코드 확인 요청
- 중복 코드 방지
- 일관성 유지

### 4.4 프롬프트 템플릿

```
## 작업
TASKS 문서의 T{N}.{X} ({작업명})을 구현해주세요.

## 참조 문서
- {문서명} 섹션 {번호}
- contracts/{계약파일명}

## 제약 조건
- {지켜야 할 것 1}
- {지켜야 할 것 2}

## 예상 결과
- 생성될 파일: {파일 경로}
- 기대 동작: {설명}
```

---

## 5. 보안 체크리스트

### 5.1 절대 금지

- [ ] 비밀정보 하드코딩 금지 (API 키, 비밀번호, JWT_SECRET)
- [ ] .env 파일 커밋 금지 (.gitignore에 추가)
- [ ] SQL 직접 문자열 조합 금지 (SQLAlchemy ORM 사용)
- [ ] 사용자 입력 그대로 출력 금지 (XSS 방지, Next.js 자동 이스케이핑 활용)

### 5.2 필수 적용

- [ ] 모든 사용자 입력 검증 (Pydantic 서버 측 검증 필수)
- [ ] 비밀번호 해싱 (bcrypt, cost factor 12)
- [ ] HTTPS 사용 (프로덕션 필수)
- [ ] CORS 설정 (화이트리스트: 프론트 도메인만 허용)
- [ ] 인증된 요청만 민감 API 접근 (JWT 미들웨어)

### 5.3 환경 변수 관리

```bash
# .env.example (커밋 O, Git에 포함)
DATABASE_URL=postgresql://user:password@localhost:5432/make_model
JWT_SECRET=your-secret-key-here
PORTONE_API_KEY=your-portone-key
PINECONE_API_KEY=your-pinecone-key
R2_BUCKET_NAME=your-bucket-name

# .env (커밋 X, .gitignore에 추가)
DATABASE_URL=postgresql://real:real@prod:5432/make_model
JWT_SECRET=abc123xyz789randomsecret
PORTONE_API_KEY=live_xxxxxxxxx
PINECONE_API_KEY=xxxxxxxx-xxxx-xxxx
R2_BUCKET_NAME=make-model-prod
```

---

## 6. 테스트 워크플로우

### 6.1 즉시 실행 검증

코드 작성 후 바로 테스트:

```bash
# 백엔드
cd backend
pytest tests/ -v --cov=app --cov-report=term-missing

# 프론트엔드
cd frontend
npm run test -- --coverage

# E2E
cd frontend
npx playwright test
```

### 6.2 오류 로그 공유 규칙

오류 발생 시 AI에게 전달할 정보:

1. 전체 에러 메시지
2. 관련 코드 스니펫
3. 재현 단계
4. 이미 시도한 해결책

**예시:**
```
## 에러
sqlalchemy.exc.IntegrityError: duplicate key value violates unique constraint "user_email_key"

## 코드
backend/app/routes/auth.py, line 42
user = User(email=email, password_hash=hashed_password)
db.add(user)
db.commit()  # 여기서 에러 발생

## 재현
1. 이메일 "test@example.com"으로 회원가입
2. 동일한 이메일로 다시 회원가입 시도

## 시도한 것
- email 필드에 UNIQUE 제약조건 확인 → 이미 설정됨
- 가입 전 이메일 중복 체크 필요한 것으로 판단
```

---

## 7. Git 워크플로우

### 7.1 브랜치 전략

```
main                # 프로덕션
├── develop         # 개발 통합
│   ├── feature/feat-0-auth
│   ├── feature/feat-1-model-explore
│   ├── feature/feat-2-booking
│   ├── feature/feat-3-order-management
│   └── fix/payment-error
```

### 7.2 커밋 메시지

```
<type>(<scope>): <subject>

<body>
```

**타입:**
- `feat`: 새 기능 (FEAT-1, FEAT-2, FEAT-3)
- `fix`: 버그 수정
- `refactor`: 리팩토링 (동작 변경 없음)
- `docs`: 문서 수정
- `test`: 테스트 추가/수정
- `chore`: 빌드, 설정 등

**예시:**
```
feat(auth): 소셜 로그인 추가

- Google OAuth 연동
- Kakao OAuth 연동
- TRD 섹션 4.1 구현 완료
- 관련 TASKS: T0.2, T0.3

Refs: #12
```

---

## 8. 코드 품질 도구

### 8.1 필수 설정

| 도구 | 프론트엔드 | 백엔드 |
|------|-----------|--------|
| 린터 | ESLint (@next/eslint-config) | Ruff |
| 포매터 | Prettier | Black |
| 타입 체크 | TypeScript (strict mode) | mypy (선택) |

### 8.2 Pre-commit 훅

```yaml
# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      # 프론트엔드
      - id: lint-frontend
        name: Lint Frontend
        entry: npm run lint
        language: system
        files: ^frontend/

      # 백엔드
      - id: lint-backend
        name: Lint Backend
        entry: ruff check .
        language: system
        files: ^backend/

      - id: format-backend
        name: Format Backend
        entry: black --check .
        language: system
        files: ^backend/
```

### 8.3 린트 통과 기준

- ESLint 에러 0개
- Ruff 에러 0개
- TypeScript 컴파일 에러 0개
- 테스트 커버리지 80% 이상

---

## 9. 프로젝트별 규칙

### 9.1 프론트엔드 (Next.js)

**컴포넌트 규칙:**
```typescript
// 1. 타입은 파일 상단에 정의
interface ModelCardProps {
  model: AIModel;
  onFavorite?: (id: string) => void;
}

// 2. 컴포넌트는 기본 export
export default function ModelCard({ model, onFavorite }: ModelCardProps) {
  // 3. 훅은 최상단
  const router = useRouter();
  const { user } = useAuthStore();

  // 4. 핸들러는 handle* 접두사
  const handleFavoriteClick = () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    onFavorite?.(model.id);
  };

  // 5. JSX 반환
  return (
    <div className="model-card">
      {/* ... */}
    </div>
  );
}
```

**API 호출 규칙:**
```typescript
// services/modelService.ts
import axios from '@/lib/axios';
import { GetModelsResponse, AIModel } from '@/types/models';

export const modelService = {
  // 함수명: 동사 + 명사
  async getModels(params: GetModelsParams): Promise<GetModelsResponse> {
    const { data } = await axios.get<GetModelsResponse>('/api/v1/models', { params });
    return data;
  },

  async getModelById(id: string): Promise<AIModel> {
    const { data } = await axios.get<AIModel>(`/api/v1/models/${id}`);
    return data;
  },
};
```

### 9.2 백엔드 (FastAPI)

**라우트 규칙:**
```python
# routes/models.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.schemas.models import GetModelsResponse, AIModelResponse
from app.services.model_service import ModelService
from app.database import get_db

router = APIRouter(prefix="/api/v1/models", tags=["models"])

@router.get("", response_model=GetModelsResponse)
async def get_models(
    style: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    AI 모델 목록 조회

    - 필터링: style, gender, age_range
    - 페이지네이션: page, limit
    - 정렬: rating DESC
    """
    service = ModelService(db)
    result = service.get_models(style=style, page=page, limit=limit)
    return result
```

**서비스 레이어 규칙:**
```python
# services/model_service.py
from sqlalchemy.orm import Session
from app.models.ai_model import AIModel
from app.schemas.models import GetModelsResponse

class ModelService:
    def __init__(self, db: Session):
        self.db = db

    def get_models(self, style: str | None, page: int, limit: int) -> GetModelsResponse:
        query = self.db.query(AIModel).filter(AIModel.status == "active")

        if style:
            query = query.filter(AIModel.style == style)

        total = query.count()
        models = query.order_by(AIModel.rating.desc()).offset((page - 1) * limit).limit(limit).all()

        return GetModelsResponse(
            data=[self._to_response(m) for m in models],
            meta={"page": page, "total": total, "limit": limit}
        )

    def _to_response(self, model: AIModel) -> AIModelResponse:
        # 헬퍼 메서드는 언더스코어 접두사
        return AIModelResponse.from_orm(model)
```

---

## 10. 성능 최적화 가이드

### 10.1 프론트엔드

- Next.js Image 컴포넌트 사용 (자동 최적화)
- 동적 import로 코드 스플리팅
- useMemo, useCallback로 불필요한 리렌더링 방지
- React Query로 API 캐싱

### 10.2 백엔드

- DB 쿼리 N+1 문제 방지 (joinedload 사용)
- 인덱스 활용 (자주 조회되는 컬럼)
- 페이지네이션 필수 (전체 목록 조회 금지)
- Redis 캐싱 (v2에서 고려)

---

## 11. 문서화 규칙

### 11.1 코드 주석

**좋은 주석 (WHY):**
```typescript
// AI 매칭 점수가 0.7 이상인 모델만 추천 (사용자 만족도 80% 기준)
const recommendedModels = matchedModels.filter(m => m.score >= 0.7);
```

**나쁜 주석 (WHAT):**
```typescript
// 필터링
const recommendedModels = matchedModels.filter(m => m.score >= 0.7);
```

### 11.2 API 문서

- FastAPI 자동 생성 문서 활용 (/docs)
- Pydantic 스키마에 description 추가

---

## Decision Log 참조

- DL-CC001: ESLint + Prettier 조합 (Next.js 공식 권장) (2026-02-05)
- DL-CC002: Ruff + Black 조합 (Python 최신 표준) (2026-02-05)
- DL-CC003: 커버리지 80% 기준 설정 (업계 표준) (2026-02-05)
- DL-CC004: Pre-commit 훅 필수 적용 (품질 게이트) (2026-02-05)
