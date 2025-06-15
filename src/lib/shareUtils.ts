/**
 * Compact, reversible encoding for shopping lists
 * Uses Base64URL encoding with compression for URLs and offline sharing
 */

import { ShoppingList, ShoppingItem, ItemCategory, ItemUnit } from '@/types';

// Mapping for compact category encoding (1 character each)
const CATEGORY_MAP: Record<ItemCategory, string> = {
  'produce': 'P',
  'dairy': 'D',
  'bakery': 'B',
  'meat': 'M',
  'frozen': 'F',
  'pantry': 'A',
  'household': 'H',
  'personal': 'R',
  'beverages': 'V',
  'other': 'O'
};

const CATEGORY_REVERSE_MAP = Object.fromEntries(
  Object.entries(CATEGORY_MAP).map(([k, v]) => [v, k as ItemCategory])
);

// Mapping for compact unit encoding (1 character each)
const UNIT_MAP: Record<ItemUnit, string> = {
  'kg': 'k',
  'g': 'g',
  'lb': 'l',
  'oz': 'o',
  'liter': 'L',
  'ml': 'm',
  'count': 'c',
  'pack': 'p',
  'custom': 'x'
};

const UNIT_REVERSE_MAP = Object.fromEntries(
  Object.entries(UNIT_MAP).map(([k, v]) => [v, k as ItemUnit])
);

interface CompactItem {
  n: string;    // name
  q: number;    // quantity
  u: string;    // unit (encoded)
  c: string;    // category (encoded)
  p?: boolean;  // isPriority
  x?: boolean;  // isPurchased
  t?: string;   // notes
  r?: number;   // price
  cu?: string;  // customUnit
}

interface CompactList {
  n: string;           // name
  i: CompactItem[];    // items
  f?: boolean;         // isFavorite
}

/**
 * Encodes a shopping list into a compact, shareable hash
 */
export function encodeShoppingList(list: ShoppingList): string {
  try {
    const compactList: CompactList = {
      n: list.name,
      i: list.items.map(item => {
        const compactItem: CompactItem = {
          n: item.name,
          q: item.quantity,
          u: UNIT_MAP[item.unit] || 'c',
          c: CATEGORY_MAP[item.category] || 'O'
        };

        // Only include optional fields if they're true/set
        if (item.isPriority) compactItem.p = true;
        if (item.isPurchased) compactItem.x = true;
        if (item.notes) compactItem.t = item.notes;
        if (item.price) compactItem.r = item.price;
        if (item.customUnit) compactItem.cu = item.customUnit;

        return compactItem;
      })
    };

    // Only include isFavorite if true
    if (list.isFavorite) compactList.f = true;

    // Convert to JSON and then to Base64URL
    const jsonString = JSON.stringify(compactList);
    const base64 = btoa(unescape(encodeURIComponent(jsonString)));
    
    // Convert to Base64URL (URL-safe)
    const base64url = base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    return base64url;
  } catch (error) {
    console.error('Error encoding shopping list:', error);
    throw new Error('Failed to encode shopping list');
  }
}

/**
 * Decodes a compact hash back into a shopping list
 */
export function decodeShoppingList(hash: string): ShoppingList {
  try {
    // Convert Base64URL back to regular Base64
    let base64 = hash
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // Add padding if needed
    while (base64.length % 4) {
      base64 += '=';
    }

    // Decode from Base64
    const jsonString = decodeURIComponent(escape(atob(base64)));
    const compactList: CompactList = JSON.parse(jsonString);

    // Convert back to full ShoppingList format
    const now = new Date();
    const list: ShoppingList = {
      id: generateId(),
      name: compactList.n,
      items: compactList.i.map(item => ({
        id: generateId(),
        name: item.n,
        quantity: item.q,
        unit: UNIT_REVERSE_MAP[item.u] || 'count',
        category: CATEGORY_REVERSE_MAP[item.c] || 'other',
        isPriority: item.p || false,
        isPurchased: item.x || false,
        notes: item.t,
        price: item.r,
        customUnit: item.cu,
        createdAt: now,
        updatedAt: now
      })),
      createdAt: now,
      updatedAt: now,
      isFavorite: compactList.f || false
    };

    return list;
  } catch (error) {
    console.error('Error decoding shopping list:', error);
    throw new Error('Invalid or corrupted share code');
  }
}

/**
 * Generates a simple unique ID
 */
function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

/**
 * Creates a shareable URL for a shopping list
 */
export function createShareableUrl(list: ShoppingList, baseUrl?: string): string {
  const hash = encodeShoppingList(list);
  const url = baseUrl || window.location.origin + window.location.pathname;
  return `${url}?share=${hash}`;
}

/**
 * Extracts a shopping list from URL parameters
 */
export function extractSharedListFromUrl(url?: string): ShoppingList | null {
  try {
    const urlObj = new URL(url || window.location.href);
    const shareParam = urlObj.searchParams.get('share');
    
    if (!shareParam) return null;
    
    return decodeShoppingList(shareParam);
  } catch (error) {
    console.error('Error extracting shared list from URL:', error);
    return null;
  }
}

/**
 * Estimates the size of the encoded hash for display purposes
 */
export function estimateHashSize(list: ShoppingList): number {
  try {
    const hash = encodeShoppingList(list);
    return hash.length;
  } catch {
    return 0;
  }
}

/**
 * Creates a downloadable file with the shopping list data
 */
export function createDownloadableFile(list: ShoppingList, format: 'json' | 'hash' = 'hash'): Blob {
  if (format === 'hash') {
    const hash = encodeShoppingList(list);
    const content = `Shopping List: ${list.name}\nShare Code: ${hash}\n\nTo import: Copy the share code and use the "Import from Code" feature in the app.`;
    return new Blob([content], { type: 'text/plain' });
  } else {
    const content = JSON.stringify(list, null, 2);
    return new Blob([content], { type: 'application/json' });
  }
}

/**
 * Validates if a string could be a valid share code
 */
export function isValidShareCode(code: string): boolean {
  try {
    // Basic validation - should be Base64URL format
    const base64urlRegex = /^[A-Za-z0-9_-]+$/;
    if (!base64urlRegex.test(code)) return false;
    
    // Try to decode
    decodeShoppingList(code);
    return true;
  } catch {
    return false;
  }
}
