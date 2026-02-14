import { Layout } from '@/components/layout/Layout';

const sections = [
  {
    title: '1. 수집하는 개인정보 항목',
    content: [
      '회원가입 시: 이메일, 비밀번호(암호화 저장), 닉네임, 역할(브랜드/크리에이터)',
      '서비스 이용 시: 프로젝트 요청 내용, 메시지 내역, 결제 관련 식별 정보',
      '자동 수집: 접속 로그, 브라우저 정보, 쿠키, 기기 정보',
    ],
  },
  {
    title: '2. 개인정보 이용 목적',
    content: [
      '회원 식별 및 계정 관리',
      '모델 섭외 매칭, 결제 처리, 고객 문의 대응',
      '서비스 품질 개선, 이상 거래 탐지, 보안 강화',
    ],
  },
  {
    title: '3. 보관 및 파기',
    content: [
      '관련 법령에서 정한 기간 동안 보관 후 지체 없이 파기합니다.',
      '회원 탈퇴 시 즉시 파기를 원칙으로 하며, 분쟁 대응이 필요한 정보는 예외적으로 보관할 수 있습니다.',
      '전자 파일은 복구 불가 방식으로 삭제하고, 출력물은 분쇄 또는 소각합니다.',
    ],
  },
  {
    title: '4. 제3자 제공 및 처리 위탁',
    content: [
      '회사는 원칙적으로 이용자 동의 없이 개인정보를 제3자에게 제공하지 않습니다.',
      '결제/인프라/알림 발송 등 서비스 제공에 필요한 범위에서만 처리 위탁이 이루어질 수 있습니다.',
      '위탁사가 변경될 경우 서비스 공지로 안내합니다.',
    ],
  },
  {
    title: '5. 이용자 권리',
    content: [
      '이용자는 언제든 본인 정보의 열람, 정정, 삭제, 처리 정지를 요청할 수 있습니다.',
      '권리 행사는 고객센터를 통해 접수 가능하며, 회사는 관련 법령에 따라 처리합니다.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <Layout>
      <section className="min-h-screen bg-[#0a0a0a] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <p className="text-sm tracking-[0.2em] text-[#E882B2] mb-3">PRIVACY POLICY</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">개인정보처리방침</h1>
            <p className="text-white/60 text-sm">최종 업데이트: 2026년 2월 14일</p>
          </div>

          <div className="space-y-5">
            {sections.map((section) => (
              <article key={section.title} className="rounded-2xl border border-white/10 bg-[#111] p-6 sm:p-7">
                <h2 className="text-lg font-semibold text-white mb-3">{section.title}</h2>
                <ul className="space-y-2 text-white/70 leading-relaxed">
                  {section.content.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-[#E882B2] mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-[#E882B2]/40 bg-[#E882B2]/10 p-5 text-sm text-white/80 leading-relaxed">
            개인정보 보호 관련 문의: <span className="font-semibold text-white">support@makemodel.io</span>
          </div>
        </div>
      </section>
    </Layout>
  );
}
