import React from 'react';
import { Filter, Clock, ChefHat, CheckCircle2, RotateCcw, Search, Sparkles } from 'lucide-react';
import { DietaryCategory } from '../types/index.ts';
import { DIETARY_FILTERS } from '../data/demoData.ts';

interface FilterSidebarProps {
  selectedDiet: DietaryCategory;
  onSelectDiet: (diet: DietaryCategory) => void;
  maxMinutes: number;
  onMaxMinutesChange: (mins: number) => void;
  selectedDifficulty: string;
  onSelectDifficulty: (diff: string) => void;
  onlyAvailable: boolean;
  onToggleOnlyAvailable: (val: boolean) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  totalFilteredCount: number;
  totalAllCount: number;
  onResetFilters: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  selectedDiet,
  onSelectDiet,
  maxMinutes,
  onMaxMinutesChange,
  selectedDifficulty,
  onSelectDifficulty,
  onlyAvailable,
  onToggleOnlyAvailable,
  searchQuery,
  onSearchQueryChange,
  totalFilteredCount,
  totalAllCount,
  onResetFilters,
}) => {
  return (
    <aside className="w-full lg:w-72 shrink-0 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
            Фильтры рецептов
          </h3>
        </div>
        <button
          onClick={onResetFilters}
          className="text-[11px] font-semibold text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 flex items-center gap-1 cursor-pointer"
          title="Сбросить все фильтры"
        >
          <RotateCcw className="w-3 h-3" /> Сброс
        </button>
      </div>

      {/* Search Input */}
      <div>
        <label className="text-xs font-bold text-stone-600 dark:text-stone-300 block mb-1.5">
          Поиск по блюду или продукту
        </label>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Например: омлет, сыр..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Dietary preferences */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Диетические предпочтения
          </label>
        </div>
        <div className="flex flex-col gap-1.5">
          {DIETARY_FILTERS.map((filter) => {
            const isSelected = selectedDiet === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => onSelectDiet(filter.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all text-left cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{filter.icon}</span>
                  <span>{filter.label}</span>
                </span>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Max Prep Time Slider */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-stone-500" />
            Время готовки
          </label>
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
            до {maxMinutes} мин
          </span>
        </div>
        <input
          type="range"
          min="10"
          max="60"
          step="5"
          value={maxMinutes}
          onChange={(e) => onMaxMinutesChange(Number(e.target.value))}
          className="w-full accent-emerald-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-stone-400 mt-1 font-mono">
          <span>10 мин</span>
          <span>30 мин</span>
          <span>60 мин</span>
        </div>
      </div>

      {/* Difficulty Level */}
      <div>
        <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-2 flex items-center gap-1.5">
          <ChefHat className="w-3.5 h-3.5 text-stone-500" />
          Сложность
        </label>
        <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-stone-100 dark:bg-stone-800 text-center">
          {['all', 'Легко', 'Средне', 'Шеф'].map((diff) => {
            const isSelected = selectedDifficulty === diff;
            const label = diff === 'all' ? 'Все' : diff;
            return (
              <button
                key={diff}
                onClick={() => onSelectDifficulty(diff)}
                className={`py-1.5 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-stone-700 text-emerald-700 dark:text-emerald-300 shadow-xs font-bold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Toggle: Only 100% available */}
      <div className="pt-3 border-t border-stone-100 dark:border-stone-800">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={(e) => onToggleOnlyAvailable(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 rounded-sm cursor-pointer"
          />
          <span className="text-xs font-medium text-stone-800 dark:text-stone-200">
            Только блюда со 100% наличием продуктов
          </span>
        </label>
      </div>

      {/* Result Count Status Badge */}
      <div className="mt-auto p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 text-center">
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Найдено рецептов:{' '}
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            {totalFilteredCount}
          </span>{' '}
          из {totalAllCount}
        </p>
      </div>
    </aside>
  );
};
