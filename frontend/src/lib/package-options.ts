import type { PackageOption } from '@/types/booking';

export interface PackageCatalogItem extends PackageOption {
  turnaroundDays: number;
  recommendedFor: string;
}

export const PACKAGE_CATALOG: PackageCatalogItem[] = [
  {
    type: 'standard',
    name: 'Standard',
    imageCount: 3,
    price: 50000,
    isExclusive: false,
    description: '기본 3장',
    turnaroundDays: 2,
    recommendedFor: '신규 제품 테스트 및 빠른 A/B 캠페인',
  },
  {
    type: 'premium',
    name: 'Premium',
    imageCount: 5,
    price: 100000,
    isExclusive: false,
    description: '프리미엄 5장',
    turnaroundDays: 3,
    recommendedFor: '상세페이지와 SNS 동시 운영 캠페인',
  },
  {
    type: 'exclusive',
    name: 'Exclusive',
    imageCount: 10,
    price: 200000,
    isExclusive: true,
    exclusiveMonths: 3,
    description: '독점 10장 (3개월)',
    turnaroundDays: 5,
    recommendedFor: '대형 런칭, 시즌 캠페인, 독점 운영',
  },
];

export const BOOKING_PACKAGES: PackageOption[] = PACKAGE_CATALOG.map((item) => ({
  type: item.type,
  name: item.name,
  imageCount: item.imageCount,
  price: item.price,
  isExclusive: item.isExclusive,
  exclusiveMonths: item.exclusiveMonths,
  description: item.description,
}));
