import React, { useRef, useState } from 'react';
import { Plus, ChefHat, AlertCircle, Calendar, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { IngredientCard } from './ui/IngredientCard';
import { BottomNav } from './ui/BottomNav';
import { Ingredient, Page } from '../App';

interface HomeUser {
  name: string;
  email: string;
  avatarUrl?: string;
}

interface HomeProps {
  ingredients: Ingredient[];
  onNavigate: (page: Page) => void;
  onDelete: (id: string) => void;
  onSignOut?: () => void;
  user?: HomeUser;
}

export function Home({ ingredients, onNavigate, onDelete, onSignOut, user }: HomeProps) {
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

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10">
        <div className="px-6 pt-5 pb-3">
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">FreshKeeper</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => onNavigate('add')}
                className="rounded-xl gap-1"
              >
                <Plus className="w-4 h-4" />
                등록
              </Button>
              {user && onSignOut && <AccountMenu user={user} onSignOut={onSignOut} />}
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

interface AccountMenuProps {
  user: HomeUser;
  onSignOut: () => void;
}

function AccountMenu({ user, onSignOut }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initial = user.name?.[0] ?? user.email[0].toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-8 h-8 rounded-full overflow-hidden bg-brand-100 flex items-center justify-center text-brand-700 text-sm font-semibold ring-2 ring-transparent hover:ring-brand-200 transition-all"
        aria-label="계정 메뉴"
      >
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          initial
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-56 bg-white rounded-2xl shadow-float p-3 z-20">
          <div className="px-2 pb-2 mb-2 border-b border-neutral-100">
            <p className="text-sm font-semibold text-neutral-900 truncate">{user.name}</p>
            <p className="text-xs text-neutral-400 truncate">{user.email}</p>
          </div>
          <button
            onClick={() => {
              setOpen(false);
              onSignOut();
            }}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-xl text-sm text-neutral-600 hover:bg-neutral-100 hover:text-danger-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </button>
        </div>
      )}
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
