
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ShoppingList, ShoppingItem, ItemCategory } from '@/types';
import { 
  ArrowLeft, 
  Plus, 
  Pencil, 
  Trash2, 
  Star, 
  MoreVertical,
  CheckCircle2,
  Filter,
  SortAsc
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddItemModal from './AddItemModal';
import CategoryBadge from './CategoryBadge';
import SearchBar from './SearchBar';
import { formatDistanceToNow } from 'date-fns';
import { useShoppingList } from '@/context/ShoppingListContext';

interface ListDetailProps {
  list: ShoppingList;
  onBack: () => void;
}

const ListDetail = ({ list, onBack }: ListDetailProps) => {
  const { updateList, toggleItemPurchased, deleteItem } = useShoppingList();
  
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | 'all'>('all');
  const [showPurchased, setShowPurchased] = useState(true);
  const [sortBy, setSortBy] = useState<'category' | 'priority' | 'name'>('category');
  
  // Calculate stats
  const totalItems = list.items.length;
  const purchasedItems = list.items.filter(item => item.isPurchased).length;
  const progress = totalItems > 0 ? Math.round((purchasedItems / totalItems) * 100) : 0;
  
  // Filter and sort items
  const filteredItems = useMemo(() => {
    return list.items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesStatus = showPurchased || !item.isPurchased;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [list.items, searchQuery, categoryFilter, showPurchased]);
  
  // Sort items
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      // Always show priority items first if sorting by priority
      if (sortBy === 'priority') {
        if (a.isPriority && !b.isPriority) return -1;
        if (!a.isPriority && b.isPriority) return 1;
      }
      
      // Then apply the selected sort
      switch (sortBy) {
        case 'category':
          return a.category.localeCompare(b.category);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [filteredItems, sortBy]);
  
  // Group items by category
  const groupedItems = useMemo(() => {
    if (sortBy !== 'category') return null;
    
    const groups: Record<string, ShoppingItem[]> = {};
    
    sortedItems.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    
    return groups;
  }, [sortedItems, sortBy]);
  
  // Handle favorite toggle
  const handleFavoriteToggle = () => {
    updateList(list.id, { isFavorite: !list.isFavorite });
  };
  
  // Handle item editing
  const handleEditItem = (item: ShoppingItem) => {
    setEditingItem(item);
    setIsAddItemModalOpen(true);
  };
  
  // Available categories for filtering
  const availableCategories = useMemo(() => {
    const categories = new Set<ItemCategory>();
    list.items.forEach(item => categories.add(item.category));
    return Array.from(categories);
  }, [list.items]);
  
  // Render item row
  const renderItemRow = (item: ShoppingItem) => (
    <div 
      key={item.id}
      className={`flex items-center gap-3 p-3 rounded-md border
        ${item.isPurchased ? 'bg-muted/50' : 'bg-card'}
        ${item.isPriority && !item.isPurchased ? 'border-primary/30' : 'border-border'}
        ${item.isPriority && !item.isPurchased ? 'shadow-sm' : ''}
      `}
    >
      <Checkbox 
        checked={item.isPurchased}
        onCheckedChange={() => toggleItemPurchased(list.id, item.id)}
        className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-medium ${item.isPurchased ? 'line-through text-muted-foreground' : ''}`}>
            {item.name}
          </span>
          {item.isPriority && !item.isPurchased && (
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          )}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <span>
            {item.quantity} {item.unit === 'custom' ? item.customUnit : item.unit}
          </span>
          {item.notes && (
            <span className="truncate max-w-[200px]">• {item.notes}</span>
          )}
        </div>
      </div>
      
      <div className="flex items-center">
        <CategoryBadge category={item.category} className="mr-2 hidden sm:flex" />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleEditItem(item)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit item
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleItemPurchased(list.id, item.id)}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark as {item.isPurchased ? 'unpurchased' : 'purchased'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={() => deleteItem(list.id, item.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
  
  return (
    <>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`${list.isFavorite ? 'text-yellow-400' : 'text-muted-foreground'} hover:text-yellow-400`}
              onClick={handleFavoriteToggle}
            >
              <Star 
                className={`h-5 w-5 ${list.isFavorite ? 'fill-yellow-400' : ''}`} 
              />
              <span className="sr-only">Toggle favorite</span>
            </Button>
            
            <Button 
              variant="default" 
              size="sm" 
              className="gap-1"
              onClick={() => setIsAddItemModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>
        </div>
        
        {/* List Title and Info */}
        <div>
          <h1 className="text-2xl font-bold">{list.name}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span>Created {formatDistanceToNow(new Date(list.createdAt), { addSuffix: true })}</span>
            <span>•</span>
            <span>{purchasedItems} of {totalItems} purchased</span>
          </div>
          
          <div className="h-1.5 bg-muted rounded-full mt-4 overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        {/* Search and filters */}
        <div className="space-y-4">
          <SearchBar 
            onSearch={setSearchQuery}
            placeholder="Search items..." 
          />
          
          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Category</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setCategoryFilter('all')}>
                  {categoryFilter === 'all' && '✓ '}All categories
                </DropdownMenuItem>
                
                {availableCategories.map(category => (
                  <DropdownMenuItem 
                    key={category} 
                    onClick={() => setCategoryFilter(category)}
                  >
                    {categoryFilter === category && '✓ '}
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </DropdownMenuItem>
                ))}
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setShowPurchased(!showPurchased)}>
                  {showPurchased ? '✓ ' : ''}Show purchased items
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <SortAsc className="h-4 w-4" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy('category')}>
                  {sortBy === 'category' && '✓ '}By Category
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('name')}>
                  {sortBy === 'name' && '✓ '}By Name
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('priority')}>
                  {sortBy === 'priority' && '✓ '}By Priority
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {categoryFilter !== 'all' && (
              <Badge 
                variant="outline" 
                className="gap-1 cursor-pointer"
                onClick={() => setCategoryFilter('all')}
              >
                {categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)}
                <span className="ml-1">×</span>
              </Badge>
            )}
            
            {!showPurchased && (
              <Badge 
                variant="outline" 
                className="gap-1 cursor-pointer"
                onClick={() => setShowPurchased(true)}
              >
                Hide purchased
                <span className="ml-1">×</span>
              </Badge>
            )}
          </div>
        </div>
        
        {/* Items List */}
        {sortedItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {searchQuery || categoryFilter !== 'all' || !showPurchased 
                ? 'No items match your filters'
                : 'No items in this list yet'}
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setIsAddItemModalOpen(true)}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add your first item
            </Button>
          </div>
        ) : sortBy === 'category' && groupedItems ? (
          <div className="space-y-6">
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center gap-2">
                  <CategoryBadge category={category as ItemCategory} />
                  <Separator className="flex-1" />
                </div>
                
                <div className="space-y-2">
                  {items.map(renderItemRow)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {sortedItems.map(renderItemRow)}
          </div>
        )}
      </div>
      
      <AddItemModal 
        open={isAddItemModalOpen}
        onOpenChange={setIsAddItemModalOpen}
        listId={list.id}
        editItem={editingItem}
      />
    </>
  );
};

export default ListDetail;
