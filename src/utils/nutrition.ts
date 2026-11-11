import { Recipe, DietaryCategory, CookedMeal, NutritionDailyGoal } from '../types/index.ts';

/**
 * Filter recipes according to dietary requirements, maximum time, search keyword, and difficulty.
 */
export function filterRecipes(
  recipes: Recipe[],
  options: {
    dietary?: DietaryCategory;
    maxMinutes?: number;
    maxCalories?: number;
    difficulty?: string;
    searchQuery?: string;
    onlyAvailable?: boolean;
  }
): Recipe[] {
  const {
    dietary = 'all',
    maxMinutes = 120,
    maxCalories,
    difficulty,
    searchQuery = '',
    onlyAvailable = false,
  } = options;

  const query = searchQuery.trim().toLowerCase();

  return recipes.filter((recipe) => {
    // Dietary filter
    if (dietary !== 'all') {
      if (!recipe.dietaryTags.includes(dietary)) {
        return false;
      }
    }

    // Time filter
    if (recipe.prepTimeMinutes > maxMinutes) {
      return false;
    }

    // Calories filter
    if (maxCalories && recipe.nutrition.calories > maxCalories) {
      return false;
    }

    // Difficulty filter
    if (difficulty && difficulty !== 'all' && recipe.difficulty !== difficulty) {
      return false;
    }

    // Only if all ingredients available (100% match)
    if (onlyAvailable && recipe.matchScore < 100) {
      return false;
    }

    // Search query filter
    if (query) {
      const matchTitle = recipe.title.toLowerCase().includes(query);
      const matchDesc = recipe.description.toLowerCase().includes(query);
      const matchIngr = recipe.ingredients.some((i) => i.name.toLowerCase().includes(query));
      if (!matchTitle && !matchDesc && !matchIngr) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Calculate total nutrition macros from logged meals.
 */
export function calculateNutritionTotals(meals: CookedMeal[]): {
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
} {
  return meals.reduce(
    (acc, meal) => {
      acc.calories += Math.round(meal.calories * (meal.servings || 1));
      acc.proteins += Math.round(meal.proteins * (meal.servings || 1));
      acc.fats += Math.round(meal.fats * (meal.servings || 1));
      acc.carbs += Math.round(meal.carbs * (meal.servings || 1));
      return acc;
    },
    { calories: 0, proteins: 0, fats: 0, carbs: 0 }
  );
}

/**
 * Calculate progress percentages against daily targets.
 */
export function calculateGoalProgress(
  current: { calories: number; proteins: number; fats: number; carbs: number },
  goal: NutritionDailyGoal
): {
  caloriesPercent: number;
  proteinsPercent: number;
  fatsPercent: number;
  carbsPercent: number;
} {
  const safePercent = (val: number, target: number) =>
    target <= 0 ? 0 : Math.min(100, Math.round((val / target) * 100));

  return {
    caloriesPercent: safePercent(current.calories, goal.calories),
    proteinsPercent: safePercent(current.proteins, goal.proteins),
    fatsPercent: safePercent(current.fats, goal.fats),
    carbsPercent: safePercent(current.carbs, goal.carbs),
  };
}

function extractKeywords(text: string): string[] {
  const cleaned = text
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[0-9.,%+]/g, ' ');
  const stopWords = new Set([
    'или', 'для', 'свежий', 'свежие', 'свежая', 'молодой', 'мл', 'шт', 'уп', 'по',
    'вкусу', 'ст', 'ложка', 'ложки', 'пучок', 'тертый', 'сырой'
  ]);
  return cleaned
    .split(/[\s-]+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 3 && !stopWords.has(w));
}

/**
 * Match recipe ingredients against detected fridge ingredients and calculate match percentage.
 */
export function calculateRecipeMatch(
  recipeIngredients: { name: string; amount: string }[],
  availableNames: string[]
): {
  matchedIngredients: { name: string; amount: string; inFridge: boolean }[];
  matchScore: number;
  missingCount: number;
} {
  const availableKeywordsList = availableNames.map((n) => ({
    raw: n.toLowerCase(),
    keywords: extractKeywords(n),
  }));

  let matchCount = 0;
  const matchedIngredients = recipeIngredients.map((item) => {
    const itemName = item.name.toLowerCase();
    const itemKeywords = extractKeywords(item.name);

    const inFridge = availableKeywordsList.some(({ raw, keywords }) => {
      // Direct raw inclusion
      if (raw.includes(itemName) || itemName.includes(raw)) return true;
      // Keyword matching
      return itemKeywords.some((ik) => {
        // e.g. 'яйц' in 'яйца', 'сыр' in 'сыр', 'молок' in 'молоко', 'томат' in 'помидоры'
        const ikRoot = ik.slice(0, 4);
        if (raw.includes(ikRoot)) return true;
        return keywords.some((ak) => ak.includes(ikRoot) || ik.includes(ak.slice(0, 4)));
      });
    });

    if (inFridge) {
      matchCount++;
    }
    return {
      ...item,
      inFridge,
    };
  });

  const total = recipeIngredients.length;
  const matchScore = total === 0 ? 100 : Math.round((matchCount / total) * 100);
  const missingCount = total - matchCount;

  return {
    matchedIngredients,
    matchScore,
    missingCount,
  };
}

/**
 * Estimate approximate price for shopping basket in Rubles.
 */
export function estimateBasketCost(items: { name: string; checked: boolean }[]): number {
  const defaultPricePerItem = 120; // Average cost in Russian supermarket
  const activeItems = items.filter((i) => !i.checked);
  return activeItems.length * defaultPricePerItem;
}
