import React, { useEffect, useState } from 'react';
import { Refrigerator, Snowflake, Sun } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './dialog';
import { Ingredient, StorageType } from '../../App';

interface EditIngredientDialogProps {
  ingredient: Ingredient | null;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, patch: { name: string; expiryDate: string; storage: StorageType; quantity: string }) => void;
}

export function EditIngredientDialog({ ingredient, onOpenChange, onSave }: EditIngredientDialogProps) {
  const [name, setName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [storage, setStorage] = useState<StorageType>('냉장');
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    if (ingredient) {
      setName(ingredient.name);
      setExpiryDate(ingredient.expiryDate);
      setStorage(ingredient.storage);
      setQuantity(ingredient.quantity ?? '');
    }
  }, [ingredient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredient || !name.trim() || !expiryDate) return;
    onSave(ingredient.id, { name: name.trim(), expiryDate, storage, quantity: quantity.trim() });
    onOpenChange(false);
  };

  return (
    <Dialog open={!!ingredient} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border-0 max-w-sm">
        <DialogTitle>식재료 수정</DialogTitle>
        <DialogDescription className="sr-only">식재료 정보를 수정합니다</DialogDescription>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-600 mb-2">식재료 이름</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl h-11" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-600 mb-2">수량 (선택)</label>
            <Input
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="예: 1개, 1/4개, 200g"
              className="rounded-xl h-11"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-600 mb-2">소비기한</label>
            <Input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="rounded-xl h-11"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-600 mb-2">보관 위치</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStorage('냉장')}
                className={`p-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                  storage === '냉장' ? 'bg-brand-500 text-white' : 'bg-neutral-100 text-neutral-500'
                }`}
              >
                <Refrigerator className="w-4 h-4" />
                냉장
              </button>
              <button
                type="button"
                onClick={() => setStorage('냉동')}
                className={`p-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                  storage === '냉동' ? 'bg-brand-500 text-white' : 'bg-neutral-100 text-neutral-500'
                }`}
              >
                <Snowflake className="w-4 h-4" />
                냉동
              </button>
              <button
                type="button"
                onClick={() => setStorage('실온')}
                className={`p-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                  storage === '실온' ? 'bg-brand-500 text-white' : 'bg-neutral-100 text-neutral-500'
                }`}
              >
                <Sun className="w-4 h-4" />
                실온
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full rounded-xl shadow-none" disabled={!name.trim() || !expiryDate}>
            저장
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
