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
import { tr } from 'date-fns/locale';
import { useShoppingList } from '@/context/ShoppingListContext';

interface ListDetailProps {
  list: ShoppingList;
  onBack: () => void;
  onDelete?: (id: string) => void;
}

const ListDetail = ({ list, onBack, onDelete }: ListDetailProps) => {
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
  
  // Handle delete list
  const handleDeleteList = () => {
    if (onDelete) {
      onDelete(list.id);
    }
  };
  
  // Available categories for filtering
  const availableCategories = useMemo(() => {
    const categories = new Set<ItemCategory>();
    list.items.forEach(item => categories.add(item.category));
    return Array.from(categories);
  }, [list.items]);
  
  // Category labels in Turkish
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
  
  // Render item row - updated to make the whole row clickable
  const renderItemRow = (item: ShoppingItem) => (
    <div 
      key={item.id}
      className={`flex items-center gap-3 p-3 rounded-md border
        ${item.isPurchased ? 'bg-muted/50' : 'bg-card'}
        ${item.isPriority && !item.isPurchased ? 'border-primary/30' : 'border-border'}
        ${item.isPriority && !item.isPurchased ? 'shadow-sm' : ''}
        active:bg-muted/70 touch-manipulation
      `}
      onClick={() => toggleItemPurchased(list.id, item.id)}
    >
      <div onClick={(e) => e.stopPropagation()} className="flex items-center">
        <Checkbox 
          checked={item.isPurchased}
          onCheckedChange={() => toggleItemPurchased(list.id, item.id)}
          className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-medium ${item.isPurchased ? 'line-through text-muted-foreground' : ''}`}>
            {item.name}
          </span>
          {item.isPriority && !item.isPurchased && (
            <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
          )}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <span>
            {item.quantity} {item.unit === 'custom' ? item.customUnit : item.unit}
          </span>
          {item.notes && (
            <span className="truncate max-w-[150px]">• {item.notes}</span>
          )}
        </div>
      </div>
      
      <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
        <CategoryBadge category={item.category} className="mr-2 hidden sm:flex text-xs" />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreVertical className="h-3.5 w-3.5" />
              <span className="sr-only">Menüyü aç</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleEditItem(item)}>
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Düzenle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleItemPurchased(list.id, item.id)}>
              <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
              {item.isPurchased ? 'Alınmadı olarak işaretle' : 'Alındı olarak işaretle'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={() => deleteItem(list.id, item.id)}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Sil
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
  
  return (
    <>
      <div className="space-y-4 animate-fade-in pb-20">
        {/* Header */}
        <div className="flex items-center justify-between sticky top-0 bg-background pt-2 pb-2 z-10">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Geri</span>
          </Button>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`${list.isFavorite ? 'text-yellow-400' : 'text-muted-foreground'} hover:text-yellow-400 h-9 w-9`}
              onClick={handleFavoriteToggle}
            >
              <Star 
                className={`h-4 w-4 ${list.isFavorite ? 'fill-yellow-400' : ''}`} 
              />
              <span className="sr-only">Favori</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Daha fazla</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={handleDeleteList}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Listeyi Sil
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant="default" 
              size="sm" 
              className="gap-1 text-xs"
              onClick={() => setIsAddItemModalOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Ürün Ekle
            </Button>
          </div>
        </div>
        
        {/* List Title and Info */}
        <div>
          <h1 className="text-xl font-bold">{list.name}</h1>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <span>{formatDistanceToNow(new Date(list.createdAt), { addSuffix: true, locale: tr })}</span>
            <span>•</span>
            <span>{purchasedItems} / {totalItems} alındı</span>
          </div>
          
          <div className="h-1.5 bg-muted rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        {/* Search and filters */}
        <div className="space-y-3">
          <SearchBar 
            onSearch={setSearchQuery}
            placeholder="Ürün ara..." 
          />
          
          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1 text-xs">
                  <Filter className="h-3.5 w-3.5" />
                  Filtrele
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Kategori</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setCategoryFilter('all')}>
                  {categoryFilter === 'all' && '✓ '}Tüm kategoriler
                </DropdownMenuItem>
                
                {availableCategories.map(category => (
                  <DropdownMenuItem 
                    key={category} 
                    onClick={() => setCategoryFilter(category)}
                  >
                    {categoryFilter === category && '✓ '}
                    {categoryLabels[category]}
                  </DropdownMenuItem>
                ))}
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Durum</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setShowPurchased(!showPurchased)}>
                  {showPurchased ? '✓ ' : ''}Alınanları göster
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1 text-xs">
                  <SortAsc className="h-3.5 w-3.5" />
                  Sırala
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy('category')}>
                  {sortBy === 'category' && '✓ '}Kategoriye Göre
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('name')}>
                  {sortBy === 'name' && '✓ '}İsme Göre
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('priority')}>
                  {sortBy === 'priority' && '✓ '}Önceliğe Göre
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {categoryFilter !== 'all' && (
              <Badge 
                variant="outline" 
                className="gap-1 cursor-pointer text-xs"
                onClick={() => setCategoryFilter('all')}
              >
                {categoryLabels[categoryFilter]}
                <span className="ml-1">×</span>
              </Badge>
            )}
            
            {!showPurchased && (
              <Badge 
                variant="outline" 
                className="gap-1 cursor-pointer text-xs"
                onClick={() => setShowPurchased(true)}
              >
                Alınanları gizle
                <span className="ml-1">×</span>
              </Badge>
            )}
          </div>
        </div>
        
        {/* Items List */}
        {sortedItems.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground text-sm">
              {searchQuery || categoryFilter !== 'all' || !showPurchased 
                ? 'Filtrelerinizle eşleşen ürün bulunamadı'
                : 'Bu listede henüz ürün yok'}
            </p>
            <Button 
              variant="outline" 
              className="mt-4 text-xs"
              onClick={() => setIsAddItemModalOpen(true)}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              İlk ürününüzü ekleyin
            </Button>
          </div>
        ) : sortBy === 'category' && groupedItems ? (
          <div className="space-y-4">
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center gap-2">
                  <CategoryBadge category={category as ItemCategory} className="text-xs" />
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
