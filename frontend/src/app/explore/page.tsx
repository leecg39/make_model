// @TASK P2-S2-T1 - 모델 탐색 페이지
// @SPEC docs/planning/domain/resources.yaml - ai_models explore page
'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FilterSidebar } from '@/components/explore/FilterSidebar';
import { SearchBar } from '@/components/explore/SearchBar';
import { SortDropdown } from '@/components/explore/SortDropdown';
import { ModelGrid } from '@/components/explore/ModelGrid';
import { Pagination } from '@/components/explore/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { useModels } from '@/hooks/useModels';
import { useFavorites } from '@/hooks/useFavorites';
import type { ModelStyle, ModelGender, ModelAgeRange } from '@/types/model';

// Create QueryClient
const queryClient = new QueryClient();

function ExplorePageContent() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<{
    style: ModelStyle | '';
    gender: ModelGender | '';
    age_range: ModelAgeRange | '';
  }>({ style: '', gender: '', age_range: '' });
  const [keyword, setKeyword] = useState('');
  const [sort, setSort] = useState<'recent' | 'popular' | 'rating'>('recent');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useModels({
    page,
    limit: 12,
    style: filters.style,
    gender: filters.gender,
    age_range: filters.age_range,
    keyword,
    sort,
  });

  const { favoriteIds, toggleFavorite } = useFavorites();

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <FilterSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onFilterChange={(newFilters) => {
          setFilters(newFilters);
          setPage(1); // 필터 변경 시 첫 페이지로
        }}
      />

      <div className="lg:ml-64 min-h-screen">
        {/* Header */}
        <div className="bg-[#111] border-b border-white/10 px-4 sm:px-6 lg:px-8 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="필터 열기"
            >
              <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <SearchBar
                onSearch={(value) => {
                  setKeyword(value);
                  setPage(1);
                }}
              />
            </div>

            {/* Sort Dropdown */}
            <SortDropdown
              value={sort}
              onChange={(value) => {
                setSort(value);
                setPage(1);
              }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-[#E882B2] border-t-transparent rounded-full animate-spin" />
                <p className="text-white/50">모델 불러오는 중...</p>
              </div>
            </div>
          ) : data && data.items.length > 0 ? (
            <>
              <ModelGrid models={data.items} favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} />
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          ) : (
            <EmptyState variant="no_search_results" />
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ExplorePageContent />
    </QueryClientProvider>
  );
}
