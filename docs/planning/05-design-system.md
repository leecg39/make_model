# Design System (기초 디자인 시스템)

> 비기술자도 이해할 수 있는 디자인 언어로 작성합니다.
> 최소 접근성 패키지를 포함합니다.

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

## 1. 디자인 철학

### 1.1 핵심 가치

| 가치 | 설명 | 구현 방법 |
|------|------|----------|
| 신뢰감 | 브랜드가 안심하고 거래할 수 있는 플랫폼 | 깔끔한 레이아웃, 투명한 가격 표시, 인증 배지 |
| 창의성 | AI 아트의 창조적 분위기 | 그라디언트 악센트, 모던한 타이포그래피 |
| 효율성 | 빠른 의사결정을 돕는 UI | 명확한 CTA, 단계별 진행 표시, 최소 클릭 |

### 1.2 참고 서비스 (무드보드)

| 서비스 | 참고할 점 | 참고하지 않을 점 |
|--------|----------|-----------------|
| Dribbble | 포트폴리오 그리드, 이미지 중심 레이아웃 | 과도한 여백 |
| Fiverr | 패키지 선택 UI, 명확한 가격 표시 | 복잡한 필터 |
| Notion | 담백한 인터페이스, 일관된 간격 | 모노톤 컬러 (밝은 악센트 필요) |

---

## 2. 컬러 팔레트

### 2.1 역할 기반 컬러

| 역할 | 컬러 | Hex | 사용처 |
|------|------|-----|--------|
| **Primary** | 퍼플 블루 | `#6366F1` | 주요 버튼, 링크, 강조 |
| **Primary Light** | 라이트 퍼플 | `#A5B4FC` | 호버, 배경 악센트 |
| **Secondary** | 틸 그린 | `#14B8A6` | 보조 버튼, 성공 메시지 |
| **Surface** | 라이트 그레이 | `#F9FAFB` | 카드, 섹션 배경 |
| **Background** | 화이트 | `#FFFFFF` | 전체 배경 |
| **Text Primary** | 다크 그레이 | `#111827` | 제목, 주요 텍스트 |
| **Text Secondary** | 미디엄 그레이 | `#6B7280` | 보조 텍스트, 캡션 |

### 2.2 피드백 컬러

| 상태 | 컬러 | Hex | 사용처 |
|------|------|-----|--------|
| **Success** | 초록 | `#22C55E` | 주문 완료, 결제 성공 |
| **Warning** | 노랑 | `#EAB308` | 검토 필요, 주의 |
| **Error** | 빨강 | `#EF4444` | 오류, 삭제 확인 |
| **Info** | 파랑 | `#3B82F6` | 안내, 도움말 |

### 2.3 다크 모드 (v2)

- MVP에서는 라이트 모드만 지원
- 다크 모드는 사용자 요청 기반으로 v2에서 추가 예정

---

## 3. 타이포그래피

### 3.1 폰트 패밀리

| 용도 | 폰트 | 대안 |
|------|------|------|
| 본문 | Pretendard | system-ui, -apple-system, sans-serif |
| 숫자/코드 | Roboto Mono | monospace |

### 3.2 타입 스케일

| 이름 | 크기 | 굵기 | 용도 |
|------|------|------|------|
| Display | 48px | Bold (700) | 랜딩 히어로 제목 |
| H1 | 36px | Bold (700) | 페이지 제목 (모델 프로필 이름) |
| H2 | 28px | SemiBold (600) | 섹션 제목 (포트폴리오, 주문 목록) |
| H3 | 22px | SemiBold (600) | 서브섹션 (패키지 타입) |
| Body Large | 18px | Regular (400) | 강조 본문 (콘셉트 설명) |
| Body | 16px | Regular (400) | 기본 본문 |
| Caption | 14px | Regular (400) | 부가 정보 (날짜, 조회수) |
| Small | 12px | Regular (400) | 라벨, 힌트 |

---

## 4. 간격 토큰 (Spacing)

| 이름 | 값 | 용도 |
|------|-----|------|
| xs | 4px | 아이콘-텍스트 간격 |
| sm | 8px | 태그 내부 패딩 |
| md | 16px | 카드 내부 여백, 요소 간 간격 |
| lg | 24px | 섹션 간 간격 |
| xl | 32px | 큰 섹션 구분 |
| 2xl | 48px | 페이지 상단 여백 |
| 3xl | 64px | 랜딩 섹션 간 여백 |

---

## 5. 기본 컴포넌트

### 5.1 버튼 (Button)

| 상태 | Primary | Secondary | Ghost |
|------|---------|-----------|-------|
| 기본 | 퍼플 채움 + 흰 텍스트 | 퍼플 테두리 + 퍼플 텍스트 | 퍼플 텍스트만 |
| 호버 | 약간 어둡게 (#5558E3) | 퍼플 배경 채움 | 배경 연한 퍼플 |
| 포커스 | 2px 퍼플 포커스 링 | 2px 퍼플 포커스 링 | 2px 퍼플 포커스 링 |
| 비활성 | 50% 투명도 + 커서 not-allowed | 50% 투명도 | 50% 투명도 |
| 로딩 | 스피너 표시 + 텍스트 비활성 | 스피너 표시 | 스피너 표시 |

**크기:**
- Large: 높이 48px, 패딩 24px (좌우)
- Medium: 높이 40px, 패딩 20px (기본)
- Small: 높이 32px, 패딩 16px

**예시:**
- Primary Large: "섭외 요청하기"
- Secondary Medium: "찜하기"
- Ghost Small: "더보기"

### 5.2 입력 필드 (Input)

| 상태 | 스타일 |
|------|--------|
| 기본 | 회색 테두리 (1px #D1D5DB) + 흰 배경 |
| 포커스 | 퍼플 테두리 (2px #6366F1) + 포커스 링 |
| 에러 | 빨강 테두리 (2px #EF4444) + 빨간 에러 메시지 |
| 비활성 | 연한 회색 배경 (#F3F4F6), 입력 불가 |
| 성공 | 초록 테두리 (2px #22C55E) |

**높이:** 40px (Medium), 48px (Large)
**패딩:** 12px (좌우), 10px (상하)

### 5.3 카드 (Card)

- 배경: Surface 컬러 (#F9FAFB) 또는 화이트 (#FFFFFF)
- 테두리: 1px solid #E5E7EB
- 모서리: 12px 라운드
- 그림자: 0 1px 3px rgba(0,0,0,0.1), 호버 시 0 4px 6px rgba(0,0,0,0.1)
- 내부 여백: md (16px)

**모델 카드 특화:**
- 이미지 비율: 3:4 (세로형)
- 이미지 상단 라운드: 12px
- 정보 영역 패딩: 16px

### 5.4 태그 (Tag)

- 배경: Primary Light (#A5B4FC)
- 텍스트: Primary (#6366F1)
- 패딩: 4px 12px
- 모서리: 16px (pill 형태)
- 폰트: Caption (14px)

---

## 6. 접근성 체크리스트

### 6.1 필수 (MVP)

- [ ] **색상 대비**: 텍스트와 배경의 대비율 4.5:1 이상 (WCAG AA)
  - Primary (#6366F1) vs White → 4.8:1 (통과)
  - Text Primary (#111827) vs White → 16.8:1 (통과)
- [ ] **포커스 링**: 키보드 탭 탐색 시 2px 퍼플 포커스 링 명확
- [ ] **클릭 영역**: 버튼/링크 최소 44x44px
- [ ] **에러 표시**: 색상만으로 구분하지 않음 (빨간 테두리 + 아이콘 + 텍스트)
- [ ] **폰트 크기**: 본문 최소 16px

### 6.2 권장 (v2)

- [ ] 키보드 전체 탐색 가능 (Tab, Enter, Esc)
- [ ] 스크린 리더 호환 (ARIA 라벨, alt 텍스트)
- [ ] 애니메이션 줄이기 옵션 (prefers-reduced-motion)
- [ ] 고대비 모드

---

## 7. 아이콘 & 일러스트

### 7.1 아이콘 라이브러리

| 옵션 | 설명 | 링크 |
|------|------|------|
| Lucide | 깔끔한 라인 아이콘, 일관된 스타일 | lucide.dev |
| Heroicons | Tailwind 공식, 2가지 스타일 (outline/solid) | heroicons.com |

**선택:** Lucide (채택)

### 7.2 아이콘 사용 규칙

- 크기: 16px (작음), 20px (기본), 24px (큼)
- 색상: 텍스트와 동일하게 상속 (currentColor)
- 버튼 내: 텍스트 왼쪽에 배치, 8px 간격
- Stroke width: 2px (일관성)

**주요 아이콘:**
- 검색: Search
- 필터: Filter
- 찜하기: Heart (outline → solid 전환)
- 섭외 요청: Send
- 채팅: MessageSquare
- 다운로드: Download
- 설정: Settings

### 7.3 일러스트

- 스타일: 미니멀 라인 일러스트 (undraw.co 참고)
- 컬러: Primary (#6366F1) 악센트
- 사용처: 빈 상태 (Empty State), 에러 페이지

---

## 8. Stitch MCP 연동 설정

> /screen-spec Phase 5에서 Google Stitch로 디자인 목업을 자동 생성할 때 사용됩니다.

### 8.1 Stitch 프롬프트 컨텍스트

아래 정보가 Stitch 프롬프트에 자동 포함됩니다:

```yaml
# specs/stitch-context.yaml (자동 생성용)
stitch_context:
  style_keywords:
    - "modern, clean, minimal"
    - "creative, artistic (AI art platform)"
    - "professional, trustworthy (marketplace)"

  color_usage:
    primary: "버튼, 링크, 강조 요소, CTA에 퍼플 블루(#6366F1) 사용"
    secondary: "성공 메시지, 보조 버튼에 틸 그린(#14B8A6) 사용"
    surface: "카드, 컨테이너 배경에 라이트 그레이(#F9FAFB) 사용"

  component_style:
    buttons: "12px rounded corners, subtle shadow on hover, 40-48px height"
    cards: "light border (1px #E5E7EB), soft shadow, 12px radius, hover lift effect"
    inputs: "outlined style with 1px border, 2px primary border on focus, 40px height"

  spacing_philosophy:
    - "generous whitespace for clarity (16-24px between sections)"
    - "consistent 8px grid system"
    - "compact but breathable card layouts"

  imagery:
    style: "photography (AI-generated model portraits), minimal icons"
    treatment: "12px rounded corners for images, subtle overlay on hover"
```

### 8.2 참고 디자인 URL (선택)

Stitch가 참고할 수 있는 디자인 URL:

| 페이지 | 참고 URL | 참고할 점 |
|--------|----------|----------|
| Dribbble 프로필 | dribbble.com/shots | 포트폴리오 그리드, 이미지 중심 레이아웃 |
| Fiverr 패키지 | fiverr.com/gigs | 가격 패키지 선택 UI, 명확한 CTA |
| Notion 랜딩 | notion.so | 담백한 섹션 구분, 일관된 타이포그래피 |

### 8.3 Stitch 출력 설정

| 설정 | 값 | 설명 |
|------|-----|------|
| 이미지 형식 | PNG | 목업 이미지 |
| 이미지 해상도 | 2x | 레티나 대응 (1440px 기준) |
| HTML 프레임워크 | Tailwind CSS | 생성 코드 스타일 |
| 접근성 기준 | WCAG 2.1 AA | 최소 85점 목표 |
| 반응형 | Desktop-first | 1024px+ 우선, 768px 태블릿 대응 |

---

## 9. 반응형 디자인

### 9.1 브레이크포인트

| 디바이스 | 최소 너비 | 주요 변화 |
|----------|----------|----------|
| 모바일 | 0px | 1열 레이아웃, 하단 네비게이션 |
| 태블릿 | 768px | 2열 그리드, 축소된 사이드바 |
| 데스크톱 | 1024px | 3-4열 그리드, 고정 사이드바 |
| 와이드 | 1440px | 최대 너비 제한 (1280px), 중앙 정렬 |

### 9.2 모바일 우선 고려사항

- 터치 타겟 최소 48x48px
- 하단 네비게이션 (홈/탐색/찜/마이페이지)
- 풀스크린 모달 (팝업 대신)
- 스와이프 제스처 (이미지 갤러리)

---

## 10. 애니메이션 & 인터랙션

### 10.1 기본 트랜지션

| 요소 | 속성 | 시간 | Easing |
|------|------|------|--------|
| 버튼 호버 | background-color | 200ms | ease-in-out |
| 카드 호버 | box-shadow, transform | 300ms | ease-out |
| 모달 등장 | opacity, scale | 250ms | ease-out |
| 페이지 전환 | opacity | 150ms | ease-in |

### 10.2 로딩 상태

- 버튼 로딩: 스피너 (16px, Primary 색상)
- 페이지 로딩: 스켈레톤 UI (그레이 그라디언트 애니메이션)
- 이미지 로딩: 블러 플레이스홀더 → 선명하게 전환

### 10.3 피드백

- 성공: 체크 아이콘 + 초록 토스트 (3초)
- 에러: X 아이콘 + 빨강 토스트 (5초)
- 정보: i 아이콘 + 파랑 토스트 (3초)

---

## Decision Log 참조

- DL-DS001: Pretendard 폰트 선택 (한글 최적화, 가변 폰트) (2026-02-05)
- DL-DS002: Lucide 아이콘 채택 (일관된 라인 스타일, React 컴포넌트 제공) (2026-02-05)
- DL-DS003: 퍼플 블루(#6366F1) Primary 컬러 선택 (창의성 + 신뢰감) (2026-02-05)
- DL-DS004: 데스크톱 우선 개발 (브랜드 담당자는 주로 PC 사용) (2026-02-05)
