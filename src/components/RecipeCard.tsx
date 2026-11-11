import React from 'react';
import { Clock, ChefHat, Flame, Plus, Check, Play, ShoppingCart } from 'lucide-react';
import { Recipe } from '../types/index.ts';

interface RecipeCardProps {
  recipe: Recipe;
  onStartCooking: (recipe: Recipe) => void;
  onAddMissingToShopping: (recipe: Recipe) => void;
  missingAdded?: boolean;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onStartCooking,
  onAddMissingToShopping,
  missingAdded = false,
}) => {
  const missingIngredients = recipe.ingredients.filter((i) => !i.inFridge);
  const isComplete = missingIngredients.length === 0;

  // Map difficulty to badge colors
  const difficultyColor = {
    Легко: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300',
    Средне: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300',
    Шеф: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300',
  }[recipe.difficulty] || 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300';

  return (
    <article className="group bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Card Header & Image */}
        <div className="relative aspect-16/10 overflow-hidden bg-stone-100 dark:bg-stone-800">
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Match Score Badge */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span
              className={`px-2.5 py-1 rounded-xl text-xs font-bold tracking-tight shadow-md backdrop-blur-md ${
                isComplete
                  ? 'bg-emerald-600/95 text-white'
                  : 'bg-amber-500/95 text-white'
              }`}
            >
              {isComplete ? '✨ 100% в наличии' : `Совпадение ${recipe.matchScore}%`}
            </span>
          </div>

          {/* Quick Stats Overlay (Time & Calories) */}
          <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-none">
            <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-stone-900/80 text-white backdrop-blur-md flex items-center gap-1 shadow-xs">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              {recipe.prepTimeMinutes} мин
            </span>
            <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-stone-900/80 text-white backdrop-blur-md flex items-center gap-1 shadow-xs">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              {recipe.nutrition.calories} ккал
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6">
          {/* Difficulty and Tags */}
          <div className="flex items-center gap-2 mb-2.5">
            <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1 ${difficultyColor}`}>
              <ChefHat className="w-3 h-3" />
              {recipe.difficulty}
            </span>
            <span className="text-xs text-stone-400 dark:text-stone-500">•</span>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              {recipe.servings} {recipe.servings === 1 ? 'порция' : 'порции'}
            </span>
          </div>

          <h3 className="font-extrabold text-stone-900 dark:text-stone-100 text-base sm:text-lg leading-snug line-clamp-2 mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {recipe.title}
          </h3>

          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed mb-4">
            {recipe.description}
          </p>

          {/* Macros Pills (КБЖУ) */}
          <div className="grid grid-cols-4 gap-1.5 p-2 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 text-center mb-4">
            <div>
              <span className="block text-[10px] text-stone-400 dark:text-stone-400 uppercase font-semibold">Ккал</span>
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200">{recipe.nutrition.calories}</span>
            </div>
            <div>
              <span className="block text-[10px] text-stone-400 dark:text-stone-400 uppercase font-semibold">Белки</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{recipe.nutrition.proteins}г</span>
            </div>
            <div>
              <span className="block text-[10px] text-stone-400 dark:text-stone-400 uppercase font-semibold">Жиры</span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{recipe.nutrition.fats}г</span>
            </div>
            <div>
              <span className="block text-[10px] text-stone-400 dark:text-stone-400 uppercase font-semibold">Углев</span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{recipe.nutrition.carbs}г</span>
            </div>
          </div>

          {/* Missing Ingredients Section */}
          {missingIngredients.length > 0 && (
            <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1">
                  Не хватает ({missingIngredients.length}):
                </span>
                <button
                  onClick={() => onAddMissingToShopping(recipe)}
                  disabled={missingAdded}
                  className="text-xs font-bold text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {missingAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Добавлено</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ В список покупок</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                {missingIngredients.map((i) => `${i.name} (${i.amount})`).join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-5 sm:p-6 pt-0 flex gap-2">
        <button
          onClick={() => onStartCooking(recipe)}
          aria-label={`Готовить ${recipe.title}`}
          className="flex-1 py-3 px-4 rounded-2xl bg-stone-900 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Готовить по шагам</span>
        </button>

        {missingIngredients.length > 0 && (
          <button
            onClick={() => onAddMissingToShopping(recipe)}
            title="Добавить недостающие продукты в список покупок"
            aria-label="Добавить недостающие продукты в список покупок"
            className="p-3 rounded-2xl border border-stone-200 dark:border-stone-700 hover:border-amber-500 text-stone-600 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-all cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        )}
      </div>
    </article>
  );
};
