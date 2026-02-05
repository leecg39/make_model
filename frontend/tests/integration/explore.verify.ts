/**
 * @TASK P2-S2-V - 모델 탐색 연결점 검증
 * @SPEC docs/planning/domain/resources.yaml
 *
 * 모델 탐색 기능의 5가지 검증 항목을 정적 분석으로 확인합니다.
 */

import type { AIModel, Favorite } from '@/types/model';

/**
 * VERIFICATION RESULTS: 모델 탐색 연결점 검증
 */

// ============================================================================
// 1. FIELD COVERAGE: ai_models 필드 검증
// ============================================================================

/**
 * ✅ PASS: AIModel 타입에 모든 필수 필드 존재
 * @location frontend/src/types/model.ts
 *
 * 필수 필드:
 * - id: string ✅
 * - name: string ✅
 * - thumbnail_url: string ✅
 * - style: ModelStyle ✅
 * - gender: ModelGender ✅
 * - age_range: ModelAgeRange ✅
 * - rating: number ✅
 * - view_count: number ✅
 * - tags: string[] ✅
 *
 * 추가 필드:
 * - creator_id: string ✅
 * - status: ModelStatus ✅
 * - creator?: Creator (선택) ✅
 * - created_at: string ✅
 */

const AIModelFieldCoverage = {
  required: [
    'id',
    'name',
    'thumbnail_url',
    'style',
    'gender',
    'age_range',
    'rating',
    'view_count',
    'tags',
  ] as const,
  status: 'PASS',
  location: 'frontend/src/types/model.ts:15-29',
  details:
    'AIModel 인터페이스가 모든 필드를 포함하고 있음. Backend ai_models 테이블과 동기화됨.',
};

// ============================================================================
// 2. FIELD COVERAGE: favorites.[model_id] 필드 검증
// ============================================================================

/**
 * ✅ PASS: Favorite 타입에 model_id 필드 존재
 * @location frontend/src/types/model.ts
 *
 * Favorite 필드:
 * - id: string ✅
 * - user_id: string ✅
 * - model_id: string ✅
 * - created_at: string ✅
 */

const FavoriteFieldCoverage = {
  required: ['id', 'user_id', 'model_id', 'created_at'] as const,
  status: 'PASS',
  location: 'frontend/src/types/model.ts:48-53',
  details: 'Favorite 인터페이스가 model_id 필드를 포함하고 있음.',
};

// ============================================================================
// 3. ENDPOINT: GET /api/models?style=casual&gender=female 필터 동작
// ============================================================================

/**
 * ✅ PASS: modelService.getModels()가 필터 파라미터를 올바르게 전달
 * @location frontend/src/services/model.ts
 *
 * 지원되는 필터 파라미터:
 * - style: ModelStyle | '' ✅
 * - gender: ModelGender | '' ✅
 * - age_range: ModelAgeRange | '' ✅
 * - keyword: string ✅
 * - sort: 'recent' | 'popular' | 'rating' ✅
 * - page: number (기본값: 1) ✅
 * - limit: number (기본값: 12) ✅
 *
 * URLSearchParams 사용으로 쿼리 스트링 생성:
 * GET /api/models?page=1&limit=12&style=casual&gender=female
 */

const EndpointFilterCoverage = {
  status: 'PASS',
  location: 'frontend/src/services/model.ts:10-29',
  method: 'getModels(params)',
  implementation: [
    'URLSearchParams 생성',
    'page, limit 기본값 설정',
    '필터 조건 추가 (if 문으로 존재 여부 확인)',
    '쿼리 스트링 생성 후 API 호출',
  ],
  details: 'ModelService가 모든 필터 파라미터를 올바르게 URLSearchParams로 전달하고 있음.',
};

// ============================================================================
// 4. NAVIGATION: model_card → /models/:id 라우트 존재 검증
// ============================================================================

/**
 * ⚠️ ISSUE FOUND: /models/:id 라우트가 구현되어 있지 않음
 * @location frontend/src/components/cards/ModelCard.tsx:35-36
 *
 * 코드 분석:
 * - ModelCard가 router.push(`/models/${id}`)로 라우트 시도 ✅
 * - 하지만 frontend/src/app/models/[id]/page.tsx 파일 미존재 ❌
 *
 * 라우트 구조 검사 결과:
 * - /app/explore ✅ (탐색 페이지)
 * - /app/login ✅ (로그인)
 * - /app/register ✅ (회원가입)
 * - /app/profile ✅ (프로필)
 * - /app/models/[id] ❌ (모델 상세 페이지 - 미구현)
 */

const NavigationIssueCoverage = {
  status: 'ISSUE',
  severity: 'HIGH',
  location: 'frontend/src/components/cards/ModelCard.tsx:35-36',
  issue: 'Broken Navigation: /models/:id 라우트 미구현',
  codeSnippet: `
    // ModelCard.tsx (line 35-36)
    const handleCardClick = () => {
      router.push(\`/models/\${id}\`);  // ← /models/[id] 라우트 존재하지 않음
    };
  `,
  expectedRoute: '/app/models/[id]/page.tsx',
  actualRoute: 'NOT FOUND',
  impact: 'ModelCard 클릭 시 404 에러 발생. 모델 상세 페이지 접근 불가.',
  requirement: 'Phase 2에서 /models/[id] 페이지 구현 필요',
};

// ============================================================================
// 5. AUTH: favorites API 인증 체크 검증
// ============================================================================

/**
 * ⚠️ PARTIAL ISSUE: favorites API 호출 시 인증 헤더 미전달
 * @location frontend/src/services/favorite.ts
 *
 * 문제 분석:
 *
 * 1. axios `api` 인스턴스 설정 (frontend/src/services/api.ts)
 *    - baseURL 설정 ✅
 *    - Content-Type 헤더 설정 ✅
 *    - Authorization 인터셉터 설정 ❌ (없음)
 *
 * 2. favorite.ts 구현
 *    - api.get('/api/favorites') ← 인증 헤더 없음 ❌
 *    - api.post('/api/favorites', {...}) ← 인증 헤더 없음 ❌
 *    - api.delete(`/api/favorites/\${modelId}`) ← 인증 헤더 없음 ❌
 *
 * 3. useFavorites 훅 확인 (frontend/src/hooks/useFavorites.ts)
 *    - ✅ user 존재 확인 (enabled: !!user)
 *    - ✅ 로그인 체크 구현됨 (ModelCard에서 !user 시 loginModal 열기)
 *    - ❌ 하지만 실제 API 호출 시 Authorization 헤더 누락
 *
 * 원인:
 * - favoriteService가 기본 axios 인스턴스 사용
 * - axios 인스턴스에 request interceptor 없음
 * - 토큰을 자동으로 Authorization 헤더에 추가하는 메커니즘 부재
 *
 * 비교: authService (frontend/src/services/auth.ts)
 * - fetchWithAuth() 헬퍼 함수 사용 (line 9-28)
 * - authLib.getAuthHeader() 호출로 Authorization 헤더 추가 ✅
 * - favorites API도 동일한 패턴 필요
 */

const AuthCheckCoverage = {
  status: 'PARTIAL_ISSUE',
  severity: 'MEDIUM',
  location: [
    'frontend/src/services/api.ts (axios 인스턴스)',
    'frontend/src/services/favorite.ts (API 호출)',
    'frontend/src/hooks/useFavorites.ts (로그인 체크)',
  ],
  issues: [
    {
      type: 'Missing: axios interceptor',
      location: 'frontend/src/services/api.ts',
      problem: 'axios 인스턴스에 request interceptor 없음',
      impact: 'API 호출 시 Authorization 헤더 자동 추가 불가',
      code: `
        // 현재 (api.ts 라인 3-8) - 인터셉터 없음
        const api = axios.create({
          baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // 필요한 구현
        api.interceptors.request.use((config) => {
          const token = authLib.getToken();
          if (token) {
            config.headers.Authorization = \`Bearer \${token}\`;
          }
          return config;
        });
      `,
    },
    {
      type: 'Inconsistent: favoriteService vs authService',
      location: 'frontend/src/services/favorite.ts vs auth.ts',
      problem:
        'favorite.ts는 기본 axios 사용, auth.ts는 fetchWithAuth() 헬퍼 사용',
      impact: 'favorites API 호출 시 토큰 미포함',
      pattern:
        'authService는 fetchWithAuth()로 모든 호출에 Authorization 헤더 추가하는 반면, favoriteService는 그렇지 않음',
    },
  ],
  workaround: 'useFavorites 훅의 enabled 체크로 로그인 확인은 함 (line 18)',
  requirement: 'axios interceptor 추가 또는 favoriteService를 fetchWithAuth 패턴으로 리팩토링 필요',
};

// ============================================================================
// SUMMARY
// ============================================================================

/**
 * 검증 결과 요약
 */
export const ExploreVerificationResults = {
  timestamp: new Date().toISOString(),
  phase: 'Phase 2',
  taskId: 'P2-S2-V',
  results: [
    {
      name: '1. Field Coverage: ai_models',
      status: 'PASS',
      details: AIModelFieldCoverage,
    },
    {
      name: '2. Field Coverage: favorites',
      status: 'PASS',
      details: FavoriteFieldCoverage,
    },
    {
      name: '3. Endpoint: GET /api/models?style=casual&gender=female',
      status: 'PASS',
      details: EndpointFilterCoverage,
    },
    {
      name: '4. Navigation: model_card → /models/:id',
      status: 'ISSUE',
      severity: 'HIGH',
      details: NavigationIssueCoverage,
    },
    {
      name: '5. Auth: favorites API 인증 체크',
      status: 'PARTIAL_ISSUE',
      severity: 'MEDIUM',
      details: AuthCheckCoverage,
    },
  ],
  summary: {
    total: 5,
    pass: 2,
    issues: 3,
    blockers: 1,
  },
  issues: [
    {
      id: 'EX-001',
      type: 'Missing Route',
      severity: 'HIGH',
      title: '/models/:id 라우트 미구현',
      description: 'ModelCard에서 클릭 시 /models/:id로 이동하려 하지만 라우트가 없음',
      affectedFile: 'frontend/src/components/cards/ModelCard.tsx',
      recommendation: 'frontend/src/app/models/[id]/page.tsx 생성',
      phase: 'Phase 2',
    },
    {
      id: 'EX-002',
      type: 'Missing Interceptor',
      severity: 'MEDIUM',
      title: 'axios 인터셉터 미구성',
      description:
        'axios 인스턴스에 request interceptor가 없어 favorites API 호출 시 Authorization 헤더 자동 추가 불가',
      affectedFile: 'frontend/src/services/api.ts',
      recommendation:
        'axios.interceptors.request.use()로 Authorization 헤더 자동 추가 구현',
      alternative: 'favoriteService를 fetchWithAuth 패턴으로 리팩토링',
      phase: 'Phase 2',
    },
    {
      id: 'EX-003',
      type: 'Inconsistent Pattern',
      severity: 'MEDIUM',
      title: 'API 호출 패턴 불일치',
      description:
        'authService는 fetchWithAuth() 헬퍼 사용, favoriteService는 기본 axios 사용 - 일관성 필요',
      affectedFiles: [
        'frontend/src/services/favorite.ts',
        'frontend/src/services/auth.ts',
      ],
      recommendation: 'favoriteService를 authService와 동일한 패턴으로 통일',
      phase: 'Phase 2',
    },
  ],
  nextSteps: [
    '1. /models/[id] 페이지 생성 (EX-001 해결)',
    '2. axios interceptor 추가 또는 favoriteService 리팩토링 (EX-002, EX-003 해결)',
    '3. favorites API 호출 시 Authorization 헤더 검증',
    '4. integration test 실행으로 엔드투엔드 흐름 검증',
  ],
};

/**
 * 정적 분석 완료
 *
 * ✅ 2/5 항목 통과
 * ❌ 3/5 항목 이슈 발견 (1개 HIGH, 2개 MEDIUM)
 *
 * 주요 이슈:
 * 1. /models/:id 라우트 미구현 → 모델 상세 페이지 접근 불가
 * 2. axios Authorization 헤더 미설정 → favorites API 401 Unauthorized 가능성
 * 3. API 호출 패턴 불일치 → 코드 유지보수 어려움
 */
