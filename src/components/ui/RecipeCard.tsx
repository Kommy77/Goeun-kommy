import React from 'react';
import { Clock, Users, ChevronRight } from 'lucide-react';
import { Recipe } from '../RecipeList';
import { getRecipeEmoji } from '../../lib/recipeEmoji';

export interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
  const getMatchColor = (rate: number) => {
    if (rate >= 90) return { bg: 'bg-brand-50', text: 'text-brand-700' };
    if (rate >= 70) return { bg: 'bg-blue-50', text: 'text-blue-700' };
    return { bg: 'bg-warn-50', text: 'text-warn-600' };
  };

  const matchColor = getMatchColor(recipe.matchRate);

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-shadow text-left overflow-hidden"
    >
      <div className="flex gap-4 p-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-20 h-20 bg-brand-50 rounded-xl flex items-center justify-center text-4xl">
          {getRecipeEmoji(recipe.title)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-semibold text-neutral-900 line-clamp-1">
              {recipe.title}
            </h3>
            <ChevronRight className="w-4 h-4 text-neutral-300 flex-shrink-0 mt-0.5" />
          </div>

          <div className="flex items-center gap-3 text-xs text-neutral-500 mb-2.5">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {recipe.cookTime}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {recipe.servings}인분
            </span>
          </div>

          {/* Match Rate */}
          <div className="flex items-center gap-1.5 mt-auto">
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${matchColor.bg} ${matchColor.text}`}>
              매칭 {recipe.matchRate}%
            </span>
            {recipe.missingIngredients.length > 0 && (
              <span className="text-xs text-neutral-400">
                부족 {recipe.missingIngredients.length}개
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};
