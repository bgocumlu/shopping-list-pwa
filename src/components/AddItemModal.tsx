import React, { useEffect, useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ItemCategory, ItemUnit, ShoppingItem } from '@/types';
import { useShoppingList } from '@/context/ShoppingListContext';

interface AddItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId: string;
  editItem?: ShoppingItem;
}

type FormData = Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt'>;

const initialFormData: FormData = {
  name: '',
  quantity: 1,
  unit: 'count',
  category: 'other',
  notes: '',
  price: undefined,
  isPriority: false,
  isPurchased: false,
};

const categories: { value: ItemCategory; label: string }[] = [
  { value: 'produce', label: 'Meyve-Sebze' },
  { value: 'dairy', label: 'Süt Ürünleri' },
  { value: 'bakery', label: 'Fırın' },
  { value: 'meat', label: 'Et' },
  { value: 'frozen', label: 'Donmuş Gıda' },
  { value: 'pantry', label: 'Kiler' },
  { value: 'household', label: 'Ev Gereçleri' },
  { value: 'personal', label: 'Kişisel Bakım' },
  { value: 'beverages', label: 'İçecekler' },
  { value: 'other', label: 'Diğer' },
];

const units: { value: ItemUnit; label: string }[] = [
  { value: 'count', label: 'Adet' },
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'g', label: 'Gram (g)' },
  { value: 'lb', label: 'Libre (lb)' },
  { value: 'oz', label: 'Ons (oz)' },
  { value: 'liter', label: 'Litre (L)' },
  { value: 'ml', label: 'Mililitre (ml)' },
  { value: 'pack', label: 'Paket' },
  { value: 'custom', label: 'Özel' },
];

const AddItemModal = ({ open, onOpenChange, listId, editItem }: AddItemModalProps) => {
  const { addItem, updateItem } = useShoppingList();
  const [formData, setFormData] = useState<FormData>(editItem || initialFormData);
  const [showCustomUnit, setShowCustomUnit] = useState<boolean>(formData.unit === 'custom');

  // Reset form when modal is closed
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (!editItem) {
        setFormData(initialFormData);
      }
      setShowCustomUnit(false);
    } else if (editItem) {
      setFormData(editItem);
      setShowCustomUnit(editItem.unit === 'custom');
    }
    onOpenChange(open);
  };

  useEffect(() => {
    if (open) {
      if (editItem) {
        setFormData(editItem);
        setShowCustomUnit(editItem.unit === 'custom');
      } else {
        setFormData(initialFormData);
        setShowCustomUnit(false);
      }
    }
  }, [open, editItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.name.trim() === '') {
      return; // Don't submit if name is empty
    }
    
    if (editItem) {
      updateItem(listId, editItem.id, formData);
    } else {
      addItem(listId, formData);
    }
    
    onOpenChange(false);
    
    if (!editItem) {
      setFormData(initialFormData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle numeric inputs
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? undefined : Number(value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUnitChange = (value: string) => {
    const unitValue = value as ItemUnit;
    setFormData(prev => ({ ...prev, unit: unitValue }));
    setShowCustomUnit(unitValue === 'custom');
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editItem ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Item Name */}
            <div className="grid gap-2">
              <Label htmlFor="name" className="font-medium">
                Ürün Adı <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ürün adı girin"
                required
                autoFocus
              />
            </div>
            
            {/* Quantity and Unit */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="quantity" className="font-medium">
                  Miktar
                </Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.quantity === undefined ? '' : formData.quantity}
                  onChange={handleChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="unit" className="font-medium">
                  Birim
                </Label>
                <Select 
                  value={formData.unit} 
                  onValueChange={handleUnitChange}
                >
                  <SelectTrigger id="unit">
                    <SelectValue placeholder="Birim seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Birimler</SelectLabel>
                      {units.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                
                {showCustomUnit && (
                  <Input
                    className="mt-2"
                    name="customUnit"
                    value={formData.customUnit || ''}
                    onChange={handleChange}
                    placeholder="Özel birim girin"
                  />
                )}
              </div>
            </div>
            
            {/* Category */}
            <div className="grid gap-2">
              <Label htmlFor="category" className="font-medium">
                Kategori
              </Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as ItemCategory }))}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Kategoriler</SelectLabel>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            {/* Price (Optional) */}
            <div className="grid gap-2">
              <Label htmlFor="price" className="font-medium">
                Fiyat (İsteğe Bağlı)
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price === undefined ? '' : formData.price}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
            
            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes" className="font-medium">
                Notlar (İsteğe Bağlı)
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes || ''}
                onChange={handleChange}
                placeholder="Ek notlarınızı buraya ekleyin..."
                className="resize-none"
                rows={3}
              />
            </div>
            
            {/* Priority Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="priority" className="font-medium">
                Öncelikli Olarak İşaretle
              </Label>
              <Switch
                id="priority"
                checked={formData.isPriority}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPriority: checked }))}
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                İptal
              </Button>
            </DialogClose>
            <Button type="submit">
              {editItem ? 'Kaydet' : 'Ekle'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemModal;
