// @TASK P2-S2-T1 - 필터 사이드바 컴포넌트
// @SPEC docs/planning/domain/resources.yaml - ai_models filters
'use client';

import { motion } from 'framer-motion';
import type { ModelStyle, ModelGender, ModelAgeRange } from '@/types/model';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    style: ModelStyle | '';
    gender: ModelGender | '';
    age_range: ModelAgeRange | '';
  };
  onFilterChange: (filters: {
    style: ModelStyle | '';
    gender: ModelGender | '';
    age_range: ModelAgeRange | '';
  }) => void;
}

const styleOptions: { value: ModelStyle | ''; label: string }[] = [
  { value: '', label: '전체' },
  { value: 'casual', label: '캐주얼' },
  { value: 'formal', label: '포멀' },
  { value: 'sporty', label: '스포티' },
  { value: 'street', label: '스트릿' },
  { value: 'vintage', label: '빈티지' },
  { value: 'editorial', label: '에디토리얼' },
];

const genderOptions: { value: ModelGender | ''; label: string }[] = [
  { value: '', label: '전체' },
  { value: 'female', label: '여성' },
  { value: 'male', label: '남성' },
  { value: 'non_binary', label: '논바이너리' },
];

const ageRangeOptions: { value: ModelAgeRange | ''; label: string }[] = [
  { value: '', label: '전체' },
  { value: '10s', label: '10대' },
  { value: '20s', label: '20대' },
  { value: '30s', label: '30대' },
  { value: '40s_plus', label: '40대 이상' },
];

export function FilterSidebar({ isOpen, onClose, filters, onFilterChange }: FilterSidebarProps) {
  const handleReset = () => {
    onFilterChange({ style: '', gender: '', age_range: '' });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -320 }}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="fixed lg:sticky top-0 left-0 h-screen w-64 bg-[#111] border-r border-white/10 z-50 lg:z-0 overflow-y-auto"
        aria-label="스타일 필터"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">필터</h2>
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="필터 닫기"
            >
              <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Style Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-white mb-3">스타일</h3>
            <div className="space-y-2">
              {styleOptions.map((option) => (
                <label key={option.value} className="flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="style"
                    value={option.value}
                    checked={filters.style === option.value}
                    onChange={(e) => onFilterChange({ ...filters, style: e.target.value as ModelStyle | '' })}
                    className="w-4 h-4 text-[#E882B2] border-white/30 bg-[#1a1a1a] focus:ring-[#E882B2] focus:ring-offset-[#111]"
                  />
                  <span className="ml-2 text-sm text-white/60 group-hover:text-white transition-colors">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Gender Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-white mb-3">성별</h3>
            <div className="space-y-2">
              {genderOptions.map((option) => (
                <label key={option.value} className="flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="gender"
                    value={option.value}
                    checked={filters.gender === option.value}
                    onChange={(e) => onFilterChange({ ...filters, gender: e.target.value as ModelGender | '' })}
                    className="w-4 h-4 text-[#E882B2] border-white/30 bg-[#1a1a1a] focus:ring-[#E882B2] focus:ring-offset-[#111]"
                  />
                  <span className="ml-2 text-sm text-white/60 group-hover:text-white transition-colors">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Age Range Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-white mb-3">연령대</h3>
            <div className="space-y-2">
              {ageRangeOptions.map((option) => (
                <label key={option.value} className="flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="age_range"
                    value={option.value}
                    checked={filters.age_range === option.value}
                    onChange={(e) => onFilterChange({ ...filters, age_range: e.target.value as ModelAgeRange | '' })}
                    className="w-4 h-4 text-[#E882B2] border-white/30 bg-[#1a1a1a] focus:ring-[#E882B2] focus:ring-offset-[#111]"
                  />
                  <span className="ml-2 text-sm text-white/60 group-hover:text-white transition-colors">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="w-full px-4 py-2 bg-white/10 text-white/70 rounded-lg font-medium hover:bg-white/20 hover:text-white transition-colors"
          >
            필터 초기화
          </button>
        </div>
      </motion.aside>
    </>
  );
}
