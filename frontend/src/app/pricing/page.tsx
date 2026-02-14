import Link from 'next/link';
import { Layout } from '@/components/layout/Layout';

const plans = [
  {
    name: 'Starter',
    price: '월 49,000원',
    description: '처음 AI 모델 섭외를 시작하는 소규모 브랜드',
    features: ['월 3건 섭외 요청', '기본 메시지 지원', '모델 즐겨찾기'],
  },
  {
    name: 'Growth',
    price: '월 149,000원',
    description: '지속적으로 콘텐츠를 제작하는 성장 단계 브랜드',
    features: ['월 15건 섭외 요청', '우선 매칭', '성과 리포트', '전담 CS 채널'],
    highlighted: true,
  },
  {
    name: 'Scale',
    price: '문의',
    description: '대규모 캠페인과 다중 브랜드 운영이 필요한 팀',
    features: ['요청 무제한', '전용 운영 가이드', 'API 연동 지원', '커스텀 결제 플랜'],
  },
];

export default function PricingPage() {
  return (
    <Layout>
      <section className="min-h-screen bg-[#0a0a0a] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm tracking-[0.2em] text-[#E882B2] mb-3">PRICING</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">브랜드 성장을 위한 요금제</h1>
            <p className="text-white/60 max-w-2xl mx-auto">
              캠페인 규모와 운영 방식에 맞춰 선택할 수 있도록 구성했습니다. 언제든 상위 플랜으로 변경할 수 있습니다.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`rounded-2xl border p-7 ${
                  plan.highlighted
                    ? 'bg-[#E882B2]/10 border-[#E882B2]/60 shadow-[0_0_40px_rgba(232,130,178,0.15)]'
                    : 'bg-[#111] border-white/10'
                }`}
              >
                <h2 className="text-xl font-semibold text-white">{plan.name}</h2>
                <p className="text-2xl font-bold text-[#E882B2] mt-3">{plan.price}</p>
                <p className="text-sm text-white/60 mt-3 leading-relaxed">{plan.description}</p>
                <ul className="mt-5 space-y-2 text-sm text-white/80">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="text-[#E882B2] mt-0.5">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-white/10 bg-[#111] p-8 text-center">
            <h3 className="text-xl font-semibold text-white mb-3">플랜 선택이 어렵다면</h3>
            <p className="text-white/60 mb-6">브랜드 상황을 알려주시면 적합한 운영 플로우를 제안해 드립니다.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/auth/signup" className="px-6 py-3 rounded-lg bg-[#E882B2] text-black font-semibold hover:bg-[#f598c4] transition-colors">
                시작하기
              </Link>
              <Link href="/explore" className="px-6 py-3 rounded-lg border border-white/20 text-white/80 hover:border-[#E882B2] hover:text-[#E882B2] transition-colors">
                모델 둘러보기
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
