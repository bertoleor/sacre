"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { CartItem, Product } from '@/lib/supabase/types';

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  
  // Actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  // UI
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  
  // Computed
  getItemCount: () => number;
  getSubtotal: () => number;
  getShippingCost: () => number;
  getTotal: () => number;
  isEmpty: () => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Free shipping threshold
const FREE_SHIPPING_THRESHOLD = 50000;
const SHIPPING_COST = 2500;

export function CartProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('sacre-cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setItems(parsed);
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
      }
    }
    setIsLoading(false);
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('sacre-cart', JSON.stringify(items));
    }
  }, [items, isLoading]);

  const addItem = useCallback((product: Product, quantity: number = 1) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return currentItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...currentItems, { product, quantity }];
    });
    
    // Open cart when adding item
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string | number) => {
    setItems(currentItems => currentItems.filter(item => String(item.product.id) !== String(productId)));
  }, []);

  const updateQuantity = useCallback((productId: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    
    const id = String(productId);
    setItems(currentItems =>
      currentItems.map(item =>
        String(item.product.id) === id
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen(prev => !prev), []);

  const getItemCount = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const getSubtotal = useCallback(() => {
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }, [items]);

  const getShippingCost = useCallback(() => {
    const subtotal = getSubtotal();
    if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
    return SHIPPING_COST;
  }, [getSubtotal]);

  const getTotal = useCallback(() => {
    return getSubtotal() + getShippingCost();
  }, [getSubtotal, getShippingCost]);

  const isEmpty = useCallback(() => {
    return items.length === 0;
  }, [items]);

  const contextValue = useMemo(() => ({
    items,
    isOpen,
    isLoading,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    toggleCart,
    getItemCount,
    getSubtotal,
    getShippingCost,
    getTotal,
    isEmpty,
  }), [items, isOpen, isLoading, addItem, removeItem, updateQuantity, clearCart, openCart, closeCart, toggleCart, getItemCount, getSubtotal, getShippingCost, getTotal, isEmpty]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

// Export constants for use in components
export const FREE_SHIPPING_THRESHOLD_VALUE = FREE_SHIPPING_THRESHOLD;
export const SHIPPING_COST_VALUE = SHIPPING_COST;
