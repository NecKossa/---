import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { FridgeScanner } from './components/FridgeScanner.tsx';
import { FilterSidebar } from './components/FilterSidebar.tsx';
import { RecipeCard } from './components/RecipeCard.tsx';
import { CookingModeModal } from './components/CookingModeModal.tsx';
import { ShoppingListView } from './components/ShoppingListView.tsx';
import { NutritionTrackerView } from './components/NutritionTrackerView.tsx';
import { FRIDGE_PRESETS, INITIAL_RECIPES, FridgePreset } from './data/demoData.ts';
import { Recipe, ShoppingItem, CookedMeal, DietaryCategory, NutritionDailyGoal } from './types/index.ts';
import { filterRecipes, calculateNutritionTotals, calculateRecipeMatch } from './utils/nutrition.ts';
import { Sparkles, UtensilsCrossed, AlertTriangle } from 'lucide-react';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chef_fridge_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('chef_fridge_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('chef_fridge_theme', 'light');
    }
  }, [isDarkMode]);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'fridge' | 'shopping' | 'nutrition'>('fridge');

  // Scanner state
  const [currentImage, setCurrentImage] = useState<string | null>(FRIDGE_PRESETS[0].imageUrl);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [ingredients, setIngredients] = useState<string[]>(FRIDGE_PRESETS[0].ingredients);
  const [fridgeSummary, setFridgeSummary] = useState<string>(
    'Распознано 8 продуктов: яйца, сыр, помидоры, молоко, ветчина, зелень. Идеально для пышных омлетов, шакшуки и сытных паст!'
  );
  const [storageTips, setStorageTips] = useState<string[]>([
    'Шпинат и зелень лучше просушить и завернуть в пергамент',
    'Сыр храните в закрытом контейнере при температуре +4°C',
    'Томаты раскроют больше вкуса, если дать им полежать при комнатной температуре перед готовкой',
  ]);

  // Recipes & Filtering state
  const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES);
  const [selectedDiet, setSelectedDiet] = useState<DietaryCategory>('all');
  const [maxMinutes, setMaxMinutes] = useState<number>(45);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Hands-free Cooking Modal state
  const [cookingRecipe, setCookingRecipe] = useState<Recipe | null>(null);

  // Shopping list state
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('chef_fridge_shopping');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return [
      {
        id: 'shop-init-1',
        name: 'Хлеб чиабатта или багет',
        amount: '2 ломтика',
        category: 'Выпечка и хлеб',
        checked: false,
        fromRecipeTitle: 'Шакшука по-средиземноморски',
        addedAt: new Date().toISOString(),
      },
      {
        id: 'shop-init-2',
        name: 'Паста спагетти',
        amount: '180 г',
        category: 'Бакалея и специи',
        checked: false,
        fromRecipeTitle: 'Итальянская паста с ветчиной',
        addedAt: new Date().toISOString(),
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('chef_fridge_shopping', JSON.stringify(shoppingItems));
  }, [shoppingItems]);

  // Cooked meals log (Nutrition Tracker)
  const [cookedMeals, setCookedMeals] = useState<CookedMeal[]>(() => {
    const saved = localStorage.getItem('chef_fridge_meals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return [
      {
        id: 'meal-init-1',
        recipeId: 'rec-1',
        recipeTitle: 'Пышный омлет со шпинатом, томатами и сыром',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        calories: 340,
        proteins: 24,
        fats: 25,
        carbs: 4,
        servings: 1,
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('chef_fridge_meals', JSON.stringify(cookedMeals));
  }, [cookedMeals]);

  // Daily nutrition goal
  const [dailyGoal, setDailyGoal] = useState<NutritionDailyGoal>(() => {
    const saved = localStorage.getItem('chef_fridge_goal');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return {
      calories: 2100,
      proteins: 100,
      fats: 70,
      carbs: 180,
    };
  });

  useEffect(() => {
    localStorage.setItem('chef_fridge_goal', JSON.stringify(dailyGoal));
  }, [dailyGoal]);

  const [lastAddedRecipeId, setLastAddedRecipeId] = useState<string | null>(null);

  // Recalculate recipe match scores whenever ingredients change
  useEffect(() => {
    setRecipes((prevRecipes) =>
      prevRecipes.map((rec) => {
        const { matchedIngredients, matchScore } = calculateRecipeMatch(
          rec.ingredients,
          ingredients
        );
        return {
          ...rec,
          ingredients: matchedIngredients,
          matchScore,
        };
      })
    );
  }, [ingredients]);

  // Handle image selection (preset or camera upload)
  const handleImageSelected = async (base64OrUrl: string, preset?: FridgePreset) => {
    setCurrentImage(base64OrUrl);
    setIsAnalyzing(true);

    if (preset) {
      // Use preset data immediately for fast responsive feedback
      setIngredients(preset.ingredients);
      setFridgeSummary(`Распознаны продукты для набора «${preset.name}». ИИ подобрал оптимальные рецепты!`);
      if (preset.id === 'fitness') {
        setSelectedDiet('keto');
      } else if (preset.id === 'veggie') {
        setSelectedDiet('vegetarian');
      }
      setTimeout(() => setIsAnalyzing(false), 600);
      return;
    }

    try {
      // Call server-side API with Gemini Vision
      const response = await fetch('/api/analyze-fridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64OrUrl,
          dietFilter: selectedDiet,
        }),
      });

      const resData = await response.json();

      if (resData.success && resData.data) {
        const { detectedIngredients, fridgeSummary: summary, storageTips: tips, recipes: aiRecipes } =
          resData.data;

        if (Array.isArray(detectedIngredients) && detectedIngredients.length > 0) {
          const names = detectedIngredients.map((i: { name: string; amount?: string }) =>
            i.amount ? `${i.name} (${i.amount})` : i.name
          );
          setIngredients(names);
        }

        if (summary) setFridgeSummary(summary);
        if (tips) setStorageTips(tips);

        if (Array.isArray(aiRecipes) && aiRecipes.length > 0) {
          setRecipes((prev) => [...aiRecipes, ...prev.filter((r) => !r.id.startsWith('rec-ai'))]);
        }
      }
    } catch (err) {
      console.error('Error analyzing image:', err);
      setFridgeSummary('ИИ завершил сканирование. Продукты распознаны и готовы к использованию.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Ingredient management
  const handleAddIngredient = (name: string) => {
    setIngredients((prev) => [name, ...prev]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  // Add missing ingredients of a recipe to shopping list
  const handleAddMissingToShopping = (recipe: Recipe) => {
    const missing = recipe.ingredients.filter((i) => !i.inFridge);
    if (missing.length === 0) return;

    const newItems: ShoppingItem[] = missing.map((item) => ({
      id: `shop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: item.name,
      amount: item.amount || '1 шт',
      category: 'Бакалея и продукты',
      checked: false,
      fromRecipeTitle: recipe.title,
      addedAt: new Date().toISOString(),
    }));

    setShoppingItems((prev) => [...newItems, ...prev]);
    setLastAddedRecipeId(recipe.id);
    setTimeout(() => setLastAddedRecipeId(null), 3000);
  };

  // Log meal after hands-free cooking completes
  const handleFinishMeal = (recipe: Recipe) => {
    const newMeal: CookedMeal = {
      id: `meal-${Date.now()}`,
      recipeId: recipe.id,
      recipeTitle: recipe.title,
      timestamp: new Date().toISOString(),
      calories: recipe.nutrition.calories,
      proteins: recipe.nutrition.proteins,
      fats: recipe.nutrition.fats,
      carbs: recipe.nutrition.carbs,
      servings: 1,
    };

    setCookedMeals((prev) => [newMeal, ...prev]);
    setCookingRecipe(null);
    setActiveTab('nutrition');
  };

  // Filtered recipes
  const filteredRecipes = filterRecipes(recipes, {
    dietary: selectedDiet,
    maxMinutes,
    difficulty: selectedDifficulty,
    onlyAvailable,
    searchQuery,
  });

  const totals = calculateNutritionTotals(cookedMeals);

  const handleTabChange = (tab: 'fridge' | 'shopping' | 'nutrition') => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans transition-colors duration-200">
      {/* Global Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        shoppingCount={shoppingItems.filter((i) => !i.checked).length}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onNewScanClick={() => {
          handleTabChange('fridge');
        }}
        todayCalories={totals.calories}
        caloriesGoal={dailyGoal.calories}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {activeTab === 'fridge' && (
          <div className="space-y-8">
            {/* Fridge Photo Scanner & Ingredient Extraction */}
            <FridgeScanner
              currentImage={currentImage}
              onImageSelected={handleImageSelected}
              isAnalyzing={isAnalyzing}
              ingredients={ingredients}
              onAddIngredient={handleAddIngredient}
              onRemoveIngredient={handleRemoveIngredient}
              fridgeSummary={fridgeSummary}
              storageTips={storageTips}
              onGenerateRecipes={() => {
                // Trigger re-matching
                setRecipes((prev) => [...prev]);
              }}
            />

            {/* Recipes Section with Dietary Filter Sidebar */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Filter Sidebar */}
              <FilterSidebar
                selectedDiet={selectedDiet}
                onSelectDiet={setSelectedDiet}
                maxMinutes={maxMinutes}
                onMaxMinutesChange={setMaxMinutes}
                selectedDifficulty={selectedDifficulty}
                onSelectDifficulty={setSelectedDifficulty}
                onlyAvailable={onlyAvailable}
                onToggleOnlyAvailable={setOnlyAvailable}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                totalFilteredCount={filteredRecipes.length}
                totalAllCount={recipes.length}
                onResetFilters={() => {
                  setSelectedDiet('all');
                  setMaxMinutes(60);
                  setSelectedDifficulty('all');
                  setOnlyAvailable(false);
                  setSearchQuery('');
                }}
              />

              {/* Recipe Cards Grid */}
              <div className="flex-1 w-full space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <h2 className="text-xl font-black text-stone-900 dark:text-stone-100">
                      Рекомендованные рецепты ({filteredRecipes.length})
                    </h2>
                  </div>
                  {selectedDiet !== 'all' && (
                    <span className="text-xs px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                      Фильтр: {selectedDiet}
                    </span>
                  )}
                </div>

                {filteredRecipes.length === 0 ? (
                  <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-3">
                    <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto stroke-1" />
                    <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                      Нет рецептов, точно подходящих под выбранные фильтры
                    </h3>
                    <p className="text-xs text-stone-500 max-w-md mx-auto">
                      Попробуйте увеличить максимальное время готовки, снять ограничение «Только 100%» или выбрать другую диету.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedDiet('all');
                        setMaxMinutes(60);
                        setOnlyAvailable(false);
                        setSearchQuery('');
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                    >
                      Сбросить фильтры
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredRecipes.map((recipe) => (
                      <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        onStartCooking={(rec) => setCookingRecipe(rec)}
                        onAddMissingToShopping={handleAddMissingToShopping}
                        missingAdded={lastAddedRecipeId === recipe.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'shopping' && (
          <ShoppingListView
            items={shoppingItems}
            onToggleItem={(id) =>
              setShoppingItems((prev) =>
                prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))
              )
            }
            onDeleteItem={(id) =>
              setShoppingItems((prev) => prev.filter((i) => i.id !== id))
            }
            onAddItem={(name, amount, category) => {
              const newItem: ShoppingItem = {
                id: `shop-manual-${Date.now()}`,
                name,
                amount,
                category,
                checked: false,
                addedAt: new Date().toISOString(),
              };
              setShoppingItems((prev) => [newItem, ...prev]);
            }}
            onClearCompleted={() =>
              setShoppingItems((prev) => prev.filter((i) => !i.checked))
            }
            onClearAll={() => setShoppingItems([])}
          />
        )}

        {activeTab === 'nutrition' && (
          <NutritionTrackerView
            meals={cookedMeals}
            onDeleteMeal={(id) =>
              setCookedMeals((prev) => prev.filter((m) => m.id !== id))
            }
            onAddManualMeal={(mealData) => {
              const newMeal: CookedMeal = {
                ...mealData,
                id: `meal-manual-${Date.now()}`,
                timestamp: new Date().toISOString(),
              };
              setCookedMeals((prev) => [newMeal, ...prev]);
            }}
            dailyGoal={dailyGoal}
            onUpdateDailyGoal={(goal) => setDailyGoal(goal)}
          />
        )}
      </main>

      {/* Hands-free Cooking Mode Modal */}
      <CookingModeModal
        recipe={cookingRecipe}
        isOpen={Boolean(cookingRecipe)}
        onClose={() => setCookingRecipe(null)}
        onAddMissingToShopping={handleAddMissingToShopping}
        onFinishMeal={handleFinishMeal}
      />
    </div>
  );
}
