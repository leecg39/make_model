// @TASK P4-S1-T1 - DashboardNav 컴포넌트
// @SPEC specs/screens/brand-dashboard.yaml

'use client';

import { useRouter, usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: '주문 관리',
    path: '/dashboard/brand',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  },
  {
    label: '찜 목록',
    path: '/dashboard/brand/favorites',
    icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  },
  {
    label: '프로필 설정',
    path: '/dashboard/brand/profile',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  },
];

const EXTERNAL_ITEMS: NavItem[] = [
  {
    label: '홈',
    path: '/',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1',
  },
  {
    label: '모델 탐색',
    path: '/explore',
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  },
];

export function DashboardNav() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/dashboard/brand') {
      return pathname === path;
    }
    return pathname?.startsWith(path);
  };

  return (
    <nav
      className="bg-[#111] border-r border-white/10 min-h-screen w-64 p-6 flex flex-col"
      role="navigation"
      aria-label="대시보드 네비게이션"
    >
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white">브랜드</h2>
        <p className="text-sm text-white/50 mt-1">대시보드</p>
      </div>

      <ul className="space-y-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);

          return (
            <li key={item.path}>
              <button
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  active
                    ? 'bg-[#E882B2] text-black font-semibold'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill={active ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={item.icon}
                  />
                </svg>
                <span>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* External Navigation */}
      <div className="mt-auto pt-6 border-t border-white/10">
        <ul className="space-y-2">
          {EXTERNAL_ITEMS.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => router.push(item.path)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/50 hover:bg-white/5 hover:text-white transition-all duration-300"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={item.icon}
                  />
                </svg>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
