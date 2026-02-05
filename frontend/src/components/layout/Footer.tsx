// @TASK P1-S0-T1 - Global Footer component
// @SPEC Phase 1 Layout Components
'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-3">Make Model</h3>
            <p className="text-sm text-gray-600 mb-2">AI 인플루언서 마켓플레이스</p>
            <p className="text-xs text-gray-500">사업자등록번호: 123-45-67890</p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">정보</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                  개인정보처리방침
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">고객센터</h4>
            <p className="text-sm text-gray-600">
              <a href="mailto:support@makemodel.io" className="hover:text-indigo-600 transition-colors">
                support@makemodel.io
              </a>
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Make Model. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
