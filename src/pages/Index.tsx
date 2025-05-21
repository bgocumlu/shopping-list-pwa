
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
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
    setCurrentList,
    setSortOrder,
    setFilterType,
    setViewType
  } = useShoppingList();

  const [isCreateListModalOpen, setIsCreateListModalOpen] = useState(false);
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
      <div className="container max-w-3xl py-6 px-4 md:px-6">
        <ListDetail 
          list={currentList} 
          onBack={() => setCurrentList(null)} 
        />
      </div>
    );
  }

  return (
    <div className="container py-6 px-4 md:px-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Shopping Lists</h1>
          <p className="text-muted-foreground">
            Manage your shopping lists and never forget an item
          </p>
        </div>
        
        <Button 
          onClick={() => setIsCreateListModalOpen(true)}
          className="shrink-0 gap-1"
        >
          <Plus className="h-4 w-4" />
          New List
        </Button>
      </div>
      
      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <SearchBar 
          onSearch={setSearchQuery}
          placeholder="Search lists..." 
          className="w-full"
        />
        
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <ListFilter className="h-4 w-4" />
                {filterType === 'all' ? 'All Lists' : 
                 filterType === 'pending' ? 'Pending Items' : 'Priority Items'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setFilterType('all')}>
                {filterType === 'all' && '✓ '}All Lists
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType('pending')}>
                {filterType === 'pending' && '✓ '}Lists with Pending Items
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType('priority')}>
                {filterType === 'priority' && '✓ '}Lists with Priority Items
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <SortAsc className="h-4 w-4" />
                {sortOrder === 'date' ? 'Recent First' : 'Alphabetical'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setSortOrder('date')}>
                {sortOrder === 'date' && '✓ '}Recent First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder('alphabetical')}>
                {sortOrder === 'alphabetical' && '✓ '}Alphabetical
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={() => setViewType(viewType === 'grid' ? 'list' : 'grid')}
          >
            {viewType === 'grid' ? (
              <>
                <ListIcon className="h-4 w-4" />
                List View
              </>
            ) : (
              <>
                <Grid className="h-4 w-4" />
                Grid View
              </>
            )}
          </Button>
          
          {(filterType !== 'all' || searchQuery) && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1 ml-auto"
              onClick={resetFilters}
            >
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>
      
      {/* Lists */}
      {filteredAndSortedLists.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-2">No shopping lists found</h2>
          <p className="text-muted-foreground mb-6">
            {searchQuery || filterType !== 'all' 
              ? 'Try changing your search or filters'
              : 'Create your first shopping list to get started'}
          </p>
          <Button onClick={() => setIsCreateListModalOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Create a List
          </Button>
        </div>
      ) : (
        <div className={`
          ${viewType === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' 
            : 'space-y-3'}
        `}>
          {filteredAndSortedLists.map(list => (
            viewType === 'grid' ? (
              <ListCard 
                key={list.id}
                list={list}
                onClick={() => handleListClick(list)}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ) : (
              <div 
                key={list.id}
                className="flex items-center border rounded-lg p-4 bg-card cursor-pointer card-hover"
                onClick={() => handleListClick(list)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium truncate">{list.name}</h3>
                    {list.isFavorite && (
                      <span className="text-yellow-400">
                        <span className="sr-only">Favorite</span>
                        ★
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {list.items.length} items • {list.items.filter(item => item.isPurchased).length} purchased
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="ml-2"
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
                  className="ml-2"
                >
                  <Menu className="h-4 w-4" />
                </Button>
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
              <DialogTitle>Create New List</DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <Label htmlFor="list-name" className="text-right">
                List Name
              </Label>
              <Input
                id="list-name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                className="mt-1"
                placeholder="e.g., Weekly Groceries"
                autoFocus
              />
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={!newListName.trim()}>
                Create List
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
