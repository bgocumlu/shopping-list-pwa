
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ItemCategory } from '@/types';

const categoryLabels: Record<ItemCategory, string> = {
  'produce': 'Produce',
  'dairy': 'Dairy',
  'bakery': 'Bakery',
  'meat': 'Meat',
  'frozen': 'Frozen',
  'pantry': 'Pantry',
  'household': 'Household',
  'personal': 'Personal',
  'beverages': 'Beverages',
  'other': 'Other'
};

interface CategoryBadgeProps {
  category: ItemCategory;
  className?: string;
}

const CategoryBadge = ({ category, className = '' }: CategoryBadgeProps) => {
  const badgeStyles = {
    backgroundColor: `rgb(var(--background) / 0.9)`,
    color: `var(--foreground)`,
    border: `1px solid`,
    borderColor: `var(--border)`,
    borderLeftColor: `theme(colors.category.${category})`,
    borderLeftWidth: '4px',
  };

  return (
    <Badge 
      className={`font-medium py-1 ${className}`} 
      style={badgeStyles}
    >
      {categoryLabels[category]}
    </Badge>
  );
};

export default CategoryBadge;
