import React from 'react';
import { Clock, Users, ChevronRight } from 'lucide-react';
import { Recipe } from '../RecipeList';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
  const getMatchColor = (rate: number) => {
    if (rate >= 90) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    if (rate >= 70) return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
  };

  const matchColor = getMatchColor(recipe.matchRate);

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow text-left"
    >
      <div className="flex gap-4 p-4">
        {/* Image */}
        <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
          <ImageWithFallback
            src={`https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop`}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 line-clamp-1">
              {recipe.title}
            </h3>
            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {recipe.cookTime}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {recipe.servings}인분
            </span>
          </div>

          {/* Match Rate */}
          <div className="flex items-center gap-2 mt-auto">
            <span className={`px-2 py-1 rounded-md text-xs font-medium ${matchColor.bg} ${matchColor.text}`}>
              재료 매칭 {recipe.matchRate}%
            </span>
            {recipe.missingIngredients.length > 0 && (
              <span className="text-xs text-gray-500">
                부족 {recipe.missingIngredients.length}개
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};
