
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ShoppingList } from '@/types';
import { ArrowRight, Star, Clock, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
      className="overflow-hidden card-hover animate-fade-in cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-medium truncate pr-2">{name}</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`${isFavorite ? 'text-yellow-400' : 'text-muted-foreground'} hover:text-yellow-400`}
            onClick={handleFavoriteToggle}
          >
            <Star 
              className={`h-5 w-5 ${isFavorite ? 'fill-yellow-400' : ''}`} 
            />
            <span className="sr-only">Toggle favorite</span>
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <Clock className="h-3.5 w-3.5" />
          <span>Created {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
        </div>

        <div className="mt-4">
          <div className="flex justify-between mb-2 text-sm">
            <span>{purchasedItems} of {totalItems} purchased</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {totalItems === 0 
              ? 'No items yet' 
              : purchasedItems === totalItems 
                ? 'All items purchased' 
                : `${totalItems - purchasedItems} items remaining`}
          </span>
        </div>
      </CardContent>
      <CardFooter className="bg-muted p-3 pt-2 pb-2">
        <Button variant="ghost" size="sm" className="ml-auto group" onClick={onClick}>
          <span>View list</span>
          <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ListCard;
