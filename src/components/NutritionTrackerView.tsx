import React, { useState } from 'react';
import {
  PieChart,
  Flame,
  Plus,
  Trash2,
  Settings2,
  Calendar,
  Check,
  TrendingUp,
  Award,
  Info
} from 'lucide-react';
import { CookedMeal, NutritionDailyGoal } from '../types/index.ts';
import { calculateNutritionTotals, calculateGoalProgress } from '../utils/nutrition.ts';

interface NutritionTrackerViewProps {
  meals: CookedMeal[];
  onDeleteMeal: (id: string) => void;
  onAddManualMeal: (meal: Omit<CookedMeal, 'id' | 'timestamp'>) => void;
  dailyGoal: NutritionDailyGoal;
  onUpdateDailyGoal: (goal: NutritionDailyGoal) => void;
}

export const NutritionTrackerView: React.FC<NutritionTrackerViewProps> = ({
  meals,
  onDeleteMeal,
  onAddManualMeal,
  dailyGoal,
  onUpdateDailyGoal,
}) => {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalForm, setGoalForm] = useState(dailyGoal);

  // Manual meal form
  const [manualTitle, setManualTitle] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [manualProteins, setManualProteins] = useState('');
  const [manualFats, setManualFats] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');

  const totals = calculateNutritionTotals(meals);
  const progress = calculateGoalProgress(totals, dailyGoal);

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateDailyGoal(goalForm);
    setIsEditingGoal(false);
  };

  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    onAddManualMeal({
      recipeId: `custom-${Date.now()}`,
      recipeTitle: manualTitle.trim(),
      calories: Number(manualCalories) || 0,
      proteins: Number(manualProteins) || 0,
      fats: Number(manualFats) || 0,
      carbs: Number(manualCarbs) || 0,
      servings: 1,
    });

    setManualTitle('');
    setManualCalories('');
    setManualProteins('');
    setManualFats('');
    setManualCarbs('');
  };

  const caloriesRemaining = Math.max(0, dailyGoal.calories - totals.calories);

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 dark:from-stone-900 dark:to-stone-950 border border-stone-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Баланс питания
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Трекер калорийности и нутриентов (КБЖУ)
          </h1>
          <p className="text-sm text-stone-300 mt-1 max-w-xl">
            Каждое приготовленное блюдо автоматически учитывается здесь. Отслеживайте баланс белков, жиров и углеводов.
          </p>
        </div>

        <button
          onClick={() => setIsEditingGoal((prev) => !prev)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold backdrop-blur-md transition-all cursor-pointer border border-white/10"
        >
          <Settings2 className="w-4 h-4" />
          <span>{isEditingGoal ? 'Закрыть настройку цели' : 'Настроить цель КБЖУ'}</span>
        </button>
      </div>

      {/* Goal Editor Drawer if open */}
      {isEditingGoal && (
        <form onSubmit={handleSaveGoal} className="bg-white dark:bg-stone-900 border border-emerald-500/40 rounded-3xl p-6 shadow-md space-y-4">
          <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-emerald-600" />
            Индивидуальные дневные нормы
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-stone-600 dark:text-stone-400 block mb-1">Калории (ккал)</label>
              <input
                type="number"
                value={goalForm.calories}
                onChange={(e) => setGoalForm({ ...goalForm, calories: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl text-sm border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-600 dark:text-stone-400 block mb-1">Белки (г)</label>
              <input
                type="number"
                value={goalForm.proteins}
                onChange={(e) => setGoalForm({ ...goalForm, proteins: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl text-sm border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-600 dark:text-stone-400 block mb-1">Жиры (г)</label>
              <input
                type="number"
                value={goalForm.fats}
                onChange={(e) => setGoalForm({ ...goalForm, fats: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl text-sm border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-600 dark:text-stone-400 block mb-1">Углеводы (г)</label>
              <input
                type="number"
                value={goalForm.carbs}
                onChange={(e) => setGoalForm({ ...goalForm, carbs: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl text-sm border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditingGoal(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
            >
              Сохранить нормы
            </button>
          </div>
        </form>
      )}

      {/* Macro Summary Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Calories Card */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500" />
              Калории
            </span>
            <span className="text-xs font-bold font-mono text-stone-400">
              {progress.caloriesPercent}%
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-3xl font-black font-mono text-stone-900 dark:text-stone-100">
              {totals.calories}
            </span>
            <span className="text-xs text-stone-400">/ {dailyGoal.calories} ккал</span>
          </div>
          <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden mb-2">
            <div
              className="bg-orange-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, progress.caloriesPercent)}%` }}
            />
          </div>
          <span className="text-[11px] text-stone-500 dark:text-stone-400">
            Осталось на сегодня: <span className="font-bold">{caloriesRemaining} ккал</span>
          </span>
        </div>

        {/* Proteins Card */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-500" />
              Белки
            </span>
            <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {progress.proteinsPercent}%
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-3xl font-black font-mono text-stone-900 dark:text-stone-100">
              {totals.proteins}г
            </span>
            <span className="text-xs text-stone-400">/ {dailyGoal.proteins}г</span>
          </div>
          <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden mb-2">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, progress.proteinsPercent)}%` }}
            />
          </div>
          <span className="text-[11px] text-stone-500 dark:text-stone-400">
            Для мышц и сытости
          </span>
        </div>

        {/* Fats Card */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              Жиры
            </span>
            <span className="text-xs font-bold font-mono text-amber-600 dark:text-amber-400">
              {progress.fatsPercent}%
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-3xl font-black font-mono text-stone-900 dark:text-stone-100">
              {totals.fats}г
            </span>
            <span className="text-xs text-stone-400">/ {dailyGoal.fats}г</span>
          </div>
          <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden mb-2">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, progress.fatsPercent)}%` }}
            />
          </div>
          <span className="text-[11px] text-stone-500 dark:text-stone-400">
            Основа энергии в кето
          </span>
        </div>

        {/* Carbs Card */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-blue-500" />
              Углеводы
            </span>
            <span className="text-xs font-bold font-mono text-blue-600 dark:text-blue-400">
              {progress.carbsPercent}%
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-3xl font-black font-mono text-stone-900 dark:text-stone-100">
              {totals.carbs}г
            </span>
            <span className="text-xs text-stone-400">/ {dailyGoal.carbs}г</span>
          </div>
          <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden mb-2">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, progress.carbsPercent)}%` }}
            />
          </div>
          <span className="text-[11px] text-stone-500 dark:text-stone-400">
            Медленные и быстрые
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Log of Prepared Dishes */}
        <div className="lg:col-span-8 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="font-extrabold text-stone-900 dark:text-stone-100 text-lg">
                Приготовленные блюда сегодня ({meals.length})
              </h2>
            </div>
          </div>

          {meals.length === 0 ? (
            <div className="text-center py-12 text-stone-400 dark:text-stone-500">
              <PieChart className="w-12 h-12 mx-auto mb-2 stroke-1" />
              <p className="text-sm font-semibold">Сегодня еще не было записей</p>
              <p className="text-xs">Запустите пошаговое приготовление любого рецепта и нажмите «Блюдо готово»</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {meals.map((meal) => (
                <div key={meal.id} className="py-4 flex items-center justify-between gap-4 group">
                  <div>
                    <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm sm:text-base">
                      {meal.recipeTitle}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mt-1">
                      <span className="font-bold text-orange-600 dark:text-orange-400">
                        {meal.calories} ккал
                      </span>
                      <span>•</span>
                      <span>Б: {meal.proteins}г</span>
                      <span>•</span>
                      <span>Ж: {meal.fats}г</span>
                      <span>•</span>
                      <span>У: {meal.carbs}г</span>
                      <span>•</span>
                      <span className="text-stone-400 font-mono">
                        {new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteMeal(meal.id)}
                    className="p-2 rounded-xl text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Удалить запись"
                    aria-label={`Удалить ${meal.recipeTitle}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Custom Snack / Meal Sidebar Form */}
        <div className="lg:col-span-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Добавить перекус или блюдо
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Если вы съели что-то вне рецептов (яблоко, кофе с молоком или протеин)
          </p>

          <form onSubmit={handleAddMeal} className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400 block mb-1">Название</label>
              <input
                type="text"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="Например, «Зеленое яблоко»"
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400 block mb-1">Калории (ккал)</label>
                <input
                  type="number"
                  value={manualCalories}
                  onChange={(e) => setManualCalories(e.target.value)}
                  placeholder="95"
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400 block mb-1">Белки (г)</label>
                <input
                  type="number"
                  value={manualProteins}
                  onChange={(e) => setManualProteins(e.target.value)}
                  placeholder="1"
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400 block mb-1">Жиры (г)</label>
                <input
                  type="number"
                  value={manualFats}
                  onChange={(e) => setManualFats(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400 block mb-1">Углеводы (г)</label>
                <input
                  type="number"
                  value={manualCarbs}
                  onChange={(e) => setManualCarbs(e.target.value)}
                  placeholder="22"
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!manualTitle.trim()}
              className="w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-stone-900 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white disabled:opacity-40 transition-all cursor-pointer"
            >
              Записать в дневник
            </button>
          </form>

          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-emerald-900 dark:text-emerald-200 leading-snug">
              Придерживаетесь кето? Старайтесь удерживать углеводы ниже 30г в сутки, а жиры — выше 70% от общей суточной нормы.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
