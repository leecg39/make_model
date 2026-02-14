import Link from 'next/link';
import { Layout } from '@/components/layout/Layout';

const values = [
  {
    title: '빠른 제작',
    description: '브랜드가 필요한 모델을 빠르게 탐색하고 섭외까지 이어지도록 전체 과정을 단순화합니다.',
  },
  {
    title: '신뢰 기반 거래',
    description: '명확한 요청서, 메시지, 결제 흐름을 제공해 브랜드와 크리에이터가 안심하고 협업할 수 있게 합니다.',
  },
  {
    title: '지속 가능한 성장',
    description: '크리에이터가 재사용 가능한 포트폴리오를 구축하고 브랜드가 반복 캠페인을 운영하도록 돕습니다.',
  },
];

export default function AboutPage() {
  return (
    <Layout>
      <section className="min-h-screen bg-[#0a0a0a] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <p className="text-sm tracking-[0.2em] text-[#E882B2] mb-3">ABOUT MAKE MODEL</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-5">
              브랜드와 크리에이터를 연결하는
              <br className="hidden sm:block" />
              AI 인플루언서 마켓플레이스
            </h1>
            <p className="text-white/65 leading-relaxed max-w-3xl">
              MAKE MODEL은 브랜드가 원하는 콘셉트의 AI 모델을 탐색하고, 크리에이터와 협업해 실제 마케팅 결과물까지 연결할 수 있도록 설계된 플랫폼입니다.
              탐색부터 섭외, 메시지, 결과물 전달까지 한 곳에서 운영할 수 있습니다.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111] p-7 sm:p-9 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">우리가 해결하는 문제</h2>
            <ul className="space-y-3 text-white/70 leading-relaxed">
              <li>• 브랜드는 캠페인에 맞는 모델을 찾는 데 많은 시간을 쓰고 있습니다.</li>
              <li>• 크리에이터는 작업 의뢰를 안정적으로 확보하기 어렵습니다.</li>
              <li>• 협업 과정에서 요구사항과 산출물 관리가 분산되어 반복 비용이 큽니다.</li>
            </ul>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mb-10">
            {values.map((value) => (
              <article key={value.title} className="rounded-2xl border border-white/10 bg-[#111] p-6">
                <h3 className="text-lg font-semibold text-white mb-3">{value.title}</h3>
                <p className="text-sm text-white/65 leading-relaxed">{value.description}</p>
              </article>
            ))}
          </div>

          <div className="rounded-2xl border border-[#E882B2]/40 bg-[#E882B2]/10 p-8 text-center">
            <h3 className="text-xl font-semibold text-white mb-3">함께 성장할 파트너를 찾고 있나요?</h3>
            <p className="text-white/70 mb-6">브랜드는 더 빠르게 캠페인을 실행하고, 크리에이터는 더 많은 기회를 얻을 수 있습니다.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/auth/signup" className="px-6 py-3 rounded-lg bg-[#E882B2] text-black font-semibold hover:bg-[#f598c4] transition-colors">
                회원가입
              </Link>
              <Link href="/explore" className="px-6 py-3 rounded-lg border border-white/20 text-white/80 hover:text-[#E882B2] hover:border-[#E882B2] transition-colors">
                모델 탐색
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
