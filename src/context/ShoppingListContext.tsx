import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  ShoppingList, 
  ShoppingItem, 
  ItemCategory, 
  ItemUnit, 
  SortOrder, 
  ListFilterType,
  ListViewType 
} from '@/types';
import { toast } from '@/components/ui/use-toast';

interface ShoppingListContextType {
  lists: ShoppingList[];
  currentList: ShoppingList | null;
  sortOrder: SortOrder;
  filterType: ListFilterType;
  viewType: ListViewType;
  createList: (name: string) => ShoppingList;
  updateList: (id: string, updates: Partial<ShoppingList>) => void;
  deleteList: (id: string) => void;
  setCurrentList: (id: string | null) => void;
  addItem: (listId: string, item: Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateItem: (listId: string, itemId: string, updates: Partial<ShoppingItem>) => void;
  deleteItem: (listId: string, itemId: string) => void;
  toggleItemPurchased: (listId: string, itemId: string) => void;
  setSortOrder: (order: SortOrder) => void;
  setFilterType: (filter: ListFilterType) => void;
  setViewType: (view: ListViewType) => void;
}

const ShoppingListContext = createContext<ShoppingListContextType | undefined>(undefined);

// Sample categories for the default list
const sampleCategories: ItemCategory[] = [
  'produce', 'dairy', 'bakery', 'pantry', 'frozen'
];

// Sample item names for each category
const sampleItems: Record<ItemCategory, string[]> = {
  produce: ['Apples', 'Bananas', 'Spinach', 'Carrots', 'Tomatoes'],
  dairy: ['Milk', 'Eggs', 'Cheese', 'Yogurt', 'Butter'],
  bakery: ['Bread', 'Bagels', 'Muffins', 'Croissants'],
  meat: ['Chicken', 'Beef', 'Pork', 'Fish', 'Turkey'],
  frozen: ['Ice Cream', 'Frozen Pizza', 'Frozen Vegetables'],
  pantry: ['Rice', 'Pasta', 'Cereal', 'Canned Soup'],
  household: ['Paper Towels', 'Dish Soap', 'Laundry Detergent'],
  personal: ['Shampoo', 'Toothpaste', 'Soap'],
  beverages: ['Coffee', 'Tea', 'Juice', 'Soda'],
  other: ['Snacks', 'Desserts']
};

// Generate sample units for items
const getUnitForCategory = (category: ItemCategory): ItemUnit => {
  switch (category) {
    case 'produce': return Math.random() > 0.5 ? 'kg' : 'count';
    case 'dairy': return Math.random() > 0.5 ? 'count' : 'liter';
    case 'bakery': return 'count';
    case 'meat': return 'kg';
    case 'frozen': return 'count';
    case 'pantry': return 'count';
    case 'household': return 'count';
    case 'personal': return 'count';
    case 'beverages': return 'liter';
    case 'other': return 'count';
  }
};

// Create sample data
const createSampleData = (): ShoppingList[] => {
  // Weekly Groceries list
  const weeklyGroceries: ShoppingList = {
    id: uuidv4(),
    name: 'Weekly Groceries',
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isFavorite: true
  };

  // Add 8-10 sample items to the weekly groceries list
  sampleCategories.forEach(category => {
    const categoryItems = sampleItems[category];
    const randomItems = categoryItems.sort(() => 0.5 - Math.random()).slice(0, 2);
    
    randomItems.forEach(itemName => {
      const unit = getUnitForCategory(category);
      weeklyGroceries.items.push({
        id: uuidv4(),
        name: itemName,
        quantity: Math.floor(Math.random() * 5) + 1,
        unit,
        category,
        isPriority: Math.random() > 0.8,
        isPurchased: Math.random() > 0.7,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
  });

  // Party Supplies list
  const partySupplies: ShoppingList = {
    id: uuidv4(),
    name: 'Party Supplies',
    items: [
      {
        id: uuidv4(),
        name: 'Paper Plates',
        quantity: 2,
        unit: 'pack',
        category: 'household',
        isPriority: true,
        isPurchased: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Plastic Cups',
        quantity: 3,
        unit: 'pack',
        category: 'household',
        isPriority: false,
        isPurchased: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Soda',
        quantity: 6,
        unit: 'liter',
        category: 'beverages',
        isPriority: true,
        isPurchased: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    updatedAt: new Date(Date.now() - 86400000),
    isFavorite: false
  };

  // Return both lists
  return [weeklyGroceries, partySupplies];
};

export const ShoppingListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with sample data or load from localStorage
  const [lists, setLists] = useState<ShoppingList[]>(() => {
    const savedLists = localStorage.getItem('shoppingLists');
    return savedLists ? JSON.parse(savedLists) : createSampleData();
  });
  
  const [currentList, setCurrentListState] = useState<ShoppingList | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('date');
  const [filterType, setFilterType] = useState<ListFilterType>('all');
  const [viewType, setViewType] = useState<ListViewType>('grid');

  // Save lists to localStorage when they change
  useEffect(() => {
    localStorage.setItem('shoppingLists', JSON.stringify(lists));
  }, [lists]);

  // Set current list
  const setCurrentList = (id: string | null) => {
    if (!id) {
      setCurrentListState(null);
      return;
    }

    const list = lists.find(list => list.id === id);
    if (list) {
      setCurrentListState(list);
    } else {
      toast({
        title: "Liste bulunamadı",
        description: "Seçilen liste bulunamadı.",
        variant: "destructive"
      });
    }
  };

  // Create a new list
  const createList = (name: string): ShoppingList => {
    const newList: ShoppingList = {
      id: uuidv4(),
      name,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isFavorite: false
    };
    
    setLists(prev => [...prev, newList]);
    toast({
      title: "Liste oluşturuldu",
      description: `"${name}" başarıyla oluşturuldu.`
    });
    
    return newList;
  };

  // Update an existing list
  const updateList = (id: string, updates: Partial<ShoppingList>) => {
    setLists(prev => prev.map(list => 
      list.id === id ? { ...list, ...updates, updatedAt: new Date() } : list
    ));
    
    if (currentList?.id === id) {
      setCurrentListState(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null);
    }
  };

  // Delete a list
  const deleteList = (id: string) => {
    setLists(prev => prev.filter(list => list.id !== id));
    
    if (currentList?.id === id) {
      setCurrentListState(null);
    }
    
    toast({
      title: "Liste silindi",
      description: "Alışveriş listesi silindi."
    });
  };

  // Add an item to a list
  const addItem = (listId: string, item: Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: ShoppingItem = {
      ...item,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setLists(prev => prev.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          items: [...list.items, newItem],
          updatedAt: new Date()
        };
      }
      return list;
    }));
    
    if (currentList?.id === listId) {
      setCurrentListState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          items: [...prev.items, newItem],
          updatedAt: new Date()
        };
      });
    }
  };

  // Update an item in a list
  const updateItem = (listId: string, itemId: string, updates: Partial<ShoppingItem>) => {
    setLists(prev => prev.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          items: list.items.map(item => 
            item.id === itemId ? { ...item, ...updates, updatedAt: new Date() } : item
          ),
          updatedAt: new Date()
        };
      }
      return list;
    }));
    
    if (currentList?.id === listId) {
      setCurrentListState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          items: prev.items.map(item => 
            item.id === itemId ? { ...item, ...updates, updatedAt: new Date() } : item
          ),
          updatedAt: new Date()
        };
      });
    }
  };

  // Delete an item from a list
  const deleteItem = (listId: string, itemId: string) => {
    setLists(prev => prev.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          items: list.items.filter(item => item.id !== itemId),
          updatedAt: new Date()
        };
      }
      return list;
    }));
    
    if (currentList?.id === listId) {
      setCurrentListState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          items: prev.items.filter(item => item.id !== itemId),
          updatedAt: new Date()
        };
      });
    }
  };

  // Toggle the purchased status of an item
  const toggleItemPurchased = (listId: string, itemId: string) => {
    setLists(prev => prev.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          items: list.items.map(item => 
            item.id === itemId 
              ? { ...item, isPurchased: !item.isPurchased, updatedAt: new Date() } 
              : item
          ),
          updatedAt: new Date()
        };
      }
      return list;
    }));
    
    if (currentList?.id === listId) {
      setCurrentListState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          items: prev.items.map(item => 
            item.id === itemId 
              ? { ...item, isPurchased: !item.isPurchased, updatedAt: new Date() } 
              : item
          ),
          updatedAt: new Date()
        };
      });
    }
  };

  const value = {
    lists,
    currentList,
    sortOrder,
    filterType,
    viewType,
    createList,
    updateList,
    deleteList,
    setCurrentList,
    addItem,
    updateItem,
    deleteItem,
    toggleItemPurchased,
    setSortOrder,
    setFilterType,
    setViewType
  };

  return (
    <ShoppingListContext.Provider value={value}>
      {children}
    </ShoppingListContext.Provider>
  );
};

export const useShoppingList = (): ShoppingListContextType => {
  const context = useContext(ShoppingListContext);
  if (!context) {
    throw new Error('useShoppingList must be used within a ShoppingListProvider');
  }
  return context;
};
