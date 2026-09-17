import React, { useState } from 'react';
import { ArrowLeft, Clock, Users, Heart, Bookmark, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { Button } from './button';
import { Recipe } from '../RecipeList';
import { ImageWithFallback } from '../figma/ImageWithFallback';

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
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLiked(!liked)}
              className={`p-2 rounded-lg transition-colors ${
                liked ? 'text-red-500 bg-red-50' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => setSaved(!saved)}
              className={`p-2 rounded-lg transition-colors ${
                saved ? 'text-emerald-500 bg-emerald-50' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="w-full h-64 bg-gray-100">
        <ImageWithFallback
          src={`https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop`}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Title & Meta */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{recipe.title}</h1>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
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
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            재료 매칭 {recipe.matchRate}%
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-3">필요한 재료</h2>
          <div className="space-y-2">
            {recipe.requiredIngredients.map((ingredient, index) => {
              const isMissing = recipe.missingIngredients.includes(ingredient);
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between py-2 ${
                    index !== recipe.requiredIngredients.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <span className={isMissing ? 'text-gray-500' : 'text-gray-900'}>
                    {ingredient}
                  </span>
                  {isMissing ? (
                    <span className="text-xs text-orange-600 font-medium px-2 py-1 bg-orange-50 rounded-md">
                      부족
                    </span>
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
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
              className="w-full mt-4 gap-2"
              onClick={() => alert('제휴 쇼핑몰로 이동합니다')}
            >
              <ShoppingCart className="w-4 h-4" />
              부족한 재료 사기 ({recipe.missingIngredients.length}개)
            </Button>
          )}
        </div>

        {/* Cooking Steps */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-3">조리 순서</h2>
          <div className="space-y-3">
            {recipe.steps.map((step, index) => (
              <button
                key={index}
                onClick={() => toggleStep(index)}
                className="w-full text-left"
              >
                <div className={`flex gap-3 p-3 rounded-lg transition-all ${
                  completedSteps.has(index)
                    ? 'bg-emerald-50 border border-emerald-200'
                    : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                }`}>
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                    completedSteps.has(index)
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white text-gray-600 border border-gray-300'
                  }`}>
                    {completedSteps.has(index) ? '✓' : index + 1}
                  </div>
                  <p className={`flex-1 text-sm ${
                    completedSteps.has(index) ? 'text-emerald-900 line-through' : 'text-gray-700'
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
          <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl p-6 text-center text-white shadow-lg">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="font-bold text-lg mb-1">요리 완성!</h3>
            <p className="text-sm text-emerald-50">
              맛있게 드세요!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
