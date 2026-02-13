export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-white/20 border-t-[#E882B2] rounded-full animate-spin" />
        <p className="text-white/40 text-sm">로딩 중...</p>
      </div>
    </div>
  );
}
