/**
 * Mock AI Models Data
 *
 * 56개의 실제 모델 이미지를 기반으로 12개의 AI 모델 Mock 데이터
 * 이미지 경로: /picture/model/사진_XXX_YYYY.png
 */

import { AIModel, ModelImage, ModelsResponse } from '@/types/model';

// ─────────────────────────────────────────────────────────────────────────────
// Mock Creators
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_CREATORS = [
  {
    id: 'c1000000-0000-0000-0000-000000000001',
    email: 'creator1@example.com',
    nickname: '아이리스 스튜디오',
    profile_image: null,
  },
  {
    id: 'c1000000-0000-0000-0000-000000000002',
    email: 'creator2@example.com',
    nickname: '루나 크리에이티브',
    profile_image: null,
  },
  {
    id: 'c1000000-0000-0000-0000-000000000003',
    email: 'creator3@example.com',
    nickname: '스텔라 AI',
    profile_image: null,
  },
  {
    id: 'c1000000-0000-0000-0000-000000000004',
    email: 'creator4@example.com',
    nickname: '노바 디자인',
    profile_image: null,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Image Builder
// ─────────────────────────────────────────────────────────────────────────────

const IMAGE_BASE_PATH = '/picture/model';

function buildImage(
  modelId: string,
  filename: string,
  order: number,
  isThumbnail: boolean
): ModelImage {
  return {
    id: `img-${modelId}-${order}`,
    model_id: modelId,
    image_url: `${IMAGE_BASE_PATH}/${filename}`,
    display_order: order,
    is_thumbnail: isThumbnail,
    created_at: '2026-02-04T10:43:00Z',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock AI Models
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_AI_MODELS: AIModel[] = [
  // Model 1: 캐주얼 여성 20대
  {
    id: 'm0000000-0000-0000-0000-000000000001',
    creator_id: 'c1000000-0000-0000-0000-000000000001',
    name: '소희',
    description:
      '트렌디하고 자연스러운 캐주얼 룩의 AI 모델입니다. 데일리웨어, 스트릿 패션 촬영에 적합합니다.',
    style: 'casual',
    gender: 'female',
    age_range: '20s',
    view_count: 1523,
    rating: 4.8,
    status: 'active',
    thumbnail_url: `${IMAGE_BASE_PATH}/사진_001_0001.png`,
    tags: ['캐주얼', '데일리룩', '스트릿', '트렌디'],
    images: [
      buildImage('m0000000-0000-0000-0000-000000000001', '사진_001_0001.png', 1, true),
      buildImage('m0000000-0000-0000-0000-000000000001', '사진_002_0002.png', 2, false),
      buildImage('m0000000-0000-0000-0000-000000000001', '사진_003_0003.png', 3, false),
      buildImage('m0000000-0000-0000-0000-000000000001', '사진_004_0004.png', 4, false),
      buildImage('m0000000-0000-0000-0000-000000000001', '사진_005_0005.png', 5, false),
    ],
    creator: MOCK_CREATORS[0],
    created_at: '2026-01-15T09:00:00Z',
    updated_at: '2026-02-01T14:30:00Z',
  },
  // Model 2: 포멀 여성 30대
  {
    id: 'm0000000-0000-0000-0000-000000000002',
    creator_id: 'c1000000-0000-0000-0000-000000000001',
    name: '유진',
    description:
      '세련되고 우아한 비즈니스 룩 전문 AI 모델입니다. 오피스웨어, 정장 화보에 완벽합니다.',
    style: 'formal',
    gender: 'female',
    age_range: '30s',
    view_count: 982,
    rating: 4.6,
    status: 'active',
    thumbnail_url: `${IMAGE_BASE_PATH}/사진_006_0006.png`,
    tags: ['포멀', '비즈니스', '오피스', '세련된'],
    images: [
      buildImage('m0000000-0000-0000-0000-000000000002', '사진_006_0006.png', 1, true),
      buildImage('m0000000-0000-0000-0000-000000000002', '사진_007_0007.png', 2, false),
      buildImage('m0000000-0000-0000-0000-000000000002', '사진_008_0008.png', 3, false),
      buildImage('m0000000-0000-0000-0000-000000000002', '사진_009_0009.png', 4, false),
    ],
    creator: MOCK_CREATORS[0],
    created_at: '2026-01-18T11:00:00Z',
    updated_at: '2026-02-02T10:00:00Z',
  },
  // Model 3: 스포티 여성 20대
  {
    id: 'm0000000-0000-0000-0000-000000000003',
    creator_id: 'c1000000-0000-0000-0000-000000000002',
    name: '하늘',
    description:
      '역동적이고 활기찬 스포츠웨어 전문 AI 모델입니다. 애슬레저, 스포츠 브랜드 캠페인에 적합합니다.',
    style: 'sporty',
    gender: 'female',
    age_range: '20s',
    view_count: 2341,
    rating: 4.9,
    status: 'active',
    thumbnail_url: `${IMAGE_BASE_PATH}/사진_010_0010.png`,
    tags: ['스포티', '애슬레저', '헬스', '액티브'],
    images: [
      buildImage('m0000000-0000-0000-0000-000000000003', '사진_010_0010.png', 1, true),
      buildImage('m0000000-0000-0000-0000-000000000003', '사진_011_0011.png', 2, false),
      buildImage('m0000000-0000-0000-0000-000000000003', '사진_012_0012.png', 3, false),
      buildImage('m0000000-0000-0000-0000-000000000003', '사진_013_0013.png', 4, false),
      buildImage('m0000000-0000-0000-0000-000000000003', '사진_014_0014.png', 5, false),
    ],
    creator: MOCK_CREATORS[1],
    created_at: '2026-01-20T08:30:00Z',
    updated_at: '2026-02-03T09:15:00Z',
  },
  // Model 4: 빈티지 여성 20대
  {
    id: 'm0000000-0000-0000-0000-000000000004',
    creator_id: 'c1000000-0000-0000-0000-000000000002',
    name: '민서',
    description:
      '클래식하고 레트로한 감성의 AI 모델입니다. 빈티지 패션, 레트로 무드 촬영에 어울립니다.',
    style: 'vintage',
    gender: 'female',
    age_range: '20s',
    view_count: 876,
    rating: 4.5,
    status: 'active',
    thumbnail_url: `${IMAGE_BASE_PATH}/사진_015_0015.png`,
    tags: ['빈티지', '레트로', '클래식', '올드스쿨'],
    images: [
      buildImage('m0000000-0000-0000-0000-000000000004', '사진_015_0015.png', 1, true),
      buildImage('m0000000-0000-0000-0000-000000000004', '사진_016_0016.png', 2, false),
      buildImage('m0000000-0000-0000-0000-000000000004', '사진_017_0017.png', 3, false),
      buildImage('m0000000-0000-0000-0000-000000000004', '사진_018_0018.png', 4, false),
    ],
    creator: MOCK_CREATORS[1],
    created_at: '2026-01-22T14:00:00Z',
    updated_at: '2026-02-01T16:45:00Z',
  },
  // Model 5: 캐주얼 남성 20대
  {
    id: 'm0000000-0000-0000-0000-000000000005',
    creator_id: 'c1000000-0000-0000-0000-000000000003',
    name: '준호',
    description:
      '모던하고 깔끔한 남성 캐주얼 AI 모델입니다. 남성복, 스트릿웨어 브랜드에 적합합니다.',
    style: 'casual',
    gender: 'male',
    age_range: '20s',
    view_count: 1245,
    rating: 4.7,
    status: 'active',
    thumbnail_url: `${IMAGE_BASE_PATH}/사진_019_0019.png`,
    tags: ['캐주얼', '스트릿', '남성복', '모던'],
    images: [
      buildImage('m0000000-0000-0000-0000-000000000005', '사진_019_0019.png', 1, true),
      buildImage('m0000000-0000-0000-0000-000000000005', '사진_020_0020.png', 2, false),
      buildImage('m0000000-0000-0000-0000-000000000005', '사진_021_0021.png', 3, false),
      buildImage('m0000000-0000-0000-0000-000000000005', '사진_022_0022.png', 4, false),
      buildImage('m0000000-0000-0000-0000-000000000005', '사진_023_0023.png', 5, false),
    ],
    creator: MOCK_CREATORS[2],
    created_at: '2026-01-25T10:30:00Z',
    updated_at: '2026-02-04T11:00:00Z',
  },
  // Model 6: 포멀 남성 30대
  {
    id: 'm0000000-0000-0000-0000-000000000006',
    creator_id: 'c1000000-0000-0000-0000-000000000003',
    name: '현우',
    description:
      '품격있고 전문적인 비즈니스 남성 AI 모델입니다. 정장, 수트 화보에 최적화되어 있습니다.',
    style: 'formal',
    gender: 'male',
    age_range: '30s',
    view_count: 654,
    rating: 4.4,
    status: 'active',
    thumbnail_url: `${IMAGE_BASE_PATH}/사진_024_0024.png`,
    tags: ['포멀', '정장', '비즈니스', '프로페셔널'],
    images: [
      buildImage('m0000000-0000-0000-0000-000000000006', '사진_024_0024.png', 1, true),
      buildImage('m0000000-0000-0000-0000-000000000006', '사진_025_0025.png', 2, false),
      buildImage('m0000000-0000-0000-0000-000000000006', '사진_026_0026.png', 3, false),
      buildImage('m0000000-0000-0000-0000-000000000006', '사진_027_0027.png', 4, false),
    ],
    creator: MOCK_CREATORS[2],
    created_at: '2026-01-26T09:00:00Z',
    updated_at: '2026-02-02T15:30:00Z',
  },
  // Model 7: 스포티 남성 20대
  {
    id: 'm0000000-0000-0000-0000-000000000007',
    creator_id: 'c1000000-0000-0000-0000-000000000004',
    name: '태민',
    description:
      '건강하고 활력있는 스포츠 남성 AI 모델입니다. 스포츠웨어, 피트니스 브랜드에 어울립니다.',
    style: 'sporty',
    gender: 'male',
    age_range: '20s',
    view_count: 1876,
    rating: 4.8,
    status: 'active',
    thumbnail_url: `${IMAGE_BASE_PATH}/사진_028_0028.png`,
    tags: ['스포티', '피트니스', '액티브', '헬시'],
    images: [
      buildImage('m0000000-0000-0000-0000-000000000007', '사진_028_0028.png', 1, true),
      buildImage('m0000000-0000-0000-0000-000000000007', '사진_029_0029.png', 2, false),
      buildImage('m0000000-0000-0000-0000-000000000007', '사진_030_0030.png', 3, false),
      buildImage('m0000000-0000-0000-0000-000000000007', '사진_031_0031.png', 4, false),
      buildImage('m0000000-0000-0000-0000-000000000007', '사진_032_0032.png', 5, false),
    ],
    creator: MOCK_CREATORS[3],
    created_at: '2026-01-28T13:00:00Z',
    updated_at: '2026-02-03T17:00:00Z',
  },
  // Model 8: 캐주얼 여성 10대
  {
    id: 'm0000000-0000-0000-0000-000000000008',
    creator_id: 'c1000000-0000-0000-0000-000000000004',
    name: '지우',
    description:
      '발랄하고 귀여운 10대 감성의 AI 모델입니다. 영캐주얼, Z세대 타겟 브랜드에 적합합니다.',
    style: 'casual',
    gender: 'female',
    age_range: '10s',
    view_count: 2103,
    rating: 4.7,
    status: 'active',
    thumbnail_url: `${IMAGE_BASE_PATH}/사진_033_0033.png`,
    tags: ['영캐주얼', 'Z세대', '발랄', '큐트'],
    images: [
      buildImage('m0000000-0000-0000-0000-000000000008', '사진_033_0033.png', 1, true),
      buildImage('m0000000-0000-0000-0000-000000000008', '사진_034_0034.png', 2, false),
      buildImage('m0000000-0000-0000-0000-000000000008', '사진_035_0035.png', 3, false),
      buildImage('m0000000-0000-0000-0000-000000000008', '사진_036_0036.png', 4, false),
    ],
    creator: MOCK_CREATORS[3],
    created_at: '2026-01-29T11:30:00Z',
    updated_at: '2026-02-04T10:15:00Z',
  },
  // Model 9: 빈티지 여성 30대
  {
    id: 'm0000000-0000-0000-0000-000000000009',
    creator_id: 'c1000000-0000-0000-0000-000000000001',
    name: '서연',
    description:
      '고급스럽고 우아한 빈티지 감성 AI 모델입니다. 럭셔리 브랜드, 하이엔드 패션에 어울립니다.',
    style: 'vintage',
    gender: 'female',
    age_range: '30s',
    view_count: 743,
    rating: 4.6,
    status: 'active',
    thumbnail_url: `${IMAGE_BASE_PATH}/사진_037_0037.png`,
    tags: ['빈티지', '럭셔리', '하이엔드', '엘레강스'],
    images: [
      buildImage('m0000000-0000-0000-0000-000000000009', '사진_037_0037.png', 1, true),
      buildImage('m0000000-0000-0000-0000-000000000009', '사진_038_0038.png', 2, false),
      buildImage('m0000000-0000-0000-0000-000000000009', '사진_039_0039.png', 3, false),
      buildImage('m0000000-0000-0000-0000-000000000009', '사진_040_0040.png', 4, false),
      buildImage('m0000000-0000-0000-0000-000000000009', '사진_040_0041.png', 5, false),
    ],
    creator: MOCK_CREATORS[0],
    created_at: '2026-01-30T15:00:00Z',
    updated_at: '2026-02-03T12:30:00Z',
  },
  // Model 10: 캐주얼 여성 20대 (뉴페이스)
  {
    id: 'm0000000-0000-0000-0000-000000000010',
    creator_id: 'c1000000-0000-0000-0000-000000000002',
    name: '예은',
    description:
      '신선하고 트렌디한 MZ세대 감성 AI 모델입니다. 인스타그램, SNS 마케팅에 최적화되어 있습니다.',
    style: 'casual',
    gender: 'female',
    age_range: '20s',
    view_count: 3201,
    rating: 4.9,
    status: 'active',
    thumbnail_url: `${IMAGE_BASE_PATH}/사진_041_0042.png`,
    tags: ['MZ세대', '인스타', '트렌디', '바이럴'],
    images: [
      buildImage('m0000000-0000-0000-0000-000000000010', '사진_041_0042.png', 1, true),
      buildImage('m0000000-0000-0000-0000-000000000010', '사진_041_0043.png', 2, false),
      buildImage('m0000000-0000-0000-0000-000000000010', '사진_042_0044.png', 3, false),
      buildImage('m0000000-0000-0000-0000-000000000010', '사진_042_0045.png', 4, false),
    ],
    creator: MOCK_CREATORS[1],
    created_at: '2026-02-01T09:00:00Z',
    updated_at: '2026-02-04T14:00:00Z',
  },
  // Model 11: 포멀 여성 40대+
  {
    id: 'm0000000-0000-0000-0000-000000000011',
    creator_id: 'c1000000-0000-0000-0000-000000000003',
    name: '미경',
    description:
      '성숙하고 품위있는 시니어 AI 모델입니다. 프리미엄 브랜드, 시니어 타겟 패션에 적합합니다.',
    style: 'formal',
    gender: 'female',
    age_range: '40s_plus',
    view_count: 421,
    rating: 4.5,
    status: 'active',
    thumbnail_url: `${IMAGE_BASE_PATH}/사진_043_0046.png`,
    tags: ['시니어', '프리미엄', '품위', '클래식'],
    images: [
      buildImage('m0000000-0000-0000-0000-000000000011', '사진_043_0046.png', 1, true),
      buildImage('m0000000-0000-0000-0000-000000000011', '사진_044_0047.png', 2, false),
      buildImage('m0000000-0000-0000-0000-000000000011', '사진_044_0048.png', 3, false),
      buildImage('m0000000-0000-0000-0000-000000000011', '사진_045_0049.png', 4, false),
    ],
    creator: MOCK_CREATORS[2],
    created_at: '2026-02-02T10:00:00Z',
    updated_at: '2026-02-04T16:00:00Z',
  },
  // Model 12: 스포티 남성 10대
  {
    id: 'm0000000-0000-0000-0000-000000000012',
    creator_id: 'c1000000-0000-0000-0000-000000000004',
    name: '민준',
    description:
      '에너지 넘치는 10대 스포츠 AI 모델입니다. 스쿨룩, 청소년 스포츠 브랜드에 어울립니다.',
    style: 'sporty',
    gender: 'male',
    age_range: '10s',
    view_count: 1532,
    rating: 4.6,
    status: 'active',
    thumbnail_url: `${IMAGE_BASE_PATH}/사진_046_0050.png`,
    tags: ['스포티', '스쿨룩', '청소년', '에너지'],
    images: [
      buildImage('m0000000-0000-0000-0000-000000000012', '사진_046_0050.png', 1, true),
      buildImage('m0000000-0000-0000-0000-000000000012', '사진_047_0051.png', 2, false),
      buildImage('m0000000-0000-0000-0000-000000000012', '사진_048_0052.png', 3, false),
      buildImage('m0000000-0000-0000-0000-000000000012', '사진_049_0053.png', 4, false),
      buildImage('m0000000-0000-0000-0000-000000000012', '사진_050_0054.png', 5, false),
      buildImage('m0000000-0000-0000-0000-000000000012', '사진_051_0055.png', 6, false),
      buildImage('m0000000-0000-0000-0000-000000000012', '사진_052_0056.png', 7, false),
    ],
    creator: MOCK_CREATORS[3],
    created_at: '2026-02-03T08:00:00Z',
    updated_at: '2026-02-05T09:00:00Z',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get paginated mock models response
 */
export function getMockModelsResponse(
  page = 1,
  limit = 12,
  filters?: {
    style?: string;
    gender?: string;
    age_range?: string;
    keyword?: string;
  }
): ModelsResponse {
  let filtered = [...MOCK_AI_MODELS];

  // Apply filters
  if (filters?.style) {
    filtered = filtered.filter((m) => m.style === filters.style);
  }
  if (filters?.gender) {
    filtered = filtered.filter((m) => m.gender === filters.gender);
  }
  if (filters?.age_range) {
    filtered = filtered.filter((m) => m.age_range === filters.age_range);
  }
  if (filters?.keyword) {
    const keyword = filters.keyword.toLowerCase();
    filtered = filtered.filter(
      (m) =>
        m.name.toLowerCase().includes(keyword) ||
        m.description?.toLowerCase().includes(keyword) ||
        m.tags?.some((t) => t.toLowerCase().includes(keyword))
    );
  }

  // Paginate
  const total = filtered.length;
  const offset = (page - 1) * limit;
  const items = filtered.slice(offset, offset + limit);

  return {
    items,
    total,
    page,
    limit,
    offset,
  };
}

/**
 * Get single mock model by ID
 */
export function getMockModelById(id: string): AIModel | undefined {
  return MOCK_AI_MODELS.find((m) => m.id === id);
}

/**
 * Get popular models (sorted by view_count)
 */
export function getPopularMockModels(limit = 6): AIModel[] {
  return [...MOCK_AI_MODELS].sort((a, b) => b.view_count - a.view_count).slice(0, limit);
}

/**
 * Get recent models (sorted by created_at)
 */
export function getRecentMockModels(limit = 6): AIModel[] {
  return [...MOCK_AI_MODELS]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}

/**
 * Get top-rated models (sorted by rating)
 */
export function getTopRatedMockModels(limit = 6): AIModel[] {
  return [...MOCK_AI_MODELS]
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, limit);
}

export default MOCK_AI_MODELS;
