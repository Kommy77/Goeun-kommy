import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Landing } from './components/Landing';
import { Login } from './components/Login';
import { Home } from './components/Home';
import { AddIngredient } from './components/AddIngredient';
import { RecipeList } from './components/RecipeList';
import { OnboardingTour } from './components/OnboardingTour';
import { supabase } from './lib/supabase';

export type StorageType = '냉장' | '냉동' | '실온';
export type StatusType = '여유' | '임박' | '오늘' | '초과';

export interface Ingredient {
  id: string;
  name: string;
  expiryDate: string;
  storage: StorageType;
  status: StatusType;
  quantity?: string;
  createdAt: string;
}

export type Page = 'landing' | 'home' | 'add' | 'recipes';

// Onboarding 진행 상태
export interface OnboardingProgress {
  hasAddedIngredient: boolean;
  hasViewedRecipes: boolean;
  hasCompletedTour: boolean;
}

function getDisplayUser(session: Session) {
  if (session.user.is_anonymous) {
    return { name: '게스트', email: '게스트 세션 (임시)' };
  }
  const meta = session.user.user_metadata ?? {};
  return {
    name: meta.full_name || meta.name || session.user.email || '사용자',
    email: session.user.email ?? '',
    avatarUrl: meta.avatar_url,
  };
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboardingTour, setShowOnboardingTour] = useState(false);
  const [onboardingProgress, setOnboardingProgress] = useState<OnboardingProgress>(() => {
    const saved = localStorage.getItem('freshkeeper_onboarding');
    return saved ? JSON.parse(saved) : {
      hasAddedIngredient: false,
      hasViewedRecipes: false,
      hasCompletedTour: false,
    };
  });

  // Onboarding 상태 저장
  useEffect(() => {
    localStorage.setItem('freshkeeper_onboarding', JSON.stringify(onboardingProgress));
  }, [onboardingProgress]);

  // 재료 추가 시 onboarding 업데이트
  const updateOnboardingOnAdd = () => {
    if (!onboardingProgress.hasAddedIngredient) {
      setOnboardingProgress(prev => ({ ...prev, hasAddedIngredient: true }));
    }
  };

  // 레시피 조회 시 onboarding 업데이트
  const updateOnboardingOnRecipes = () => {
    if (!onboardingProgress.hasViewedRecipes) {
      setOnboardingProgress(prev => ({ ...prev, hasViewedRecipes: true }));
    }
  };

  // Track auth session
  useEffect(() => {
    const maybeShowTour = () => {
      const saved = localStorage.getItem('freshkeeper_onboarding');
      const progress = saved ? JSON.parse(saved) : null;
      if (!progress?.hasCompletedTour) {
        setShowOnboardingTour(true);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
      if (session) maybeShowTour();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
      if (session) {
        setCurrentPage((prev) => (prev === 'landing' ? 'home' : prev));
        maybeShowTour();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load ingredients from Supabase once logged in
  useEffect(() => {
    if (session) {
      loadIngredients();
    } else {
      setIngredients([]);
      setLoading(false);
    }
  }, [session]);

  const loadIngredients = async () => {
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedData: Ingredient[] = data.map((item) => ({
          id: item.id,
          name: item.name,
          expiryDate: item.expiry_date,
          storage: item.storage as StorageType,
          status: item.status as StatusType,
          quantity: item.quantity ?? undefined,
          createdAt: item.created_at,
        }));
        setIngredients(formattedData);
      }
    } catch (error) {
      console.error('Error loading ingredients:', error);
    } finally {
      setLoading(false);
    }
  };

  const addIngredient = async (ingredient: Omit<Ingredient, 'id' | 'status' | 'createdAt'>) => {
    if (!session) return;
    try {
      const status = calculateStatus(ingredient.expiryDate);

      const { data, error } = await supabase
        .from('ingredients')
        .insert([
          {
            name: ingredient.name,
            expiry_date: ingredient.expiryDate,
            storage: ingredient.storage,
            status: status,
            quantity: ingredient.quantity || null,
            user_id: session.user.id,
          },
        ])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        const newIngredient: Ingredient = {
          id: data[0].id,
          name: data[0].name,
          expiryDate: data[0].expiry_date,
          storage: data[0].storage as StorageType,
          status: data[0].status as StatusType,
          quantity: data[0].quantity ?? undefined,
          createdAt: data[0].created_at,
        };
        setIngredients((prev) => [newIngredient, ...prev]);
        updateOnboardingOnAdd();
      }

      setCurrentPage('home');
    } catch (error) {
      console.error('Error adding ingredient:', error);
      alert('식재료 추가 중 오류가 발생했습니다.');
    }
  };

  const updateIngredient = async (
    id: string,
    patch: Partial<Pick<Ingredient, 'name' | 'expiryDate' | 'storage' | 'quantity'>>
  ) => {
    try {
      const status = patch.expiryDate ? calculateStatus(patch.expiryDate) : undefined;

      const { data, error } = await supabase
        .from('ingredients')
        .update({
          ...(patch.name !== undefined ? { name: patch.name } : {}),
          ...(patch.expiryDate !== undefined ? { expiry_date: patch.expiryDate } : {}),
          ...(patch.storage !== undefined ? { storage: patch.storage } : {}),
          ...(patch.quantity !== undefined ? { quantity: patch.quantity || null } : {}),
          ...(status ? { status } : {}),
        })
        .eq('id', id)
        .select();

      if (error) throw error;

      if (data && data[0]) {
        const updated: Ingredient = {
          id: data[0].id,
          name: data[0].name,
          expiryDate: data[0].expiry_date,
          storage: data[0].storage as StorageType,
          status: data[0].status as StatusType,
          quantity: data[0].quantity ?? undefined,
          createdAt: data[0].created_at,
        };
        setIngredients((prev) => prev.map((ing) => (ing.id === id ? updated : ing)));
      }
    } catch (error) {
      console.error('Error updating ingredient:', error);
      alert('식재료 수정 중 오류가 발생했습니다.');
    }
  };

  const deleteIngredient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ingredients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setIngredients((prev) => prev.filter((ing) => ing.id !== id));
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      alert('식재료 삭제 중 오류가 발생했습니다.');
    }
  };

  const calculateStatus = (expiryDate: string): StatusType => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return '초과';
    if (diffDays === 0) return '오늘';
    if (diffDays <= 3) return '임박';
    return '여유';
  };

  // Update status when page changes
  useEffect(() => {
    const updateStatuses = async () => {
      const updatedIngredients = ingredients.map((ing) => ({
        ...ing,
        status: calculateStatus(ing.expiryDate),
      }));

      const hasChanged = updatedIngredients.some(
        (ing, idx) => ing.status !== ingredients[idx].status
      );

      if (hasChanged) {
        // Update in Supabase
        try {
          for (const ing of updatedIngredients) {
            if (ing.status !== ingredients.find((i) => i.id === ing.id)?.status) {
              await supabase
                .from('ingredients')
                .update({ status: ing.status })
                .eq('id', ing.id);
            }
          }
          setIngredients(updatedIngredients);
        } catch (error) {
          console.error('Error updating statuses:', error);
        }
      }
    };

    if (ingredients.length > 0) {
      updateStatuses();
    }
  }, [currentPage]);

  const handleNavigate = (page: Page) => {
    if (page === 'recipes') {
      updateOnboardingOnRecipes();
    }
    setCurrentPage(page);
  };

  const handleStartFromLanding = () => {
    setCurrentPage('home');
  };

  const handleQuickStartFromLanding = () => {
    setCurrentPage('add');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentPage('landing');
  };

  const handleCompleteTour = () => {
    setShowOnboardingTour(false);
    setOnboardingProgress(prev => ({ ...prev, hasCompletedTour: true }));
  };

  const renderPage = () => {
    if (authLoading) {
      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          </div>
        </div>
      );
    }

    if (currentPage === 'landing') {
      return <Landing onStart={handleStartFromLanding} onQuickStart={handleQuickStartFromLanding} />;
    }

    if (!session) {
      return <Login />;
    }

    if (loading) {
      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
            <p className="text-neutral-600">로딩 중...</p>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'landing':
        return <Landing onStart={handleStartFromLanding} onQuickStart={handleQuickStartFromLanding} />;
      case 'home':
        return (
          <>
            {showOnboardingTour && (
              <OnboardingTour onComplete={handleCompleteTour} />
            )}
            <Home
              ingredients={ingredients}
              onNavigate={handleNavigate}
              onDelete={deleteIngredient}
              onUpdate={updateIngredient}
              onSignOut={handleSignOut}
              user={session ? getDisplayUser(session) : undefined}
            />
          </>
        );
      case 'add':
        return (
          <AddIngredient
            onAdd={addIngredient}
            onBack={() => setCurrentPage('home')}
          />
        );
      case 'recipes':
        return (
          <RecipeList
            ingredients={ingredients}
            onNavigate={handleNavigate}
          />
        );
      default:
        return <Landing onStart={handleStartFromLanding} onQuickStart={handleQuickStartFromLanding} />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {renderPage()}
    </div>
  );
}
