import React, { useEffect, useState } from 'react';
import { ArrowLeft, ChefHat, Clock, Users, Heart, Bookmark, Sparkles, Loader2, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { RecipeCard } from './ui/RecipeCard';
import { RecipeDetail } from './ui/RecipeDetail';
import { BottomNav } from './ui/BottomNav';
import { Ingredient, Page } from '../App';
import { supabase } from '../lib/supabase';

interface RecipeListProps {
  ingredients: Ingredient[];
  onBack: () => void;
  onNavigate: (page: Page) => void;
}

export interface Recipe {
  id: string;
  title: string;
  image: string;
  cookTime: string;
  servings: number;
  matchRate: number;
  requiredIngredients: string[];
  missingIngredients: string[];
  steps: string[];
  likes: number;
  saves: number;
}

// Seed recipe data
const seedRecipes: Recipe[] = [
  {
    id: '1',
    title: '김치볶음밥',
    image: 'kimchi-fried-rice',
    cookTime: '15분',
    servings: 2,
    matchRate: 100,
    requiredIngredients: ['김치', '밥', '계란', '참기름'],
    missingIngredients: [],
    steps: [
      '김치를 잘게 썰어주세요',
      '팬에 기름을 두르고 김치를 볶아주세요',
      '밥을 넣고 함께 볶아주세요',
      '계란을 프라이해서 올려주세요',
      '참기름을 둘러 완성합니다'
    ],
    likes: 324,
    saves: 158,
  },
  {
    id: '2',
    title: '된장찌개',
    image: 'soybean-stew',
    cookTime: '20분',
    servings: 3,
    matchRate: 80,
    requiredIngredients: ['된장', '두부', '양파', '애호박', '대파'],
    missingIngredients: ['대파'],
    steps: [
      '냄비에 물을 끓여주세요',
      '된장을 풀어주세요',
      '썰어놓은 야채를 넣고 끓여주세요',
      '두부를 넣고 5분 더 끓이세요',
      '대파를 올려 완성합니다'
    ],
    likes: 512,
    saves: 289,
  },
  {
    id: '3',
    title: '계란말이',
    image: 'egg-roll',
    cookTime: '10분',
    servings: 2,
    matchRate: 90,
    requiredIngredients: ['계란', '우유', '소금'],
    missingIngredients: [],
    steps: [
      '계란에 우유와 소금을 넣고 섞어주세요',
      '팬에 기름을 두르고 달궈주세요',
      '계란물을 부어 익혀주세요',
      '돌돌 말아가며 완성하세요'
    ],
    likes: 892,
    saves: 445,
  },
  {
    id: '4',
    title: '야채볶음',
    image: 'vegetable-stirfry',
    cookTime: '15분',
    servings: 2,
    matchRate: 75,
    requiredIngredients: ['양파', '당근', '피망', '간장', '참기름'],
    missingIngredients: ['피망', '간장'],
    steps: [
      '모든 야채를 먹기 좋은 크기로 썰어주세요',
      '팬에 기름을 두르고 센 불에서 볶아주세요',
      '간장으로 간을 맞춰주세요',
      '참기름을 둘러 완성합니다'
    ],
    likes: 267,
    saves: 134,
  },
  {
    id: '5',
    title: '토마토 달걀볶음',
    image: 'tomato-egg',
    cookTime: '12분',
    servings: 2,
    matchRate: 95,
    requiredIngredients: ['토마토', '계란', '설탕', '소금'],
    missingIngredients: [],
    steps: [
      '토마토를 큼직하게 썰어주세요',
      '계란을 스크램블로 먼저 볶아 덜어주세요',
      '토마토를 볶다가 설탕을 넣어주세요',
      '계란을 다시 넣고 섞어주세요',
      '소금으로 간을 맞춰 완성합니다'
    ],
    likes: 445,
    saves: 223,
  },
];

function getFallbackRecipes(ingredients: Ingredient[]): Recipe[] {
  const userIngredientNames = ingredients.map((ing) => ing.name.toLowerCase());

  const recipesWithMatch = seedRecipes.map((recipe) => {
    const requiredLower = recipe.requiredIngredients.map((ing) => ing.toLowerCase());
    const matchCount = requiredLower.filter((req) =>
      userIngredientNames.some((userIng) => req.includes(userIng) || userIng.includes(req))
    ).length;
    const matchRate = Math.round((matchCount / requiredLower.length) * 100);

    const missing = recipe.requiredIngredients.filter(
      (req) => !userIngredientNames.some((userIng) => req.toLowerCase().includes(userIng) || userIng.includes(req.toLowerCase()))
    );

    return { ...recipe, matchRate, missingIngredients: missing };
  });

  return [...recipesWithMatch].sort((a, b) => b.matchRate - a.matchRate);
}

export function RecipeList({ ingredients, onBack, onNavigate }: RecipeListProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [aiRecipes, setAiRecipes] = useState<Recipe[] | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiFailed, setAiFailed] = useState(false);

  useEffect(() => {
    if (ingredients.length === 0) return;

    let cancelled = false;
    setIsLoadingAi(true);
    setAiFailed(false);

    supabase.auth.getSession()
      .then(({ data: { session } }) =>
        fetch('/api/recommend-recipes', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            ...(session ? { authorization: `Bearer ${session.access_token}` } : {}),
          },
          body: JSON.stringify({
            ingredients: ingredients.map((ing) => ({ name: ing.name, status: ing.status })),
          }),
        })
      )
      .then((res) => {
        if (!res.ok) throw new Error('추천 실패');
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const recipes: Recipe[] = (data.recipes ?? []).map((r: Omit<Recipe, 'id' | 'image' | 'likes' | 'saves'>, idx: number) => ({
          ...r,
          id: `ai-${idx}`,
          image: 'ai-recipe',
          likes: 0,
          saves: 0,
        }));
        if (recipes.length === 0) throw new Error('빈 응답');
        setAiRecipes(recipes);
      })
      .catch(() => {
        if (!cancelled) setAiFailed(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingAi(false);
      });

    return () => {
      cancelled = true;
    };
  }, [ingredients]);

  const sortedRecipes = aiRecipes
    ? [...aiRecipes].sort((a, b) => b.matchRate - a.matchRate)
    : getFallbackRecipes(ingredients);

  if (selectedRecipe) {
    return (
      <RecipeDetail
        recipe={selectedRecipe}
        onBack={() => setSelectedRecipe(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={onBack}
              className="p-2 -ml-2 hover:bg-neutral-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-700" />
            </button>
            <h1 className="text-lg font-bold text-neutral-900">맞춤 레시피</h1>
          </div>

          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <ChefHat className="w-4 h-4" />
            <span>보유 식재료 {ingredients.length}개 기준</span>
          </div>

          {isLoadingAi && (
            <div className="flex items-center gap-2 text-sm text-brand-600 mt-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>AI가 레시피를 만들고 있어요...</span>
            </div>
          )}
          {aiRecipes && !isLoadingAi && (
            <div className="flex items-center gap-2 text-sm text-brand-600 mt-2">
              <Sparkles className="w-4 h-4" />
              <span>AI 맞춤 추천</span>
            </div>
          )}
          {aiFailed && !isLoadingAi && (
            <p className="text-xs text-neutral-400 mt-2">AI 추천을 불러오지 못해 기본 레시피를 보여드려요</p>
          )}
        </div>
      </div>

      {/* Recipes */}
      <div className="px-6 py-4">
        {ingredients.length === 0 ? (
          <EmptyState onNavigate={onNavigate} />
        ) : (
          <div className="space-y-3">
            {sortedRecipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => setSelectedRecipe(recipe)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentPage="recipes" onNavigate={onNavigate} />
    </div>
  );
}

interface EmptyStateProps {
  onNavigate: (page: Page) => void;
}

function EmptyState({ onNavigate }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
        <ChefHat className="w-10 h-10 text-neutral-400" />
      </div>
      <p className="text-neutral-600 mb-2">등록된 식재료가 없습니다</p>
      <p className="text-sm text-neutral-500 mb-6">
        식재료를 등록하면 맞춤 레시피를 추천해드려요
      </p>
      <Button onClick={() => onNavigate('add')} className="gap-2 rounded-xl shadow-none">
        <Plus className="w-4 h-4" />
        식재료 등록하기
      </Button>
    </div>
  );
}
