import Link from 'next/link';
import { Layout } from '@/components/layout/Layout';
import { loadMarketInsights } from '@/lib/market-insights';

const creatorBenefits = [
  '브랜드 요청 기반의 안정적인 작업 기회 확보',
  '포트폴리오 공개를 통한 반복 의뢰 가능성 확대',
  '메시지/파일 전달/상태 관리까지 한 곳에서 운영',
  '정산 내역을 대시보드에서 투명하게 확인',
];

const workflow = [
  {
    title: '모델 등록',
    description: '콘셉트와 스타일이 드러나는 대표 이미지와 소개를 등록합니다.',
  },
  {
    title: '요청 수락 및 제작',
    description: '브랜드 요청서를 검토한 뒤 조건에 맞게 결과물을 제작합니다.',
  },
  {
    title: '전달 및 정산',
    description: '완료 파일을 전달하고, 작업 상태와 정산 흐름을 확인합니다.',
  },
];

export default async function CreatorsPage() {
  const insights = await loadMarketInsights();

  return (
    <Layout>
      <section className="min-h-screen bg-[#0a0a0a] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-sm tracking-[0.2em] text-[#E882B2] mb-3">FOR CREATORS</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">크리에이터를 위한 제작 워크스페이스</h1>
            <p className="text-white/65 max-w-3xl leading-relaxed">
              MAKE MODEL은 크리에이터가 AI 모델 포트폴리오를 구축하고, 브랜드 의뢰를 수주해 결과물을 전달하고 정산까지 관리할 수 있도록 설계된 작업 플랫폼입니다.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <article className="rounded-2xl border border-white/10 bg-[#111] p-7">
              <h2 className="text-xl font-semibold text-white mb-4">이런 분들에게 추천해요</h2>
              <ul className="space-y-3 text-white/75 leading-relaxed">
                <li>• AI 모델 제작을 기반으로 수익화를 시작하고 싶은 분</li>
                <li>• 단발 작업이 아닌 반복 의뢰 구조를 만들고 싶은 분</li>
                <li>• 브랜드 커뮤니케이션과 파일 관리를 체계화하고 싶은 분</li>
              </ul>
            </article>
            <article className="rounded-2xl border border-[#E882B2]/40 bg-[#E882B2]/10 p-7">
              <h2 className="text-xl font-semibold text-white mb-4">크리에이터 혜택</h2>
              <ul className="space-y-2 text-white/80">
                {creatorBenefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2">
                    <span className="text-[#E882B2] mt-0.5">•</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <article className="rounded-xl border border-white/10 bg-[#111] p-5">
              <p className="text-sm text-white/50 mb-2">활성 모델</p>
              <p className="text-2xl font-bold text-white">{insights.totalModels.toLocaleString()}</p>
            </article>
            <article className="rounded-xl border border-white/10 bg-[#111] p-5">
              <p className="text-sm text-white/50 mb-2">누적 의뢰</p>
              <p className="text-2xl font-bold text-white">{insights.totalBookings.toLocaleString()}</p>
            </article>
            <article className="rounded-xl border border-white/10 bg-[#111] p-5">
              <p className="text-sm text-white/50 mb-2">평균 작업 기간</p>
              <p className="text-2xl font-bold text-white">{insights.averageWorkDays}일</p>
            </article>
            <article className="rounded-xl border border-white/10 bg-[#111] p-5">
              <p className="text-sm text-white/50 mb-2">평균 모델 평점</p>
              <p className="text-2xl font-bold text-white">{insights.averageRating.toFixed(2)}</p>
            </article>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111] p-7 sm:p-8 mb-8">
            <h2 className="text-xl font-semibold text-white mb-5">작업 흐름</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {workflow.map((step, index) => (
                <article key={step.title} className="rounded-xl border border-white/10 bg-[#0f0f0f] p-5">
                  <p className="text-xs tracking-wide text-[#E882B2] mb-2">STEP {index + 1}</p>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-white/65 leading-relaxed">{step.description}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <article className="rounded-2xl border border-white/10 bg-[#111] p-7">
              <h2 className="text-xl font-semibold text-white mb-4">최근 성공 사례</h2>
              <ul className="space-y-3">
                {insights.recentSuccessCases.slice(0, 3).map((item) => (
                  <li key={item.id} className="rounded-xl border border-white/10 bg-[#0f0f0f] p-4">
                    <p className="text-white font-medium">{item.modelName} · {item.styleLabel}</p>
                    <p className="text-sm text-white/60 mt-1">크리에이터: {item.creatorName}</p>
                    <p className="text-sm text-white/70 mt-2">조회수 {item.viewCount.toLocaleString()} · 평점 {item.rating.toFixed(1)}</p>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-2xl border border-white/10 bg-[#111] p-7">
              <h2 className="text-xl font-semibold text-white mb-4">추천 패키지 이해하기</h2>
              <ul className="space-y-3">
                {insights.recommendedPackages.map((pkg) => (
                  <li key={pkg.type} className="rounded-xl border border-white/10 bg-[#0f0f0f] p-4">
                    <p className="text-white font-medium">{pkg.name} · {pkg.imageCount}장</p>
                    <p className="text-sm text-white/65 mt-1">브랜드 결제 기준 {pkg.price.toLocaleString()}원 · 평균 {pkg.turnaroundDays}일</p>
                    <p className="text-sm text-[#E882B2] mt-2">{pkg.recommendedFor}</p>
                  </li>
                ))}
              </ul>
            </article>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111] p-8 text-center">
            <h3 className="text-xl font-semibold text-white mb-3">지금 포트폴리오를 등록해보세요</h3>
            <p className="text-white/60 mb-6">브랜드가 먼저 찾는 크리에이터가 될 수 있도록 노출과 작업 경험을 함께 쌓아보세요.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/auth/signup" className="px-6 py-3 rounded-lg bg-[#E882B2] text-black font-semibold hover:bg-[#f598c4] transition-colors">
                크리에이터로 시작하기
              </Link>
              <Link href="/models/new" className="px-6 py-3 rounded-lg border border-white/20 text-white/80 hover:text-[#E882B2] hover:border-[#E882B2] transition-colors">
                모델 등록 페이지
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
