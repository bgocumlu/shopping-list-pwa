// Quick test to demonstrate the compression improvements
// Run with: node test-compression.js

const { encodeShoppingList, decodeShoppingList } = require('./dist/lib/shareUtils.js');

// Sample shopping list that would create a long hash
const sampleList = {
  id: "test-id",
  name: "Weekly Groceries",
  items: [
    {
      id: "1",
      name: "milk",
      quantity: 2,
      unit: "count",
      category: "dairy",
      isPriority: true,
      isPurchased: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "2", 
      name: "bread",
      quantity: 1,
      unit: "count",
      category: "bakery",
      isPriority: false,
      isPurchased: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "3",
      name: "eggs",
      quantity: 12,
      unit: "count", 
      category: "dairy",
      isPriority: false,
      isPurchased: true,
      notes: "Large eggs",
      price: 3.99,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "4",
      name: "chicken",
      quantity: 1,
      unit: "lb",
      category: "meat", 
      isPriority: false,
      isPurchased: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "5",
      name: "apples",
      quantity: 6,
      unit: "count",
      category: "produce",
      isPriority: false,
      isPurchased: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
  isFavorite: true
};

try {
  console.log('Original list:', JSON.stringify(sampleList, null, 2));
  
  const hash = encodeShoppingList(sampleList);
  console.log('\nGenerated hash:', hash);
  console.log('Hash length:', hash.length, 'characters');
  
  const decoded = decodeShoppingList(hash);
  console.log('\nDecoded list name:', decoded.name);
  console.log('Items count:', decoded.items.length);
  console.log('Items:', decoded.items.map(item => `${item.name} (${item.quantity} ${item.unit})`));
  
  console.log('\nCompression successful! ✅');
} catch (error) {
  console.error('Error:', error.message);
}
