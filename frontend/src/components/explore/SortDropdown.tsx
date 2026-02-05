// @TASK P2-S2-T1 - 정렬 드롭다운 컴포넌트
// @SPEC docs/planning/domain/resources.yaml - ai_models sort
'use client';

interface SortDropdownProps {
  value: 'recent' | 'popular' | 'rating';
  onChange: (value: 'recent' | 'popular' | 'rating') => void;
}

const sortOptions = [
  { value: 'recent' as const, label: '최신순' },
  { value: 'popular' as const, label: '인기순' },
  { value: 'rating' as const, label: '평점순' },
];

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-sm text-gray-600">
        정렬
      </label>
      <select
        id="sort"
        value={value}
        onChange={(e) => onChange(e.target.value as 'recent' | 'popular' | 'rating')}
        aria-label="정렬"
        className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
