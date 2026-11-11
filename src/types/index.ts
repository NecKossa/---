export type DietaryCategory = 
  | 'all'
  | 'vegetarian'
  | 'vegan'
  | 'keto'
  | 'low_carb'
  | 'gluten_free'
  | 'high_protein'
  | 'quick';

export interface Ingredient {
  id: string;
  name: string;
  category?: 'dairy' | 'vegetable' | 'meat' | 'bakery' | 'spice' | 'other';
  quantity?: string;
  confidence?: number; // 0..100
}

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
  durationMinutes?: number;
  tip?: string;
}

export interface RecipeNutrition {
  calories: number; // kcal
  proteins: number; // g
  fats: number;     // g
  carbs: number;    // g
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  prepTimeMinutes: number;
  difficulty: 'Легко' | 'Средне' | 'Шеф';
  dietaryTags: DietaryCategory[];
  nutrition: RecipeNutrition;
  servings: number;
  ingredients: {
    name: string;
    amount: string;
    inFridge: boolean;
  }[];
  steps: RecipeStep[];
  matchScore: number; // % of ingredients already available
}

export interface ShoppingItem {
  id: string;
  name: string;
  amount: string;
  category: string;
  checked: boolean;
  fromRecipeTitle?: string;
  addedAt: string;
  estimatedPriceRub?: number;
}

export interface DeliveryService {
  id: 'yandex_lavka' | 'sbermarket' | 'samokat' | 'vkusvill' | 'ozon_fresh';
  name: string;
  logo: string;
  deliveryTime: string;
  minOrder: number;
  color: string;
}

export interface NutritionDailyGoal {
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
}

export interface CookedMeal {
  id: string;
  recipeId: string;
  recipeTitle: string;
  timestamp: string;
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
  servings: number;
}
