import React, { useState } from 'react';
import { ArrowLeft, Clock, Users, Heart, Bookmark, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { Button } from './button';
import { Recipe } from '../RecipeList';
import { getRecipeEmoji } from '../../lib/recipeEmoji';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
}

export function RecipeDetail({ recipe, onBack }: RecipeDetailProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (index: number) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompletedSteps(newCompleted);
  };

  const allStepsCompleted = completedSteps.size === recipe.steps.length;

  return (
    <div className="min-h-screen bg-neutral-50 pb-6">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setLiked(!liked)}
              className={`p-2 rounded-xl transition-colors ${
                liked ? 'text-danger-500 bg-danger-50' : 'text-neutral-500 hover:bg-neutral-100'
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => setSaved(!saved)}
              className={`p-2 rounded-xl transition-colors ${
                saved ? 'text-brand-500 bg-brand-50' : 'text-neutral-500 hover:bg-neutral-100'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Hero Icon */}
      <div className="w-full h-56 bg-brand-50 flex items-center justify-center text-8xl">
        {getRecipeEmoji(recipe.title)}
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-5">
        {/* Title & Meta */}
        <div>
          <h1 className="text-xl font-bold text-neutral-900 mb-3">{recipe.title}</h1>

          <div className="flex items-center gap-4 text-sm text-neutral-500 mb-3">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {recipe.cookTime}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {recipe.servings}인분
            </span>
            <span className="flex items-center gap-1.5">
              <Heart className="w-4 h-4" />
              {recipe.likes}
            </span>
          </div>

          {/* Match Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-full text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            재료 매칭 {recipe.matchRate}%
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <h2 className="font-semibold text-neutral-900 mb-3">필요한 재료</h2>
          <div className="space-y-2">
            {recipe.requiredIngredients.map((ingredient, index) => {
              const isMissing = recipe.missingIngredients.includes(ingredient);
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between py-2 ${
                    index !== recipe.requiredIngredients.length - 1 ? 'border-b border-neutral-100' : ''
                  }`}
                >
                  <span className={isMissing ? 'text-neutral-400' : 'text-neutral-900'}>
                    {ingredient}
                  </span>
                  {isMissing ? (
                    <span className="text-xs text-warn-600 font-medium px-2 py-1 bg-warn-50 rounded-full">
                      부족
                    </span>
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-brand-500" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Buy Missing Ingredients */}
          {recipe.missingIngredients.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              className="w-full mt-4 rounded-xl gap-2 bg-neutral-100 hover:bg-neutral-200 shadow-none"
              onClick={() => alert('제휴 쇼핑몰로 이동합니다')}
            >
              <ShoppingCart className="w-4 h-4" />
              부족한 재료 사기 ({recipe.missingIngredients.length}개)
            </Button>
          )}
        </div>

        {/* Cooking Steps */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <h2 className="font-semibold text-neutral-900 mb-3">조리 순서</h2>
          <div className="space-y-2.5">
            {recipe.steps.map((step, index) => (
              <button
                key={index}
                onClick={() => toggleStep(index)}
                className="w-full text-left"
              >
                <div className={`flex gap-3 p-3 rounded-xl transition-all ${
                  completedSteps.has(index)
                    ? 'bg-brand-50'
                    : 'bg-neutral-50 hover:bg-neutral-100'
                }`}>
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                    completedSteps.has(index)
                      ? 'bg-brand-500 text-white'
                      : 'bg-white text-neutral-500 shadow-card'
                  }`}>
                    {completedSteps.has(index) ? '✓' : index + 1}
                  </div>
                  <p className={`flex-1 text-sm ${
                    completedSteps.has(index) ? 'text-brand-900 line-through' : 'text-neutral-700'
                  }`}>
                    {step}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Completion Message */}
        {allStepsCompleted && (
          <div className="bg-brand-500 rounded-2xl p-6 text-center text-white">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="font-bold text-lg mb-1">요리 완성!</h3>
            <p className="text-sm text-brand-50">
              맛있게 드세요!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
