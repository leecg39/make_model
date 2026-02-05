// @TASK P1-S0-T1 - Layout wrapper component
// @SPEC Phase 1 Layout Components
'use client';

import { Header } from './Header';
import { Footer } from './Footer';
import { ToastContainer } from '../ui/Toast';
import { LoginModal } from '../ui/LoginModal';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ToastContainer />
      <LoginModal />
    </div>
  );
}
