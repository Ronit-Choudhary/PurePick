
import React, { createContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Store, Product, Category } from '../types';
import { stores as allStores, categories as allCategories } from '../constants';

interface StoreContextType {
  stores: Store[];
  selectedStore: Store;
  products: Product[];
  categories: Category[];
  selectStore: (storeId: string) => void;
  findNearestStore: (lat: number, lon: number) => { store: Store | null; distance: number };
}

export const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Haversine formula to calculate distance between two lat/lon points in miles
const getDistanceInMiles = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 3958.8; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedStore, setSelectedStore] = useState<Store>(() => {
    const savedStoreId = localStorage.getItem('blinkit_store_id');
    return allStores.find(s => s.id === savedStoreId) || allStores[0];
  });

  const selectStore = (storeId: string) => {
    const store = allStores.find(s => s.id === storeId);
    if (store) {
      setSelectedStore(store);
      localStorage.setItem('blinkit_store_id', store.id);
    }
  };
  
  const findNearestStore = (lat: number, lon: number): { store: Store | null; distance: number } => {
    let nearestStore: Store | null = null;
    let minDistance = Infinity;

    allStores.forEach(store => {
        const distance = getDistanceInMiles(lat, lon, store.latitude, store.longitude);
        if (distance < minDistance) {
            minDistance = distance;
            nearestStore = store;
        }
    });
    
    return { store: nearestStore, distance: minDistance };
  };

  const products = useMemo(() => selectedStore.products, [selectedStore]);
  
  const categories = useMemo(() => {
    const availableCategoryNames = new Set(products.map(p => p.category));
    return allCategories.filter(c => availableCategoryNames.has(c.name));
  }, [products]);

  const value = {
    stores: allStores,
    selectedStore,
    products,
    categories,
    selectStore,
    findNearestStore,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};
