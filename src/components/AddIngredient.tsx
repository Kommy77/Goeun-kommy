import React, { useState } from 'react';
import { ArrowLeft, Refrigerator, Snowflake, Camera, Mic, Plus, Carrot, Egg, Milk } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { StorageType } from '../App';

interface AddIngredientProps {
  onAdd: (ingredient: { name: string; expiryDate: string; storage: StorageType }) => void;
  onBack: () => void;
}

// 자주 쓰는 재료 템플릿
const QUICK_TEMPLATES = [
  {
    name: '기본 채소 세트',
    icon: <Carrot className="w-4 h-4" />,
    items: ['양파', '당근', '대파', '마늘', '감자'],
    color: 'bg-green-50 border-green-200 text-green-700',
  },
  {
    name: '냉장고 필수품',
    icon: <Egg className="w-4 h-4" />,
    items: ['계란', '두부', '버터'],
    color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  },
  {
    name: '유제품 세트',
    icon: <Milk className="w-4 h-4" />,
    items: ['우유', '치즈', '요거트'],
    color: 'bg-blue-50 border-blue-200 text-blue-700',
  },
];

export function AddIngredient({ onAdd, onBack }: AddIngredientProps) {
  const [name, setName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [storage, setStorage] = useState<StorageType>('냉장');
  const [showTemplates, setShowTemplates] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && expiryDate) {
      onAdd({ name: name.trim(), expiryDate, storage });
      // Reset form
      setName('');
      setExpiryDate('');
      setStorage('냉장');
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getDefaultExpiryDate = (days: number = 7) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  const handleQuickAdd = (itemName: string) => {
    onAdd({
      name: itemName,
      expiryDate: getDefaultExpiryDate(7),
      storage: '냉장',
    });
  };

  const handleCameraClick = () => {
    // TODO: 실제 카메라/사진 인식 API 연동
    alert('📸 사진 인식 기능은 곧 업데이트됩니다!\n\n냉장고 사진을 찍으면 AI가 재료를 자동으로 인식합니다.');
  };

  const handleVoiceClick = () => {
    // TODO: 실제 음성 인식 API 연동
    alert('🎤 음성 입력 기능은 곧 업데이트됩니다!\n\n"양파, 당근, 대파 추가"라고 말하면 한 번에 등록됩니다.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">식재료 등록</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 입력 방식 선택 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">빠른 등록 방법</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCameraClick}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50 hover:bg-emerald-100 transition-colors"
            >
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-emerald-700">사진으로 등록</span>
              <span className="text-xs text-emerald-600">냉장고 사진 한 장으로!</span>
            </button>
            <button
              onClick={handleVoiceClick}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-purple-300 bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-purple-700">음성으로 등록</span>
              <span className="text-xs text-purple-600">"양파, 당근 추가"</span>
            </button>
          </div>
        </div>

        {/* 자주 쓰는 재료 템플릿 */}
        {showTemplates && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-700">자주 쓰는 재료 원클릭 추가</p>
              <button
                onClick={() => setShowTemplates(false)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                접기
              </button>
            </div>
            <div className="space-y-3">
              {QUICK_TEMPLATES.map((template) => (
                <div key={template.name} className={`rounded-xl border p-3 ${template.color}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {template.icon}
                    <span className="text-sm font-medium">{template.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {template.items.map((item) => (
                      <button
                        key={item}
                        onClick={() => handleQuickAdd(item)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white rounded-full text-xs font-medium border hover:shadow-sm transition-shadow"
                      >
                        <Plus className="w-3 h-3" />
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 직접 입력 폼 */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-500">또는 직접 입력</span>
            </div>

            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                식재료 이름 *
              </label>
              <Input
                id="name"
                type="text"
                placeholder="예: 우유, 달걀, 양파..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Expiry Date Input */}
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                소비기한 *
              </label>
              <Input
                id="expiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                min={getTodayDate()}
                required
              />
              <p className="mt-2 text-xs text-gray-500">
                소비기한 1일 전과 당일에 알림이 전송됩니다
              </p>
            </div>

            {/* Storage Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                보관 위치 *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <StorageButton
                  active={storage === '냉장'}
                  onClick={() => setStorage('냉장')}
                  icon={<Refrigerator className="w-5 h-5" />}
                  label="냉장"
                />
                <StorageButton
                  active={storage === '냉동'}
                  onClick={() => setStorage('냉동')}
                  icon={<Snowflake className="w-5 h-5" />}
                  label="냉동"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 space-y-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={!name.trim() || !expiryDate}
            >
              등록하기
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={onBack}
            >
              취소
            </Button>
          </div>
        </form>

        {/* Helper Text */}
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-sm text-blue-900">
            💡 <span className="font-medium">팁:</span> 사진 인식이나 음성 입력을 사용하면 여러 재료를 한 번에 등록할 수 있습니다!
          </p>
        </div>
      </div>
    </div>
  );
}

interface StorageButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function StorageButton({ active, onClick, icon, label }: StorageButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
        active
          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}
