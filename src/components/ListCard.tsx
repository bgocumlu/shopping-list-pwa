
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ShoppingList } from '@/types';
import { ArrowRight, Star, Clock, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ListCardProps {
  list: ShoppingList;
  onClick: () => void;
  onFavoriteToggle: (id: string) => void;
}

const ListCard = ({ list, onClick, onFavoriteToggle }: ListCardProps) => {
  const { id, name, items, createdAt, isFavorite } = list;
  
  // Calculate completion stats
  const totalItems = items.length;
  const purchasedItems = items.filter(item => item.isPurchased).length;
  const progress = totalItems > 0 ? Math.round((purchasedItems / totalItems) * 100) : 0;
  
  // Handle favorite toggle
  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteToggle(id);
  };

  return (
    <Card 
      className="overflow-hidden card-hover animate-fade-in cursor-pointer h-full"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium truncate pr-2">{name}</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`${isFavorite ? 'text-yellow-400' : 'text-muted-foreground'} hover:text-yellow-400 h-8 w-8`}
            onClick={handleFavoriteToggle}
          >
            <Star 
              className={`h-4 w-4 ${isFavorite ? 'fill-yellow-400' : ''}`} 
            />
            <span className="sr-only">Favori</span>
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <Clock className="h-3 w-3" />
          <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: tr })}</span>
        </div>

        <div className="mt-3">
          <div className="flex justify-between mb-1 text-xs">
            <span>{purchasedItems} / {totalItems} alındı</span>
            <span>%{progress}</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        <div className="mt-3 flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs">
            {totalItems === 0 
              ? 'Henüz ürün yok' 
              : purchasedItems === totalItems 
                ? 'Tüm ürünler alındı' 
                : `${totalItems - purchasedItems} ürün kaldı`}
          </span>
        </div>
      </CardContent>
      <CardFooter className="bg-muted p-2">
        <Button variant="ghost" size="sm" className="ml-auto group text-xs" onClick={onClick}>
          <span>Listeyi görüntüle</span>
          <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ListCard;
