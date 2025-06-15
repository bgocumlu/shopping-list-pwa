import React, { useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check } from 'lucide-react';

interface ManualCopyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  text: string;
  title: string;
  description?: string;
}

const ManualCopyDialog = ({ 
  open, 
  onOpenChange, 
  text, 
  title, 
  description = "Otomatik kopyalama kullanılamıyor. Lütfen metni manuel olarak seçip kopyalayın:" 
}: ManualCopyDialogProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isSelected, setIsSelected] = React.useState(false);

  // Auto-select text when dialog opens
  useEffect(() => {
    if (open && textareaRef.current) {
      const timer = setTimeout(() => {
        textareaRef.current?.select();
        textareaRef.current?.setSelectionRange(0, text.length);
        setIsSelected(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [open, text]);

  const handleSelectAll = () => {
    if (textareaRef.current) {
      textareaRef.current.select();
      textareaRef.current.setSelectionRange(0, text.length);
      setIsSelected(true);
    }
  };

  const handleTextareaClick = () => {
    handleSelectAll();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Textarea
              ref={textareaRef}
              value={text}
              readOnly
              onClick={handleTextareaClick}
              className="min-h-[120px] text-xs font-mono resize-none cursor-pointer"
              placeholder="Kopyalanacak metin..."
            />
            
            <div className="text-xs text-muted-foreground">
              💡 <strong>iOS İpucu:</strong> Metni seçtikten sonra "Kopyala" seçeneğini kullanın veya Ctrl+C (Cmd+C) yapın.
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleSelectAll}
            >
              {isSelected ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  Seçildi
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Tümünü Seç
                </>
              )}
            </Button>
            
            <Button
              variant="default"
              onClick={() => onOpenChange(false)}
            >
              Tamam
            </Button>
          </div>

          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">
              <strong>Not:</strong> iOS Safari PWA'larda güvenlik nedenleriyle otomatik panoya kopyalama kısıtlıdır. 
              Bu durum Apple'ın güvenlik politikalarından kaynaklanmaktadır.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManualCopyDialog;
