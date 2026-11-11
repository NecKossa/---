import React from 'react';
import { Refrigerator, Sparkles, ShoppingBag, PieChart, Moon, Sun, Camera } from 'lucide-react';

interface HeaderProps {
  activeTab: 'fridge' | 'shopping' | 'nutrition';
  setActiveTab: (tab: 'fridge' | 'shopping' | 'nutrition') => void;
  shoppingCount: number;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  onNewScanClick: () => void;
  todayCalories: number;
  caloriesGoal: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  shoppingCount,
  isDarkMode,
  setIsDarkMode,
  onNewScanClick,
  todayCalories,
  caloriesGoal,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b backdrop-blur-md transition-colors duration-200 bg-white/90 dark:bg-stone-900/90 border-stone-200 dark:border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('fridge')}>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <Refrigerator className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-stone-900 dark:text-stone-100">
                  Шеф-Фридж
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                  <Sparkles className="w-2.5 h-2.5 mr-0.5" /> AI
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 hidden sm:block">
                Умный кулинарный ассистент &amp; трекер
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center p-1 rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/60" aria-label="Разделы приложения">
            <button
              onClick={() => setActiveTab('fridge')}
              aria-label="Рецепты и холодильник"
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'fridge'
                  ? 'bg-white dark:bg-stone-700 text-emerald-700 dark:text-emerald-300 shadow-sm'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Refrigerator className="w-4 h-4" />
              <span className="hidden md:inline">Холодильник &amp; Рецепты</span>
              <span className="md:hidden">Рецепты</span>
            </button>

            <button
              onClick={() => setActiveTab('shopping')}
              aria-label="Список покупок"
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all relative ${
                activeTab === 'shopping'
                  ? 'bg-white dark:bg-stone-700 text-emerald-700 dark:text-emerald-300 shadow-sm'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden md:inline">Список покупок</span>
              <span className="md:hidden">Покупки</span>
              {shoppingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[11px] font-bold bg-amber-500 text-white leading-none">
                  {shoppingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('nutrition')}
              aria-label="Трекер КБЖУ"
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'nutrition'
                  ? 'bg-white dark:bg-stone-700 text-emerald-700 dark:text-emerald-300 shadow-sm'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span className="hidden md:inline">Трекер КБЖУ</span>
              <span className="md:hidden">КБЖУ</span>
              <span className="hidden lg:inline-flex text-[11px] font-mono px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                {todayCalories}/{caloriesGoal} ккал
              </span>
            </button>
          </nav>

          {/* Quick Actions: Scan & Dark Mode */}
          <div className="flex items-center gap-2">
            <button
              onClick={onNewScanClick}
              aria-label="Сделать снимок холодильника"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-sm transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Снять холодильник</span>
            </button>

            <button
              onClick={() => setIsDarkMode((prev) => !prev)}
              aria-label={isDarkMode ? 'Включить светлую тему' : 'Включить темную тему'}
              className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              title={isDarkMode ? 'Светлая тема' : 'Темная тема'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
