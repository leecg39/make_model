'use client';

export default function ExploreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">탐색 오류</h2>
        <p className="text-white/50 mb-6">{error.message || '모델을 불러오는 중 오류가 발생했습니다.'}</p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-[#E882B2] text-black rounded-lg font-semibold hover:bg-[#f598c4] transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
