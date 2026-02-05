# Database Design (데이터베이스 설계)

> Mermaid ERD로 주요 엔티티와 관계를 표현합니다.
> 각 엔티티에 FEAT 주석을 달아 어떤 기능에서 사용되는지 명시합니다.
> 최소 수집 원칙을 반영하여 불필요한 개인정보는 지양합니다.

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

## 1. ERD (Entity Relationship Diagram)

```mermaid
erDiagram
    %% FEAT-0: 사용자 관리
    USER {
        uuid id PK "고유 식별자"
        string email UK "로그인 이메일"
        string password_hash "암호화된 비밀번호 (소셜 로그인 시 NULL)"
        string nickname "표시 이름"
        string role "역할: brand/creator/admin"
        string profile_image "프로필 이미지 URL"
        string company_name "회사명 (브랜드만)"
        datetime created_at "가입일"
        datetime updated_at "수정일"
        datetime deleted_at "탈퇴일 (soft delete)"
    }

    %% FEAT-0: 인증
    AUTH_TOKEN {
        uuid id PK
        uuid user_id FK
        string refresh_token UK "리프레시 토큰"
        datetime expires_at "만료 시각"
        datetime created_at "생성일"
    }

    %% FEAT-1: AI 모델
    AI_MODEL {
        uuid id PK
        uuid creator_id FK "크리에이터 (USER)"
        string name "모델 이름"
        text description "모델 소개"
        string style "스타일: casual/formal/sporty/vintage"
        string gender "성별: male/female/neutral"
        string age_range "나이대: 10s/20s/30s/40s+"
        int view_count "조회수"
        float rating "평균 평점 (1-5)"
        string status "상태: draft/active/inactive"
        datetime created_at "등록일"
        datetime updated_at "수정일"
    }

    %% FEAT-1: AI 모델 포트폴리오 이미지
    MODEL_IMAGE {
        uuid id PK
        uuid model_id FK
        string image_url "이미지 URL (R2/S3)"
        int display_order "표시 순서"
        boolean is_thumbnail "썸네일 여부"
        datetime created_at "업로드일"
    }

    %% FEAT-1: AI 모델 태그
    MODEL_TAG {
        uuid id PK
        uuid model_id FK
        string tag "태그: fashion/beauty/fitness/food 등"
        datetime created_at "생성일"
    }

    %% FEAT-1: 찜하기
    FAVORITE {
        uuid id PK
        uuid user_id FK "브랜드 사용자"
        uuid model_id FK "찜한 모델"
        datetime created_at "찜한 날짜"
    }

    %% FEAT-2: 섭외 주문
    ORDER {
        uuid id PK
        uuid brand_id FK "브랜드 (USER)"
        uuid creator_id FK "크리에이터 (USER)"
        uuid model_id FK "섭외한 모델 (AI_MODEL)"
        string order_number UK "주문 번호 (표시용)"
        text concept_description "콘셉트 설명"
        string package_type "패키지: basic/standard/premium"
        int image_count "제작 이미지 수"
        boolean is_exclusive "독점 여부"
        int exclusive_months "독점 기간 (개월)"
        int total_price "총 결제 금액"
        string status "상태: pending/accepted/in_progress/completed/cancelled"
        datetime accepted_at "수락 시각"
        datetime completed_at "완료 시각"
        datetime created_at "주문 생성일"
        datetime updated_at "수정일"
    }

    %% FEAT-2: 결제 정보
    PAYMENT {
        uuid id PK
        uuid order_id FK
        string payment_provider "PG사: portone"
        string payment_method "결제 수단: card/transfer"
        int amount "결제 금액"
        string status "상태: pending/completed/failed/refunded"
        string transaction_id "PG사 거래 ID"
        datetime paid_at "결제 완료 시각"
        datetime created_at "생성일"
    }

    %% FEAT-3: 납품 파일
    DELIVERY_FILE {
        uuid id PK
        uuid order_id FK
        string file_url "파일 URL (R2/S3)"
        string file_name "파일명"
        int file_size "파일 크기 (bytes)"
        datetime uploaded_at "업로드 시각"
    }

    %% FEAT-3: 주문별 채팅
    CHAT_MESSAGE {
        uuid id PK
        uuid order_id FK
        uuid sender_id FK "발신자 (USER)"
        text message "메시지 내용"
        string attachment_url "첨부 파일 URL (선택)"
        boolean is_read "읽음 여부"
        datetime created_at "발송 시각"
    }

    %% FEAT-3: 정산
    SETTLEMENT {
        uuid id PK
        uuid creator_id FK "크리에이터"
        uuid order_id FK
        int total_amount "총 주문 금액"
        int platform_fee "플랫폼 수수료 (10%)"
        int settlement_amount "정산 금액 (90%)"
        string status "상태: pending/completed"
        datetime requested_at "정산 요청일"
        datetime completed_at "정산 완료일"
        datetime created_at "생성일"
    }

    %% 관계 정의
    USER ||--o{ AUTH_TOKEN : "has"
    USER ||--o{ AI_MODEL : "creates"
    USER ||--o{ ORDER : "places (brand)"
    USER ||--o{ ORDER : "receives (creator)"
    USER ||--o{ FAVORITE : "favorites"
    USER ||--o{ CHAT_MESSAGE : "sends"
    USER ||--o{ SETTLEMENT : "receives"

    AI_MODEL ||--o{ MODEL_IMAGE : "has"
    AI_MODEL ||--o{ MODEL_TAG : "has"
    AI_MODEL ||--o{ FAVORITE : "favorited by"
    AI_MODEL ||--o{ ORDER : "ordered"

    ORDER ||--o| PAYMENT : "has"
    ORDER ||--o{ DELIVERY_FILE : "contains"
    ORDER ||--o{ CHAT_MESSAGE : "has"
    ORDER ||--o| SETTLEMENT : "settled"
```

---

## 2. 엔티티 상세 정의

### 2.1 USER (사용자) - FEAT-0

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | UUID | PK | 고유 식별자 |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 로그인 이메일 |
| password_hash | VARCHAR(255) | NULL 허용 | 소셜 로그인 시 NULL |
| nickname | VARCHAR(50) | NOT NULL | 표시 이름 |
| role | VARCHAR(20) | NOT NULL | brand/creator/admin |
| profile_image | VARCHAR(500) | NULL | 프로필 이미지 URL |
| company_name | VARCHAR(100) | NULL | 브랜드만 입력 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 가입일 |
| updated_at | TIMESTAMP | NOT NULL | 최종 수정일 |
| deleted_at | TIMESTAMP | NULL | Soft delete용 |

**인덱스:**
- `idx_user_email` ON email
- `idx_user_role` ON role

**최소 수집 원칙 적용:**
- 필수: email, nickname, role
- 선택: profile_image, company_name
- 수집 안 함: 전화번호, 주소, 생년월일 (필요 없음)

### 2.2 AI_MODEL (AI 모델) - FEAT-1

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | UUID | PK | 고유 식별자 |
| creator_id | UUID | FK → USER.id, NOT NULL | 크리에이터 |
| name | VARCHAR(100) | NOT NULL | 모델 이름 |
| description | TEXT | NULL | 모델 소개 |
| style | VARCHAR(50) | NOT NULL | casual/formal/sporty/vintage |
| gender | VARCHAR(20) | NOT NULL | male/female/neutral |
| age_range | VARCHAR(10) | NOT NULL | 10s/20s/30s/40s+ |
| view_count | INTEGER | DEFAULT 0 | 조회수 |
| rating | DECIMAL(2,1) | DEFAULT 0.0 | 평균 평점 (1.0-5.0) |
| status | VARCHAR(20) | DEFAULT 'draft' | draft/active/inactive |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 등록일 |
| updated_at | TIMESTAMP | NOT NULL | 수정일 |

**인덱스:**
- `idx_model_creator_id` ON creator_id
- `idx_model_status` ON status
- `idx_model_style` ON style
- `idx_model_rating` ON rating DESC
- `idx_model_created_at` ON created_at DESC

### 2.3 ORDER (섭외 주문) - FEAT-2

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | UUID | PK | 고유 식별자 |
| brand_id | UUID | FK → USER.id, NOT NULL | 브랜드 사용자 |
| creator_id | UUID | FK → USER.id, NOT NULL | 크리에이터 |
| model_id | UUID | FK → AI_MODEL.id, NOT NULL | 섭외한 모델 |
| order_number | VARCHAR(50) | UNIQUE, NOT NULL | 주문 번호 (ORD-20260205-001) |
| concept_description | TEXT | NOT NULL | 콘셉트 설명 |
| package_type | VARCHAR(20) | NOT NULL | basic/standard/premium |
| image_count | INTEGER | NOT NULL | 제작 이미지 수 (3/10/20) |
| is_exclusive | BOOLEAN | DEFAULT FALSE | 독점 여부 |
| exclusive_months | INTEGER | NULL | 독점 기간 (Premium만) |
| total_price | INTEGER | NOT NULL | 총 결제 금액 (원) |
| status | VARCHAR(30) | DEFAULT 'pending' | pending/accepted/in_progress/completed/cancelled |
| accepted_at | TIMESTAMP | NULL | 수락 시각 |
| completed_at | TIMESTAMP | NULL | 완료 시각 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 주문 생성일 |
| updated_at | TIMESTAMP | NOT NULL | 수정일 |

**인덱스:**
- `idx_order_brand_id` ON brand_id
- `idx_order_creator_id` ON creator_id
- `idx_order_model_id` ON model_id
- `idx_order_status` ON status
- `idx_order_created_at` ON created_at DESC

### 2.4 PAYMENT (결제 정보) - FEAT-2

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | UUID | PK | 고유 식별자 |
| order_id | UUID | FK → ORDER.id, NOT NULL | 주문 |
| payment_provider | VARCHAR(50) | NOT NULL | portone |
| payment_method | VARCHAR(50) | NOT NULL | card/transfer |
| amount | INTEGER | NOT NULL | 결제 금액 |
| status | VARCHAR(20) | DEFAULT 'pending' | pending/completed/failed/refunded |
| transaction_id | VARCHAR(100) | NULL | PG사 거래 ID |
| paid_at | TIMESTAMP | NULL | 결제 완료 시각 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 생성일 |

**인덱스:**
- `idx_payment_order_id` ON order_id
- `idx_payment_status` ON status

### 2.5 CHAT_MESSAGE (채팅 메시지) - FEAT-3

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | UUID | PK | 고유 식별자 |
| order_id | UUID | FK → ORDER.id, NOT NULL | 주문 |
| sender_id | UUID | FK → USER.id, NOT NULL | 발신자 |
| message | TEXT | NOT NULL | 메시지 내용 |
| attachment_url | VARCHAR(500) | NULL | 첨부 파일 URL |
| is_read | BOOLEAN | DEFAULT FALSE | 읽음 여부 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 발송 시각 |

**인덱스:**
- `idx_chat_order_id` ON order_id
- `idx_chat_created_at` ON created_at DESC

---

## 3. 관계 정의

| 부모 | 자식 | 관계 | 설명 |
|------|------|------|------|
| USER | AUTH_TOKEN | 1:N | 사용자는 여러 리프레시 토큰 보유 가능 |
| USER | AI_MODEL | 1:N | 크리에이터는 여러 모델 등록 |
| USER | ORDER (brand_id) | 1:N | 브랜드는 여러 주문 생성 |
| USER | ORDER (creator_id) | 1:N | 크리에이터는 여러 주문 수신 |
| USER | FAVORITE | 1:N | 브랜드는 여러 모델 찜 |
| USER | CHAT_MESSAGE | 1:N | 사용자는 여러 메시지 발송 |
| USER | SETTLEMENT | 1:N | 크리에이터는 여러 정산 수령 |
| AI_MODEL | MODEL_IMAGE | 1:N | 모델은 여러 포트폴리오 이미지 보유 |
| AI_MODEL | MODEL_TAG | 1:N | 모델은 여러 태그 보유 |
| AI_MODEL | FAVORITE | 1:N | 모델은 여러 브랜드에게 찜됨 |
| AI_MODEL | ORDER | 1:N | 모델은 여러 주문에 사용됨 |
| ORDER | PAYMENT | 1:1 | 주문은 하나의 결제 정보 보유 |
| ORDER | DELIVERY_FILE | 1:N | 주문은 여러 납품 파일 포함 |
| ORDER | CHAT_MESSAGE | 1:N | 주문은 여러 채팅 메시지 포함 |
| ORDER | SETTLEMENT | 1:1 | 주문은 하나의 정산 정보 보유 |

---

## 4. 데이터 생명주기

| 엔티티 | 생성 시점 | 보존 기간 | 삭제/익명화 |
|--------|----------|----------|------------|
| USER | 회원가입 | 탈퇴 후 30일 | Hard delete (개인정보 완전 삭제) |
| AUTH_TOKEN | 로그인 | 만료 시 | Hard delete (배치 작업) |
| AI_MODEL | 모델 등록 | 계정 탈퇴 시 | Soft delete (deleted_at 설정) |
| ORDER | 섭외 요청 | 영구 (통계용) | 사용자 ID 익명화 |
| PAYMENT | 결제 완료 | 영구 (법적 보관 의무) | 사용자 ID 익명화 |
| DELIVERY_FILE | 콘텐츠 업로드 | 주문 완료 후 1년 | Hard delete (R2에서 제거) |
| CHAT_MESSAGE | 메시지 발송 | 주문 완료 후 1년 | Hard delete |
| SETTLEMENT | 정산 요청 | 영구 (법적 보관 의무) | 사용자 ID 익명화 |

---

## 5. 확장 고려사항

### 5.1 v2에서 추가 예정 엔티티

```mermaid
erDiagram
    %% v2: 리뷰 시스템
    REVIEW {
        uuid id PK
        uuid order_id FK
        uuid reviewer_id FK "브랜드"
        int rating "평점 1-5"
        text comment "리뷰 내용"
        datetime created_at
    }

    %% v2: 알림
    NOTIFICATION {
        uuid id PK
        uuid user_id FK
        string type "주문/채팅/정산"
        text message "알림 내용"
        boolean is_read
        datetime created_at
    }

    %% v2: AI 매칭 로그
    MATCHING_LOG {
        uuid id PK
        uuid user_id FK "브랜드"
        text concept_query "입력한 콘셉트"
        jsonb recommended_models "추천된 모델 ID 배열"
        uuid selected_model_id FK "선택한 모델"
        datetime created_at
    }
```

### 5.2 인덱스 전략

- **읽기 최적화**: 자주 조회되는 컬럼에 인덱스 (status, created_at, rating)
- **쓰기 고려**: 인덱스 과다 방지 (최대 5개/테이블)
- **복합 인덱스**: (model_id, status), (brand_id, created_at) 등 자주 함께 조회되는 컬럼 조합

### 5.3 파티셔닝 계획 (v2)

- **ORDER 테이블**: created_at 기준 월별 파티셔닝 (데이터 증가 시)
- **CHAT_MESSAGE 테이블**: created_at 기준 월별 파티셔닝

---

## Decision Log 참조

- DL-DB001: PostgreSQL JSONB 활용 (MODEL 메타데이터 유연성) (2026-02-05)
- DL-DB002: Soft delete 적용 (USER, AI_MODEL 복구 가능성 확보) (2026-02-05)
- DL-DB003: ORDER 상태 기계 설계 (pending → accepted → in_progress → completed) (2026-02-05)
- DL-DB004: SETTLEMENT 테이블 분리 (정산 로직 독립성, 법적 보관) (2026-02-05)
