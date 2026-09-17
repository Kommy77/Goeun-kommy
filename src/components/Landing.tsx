import React from 'react';
import { ChefHat, Camera, TrendingDown, Clock, Leaf } from 'lucide-react';
import { Button } from './ui/button';

interface LandingProps {
  onStart: () => void;
  onQuickStart?: () => void;
}

export function Landing({ onStart, onQuickStart }: LandingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mb-4 shadow-lg">
          <ChefHat className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">
          FreshKeeper
        </h1>

        {/* Value Proposition - 3줄 요약 */}
        <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-sm border border-emerald-100 mb-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🥬</span>
              <p className="text-gray-800 font-medium">냉장고 재료로 오늘 뭐 먹지? → <span className="text-emerald-600">고민 끝</span></p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">⏰</span>
              <p className="text-gray-800 font-medium">유통기한 임박 재료 알림 → <span className="text-emerald-600">쓰레기 ZERO</span></p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📱</span>
              <p className="text-gray-800 font-medium">5초 입력으로 맞춤 레시피 추천</p>
            </div>
          </div>
        </div>

        {/* 수치화된 베네핏 */}
        <div className="w-full max-w-md grid grid-cols-3 gap-3 mb-6">
          <BenefitBadge icon={<TrendingDown className="w-4 h-4" />} value="30%" label="음식물 쓰레기 감소" />
          <BenefitBadge icon={<Clock className="w-4 h-4" />} value="80%" label="메뉴 고민 단축" />
          <BenefitBadge icon={<Leaf className="w-4 h-4" />} value="5분" label="장보기 시간 절약" />
        </div>

        {/* Primary CTA - 사진으로 시작하기 */}
        <div className="w-full max-w-md space-y-3">
          <Button
            onClick={onQuickStart || onStart}
            size="lg"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-6 text-lg gap-2"
          >
            <Camera className="w-5 h-5" />
            냉장고 사진으로 시작하기
          </Button>
          <div className="flex gap-2">
            <Button
              onClick={onStart}
              variant="outline"
              size="sm"
              className="flex-1 text-gray-600"
            >
              직접 입력하기
            </Button>
            <Button
              onClick={onStart}
              variant="outline"
              size="sm"
              className="flex-1 text-gray-600"
            >
              둘러보기
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-8 text-sm text-gray-500">
        음식물 쓰레기 줄이기, 오늘부터 시작하세요
      </div>
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
    <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
      <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
        {icon}
        <span className="text-lg font-bold">{value}</span>
      </div>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  );
}

