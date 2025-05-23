
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ItemCategory } from '@/types';

const categoryLabels: Record<ItemCategory, string> = {
  'produce': 'Meyve-Sebze',
  'dairy': 'Süt Ürünleri',
  'bakery': 'Fırın',
  'meat': 'Et',
  'frozen': 'Donmuş Gıda',
  'pantry': 'Kiler',
  'household': 'Ev Gereçleri',
  'personal': 'Kişisel Bakım',
  'beverages': 'İçecekler',
  'other': 'Diğer'
};

interface CategoryBadgeProps {
  category: ItemCategory;
  className?: string;
}

const CategoryBadge = ({ category, className = '' }: CategoryBadgeProps) => {
  return (
    <Badge 
      className={`font-medium py-1 text-white ${className}`} 
      style={{
        backgroundColor: `var(--category-${category})`,
        border: 'none'
      }}
    >
      {categoryLabels[category]}
    </Badge>
  );
};

export default CategoryBadge;
