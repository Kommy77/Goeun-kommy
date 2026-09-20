import { Sparkles } from 'lucide-react';
import { Button } from './button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './dialog';

interface ComingSoonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  description: string;
}

export function ComingSoonDialog({ open, onOpenChange, description }: ComingSoonDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border-0 max-w-xs text-center">
        <div className="w-14 h-14 mx-auto bg-brand-50 rounded-2xl flex items-center justify-center mb-2">
          <Sparkles className="w-7 h-7 text-brand-500" />
        </div>
        <DialogTitle className="text-center text-lg">준비 중인 기능이에요</DialogTitle>
        <DialogDescription className="text-center">{description}</DialogDescription>
        <Button
          size="sm"
          className="w-full mt-2 rounded-xl shadow-none"
          onClick={() => onOpenChange(false)}
        >
          확인
        </Button>
      </DialogContent>
    </Dialog>
  );
}
