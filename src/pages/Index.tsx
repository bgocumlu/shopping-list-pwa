import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  ListFilter, 
  Grid, 
  List as ListIcon, 
  Menu, 
  X,
  SortAsc,
  Trash2
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ListCard from '@/components/ListCard';
import ListDetail from '@/components/ListDetail';
import SearchBar from '@/components/SearchBar';
import { ShoppingList, ListViewType, SortOrder, ListFilterType } from '@/types';
import { useShoppingList } from '@/context/ShoppingListContext';

const Index = () => {
  const {
    lists,
    currentList,
    sortOrder,
    filterType,
    viewType,
    createList,
    updateList,
    deleteList,
    setCurrentList,
    setSortOrder,
    setFilterType,
    setViewType
  } = useShoppingList();

  const [isCreateListModalOpen, setIsCreateListModalOpen] = useState(false);
  const [isDeleteListModalOpen, setIsDeleteListModalOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState<string | null>(null);
  const [newListName, setNewListName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle list create submission
  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      createList(newListName.trim());
      setNewListName('');
      setIsCreateListModalOpen(false);
    }
  };

  // Handle list delete
  const handleDeleteList = (id: string) => {
    setListToDelete(id);
    setIsDeleteListModalOpen(true);
  };

  // Confirm delete list
  const confirmDeleteList = () => {
    if (listToDelete) {
      deleteList(listToDelete);
      setListToDelete(null);
      setIsDeleteListModalOpen(false);
    }
  };

  // Filter and sort lists
  const filteredAndSortedLists = useMemo(() => {
    // Filter by search query
    let filtered = lists.filter(list => 
      list.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Filter by filter type
    switch (filterType) {
      case 'pending':
        filtered = filtered.filter(list => 
          list.items.some(item => !item.isPurchased)
        );
        break;
      case 'priority':
        filtered = filtered.filter(list => 
          list.items.some(item => item.isPriority && !item.isPurchased)
        );
        break;
      default:
        break;
    }
    
    // Sort lists
    return [...filtered].sort((a, b) => {
      // First sort by favorite status
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      
      // Then sort by the selected criteria
      switch (sortOrder) {
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [lists, searchQuery, filterType, sortOrder]);

  // Handle list click
  const handleListClick = (list: ShoppingList) => {
    setCurrentList(list.id);
  };

  // Handle favorite toggle
  const handleFavoriteToggle = (id: string) => {
    const list = lists.find(list => list.id === id);
    if (list) {
      updateList(id, { isFavorite: !list.isFavorite });
    }
  };

  // Reset filter and search
  const resetFilters = () => {
    setFilterType('all');
    setSearchQuery('');
  };

  // If a list is selected, show its details
  if (currentList) {
    return (
      <div className="container max-w-3xl py-4 px-3 md:px-6">
        <ListDetail 
          list={currentList} 
          onBack={() => setCurrentList(null)} 
          onDelete={handleDeleteList}
        />
      </div>
    );
  }

  return (
    <div className="container py-4 px-3 md:px-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 top-0 bg-background pt-2 pb-2 z-10">
        <div>
          <h1 className="text-2xl font-bold">Alışveriş Listeleri</h1>
          <p className="text-muted-foreground text-sm">
            Listelerinizi düzenleyin ve hiçbir ürünü unutmayın
          </p>
        </div>
        
        <Button 
          onClick={() => setIsCreateListModalOpen(true)}
          className="shrink-0 gap-1 fixed bottom-6 right-6 shadow-lg rounded-full size-14 z-20 md:static md:shadow-none md:rounded-md md:size-auto"
          size="icon"
          variant="default"
        >
          <Plus className="h-6 w-6 md:h-4 md:w-4 md:ml-1" />
          <span className="sr-only md:not-sr-only md:m-1.5">Yeni Liste</span>
        </Button>
      </div>
      
      {/* Search and Filters */}
      <div className="mb-4 space-y-3">
        <SearchBar 
          onSearch={setSearchQuery}
          placeholder="Liste ara..." 
          className="w-full"
        />
        
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1 text-xs">
                <ListFilter className="h-3.5 w-3.5" />
                {filterType === 'all' ? 'Tüm Listeler' : 
                 filterType === 'pending' ? 'Bekleyen Ürünler' : 'Öncelikli Ürünler'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filtrele</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setFilterType('all')}>
                {filterType === 'all' && '✓ '}Tüm Listeler
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType('pending')}>
                {filterType === 'pending' && '✓ '}Bekleyen Ürünler
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType('priority')}>
                {filterType === 'priority' && '✓ '}Öncelikli Ürünler
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1 text-xs">
                <SortAsc className="h-3.5 w-3.5" />
                {sortOrder === 'date' ? 'Yeniden Eskiye' : 'Alfabetik'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Sırala</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setSortOrder('date')}>
                {sortOrder === 'date' && '✓ '}Yeniden Eskiye
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder('alphabetical')}>
                {sortOrder === 'alphabetical' && '✓ '}Alfabetik
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1 text-xs"
            onClick={() => setViewType(viewType === 'grid' ? 'list' : 'grid')}
          >
            {viewType === 'grid' ? (
              <>
                <ListIcon className="h-3.5 w-3.5" />
                Liste Görünümü
              </>
            ) : (
              <>
                <Grid className="h-3.5 w-3.5" />
                Kart Görünümü
              </>
            )}
          </Button>
          
          {(filterType !== 'all' || searchQuery) && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1 ml-auto text-xs"
              onClick={resetFilters}
            >
              <X className="h-3.5 w-3.5" />
              Filtreleri Temizle
            </Button>
          )}
        </div>
      </div>
      
      {/* Lists */}
      {filteredAndSortedLists.length === 0 ? (
        <div className="text-center py-8">
          <h2 className="text-lg font-medium mb-2">Alışveriş listesi bulunamadı</h2>
          <p className="text-muted-foreground mb-6 text-sm">
            {searchQuery || filterType !== 'all' 
              ? 'Arama kriterlerinizi değiştirmeyi deneyin'
              : 'Başlamak için ilk alışveriş listenizi oluşturun'}
          </p>
          <Button onClick={() => setIsCreateListModalOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Liste Oluştur
          </Button>
        </div>
      ) : (
        <div className={`
          ${viewType === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3' 
            : 'space-y-2'}
        `}>
          {filteredAndSortedLists.map(list => (
            viewType === 'grid' ? (
              <ListCard 
                key={list.id}
                list={list}
                onClick={() => handleListClick(list)}
                onFavoriteToggle={handleFavoriteToggle}
                onDelete={handleDeleteList}
              />
            ) : (
              <div 
                key={list.id}
                className="flex items-center border rounded-lg p-3 bg-card cursor-pointer card-hover touch-manipulation"
                onClick={() => handleListClick(list)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium truncate">{list.name}</h3>
                    {list.isFavorite && (
                      <span className="text-yellow-400">
                        <span className="sr-only">Favorilerde</span>
                        ★
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {list.items.length} ürün • {list.items.filter(item => item.isPurchased).length} alındı
                  </div>
                </div>
                <div className="flex items-center">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="ml-1 h-9 w-9"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavoriteToggle(list.id);
                    }}
                  >
                    <span className={list.isFavorite ? 'text-yellow-400' : 'text-muted-foreground'}>
                      {list.isFavorite ? '★' : '☆'}
                    </span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="ml-1 h-9 w-9 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteList(list.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          ))}
        </div>
      )}
      
      {/* Create List Modal */}
      <Dialog open={isCreateListModalOpen} onOpenChange={setIsCreateListModalOpen}>
        <DialogContent>
          <form onSubmit={handleCreateList}>
            <DialogHeader>
              <DialogTitle>Yeni Liste Oluştur</DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <Label htmlFor="list-name" className="text-right">
                Liste Adı
              </Label>
              <Input
                id="list-name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                className="mt-1"
                placeholder="Örn: Haftalık Alışveriş"
                autoFocus
              />
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  İptal
                </Button>
              </DialogClose>
              <Button type="submit" disabled={!newListName.trim()}>
                Oluştur
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete List Confirmation Modal */}
      <Dialog open={isDeleteListModalOpen} onOpenChange={setIsDeleteListModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Listeyi Sil</DialogTitle>
            <DialogDescription>
              Bu işlem geri alınamaz. Bu listeyi silmek istediğinizden emin misiniz?
            </DialogDescription>
          </DialogHeader>
            
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">
                İptal
              </Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDeleteList}>
              <Trash2 className="mr-2 h-4 w-4" />
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
