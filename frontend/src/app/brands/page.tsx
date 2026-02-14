import Link from 'next/link';
import { Layout } from '@/components/layout/Layout';
import { loadMarketInsights } from '@/lib/market-insights';

const brandFeatures = [
  {
    title: '빠른 모델 탐색',
    description: '콘셉트/스타일/가격 조건으로 필요한 AI 모델을 즉시 탐색합니다.',
  },
  {
    title: '명확한 의뢰 관리',
    description: '요청서 기반으로 작업 범위, 일정, 산출물 기준을 명확하게 맞춥니다.',
  },
  {
    title: '통합 운영 대시보드',
    description: '진행 상태, 메시지, 결제, 전달 파일까지 한 화면에서 관리할 수 있습니다.',
  },
];

const useCases = [
  '신제품 런칭용 상세페이지 크리에이티브 제작',
  'SNS 광고용 숏폼/스틸 콘텐츠 반복 운영',
  '브랜드별로 다른 AI 모델 라인업 테스트 캠페인',
];

export default async function BrandsPage() {
  const insights = await loadMarketInsights();

  return (
    <Layout>
      <section className="min-h-screen bg-[#0a0a0a] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-sm tracking-[0.2em] text-[#E882B2] mb-3">FOR BRANDS</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">브랜드를 위한 AI 모델 캠페인 플랫폼</h1>
            <p className="text-white/65 max-w-3xl leading-relaxed">
              MAKE MODEL은 브랜드가 필요한 AI 모델을 빠르게 찾고, 크리에이터와 협업해 콘텐츠를 제작하며,
              결과물 전달과 운영 이력을 체계적으로 관리하도록 돕습니다.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mb-8">
            {brandFeatures.map((feature) => (
              <article key={feature.title} className="rounded-2xl border border-white/10 bg-[#111] p-6">
                <h2 className="text-lg font-semibold text-white mb-3">{feature.title}</h2>
                <p className="text-sm text-white/65 leading-relaxed">{feature.description}</p>
              </article>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <article className="rounded-xl border border-white/10 bg-[#111] p-5">
              <p className="text-sm text-white/50 mb-2">누적 브랜드</p>
              <p className="text-2xl font-bold text-white">{insights.totalBrands.toLocaleString()}</p>
            </article>
            <article className="rounded-xl border border-white/10 bg-[#111] p-5">
              <p className="text-sm text-white/50 mb-2">누적 의뢰</p>
              <p className="text-2xl font-bold text-white">{insights.totalBookings.toLocaleString()}</p>
            </article>
            <article className="rounded-xl border border-white/10 bg-[#111] p-5">
              <p className="text-sm text-white/50 mb-2">활성 모델</p>
              <p className="text-2xl font-bold text-white">{insights.totalModels.toLocaleString()}</p>
            </article>
            <article className="rounded-xl border border-white/10 bg-[#111] p-5">
              <p className="text-sm text-white/50 mb-2">평균 작업 기간</p>
              <p className="text-2xl font-bold text-white">{insights.averageWorkDays}일</p>
            </article>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <article className="rounded-2xl border border-white/10 bg-[#111] p-7">
              <h2 className="text-xl font-semibold text-white mb-4">운영 시나리오</h2>
              <ul className="space-y-3 text-white/75 leading-relaxed">
                {useCases.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-[#E882B2] mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
            <article className="rounded-2xl border border-[#E882B2]/40 bg-[#E882B2]/10 p-7">
              <h2 className="text-xl font-semibold text-white mb-4">브랜드 운영 포인트</h2>
              <ul className="space-y-3 text-white/80 leading-relaxed">
                <li>• 즐겨찾기 기반으로 우선 협업 후보군을 빠르게 구성</li>
                <li>• 프로젝트 단위로 요청 이력과 파일 전달 상태 추적</li>
                <li>• 대시보드에서 캠페인 진행 단계를 팀과 공유</li>
              </ul>
            </article>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <article className="rounded-2xl border border-white/10 bg-[#111] p-7">
              <h2 className="text-xl font-semibold text-white mb-4">최근 성공 사례</h2>
              <ul className="space-y-3">
                {insights.topSuccessCases.slice(0, 3).map((item) => (
                  <li key={item.id} className="rounded-xl border border-white/10 bg-[#0f0f0f] p-4">
                    <p className="text-white font-medium">{item.modelName} · {item.styleLabel}</p>
                    <p className="text-sm text-white/60 mt-1">크리에이터: {item.creatorName}</p>
                    <p className="text-sm text-white/70 mt-2">조회수 {item.viewCount.toLocaleString()} · 평점 {item.rating.toFixed(1)}</p>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-2xl border border-white/10 bg-[#111] p-7">
              <h2 className="text-xl font-semibold text-white mb-4">추천 패키지</h2>
              <ul className="space-y-3">
                {insights.recommendedPackages.map((pkg) => (
                  <li key={pkg.type} className="rounded-xl border border-white/10 bg-[#0f0f0f] p-4">
                    <p className="text-white font-medium">{pkg.name} · {pkg.price.toLocaleString()}원</p>
                    <p className="text-sm text-white/65 mt-1">{pkg.description} · 평균 {pkg.turnaroundDays}일</p>
                    <p className="text-sm text-[#E882B2] mt-2">{pkg.recommendedFor}</p>
                  </li>
                ))}
              </ul>
            </article>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111] p-8 text-center">
            <h3 className="text-xl font-semibold text-white mb-3">다음 캠페인을 더 빠르게 시작하세요</h3>
            <p className="text-white/60 mb-6">브랜드 계정으로 가입하면 모델 탐색부터 섭외 요청, 결제까지 바로 진행할 수 있습니다.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/auth/signup" className="px-6 py-3 rounded-lg bg-[#E882B2] text-black font-semibold hover:bg-[#f598c4] transition-colors">
                브랜드로 시작하기
              </Link>
              <Link href="/explore" className="px-6 py-3 rounded-lg border border-white/20 text-white/80 hover:text-[#E882B2] hover:border-[#E882B2] transition-colors">
                모델 탐색하기
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
