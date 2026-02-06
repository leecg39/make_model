// @TASK P1-S0-T1 - Global Header component (ourcovers-inspired redesign)
// @SPEC Phase 1 Layout Components
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';

export function Header() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const openLoginModal = useUIStore((state) => state.openLoginModal);
  const addToast = useUIStore((state) => state.addToast);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll for header background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsProfileOpen(false);
    };
    if (isProfileOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isProfileOpen]);

  const handleRegisterClick = () => {
    if (!user) {
      openLoginModal();
    } else {
      router.push('/models/new');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      addToast({ variant: 'success', message: '로그아웃되었습니다.' });
      router.push('/');
    } catch (error) {
      addToast({ variant: 'error', message: '로그아웃 실패' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-black/90 backdrop-blur-md border-b border-white/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="font-bold text-2xl tracking-tight"
            >
              <span className="text-white">MAKE</span>
              <span className="text-[#E882B2]"> MODEL</span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/explore"
              className="text-white/80 hover:text-[#E882B2] font-medium transition-colors tracking-wide"
            >
              모델 탐색
            </Link>
            <Link
              href="/creators"
              className="text-white/80 hover:text-[#E882B2] font-medium transition-colors tracking-wide"
            >
              크리에이터
            </Link>
            <Link
              href="/brands"
              className="text-white/80 hover:text-[#E882B2] font-medium transition-colors tracking-wide"
            >
              브랜드
            </Link>
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            {!user ? (
              <>
                <Link
                  href="/auth/login"
                  className="px-5 py-2 text-white/80 font-medium hover:text-[#E882B2] transition-colors"
                >
                  로그인
                </Link>
                <Link
                  href="/auth/register"
                  className="px-5 py-2 bg-[#E882B2] text-black rounded-lg font-semibold hover:bg-[#f598c4] transition-all duration-300"
                >
                  회원가입
                </Link>
              </>
            ) : (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsProfileOpen(!isProfileOpen);
                  }}
                  className="w-10 h-10 bg-[#E882B2] rounded-full flex items-center justify-center text-black font-semibold hover:bg-[#f598c4] transition-colors"
                  aria-label="프로필 메뉴"
                >
                  {user.nickname?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </motion.button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] rounded-lg shadow-xl border border-white/10 py-1 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm text-white font-medium">{user.nickname}</p>
                        <p className="text-xs text-white/50">{user.email}</p>
                      </div>
                      <Link
                        href={user.role === 'creator' ? '/dashboard/creator' : '/dashboard/brand'}
                        className="block px-4 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-[#E882B2] transition-colors"
                      >
                        대시보드
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-[#E882B2] transition-colors"
                      >
                        설정
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors"
                      >
                        로그아웃
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="메뉴"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-white/10 py-4 space-y-2"
            >
              <Link
                href="/explore"
                className="block px-4 py-3 text-white/80 hover:bg-white/5 hover:text-[#E882B2] rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                모델 탐색
              </Link>
              <Link
                href="/creators"
                className="block px-4 py-3 text-white/80 hover:bg-white/5 hover:text-[#E882B2] rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                크리에이터
              </Link>
              <Link
                href="/brands"
                className="block px-4 py-3 text-white/80 hover:bg-white/5 hover:text-[#E882B2] rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                브랜드
              </Link>

              <div className="border-t border-white/10 pt-4 mt-4">
                {!user ? (
                  <>
                    <Link
                      href="/auth/login"
                      className="block px-4 py-3 text-white/80 hover:bg-white/5 rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      로그인
                    </Link>
                    <Link
                      href="/auth/register"
                      className="block px-4 py-3 bg-[#E882B2] text-black rounded-lg font-semibold hover:bg-[#f598c4] transition-colors text-center mt-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      회원가입
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href={user.role === 'creator' ? '/dashboard/creator' : '/dashboard/brand'}
                      className="block px-4 py-3 text-white/80 hover:bg-white/5 hover:text-[#E882B2] rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      대시보드
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      로그아웃
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
