// @TASK P4-S1-T1 - DashboardNav 컴포넌트
// @SPEC specs/screens/brand-dashboard.yaml
// @TEST src/components/brand/__tests__/DashboardNav.test.tsx

'use client';

export type DashboardTab = 'orders' | 'favorites' | 'profile';

interface DashboardNavProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

const TABS: Array<{ id: DashboardTab; label: string; icon: string }> = [
  {
    id: 'orders',
    label: '주문 관리',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  },
  {
    id: 'favorites',
    label: '찜 목록',
    icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  },
  {
    id: 'profile',
    label: '프로필 설정',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  },
];

export function DashboardNav({ activeTab, onTabChange }: DashboardNavProps) {
  const handleKeyDown = (e: React.KeyboardEvent, tab: DashboardTab) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onTabChange(tab);
    }
  };

  return (
    <nav
      className="bg-[#111] border-r border-white/10 min-h-screen w-64 p-6"
      role="navigation"
      aria-label="대시보드 네비게이션"
    >
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white">브랜드</h2>
        <p className="text-sm text-white/50 mt-1">대시보드</p>
      </div>

      <div className="space-y-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, tab.id)}
              role="tab"
              aria-selected={isActive}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                isActive
                  ? 'bg-[#E882B2] text-black font-semibold'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill={isActive ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={tab.icon}
                />
              </svg>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
