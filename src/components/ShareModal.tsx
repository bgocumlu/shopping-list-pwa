import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Share2,
  Copy,
  Download,
  QrCode,
  Check,
  Globe,
  FileText,
  Hash
} from 'lucide-react';
import { ShoppingList } from '@/types';
import {
  encodeShoppingList,
  createShareableUrl,
  estimateHashSize,
  createDownloadableFile
} from '@/lib/shareUtils';
import { toast } from '@/components/ui/use-toast';

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  list: ShoppingList;
}

const ShareModal = ({ open, onOpenChange, list }: ShareModalProps) => {
  const [shareCode, setShareCode] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [hashSize, setHashSize] = useState(0);

  // Generate share data when modal opens
  useEffect(() => {
    if (open && list) {
      try {
        const code = encodeShoppingList(list);
        const url = createShareableUrl(list);
        const size = estimateHashSize(list);
        
        setShareCode(code);
        setShareUrl(url);
        setHashSize(size);
      } catch (error) {
        toast({
          title: "Paylaşım Hatası",
          description: "Liste paylaşım kodu oluşturulamadı.",
          variant: "destructive"
        });
      }
    }
  }, [open, list]);

  // Copy to clipboard function
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast({
        title: "Kopyalandı!",
        description: `${type} panoya kopyalandı.`
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopied(type);
      toast({
        title: "Kopyalandı!",
        description: `${type} panoya kopyalandı.`
      });
      setTimeout(() => setCopied(null), 2000);
    }
  };

  // Download file
  const downloadFile = (format: 'hash' | 'json') => {
    try {
      const blob = createDownloadableFile(list, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${list.name.replace(/[^a-zA-Z0-9]/g, '_')}_${format === 'hash' ? 'share_code' : 'data'}.${format === 'hash' ? 'txt' : 'json'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "İndirildi!",
        description: `Liste ${format === 'hash' ? 'paylaşım kodu' : 'verisi'} indirildi.`
      });
    } catch (error) {
      toast({
        title: "İndirme Hatası",
        description: "Dosya indirilemedi.",
        variant: "destructive"
      });
    }
  };

  // Share via Web Share API if available
  const shareViaWebAPI = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Alışveriş Listesi: ${list.name}`,
          text: `${list.name} alışveriş listemi paylaşıyorum`,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled share or error occurred
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback to copy URL
      copyToClipboard(shareUrl, 'Paylaşım Linki');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Liste Paylaş
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* List Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{list.name}</h3>
              <Badge variant="outline" className="text-xs">
                {list.items.length} ürün
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {list.items.filter(item => !item.isPurchased).length} bekleyen • {' '}
              {list.items.filter(item => item.isPriority).length} öncelikli
            </div>
          </div>

          <Separator />

          {/* Share Code Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              <Label className="text-sm font-medium">Paylaşım Kodu</Label>
              <Badge variant="secondary" className="text-xs">
                {hashSize} karakter
              </Badge>
            </div>
            <div className="flex gap-2">
              <Textarea
                value={shareCode}
                readOnly
                className="min-h-[80px] text-xs font-mono resize-none"
                placeholder="Paylaşım kodu oluşturuluyor..."
              />
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => copyToClipboard(shareCode, 'Paylaşım Kodu')}
                disabled={!shareCode}
              >
                {copied === 'Paylaşım Kodu' ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Bu kodu başkalarıyla paylaşarak listeyi içe aktarmalarını sağlayabilirsiniz. 
              İnternet bağlantısı olmadan da çalışır.
            </p>
          </div>

          <Separator />

          {/* Share URL Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <Label className="text-sm font-medium">Paylaşım Linki</Label>
            </div>
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="text-xs"
                placeholder="Link oluşturuluyor..."
              />
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => copyToClipboard(shareUrl, 'Paylaşım Linki')}
                disabled={!shareUrl}
              >
                {copied === 'Paylaşım Linki' ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {/* Web Share API or Copy URL */}
            <Button
              variant="default"
              className="gap-2"
              onClick={shareViaWebAPI}
              disabled={!shareUrl}
            >
              <Share2 className="h-4 w-4" />
              Paylaş
            </Button>

            {/* Download Share Code */}
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => downloadFile('hash')}
              disabled={!shareCode}
            >
              <Download className="h-4 w-4" />
              İndir
            </Button>
          </div>

          {/* Advanced Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Gelişmiş Seçenekler</Label>
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="justify-start gap-2"
                onClick={() => downloadFile('json')}
                disabled={!list}
              >
                <FileText className="h-4 w-4" />
                JSON olarak indir
              </Button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <p className="text-xs text-muted-foreground">
              <strong>💡 İpucu:</strong> Paylaşım kodu ile listeler offline ortamda da paylaşılabilir. 
              Link ise doğrudan tarayıcıda açılabilir.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
