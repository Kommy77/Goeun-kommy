import React, { useState } from 'react';
import { X, ChefHat, Bell, Camera, ArrowRight, Check } from 'lucide-react';
import { Button } from './ui/button';

interface OnboardingTourProps {
  onComplete: () => void;
  currentStep?: number;
}

const TOUR_STEPS = [
  {
    title: 'Step 1. 냉장고 재료 추가하기',
    description: '사진으로 한 번에 등록하거나 자주 쓰는 재료를 원클릭으로 추가하세요!',
    icon: <Camera className="w-8 h-8 text-emerald-600" />,
    tip: '📸 사진으로 한 번에 등록하세요!',
    color: 'bg-emerald-50 border-emerald-200',
  },
  {
    title: 'Step 2. 오늘의 추천 레시피 보기',
    description: '등록한 재료로 만들 수 있는 요리를 확인하세요.',
    icon: <ChefHat className="w-8 h-8 text-purple-600" />,
    tip: '등록한 재료로 만들 수 있는 요리 10개',
    color: 'bg-purple-50 border-purple-200',
  },
  {
    title: 'Step 3. 유통기한 알림 받기',
    description: '매일 저녁 6시에 "오늘 뭐 먹지?" 알림을 받아보세요.',
    icon: <Bell className="w-8 h-8 text-orange-600" />,
    tip: '매일 저녁 6시에 알림이 옵니다',
    color: 'bg-orange-50 border-orange-200',
  },
];

export function OnboardingTour({ onComplete, currentStep = 0 }: OnboardingTourProps) {
  const [step, setStep] = useState(currentStep);
  const totalSteps = TOUR_STEPS.length;

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const currentStepData = TOUR_STEPS[step];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white rounded-t-3xl shadow-xl animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div className="flex gap-1.5">
            {TOUR_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === step
                    ? 'w-6 bg-emerald-500'
                    : idx < step
                    ? 'w-3 bg-emerald-300'
                    : 'w-3 bg-gray-200'
                }`}
              />
            ))}
          </div>
          <button
            onClick={handleSkip}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="건너뛰기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <div className={`rounded-2xl p-6 ${currentStepData.color} border mb-4`}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                {currentStepData.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {currentStepData.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {currentStepData.description}
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-xs font-medium text-gray-700 shadow-sm">
                  <ArrowRight className="w-3 h-3 text-emerald-500" />
                  {currentStepData.tip}
                </div>
              </div>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-4 py-2">
            {TOUR_STEPS.map((stepData, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2 text-xs ${
                  idx <= step ? 'text-gray-700' : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    idx < step
                      ? 'bg-emerald-500'
                      : idx === step
                      ? 'bg-emerald-500'
                      : 'bg-gray-200'
                  }`}
                >
                  {idx < step ? <Check className="w-3 h-3" /> : idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-8 space-y-3">
          <Button
            onClick={handleNext}
            size="lg"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            {step < totalSteps - 1 ? '다음' : '시작하기'}
          </Button>
          {step < totalSteps - 1 && (
            <button
              onClick={handleSkip}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-700 py-2"
            >
              건너뛰기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
