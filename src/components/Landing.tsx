import React from 'react';
import { ChefHat, Camera, TrendingDown, Clock, Leaf } from 'lucide-react';
import { Button } from './ui/button';

interface LandingProps {
  onStart: () => void;
  onQuickStart?: () => void;
}

export function Landing({ onStart, onQuickStart }: LandingProps) {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-8">
        <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center mb-5">
          <ChefHat className="w-8 h-8 text-white" strokeWidth={2} />
        </div>

        <h1 className="text-[28px] font-bold text-neutral-900 mb-8 text-center tracking-tight">
          FreshKeeper
        </h1>

        {/* Value Proposition - 3줄 요약 */}
        <div className="w-full max-w-md space-y-1 mb-8">
          <ValueRow emoji="🥬" text="냉장고 재료로 오늘 뭐 먹지?" highlight="고민 끝" />
          <ValueRow emoji="⏰" text="유통기한 임박 재료 알림" highlight="쓰레기 ZERO" />
          <ValueRow emoji="📱" text="5초 입력으로 맞춤 레시피 추천" />
        </div>

        {/* 수치화된 베네핏 */}
        <div className="w-full max-w-md grid grid-cols-3 gap-2 mb-8">
          <BenefitBadge icon={<TrendingDown className="w-4 h-4" />} value="30%" label="음식물 쓰레기 감소" />
          <BenefitBadge icon={<Clock className="w-4 h-4" />} value="80%" label="메뉴 고민 단축" />
          <BenefitBadge icon={<Leaf className="w-4 h-4" />} value="5분" label="장보기 시간 절약" />
        </div>

        {/* Primary CTA - 사진으로 시작하기 */}
        <div className="w-full max-w-md space-y-2">
          <Button
            onClick={onQuickStart || onStart}
            size="lg"
            className="w-full h-14 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white text-base font-semibold rounded-2xl gap-2 shadow-none"
          >
            <Camera className="w-5 h-5" />
            냉장고 사진으로 시작하기
          </Button>
          <div className="flex gap-2">
            <button
              onClick={onStart}
              className="flex-1 h-11 rounded-xl text-sm font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors"
            >
              직접 입력하기
            </button>
            <button
              onClick={onStart}
              className="flex-1 h-11 rounded-xl text-sm font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors"
            >
              둘러보기
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-8 text-sm text-neutral-400">
        음식물 쓰레기 줄이기, 오늘부터 시작하세요
      </div>
    </div>
  );
}

interface ValueRowProps {
  emoji: string;
  text: string;
  highlight?: string;
}

function ValueRow({ emoji, text, highlight }: ValueRowProps) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className="text-xl w-7 text-center">{emoji}</span>
      <p className="text-[15px] text-neutral-700">
        {text}
        {highlight && (
          <>
            {' → '}
            <span className="font-semibold text-brand-600">{highlight}</span>
          </>
        )}
      </p>
    </div>
  );
}

interface BenefitBadgeProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

function BenefitBadge({ icon, value, label }: BenefitBadgeProps) {
  return (
    <div className="bg-white rounded-xl p-3 text-center shadow-card">
      <div className="flex items-center justify-center gap-1 text-brand-600 mb-1">
        {icon}
        <span className="text-base font-bold">{value}</span>
      </div>
      <p className="text-[11px] text-neutral-500 leading-tight">{label}</p>
    </div>
  );
}
