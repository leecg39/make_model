# Architecture Decisions

## 2026-02-05

### ADR-001: Next.js over React+Vite
- SSR/SEO가 중요한 마켓플레이스 특성
- App Router로 서버 컴포넌트 활용
- API Routes로 BFF 패턴 가능

### ADR-002: FastAPI over Django/Express
- 비동기 처리 네이티브 지원
- Pydantic 통합으로 자동 문서화
- Python AI/ML 생태계 활용

### ADR-003: PostgreSQL + Pinecone
- PostgreSQL: 관계형 데이터 (주문, 결제, 사용자)
- Pinecone: 벡터 검색 (AI 모델 매칭)

### ADR-004: PortOne for Payment
- 한국 PG사 통합 SDK
- 카드/계좌이체 지원
