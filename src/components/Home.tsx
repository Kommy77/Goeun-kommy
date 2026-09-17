import React, { useState } from 'react';
import { Plus, ChefHat, AlertCircle, Calendar, CheckCircle2, ArrowRight, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { IngredientCard } from './ui/IngredientCard';
import { BottomNav } from './ui/BottomNav';
import { Ingredient, Page, OnboardingProgress } from '../App';

interface HomeProps {
  ingredients: Ingredient[];
  onNavigate: (page: Page) => void;
  onDelete: (id: string) => void;
  onboardingProgress?: OnboardingProgress;
  onSignOut?: () => void;
}

export function Home({ ingredients, onNavigate, onDelete, onboardingProgress, onSignOut }: HomeProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'alerts'>('all');

  // Filter ingredients that are expiring soon or today
  const urgentIngredients = ingredients.filter(
    ing => ing.status === '임박' || ing.status === '오늘' || ing.status === '초과'
  );

  const displayIngredients = activeTab === 'alerts' ? urgentIngredients : ingredients;

  // Sort by status priority
  const sortedIngredients = [...displayIngredients].sort((a, b) => {
    const statusOrder = { '초과': 0, '오늘': 1, '임박': 2, '여유': 3 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  // Onboarding 진행 상태 체크
  const showProgressBanner = onboardingProgress && !onboardingProgress.hasCompletedTour;
  const ingredientCount = ingredients.length;

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10">
        <div className="px-6 pt-5 pb-3">
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">FreshKeeper</h1>
            <div className="flex items-center gap-1">
              <Button
                variant="default"
                size="sm"
                onClick={() => onNavigate('add')}
                className="rounded-xl gap-1"
              >
                <Plus className="w-4 h-4" />
                등록
              </Button>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
                  aria-label="로그아웃"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5">
            <TabButton
              active={activeTab === 'all'}
              onClick={() => setActiveTab('all')}
            >
              전체 {ingredients.length}
            </TabButton>
            <TabButton
              active={activeTab === 'alerts'}
              onClick={() => setActiveTab('alerts')}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              알림 {urgentIngredients.length}
            </TabButton>
          </div>
        </div>
      </div>

      {/* Onboarding Progress Banner */}
      {showProgressBanner && (
        <div className="mx-6 mt-4">
          <ProgressBanner
            ingredientCount={ingredientCount}
            hasViewedRecipes={onboardingProgress?.hasViewedRecipes || false}
            onNavigate={onNavigate}
          />
        </div>
      )}

      {/* Alert Banner */}
      {urgentIngredients.length > 0 && activeTab === 'all' && (
        <div className="mx-6 mt-4 bg-warn-50 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-warn-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-neutral-900 mb-0.5">
              곧 만료되는 식재료 {urgentIngredients.length}개
            </p>
            <p className="text-sm text-neutral-600 mb-3">
              이 재료로 만들 수 있는 레시피가 있습니다
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('recipes')}
              className="rounded-xl gap-1 bg-white hover:bg-neutral-50"
            >
              <ChefHat className="w-4 h-4" />
              레시피 보기
            </Button>
          </div>
        </div>
      )}

      {/* Ingredients List */}
      <div className="px-6 py-4">
        {sortedIngredients.length === 0 ? (
          <EmptyState
            message={
              activeTab === 'alerts'
                ? '곧 만료되는 식재료가 없습니다'
                : '등록된 식재료가 없습니다'
            }
            icon={activeTab === 'alerts' ? <AlertCircle className="w-12 h-12" /> : <Calendar className="w-12 h-12" />}
            action={
              activeTab === 'all' ? (
                <Button onClick={() => onNavigate('add')} className="gap-2">
                  <Plus className="w-4 h-4" />
                  첫 식재료 등록하기
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-3">
            {sortedIngredients.map(ingredient => (
              <IngredientCard
                key={ingredient.id}
                ingredient={ingredient}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentPage="home" onNavigate={onNavigate} />
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
        active
          ? 'bg-neutral-900 text-white'
          : 'text-neutral-500 bg-neutral-100 hover:bg-neutral-200'
      }`}
    >
      {children}
    </button>
  );
}

interface EmptyStateProps {
  message: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
}

function EmptyState({ message, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-4 text-neutral-400">
        {icon}
      </div>
      <p className="text-neutral-600 mb-6">{message}</p>
      {action}
    </div>
  );
}

interface ProgressBannerProps {
  ingredientCount: number;
  hasViewedRecipes: boolean;
  onNavigate: (page: Page) => void;
}

function ProgressBanner({ ingredientCount, hasViewedRecipes, onNavigate }: ProgressBannerProps) {
  const step1Complete = ingredientCount >= 3;
  const step2Complete = hasViewedRecipes;

  // 모든 단계 완료시 표시 안함
  if (step1Complete && step2Complete) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-brand-50 to-teal-50 border border-brand-200 rounded-2xl p-4">
      <p className="text-xs font-medium text-brand-600 mb-3">시작 가이드</p>

      <div className="space-y-3">
        {/* Step 1 */}
        <div className={`flex items-center gap-3 ${step1Complete ? 'opacity-60' : ''}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            step1Complete ? 'bg-brand-500 text-white' : 'bg-brand-100 text-brand-600'
          }`}>
            {step1Complete ? <CheckCircle2 className="w-4 h-4" /> : '1'}
          </div>
          <div className="flex-1">
            <p className={`text-sm font-medium ${step1Complete ? 'text-neutral-500 line-through' : 'text-neutral-800'}`}>
              재료 3개 이상 등록하기
            </p>
            {!step1Complete && (
              <p className="text-xs text-neutral-500">{ingredientCount}/3 등록됨</p>
            )}
          </div>
          {step1Complete ? (
            <span className="text-xs text-brand-600 font-medium">완료!</span>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('add')}
              className="text-xs gap-1"
            >
              등록하기 <ArrowRight className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Step 2 */}
        <div className={`flex items-center gap-3 ${!step1Complete ? 'opacity-40' : step2Complete ? 'opacity-60' : ''}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            step2Complete ? 'bg-brand-500 text-white' : 'bg-brand-100 text-brand-600'
          }`}>
            {step2Complete ? <CheckCircle2 className="w-4 h-4" /> : '2'}
          </div>
          <div className="flex-1">
            <p className={`text-sm font-medium ${step2Complete ? 'text-neutral-500 line-through' : 'text-neutral-800'}`}>
              맞춤 레시피 확인하기
            </p>
          </div>
          {step1Complete && !step2Complete && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onNavigate('recipes')}
              className="text-xs gap-1 bg-brand-500"
            >
              <ChefHat className="w-3 h-3" /> 레시피 보기
            </Button>
          )}
          {step2Complete && (
            <span className="text-xs text-brand-600 font-medium">완료!</span>
          )}
        </div>
      </div>
    </div>
  );
}
