
export type ItemUnit = 
  | 'kg' 
  | 'g' 
  | 'lb' 
  | 'oz' 
  | 'liter' 
  | 'ml' 
  | 'count' 
  | 'pack' 
  | 'custom';

export type ItemCategory = 
  | 'produce' 
  | 'dairy' 
  | 'bakery' 
  | 'meat' 
  | 'frozen' 
  | 'pantry' 
  | 'household' 
  | 'personal' 
  | 'beverages' 
  | 'other';

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: ItemUnit;
  category: ItemCategory;
  notes?: string;
  price?: number;
  isPriority: boolean;
  isPurchased: boolean;
  image?: string;
  reminderDate?: Date;
  customUnit?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingItem[];
  createdAt: Date;
  updatedAt: Date;
  isFavorite: boolean;
}

export type SortOrder = 'date' | 'alphabetical' | 'custom';
export type ListFilterType = 'all' | 'pending' | 'priority';
export type ListViewType = 'grid' | 'list';

export interface AppSettings {
  sortOrder: SortOrder;
  filterType: ListFilterType;
  viewType: ListViewType;
}
