import { Layout } from '@/components/layout/Layout';

const sections = [
  {
    title: '1. 목적',
    content:
      '본 약관은 MAKE MODEL(이하 "회사")이 제공하는 AI 인플루언서 마켓플레이스 서비스의 이용 조건 및 절차, 회사와 회원의 권리와 의무를 규정함을 목적으로 합니다.',
  },
  {
    title: '2. 회원 가입 및 계정 관리',
    content:
      '회원은 정확한 정보를 입력해 가입해야 하며, 계정 정보는 본인이 직접 관리해야 합니다. 타인의 명의 도용 또는 허위 정보 입력으로 발생한 책임은 회원에게 있습니다.',
  },
  {
    title: '3. 서비스 이용',
    content:
      '브랜드 회원은 모델 탐색/섭외 요청/결제를 진행할 수 있고, 크리에이터 회원은 모델 등록/작업 수행/산출물 전달 기능을 이용할 수 있습니다. 서비스 기능은 운영 정책에 따라 변경될 수 있습니다.',
  },
  {
    title: '4. 결제 및 환불',
    content:
      '결제 금액, 취소, 환불 정책은 결제 화면 및 별도 안내 페이지에 따릅니다. 작업이 시작된 이후의 환불은 진행 상태와 결과물 전달 여부를 기준으로 판단합니다.',
  },
  {
    title: '5. 금지 행위',
    content:
      '회원은 법령 위반, 타인의 권리 침해, 허위 의뢰 등록, 부정 결제 시도, 시스템 장애 유발 행위를 해서는 안 됩니다. 위반 시 서비스 제한 또는 계정 정지 조치가 적용될 수 있습니다.',
  },
  {
    title: '6. 책임 제한',
    content:
      '회사는 천재지변, 통신 장애, 제3자 서비스 장애 등 불가항력 사유로 발생한 손해에 대해 책임을 지지 않습니다. 단, 회사의 고의 또는 중대한 과실이 있는 경우 관련 법령을 따릅니다.',
  },
  {
    title: '7. 약관 변경',
    content:
      '회사는 필요한 경우 약관을 변경할 수 있으며, 중요한 변경 사항은 서비스 내 공지 또는 이메일을 통해 사전 안내합니다. 변경 후에도 서비스를 계속 이용하면 개정 약관에 동의한 것으로 봅니다.',
  },
];

export default function TermsPage() {
  return (
    <Layout>
      <section className="min-h-screen bg-[#0a0a0a] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <p className="text-sm tracking-[0.2em] text-[#E882B2] mb-3">TERMS OF SERVICE</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">이용약관</h1>
            <p className="text-white/60 text-sm">시행일: 2026년 2월 14일</p>
          </div>

          <div className="space-y-5">
            {sections.map((section) => (
              <article key={section.title} className="rounded-2xl border border-white/10 bg-[#111] p-6 sm:p-7">
                <h2 className="text-lg font-semibold text-white mb-3">{section.title}</h2>
                <p className="text-white/70 leading-relaxed">{section.content}</p>
              </article>
            ))}
          </div>

          <p className="text-white/45 text-sm mt-8 leading-relaxed">
            본 약관은 샘플 안내 페이지이며, 실제 운영 정책 확정 시 법률 검토를 거쳐 업데이트되어야 합니다.
          </p>
        </div>
      </section>
    </Layout>
  );
}
