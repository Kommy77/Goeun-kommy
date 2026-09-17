import React from 'react';
import { Home, ChefHat, Plus } from 'lucide-react';
import { Page } from '../../App';

interface BottomNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-1px_0_0_rgba(26,23,18,0.06)] safe-area-bottom">
      <div className="max-w-2xl mx-auto px-6 py-3">
        <div className="flex items-center justify-around">
          <NavButton
            icon={<Home className="w-6 h-6" />}
            label="홈"
            active={currentPage === 'home'}
            onClick={() => onNavigate('home')}
          />
          
          <button
            onClick={() => onNavigate('add')}
            className="relative -mt-6 w-14 h-14 bg-brand-500 rounded-full shadow-lg flex items-center justify-center hover:bg-brand-600 transition-colors"
          >
            <Plus className="w-7 h-7 text-white" />
          </button>
          
          <NavButton
            icon={<ChefHat className="w-6 h-6" />}
            label="레시피"
            active={currentPage === 'recipes'}
            onClick={() => onNavigate('recipes')}
          />
        </div>
      </div>
    </div>
  );
}

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavButton({ icon, label, active, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors ${
        active ? 'text-brand-600' : 'text-neutral-500 hover:text-neutral-700'
      }`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
