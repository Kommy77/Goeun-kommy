import React from 'react';
import { Trash2, Refrigerator, Snowflake } from 'lucide-react';
import { Ingredient } from '../../App';

interface IngredientCardProps {
  ingredient: Ingredient;
  onDelete: (id: string) => void;
}

export function IngredientCard({ ingredient, onDelete }: IngredientCardProps) {
  const statusConfig = {
    '여유': {
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
      label: '여유',
    },
    '임박': {
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-200',
      label: '임박',
    },
    '오늘': {
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
      label: '오늘',
    },
    '초과': {
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-300',
      label: '초과',
    },
  };

  const config = statusConfig[ingredient.status];
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  };

  const getDaysRemaining = (expiryDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)}일 초과`;
    if (diffDays === 0) return '오늘';
    return `D-${diffDays}`;
  };

  return (
    <div className={`bg-white rounded-xl p-4 border ${config.borderColor} transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Storage Icon */}
          <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            {ingredient.storage === '냉장' ? (
              <Refrigerator className="w-5 h-5 text-gray-600" />
            ) : (
              <Snowflake className="w-5 h-5 text-blue-500" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-1 truncate">
              {ingredient.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{formatDate(ingredient.expiryDate)}</span>
              <span className="text-gray-400">·</span>
              <span>{ingredient.storage}</span>
            </div>
          </div>
        </div>

        {/* Status & Delete */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${config.bgColor} ${config.textColor}`}>
            {getDaysRemaining(ingredient.expiryDate)}
          </span>
          <button
            onClick={() => onDelete(ingredient.id)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
            aria-label="삭제"
          >
            <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
