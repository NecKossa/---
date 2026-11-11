import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterRecipes,
  calculateNutritionTotals,
  calculateGoalProgress,
  calculateRecipeMatch,
  estimateBasketCost,
} from './nutrition.ts';
import { Recipe, CookedMeal } from '../types/index.ts';

const mockRecipes: Recipe[] = [
  {
    id: '1',
    title: 'Веганский салат с авокадо',
    description: 'Легкий и свежий салат',
    imageUrl: '',
    prepTimeMinutes: 15,
    difficulty: 'Легко',
    dietaryTags: ['vegetarian', 'vegan', 'gluten_free'],
    nutrition: { calories: 250, proteins: 5, fats: 18, carbs: 12 },
    servings: 1,
    ingredients: [
      { name: 'Авокадо', amount: '1 шт', inFridge: true },
      { name: 'Томаты', amount: '2 шт', inFridge: true },
    ],
    steps: [],
    matchScore: 100,
  },
  {
    id: '2',
    title: 'Кето-стейк со спаржей',
    description: 'Сытный ужин с высоким содержанием белка',
    imageUrl: '',
    prepTimeMinutes: 30,
    difficulty: 'Средне',
    dietaryTags: ['keto', 'low_carb', 'high_protein', 'gluten_free'],
    nutrition: { calories: 650, proteins: 48, fats: 42, carbs: 4 },
    servings: 1,
    ingredients: [
      { name: 'Говядина', amount: '300 г', inFridge: true },
      { name: 'Спаржа', amount: '150 г', inFridge: false },
    ],
    steps: [],
    matchScore: 50,
  },
];

test('filterRecipes filters by dietary tag correctly', () => {
  const ketoOnly = filterRecipes(mockRecipes, { dietary: 'keto' });
  assert.equal(ketoOnly.length, 1);
  assert.equal(ketoOnly[0].id, '2');

  const veganOnly = filterRecipes(mockRecipes, { dietary: 'vegan' });
  assert.equal(veganOnly.length, 1);
  assert.equal(veganOnly[0].id, '1');

  const all = filterRecipes(mockRecipes, { dietary: 'all' });
  assert.equal(all.length, 2);
});

test('filterRecipes filters by max prep time and difficulty', () => {
  const quickOnly = filterRecipes(mockRecipes, { maxMinutes: 20 });
  assert.equal(quickOnly.length, 1);
  assert.equal(quickOnly[0].id, '1');

  const mediumOnly = filterRecipes(mockRecipes, { difficulty: 'Средне' });
  assert.equal(mediumOnly.length, 1);
  assert.equal(mediumOnly[0].id, '2');
});

test('calculateNutritionTotals aggregates daily totals accurately', () => {
  const meals: CookedMeal[] = [
    {
      id: 'm1',
      recipeId: '1',
      recipeTitle: 'Салат',
      timestamp: '2026-11-11T10:00:00Z',
      calories: 250,
      proteins: 5,
      fats: 18,
      carbs: 12,
      servings: 2,
    },
    {
      id: 'm2',
      recipeId: '2',
      recipeTitle: 'Стейк',
      timestamp: '2026-11-11T13:00:00Z',
      calories: 600,
      proteins: 40,
      fats: 30,
      carbs: 5,
      servings: 1,
    },
  ];

  const totals = calculateNutritionTotals(meals);
  assert.equal(totals.calories, 250 * 2 + 600);
  assert.equal(totals.proteins, 5 * 2 + 40);
  assert.equal(totals.fats, 18 * 2 + 30);
  assert.equal(totals.carbs, 12 * 2 + 5);
});

test('calculateGoalProgress calculates percentages within 0-100 range', () => {
  const totals = { calories: 1000, proteins: 50, fats: 35, carbs: 100 };
  const goal = { calories: 2000, proteins: 100, fats: 70, carbs: 200 };

  const progress = calculateGoalProgress(totals, goal);
  assert.equal(progress.caloriesPercent, 50);
  assert.equal(progress.proteinsPercent, 50);
  assert.equal(progress.fatsPercent, 50);
  assert.equal(progress.carbsPercent, 50);
});

test('calculateRecipeMatch handles available vs missing ingredients', () => {
  const recipeIngrs = [
    { name: 'Куриное яйцо', amount: '3 шт' },
    { name: 'Молоко', amount: '100 мл' },
    { name: 'Свежий укроп', amount: '1 пучок' },
  ];
  const fridge = ['яйцо', 'молоко'];

  const result = calculateRecipeMatch(recipeIngrs, fridge);
  assert.equal(result.matchedIngredients[0].inFridge, true);
  assert.equal(result.matchedIngredients[1].inFridge, true);
  assert.equal(result.matchedIngredients[2].inFridge, false);
  assert.equal(result.matchScore, 67); // 2 out of 3 = 67%
  assert.equal(result.missingCount, 1);
});

test('estimateBasketCost estimates rubles based on unchecked items', () => {
  const items = [
    { name: 'Сыр', checked: false },
    { name: 'Хлеб', checked: true },
    { name: 'Масло', checked: false },
  ];
  const cost = estimateBasketCost(items);
  assert.equal(cost, 240); // 2 * 120
});
