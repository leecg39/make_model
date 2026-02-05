// @TASK P1-S1-T1 - Redirect old login path to new auth/login
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OldLoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auth/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Redirecting...</p>
    </div>
  );
}
