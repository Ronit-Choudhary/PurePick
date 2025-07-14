import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';
import { useStore } from '../hooks/useStore';

interface WishlistContextType {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { selectedStore } = useStore();
  const [wishlist, setWishlist] = useState<Product[]>([]);

  // Helper to get the localStorage key for the current store
  const getKey = () => `purepick_wishlist_${selectedStore.id}`;

  // Load wishlist for the current store
  useEffect(() => {
    const stored = localStorage.getItem(getKey());
    if (stored) {
      setWishlist(JSON.parse(stored));
    } else {
      setWishlist([]);
    }
  }, [selectedStore.id]);

  // Save wishlist for the current store
  useEffect(() => {
    localStorage.setItem(getKey(), JSON.stringify(wishlist));
  }, [wishlist, selectedStore.id]);

  const addToWishlist = (product: Product) => {
    setWishlist((prev) => {
      if (prev.find((item) => item.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
  };

  const isWishlisted = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
  };

  const clearWishlist = () => setWishlist([]);

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isWishlisted, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}; 