// @TASK P4-S2-T1 - Creator Dashboard Navigation
// @SPEC specs/screens/creator-dashboard.yaml

'use client';

import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

interface NavItem {
  label: string;
  path: string;
  icon?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: '주문 관리', path: '/dashboard/creator' },
  { label: '내 모델', path: '/dashboard/creator/models' },
  { label: '정산', path: '/dashboard/creator/settlements' },
  { label: '프로필 설정', path: '/dashboard/creator/profile' },
];

export function DashboardNav() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/dashboard/creator') {
      return pathname === path;
    }
    return pathname?.startsWith(path);
  };

  return (
    <nav className="w-64 bg-bg-secondary border-r border-white/10 min-h-screen p-6">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white">크리에이터</h1>
        <p className="text-sm text-white/60 mt-1">대시보드</p>
      </div>

      <ul className="space-y-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          return (
            <li key={item.path}>
              <motion.button
                onClick={() => router.push(item.path)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  w-full text-left px-4 py-3 rounded-lg
                  transition-all duration-300
                  ${
                    active
                      ? 'bg-accent-neon text-black font-semibold'
                      : 'text-white hover:bg-white/5'
                  }
                `}
              >
                {item.label}
              </motion.button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
