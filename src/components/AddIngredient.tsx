import React, { useRef, useState } from 'react';
import { ArrowLeft, Refrigerator, Snowflake, Sun, Camera, Mic, Receipt, Plus, Carrot, Egg, Milk, Trash2, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ComingSoonDialog } from './ui/ComingSoonDialog';
import { StorageType } from '../App';
import { supabase } from '../lib/supabase';

interface AddIngredientProps {
  onAdd: (ingredient: { name: string; expiryDate: string; storage: StorageType; quantity?: string }) => void;
  onBack: () => void;
}

interface ReviewItem {
  id: string;
  name: string;
  expiryDate: string;
  storage: StorageType;
  quantity: string;
  checked: boolean;
}

// 자주 쓰는 재료 템플릿
const QUICK_TEMPLATES = [
  {
    name: '기본 채소 세트',
    icon: <Carrot className="w-4 h-4" />,
    items: ['양파', '당근', '대파', '마늘', '감자'],
    color: 'bg-green-50 text-green-700',
  },
  {
    name: '냉장고 필수품',
    icon: <Egg className="w-4 h-4" />,
    items: ['계란', '두부', '버터'],
    color: 'bg-yellow-50 text-yellow-700',
  },
  {
    name: '유제품 세트',
    icon: <Milk className="w-4 h-4" />,
    items: ['우유', '치즈', '요거트'],
    color: 'bg-blue-50 text-blue-700',
  },
];

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

export function AddIngredient({ onAdd, onBack }: AddIngredientProps) {
  const [name, setName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [storage, setStorage] = useState<StorageType>('냉장');
  const [quantity, setQuantity] = useState('');
  const [showTemplates, setShowTemplates] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognizeError, setRecognizeError] = useState<string | null>(null);
  const [reviewItems, setReviewItems] = useState<ReviewItem[] | null>(null);
  const [showVoiceSoon, setShowVoiceSoon] = useState(false);
  const [showReceiptSoon, setShowReceiptSoon] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && expiryDate) {
      onAdd({ name: name.trim(), expiryDate, storage, quantity: quantity.trim() || undefined });
      // Reset form
      setName('');
      setExpiryDate('');
      setStorage('냉장');
      setQuantity('');
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getDefaultExpiryDate = (days: number = 7) => addDays(days);

  const handleQuickAdd = (itemName: string) => {
    onAdd({
      name: itemName,
      expiryDate: getDefaultExpiryDate(7),
      storage: '냉장',
    });
  };

  const handleCameraClick = () => {
    setRecognizeError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setIsRecognizing(true);
    setRecognizeError(null);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1] ?? '');
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch('/api/recognize-fridge', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(session ? { authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ imageBase64: base64, mediaType: file.type || 'image/jpeg' }),
      });

      if (!res.ok) throw new Error('사진 인식에 실패했어요');

      const { items } = await res.json();

      if (!items || items.length === 0) {
        setRecognizeError('사진에서 식재료를 찾지 못했어요. 다시 시도하거나 직접 입력해주세요.');
        return;
      }

      setReviewItems(
        items.map(
          (item: { name: string; storage: StorageType; shelfLifeDays: number; quantity?: string }, idx: number) => ({
            id: `${Date.now()}-${idx}`,
            name: item.name,
            expiryDate: addDays(item.shelfLifeDays ?? 7),
            storage: item.storage === '냉동' || item.storage === '실온' ? item.storage : '냉장',
            quantity: item.quantity ?? '',
            checked: true,
          })
        )
      );
    } catch (err) {
      setRecognizeError('사진 인식 중 오류가 발생했어요. 다시 시도해주세요.');
    } finally {
      setIsRecognizing(false);
    }
  };

  const handleVoiceClick = () => {
    setShowVoiceSoon(true);
  };

  const handleReceiptClick = () => {
    setShowReceiptSoon(true);
  };

  const updateReviewItem = (id: string, patch: Partial<ReviewItem>) => {
    setReviewItems((prev) => prev?.map((item) => (item.id === id ? { ...item, ...patch } : item)) ?? null);
  };

  const removeReviewItem = (id: string) => {
    setReviewItems((prev) => prev?.filter((item) => item.id !== id) ?? null);
  };

  const confirmReviewItems = () => {
    if (!reviewItems) return;
    reviewItems
      .filter((item) => item.checked && item.name.trim() && item.expiryDate)
      .forEach((item) =>
        onAdd({
          name: item.name.trim(),
          expiryDate: item.expiryDate,
          storage: item.storage,
          quantity: item.quantity.trim() || undefined,
        })
      );
    setReviewItems(null);
  };

  // 사진 인식 결과 확인 화면
  if (reviewItems) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="bg-white sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center gap-3">
            <button
              onClick={() => setReviewItems(null)}
              className="p-2 -ml-2 hover:bg-neutral-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-700" />
            </button>
            <h1 className="text-lg font-bold text-neutral-900">인식 결과 확인</h1>
          </div>
        </div>

        <div className="p-6 space-y-3 pb-28">
          <p className="text-sm text-neutral-500 mb-1">
            AI가 인식한 식재료예요. 확인/수정 후 등록해주세요.
          </p>

          {reviewItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-4 space-y-3 shadow-card">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => updateReviewItem(item.id, { checked: e.target.checked })}
                  className="w-5 h-5 accent-brand-500"
                />
                <Input
                  value={item.name}
                  onChange={(e) => updateReviewItem(item.id, { name: e.target.value })}
                  className="flex-1 rounded-xl"
                />
                <Input
                  value={item.quantity}
                  onChange={(e) => updateReviewItem(item.id, { quantity: e.target.value })}
                  placeholder="수량 (예: 1개)"
                  className="w-24 rounded-xl"
                />
                <button
                  onClick={() => removeReviewItem(item.id)}
                  className="p-2 text-neutral-300 hover:text-danger-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-2 pl-8">
                <Input
                  type="date"
                  value={item.expiryDate}
                  onChange={(e) => updateReviewItem(item.id, { expiryDate: e.target.value })}
                  className="flex-1 rounded-xl"
                />
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateReviewItem(item.id, { storage: '냉장' })}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      item.storage === '냉장' ? 'bg-brand-500 text-white' : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    냉장
                  </button>
                  <button
                    type="button"
                    onClick={() => updateReviewItem(item.id, { storage: '냉동' })}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      item.storage === '냉동' ? 'bg-brand-500 text-white' : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    냉동
                  </button>
                  <button
                    type="button"
                    onClick={() => updateReviewItem(item.id, { storage: '실온' })}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      item.storage === '실온' ? 'bg-brand-500 text-white' : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    실온
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-[0_-1px_0_0_rgba(26,23,18,0.06)]">
          <Button
            onClick={confirmReviewItems}
            size="lg"
            className="w-full h-14 rounded-2xl text-base font-semibold shadow-none"
            disabled={!reviewItems.some((item) => item.checked)}
          >
            선택한 재료 등록하기 ({reviewItems.filter((item) => item.checked).length}개)
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </button>
          <h1 className="text-lg font-bold text-neutral-900">식재료 등록</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* 입력 방식 선택 */}
        <div className="bg-white rounded-2xl shadow-card p-4">
          <p className="text-sm font-semibold text-neutral-800 mb-3">빠른 등록 방법</p>
          {recognizeError && (
            <p className="text-sm text-danger-600 mb-3">{recognizeError}</p>
          )}
          <button
            onClick={handleCameraClick}
            disabled={isRecognizing}
            className="w-full flex flex-col items-center gap-2 p-4 rounded-2xl bg-brand-50 hover:bg-brand-100 transition-colors disabled:opacity-60"
          >
            <div className="w-11 h-11 bg-brand-500 rounded-full flex items-center justify-center">
              {isRecognizing ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-white" />
              )}
            </div>
            <span className="text-sm font-semibold text-brand-700">
              {isRecognizing ? 'AI가 인식 중...' : '사진으로 등록'}
            </span>
            <span className="text-xs text-brand-600">냉장고 사진 한 장으로!</span>
          </button>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <button
              onClick={handleVoiceClick}
              className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-neutral-50 hover:bg-neutral-100 text-neutral-500 text-sm font-medium transition-colors text-center"
            >
              <Mic className="w-4 h-4 flex-shrink-0" />
              <span className="break-keep">음성으로 등록 (준비 중)</span>
            </button>
            <button
              onClick={handleReceiptClick}
              className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-neutral-50 hover:bg-neutral-100 text-neutral-500 text-sm font-medium transition-colors text-center"
            >
              <Receipt className="w-4 h-4 flex-shrink-0" />
              <span className="break-keep">영수증으로 등록 (준비 중)</span>
            </button>
          </div>
        </div>

        <ComingSoonDialog
          open={showVoiceSoon}
          onOpenChange={setShowVoiceSoon}
          description={'"양파, 당근, 대파 추가"처럼 말하면 한 번에 등록되는 음성 입력을 준비하고 있어요. 조금만 기다려주세요!'}
        />
        <ComingSoonDialog
          open={showReceiptSoon}
          onOpenChange={setShowReceiptSoon}
          description="마트 영수증 사진을 찍으면 구매한 재료를 한 번에 등록해주는 기능을 준비하고 있어요. 조금만 기다려주세요!"
        />

        {/* 자주 쓰는 재료 템플릿 */}
        {showTemplates && (
          <div className="bg-white rounded-2xl shadow-card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-neutral-800">자주 쓰는 재료 원클릭 추가</p>
              <button
                onClick={() => setShowTemplates(false)}
                className="text-xs text-neutral-400 hover:text-neutral-600"
              >
                접기
              </button>
            </div>
            <div className="space-y-3">
              {QUICK_TEMPLATES.map((template) => (
                <div key={template.name} className={`rounded-2xl p-3 ${template.color}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {template.icon}
                    <span className="text-sm font-semibold">{template.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {template.items.map((item) => (
                      <button
                        key={item}
                        onClick={() => handleQuickAdd(item)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white rounded-full text-xs font-medium shadow-card hover:shadow-card-hover transition-shadow"
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
          <div className="bg-white rounded-2xl shadow-card p-5 space-y-5">
            <span className="text-sm font-semibold text-neutral-800">또는 직접 입력</span>

            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-600 mb-2">
                식재료 이름
              </label>
              <Input
                id="name"
                type="text"
                placeholder="예: 우유, 달걀, 양파..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl h-12"
                required
              />
            </div>

            {/* Quantity Input */}
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-neutral-600 mb-2">
                수량 (선택)
              </label>
              <Input
                id="quantity"
                type="text"
                placeholder="예: 1개, 1/4개, 200g"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="rounded-xl h-12"
              />
            </div>

            {/* Expiry Date Input */}
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-neutral-600 mb-2">
                소비기한
              </label>
              <Input
                id="expiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                min={getTodayDate()}
                className="rounded-xl h-12"
                required
              />
              <p className="mt-2 text-xs text-neutral-400">
                소비기한 1일 전과 당일에 알림이 전송됩니다
              </p>
            </div>

            {/* Storage Type */}
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-3">
                보관 위치
              </label>
              <div className="grid grid-cols-3 gap-3">
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
                <StorageButton
                  active={storage === '실온'}
                  onClick={() => setStorage('실온')}
                  icon={<Sun className="w-5 h-5" />}
                  label="실온"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-4 space-y-2">
            <Button
              type="submit"
              variant="default"
              size="lg"
              className="w-full h-14 rounded-2xl text-base font-semibold shadow-none"
              disabled={!name.trim() || !expiryDate}
            >
              등록하기
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="w-full h-12 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 shadow-none"
              onClick={onBack}
            >
              취소
            </Button>
          </div>
        </form>

        {/* Helper Text */}
        <div className="px-4 py-3 bg-blue-50 rounded-2xl">
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
      className={`p-4 rounded-2xl transition-all flex flex-col items-center gap-2 ${
        active
          ? 'bg-brand-500 text-white'
          : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}
