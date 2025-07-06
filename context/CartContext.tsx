
import React, { createContext, useState, useEffect, useMemo, ReactNode, useRef } from 'react';
import { CartItem, Product } from '../types';
import { useStore } from '../hooks/useStore';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
  cartTotal: number;
  cartCount: number;
  avgEcoScore: number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { selectedStore } = useStore();
  const storeIdRef = useRef(selectedStore.id);

  useEffect(() => {
    // This effect handles automatic cart clearing if the store changes
    // *after* a modal has already received confirmation.
    if (storeIdRef.current !== selectedStore.id) {
        if (cartItems.length > 0) {
            clearCart();
        }
        storeIdRef.current = selectedStore.id;
    }
  }, [selectedStore]);


  const addToCart = (product: Product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };
  
  const getItemQuantity = (productId: string): number => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  }

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartItems]);

  const cartCount = useMemo(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  const avgEcoScore = useMemo(() => {
    if (cartCount === 0) return 0;
    const totalEcoScore = cartItems.reduce((sum, item) => sum + (item.ecologicalScore * item.quantity), 0);
    return totalEcoScore / cartCount;
  }, [cartItems, cartCount]);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemQuantity,
    cartTotal,
    cartCount,
    avgEcoScore,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
