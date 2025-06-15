import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Download,
  Upload,
  FileText,
  Hash,
  CheckCircle2,
  AlertCircle,
  Plus
} from 'lucide-react';
import { ShoppingList } from '@/types';
import {
  decodeShoppingList,
  extractSharedListFromUrl,
  isValidShareCode
} from '@/lib/shareUtils';
import { toast } from '@/components/ui/use-toast';

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (list: ShoppingList) => void;
}

const ImportModal = ({ open, onOpenChange, onImport }: ImportModalProps) => {
  const [importCode, setImportCode] = useState('');
  const [previewList, setPreviewList] = useState<ShoppingList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Handle input change
  const handleInputChange = (value: string) => {
    setImportCode(value.trim());
    setError(null);
    setPreviewList(null);

    if (value.trim()) {
      validateAndPreview(value.trim());
    }
  };

  // Validate and preview the list
  const validateAndPreview = async (code: string) => {
    setIsValidating(true);
    
    try {
      // First try to extract from URL if it looks like a URL
      let list: ShoppingList | null = null;
      
      if (code.includes('share=') || code.startsWith('http')) {
        list = extractSharedListFromUrl(code);
      } else {
        // Try to decode as direct share code
        if (isValidShareCode(code)) {
          list = decodeShoppingList(code);
        }
      }

      if (list) {
        setPreviewList(list);
        setError(null);
      } else {
        setError('Geçersiz paylaşım kodu veya link');
      }
    } catch (err) {
      setError('Paylaşım kodu çözümlenemedi. Lütfen doğru kodu girdiğinizden emin olun.');
    } finally {
      setIsValidating(false);
    }
  };

  // Handle import
  const handleImport = () => {
    if (previewList) {
      onImport(previewList);
      toast({
        title: "Liste İçe Aktarıldı!",
        description: `"${previewList.name}" başarıyla eklendi.`
      });
      
      // Reset and close
      setImportCode('');
      setPreviewList(null);
      setError(null);
      onOpenChange(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        // Try JSON first
        if (file.name.endsWith('.json')) {
          const list = JSON.parse(content) as ShoppingList;
          // Add new IDs and timestamps
          list.id = Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
          list.createdAt = new Date();
          list.updatedAt = new Date();
          list.items.forEach(item => {
            item.id = Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
            item.createdAt = new Date();
            item.updatedAt = new Date();
          });
          setPreviewList(list);
          setError(null);
        } else {
          // Try to extract share code from text file
          const lines = content.split('\n');
          const shareCodeLine = lines.find(line => line.includes('Share Code:'));
          if (shareCodeLine) {
            const code = shareCodeLine.split('Share Code:')[1]?.trim();
            if (code) {
              setImportCode(code);
              validateAndPreview(code);
            }
          } else {
            // Maybe the whole content is a share code
            handleInputChange(content.trim());
          }
        }
      } catch (err) {
        setError('Dosya formatı desteklenmiyor veya bozuk');
      }
    };
    
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  };

  // Clear current URL parameters to auto-import
  const checkUrlForSharedList = () => {
    const sharedList = extractSharedListFromUrl();
    if (sharedList) {
      setPreviewList(sharedList);
      setImportCode(window.location.search.split('share=')[1] || '');
      setError(null);
    }
  };

  // Check URL on open
  React.useEffect(() => {
    if (open) {
      checkUrlForSharedList();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Liste İçe Aktar
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Import from Code */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              <Label className="text-sm font-medium">Paylaşım Kodu veya Link</Label>
            </div>
            <Textarea
              value={importCode}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Paylaşım kodunu veya linki buraya yapıştırın..."
              className="min-h-[100px] text-xs font-mono resize-none"
            />
            {isValidating && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                Doğrulanıyor...
              </div>
            )}
          </div>

          <Separator />

          {/* File Upload */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <Label className="text-sm font-medium">Dosyadan İçe Aktar</Label>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="h-4 w-4" />
                Dosya Seç (.txt, .json)
              </Button>
              <input
                id="file-upload"
                type="file"
                accept=".txt,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              JSON formatındaki liste dosyalarını veya paylaşım kodu içeren metin dosyalarını yükleyebilirsiniz.
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Preview */}
          {previewList && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <Label className="text-sm font-medium">Önizleme</Label>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{previewList.name}</h3>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs">
                        {previewList.items.length} ürün
                      </Badge>
                      {previewList.isFavorite && (
                        <Badge variant="secondary" className="text-xs">
                          Favori
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {previewList.items.filter(item => !item.isPurchased).length} bekleyen • {' '}
                    {previewList.items.filter(item => item.isPriority).length} öncelikli
                  </div>

                  {previewList.items.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium">Ürünler:</p>
                      <div className="max-h-24 overflow-y-auto space-y-1">
                        {previewList.items.slice(0, 5).map((item, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs">
                            <span className={item.isPurchased ? 'line-through text-muted-foreground' : ''}>
                              {item.quantity} {item.unit === 'custom' ? item.customUnit : item.unit} {item.name}
                            </span>
                            {item.isPriority && <span className="text-yellow-600">⭐</span>}
                          </div>
                        ))}
                        {previewList.items.length > 5 && (
                          <p className="text-xs text-muted-foreground">
                            +{previewList.items.length - 5} ürün daha...
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full gap-2"
                  onClick={handleImport}
                >
                  <Plus className="h-4 w-4" />
                  Listeyi İçe Aktar
                </Button>
              </div>
            </>
          )}

          {/* Help */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <p className="text-xs text-muted-foreground">
              <strong>💡 İpucu:</strong> Paylaşım kodları kompakt ve güvenlidir. 
              URL'den otomatik olarak kod çıkarılır. Dosya yükleme de desteklenir.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportModal;
