import React from 'react';
import { Trash2, Pencil, Refrigerator, Snowflake } from 'lucide-react';
import { Ingredient } from '../../App';

interface IngredientCardProps {
  ingredient: Ingredient;
  onDelete: (id: string) => void;
  onEdit: (ingredient: Ingredient) => void;
}

export function IngredientCard({ ingredient, onDelete, onEdit }: IngredientCardProps) {
  const statusConfig = {
    '여유': {
      bgColor: 'bg-brand-50',
      textColor: 'text-brand-700',
      label: '여유',
    },
    '임박': {
      bgColor: 'bg-warn-50',
      textColor: 'text-warn-600',
      label: '임박',
    },
    '오늘': {
      bgColor: 'bg-danger-50',
      textColor: 'text-danger-600',
      label: '오늘',
    },
    '초과': {
      bgColor: 'bg-neutral-100',
      textColor: 'text-neutral-500',
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
    <div
      onClick={() => onEdit(ingredient)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onEdit(ingredient);
      }}
      className="w-full text-left bg-white rounded-2xl p-4 shadow-card transition-shadow hover:shadow-card-hover cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Storage Icon */}
          <div className="flex-shrink-0 w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center">
            {ingredient.storage === '냉장' ? (
              <Refrigerator className="w-5 h-5 text-neutral-500" />
            ) : (
              <Snowflake className="w-5 h-5 text-blue-500" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-neutral-900 mb-1 truncate">
              {ingredient.name}
              {ingredient.quantity && (
                <span className="ml-1.5 text-sm font-normal text-neutral-400">{ingredient.quantity}</span>
              )}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-neutral-500">
              <span>{formatDate(ingredient.expiryDate)}</span>
              <span className="text-neutral-300">·</span>
              <span>{ingredient.storage}</span>
            </div>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${config.bgColor} ${config.textColor}`}>
            {getDaysRemaining(ingredient.expiryDate)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(ingredient);
            }}
            aria-label="수정"
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors group"
          >
            <Pencil className="w-4 h-4 text-neutral-300 group-hover:text-neutral-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(ingredient.id);
            }}
            aria-label="삭제"
            className="p-2 hover:bg-danger-50 rounded-lg transition-colors group"
          >
            <Trash2 className="w-4 h-4 text-neutral-300 group-hover:text-danger-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
