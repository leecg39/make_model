export default function CreatorDashboardLoading() {
  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <div className="w-64 bg-[#111] border-r border-white/10 animate-pulse" />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-48 bg-white/5 rounded mb-8 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
