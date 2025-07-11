
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Order, CartItem, User, Address } from '../types';
import { useStore } from '../hooks/useStore';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  orders: Order[];
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  addOrder: (items: CartItem[], totalAmount: number, subtotal: number, deliveryFee: number, redeemedAmount: number, deliveryAddress: Address) => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  removeAddress: (addressId: string) => void;
  selectAddress: (addressId: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Tier list for rewards based on average eco score
const getRewardPercentage = (score: number): number => {
    if (score >= 90) return 0.06; // 6%
    if (score >= 80) return 0.05; // 5%
    if (score >= 60) return 0.04; // 4%
    if (score >= 50) return 0.03; // 3%
    if (score >= 40) return 0.025; // 2.5%
    if (score >= 20) return 0.02; // 2%
    return 0;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAuthLoading, setAuthLoading] = useState(true);
  const { selectedStore } = useStore();

  const updateUserInMasterList = (updatedUser: User) => {
    try {
        const allUsers = JSON.parse(localStorage.getItem('blinkit_users') || '[]');
        const userIndex = allUsers.findIndex((u: any) => u.email === updatedUser.email);
        if (userIndex > -1) {
            allUsers[userIndex] = { ...allUsers[userIndex], ...updatedUser };
            localStorage.setItem('blinkit_users', JSON.stringify(allUsers));
        }
    } catch(e) { console.error("Failed to update user in master list", e); }
  }
  
  const saveUser = (userToSave: User) => {
      setUser(userToSave);
      localStorage.setItem('blinkit_user', JSON.stringify(userToSave));
      updateUserInMasterList(userToSave);
  }

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('blinkit_user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // Ensure all fields exist for backwards compatibility and include extra fields
        const completeUser: User = {
            name: parsedUser.name,
            email: parsedUser.email,
            walletBalance: parsedUser.walletBalance || 0,
            addresses: parsedUser.addresses || [],
            selectedAddressId: parsedUser.selectedAddressId || null,
            phone: parsedUser.phone || '',
            gender: parsedUser.gender || '',
        }
        setUser(completeUser);
        loadOrders(completeUser.email);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('blinkit_user');
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const loadOrders = (userEmail: string) => {
    try {
      const allOrders = JSON.parse(localStorage.getItem('blinkit_orders') || '{}');
      setOrders(allOrders[userEmail] || []);
    } catch (error) {
      console.error("Failed to load orders from localStorage", error);
    }
  };

  const saveOrders = (userEmail: string, newOrders: Order[]) => {
      try {
        const allOrders = JSON.parse(localStorage.getItem('blinkit_orders') || '{}');
        allOrders[userEmail] = newOrders;
        localStorage.setItem('blinkit_orders', JSON.stringify(allOrders));
      } catch (error) {
          console.error("Failed to save orders to localStorage", error);
      }
  }
  
  const login = async (email: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
            const users = JSON.parse(localStorage.getItem('blinkit_users') || '[]');
            const userInDb = users.find((u: any) => u.email === email && u.password === password);

            if (userInDb) {
              const userData: User = { 
                name: userInDb.name, 
                email: userInDb.email, 
                walletBalance: userInDb.walletBalance || 0,
                addresses: userInDb.addresses || [],
                selectedAddressId: userInDb.selectedAddressId || null,
              };
              saveUser(userData);
              loadOrders(userData.email);
              resolve();
            } else {
              reject(new Error('Invalid email or password'));
            }
        } catch(error) {
            reject(new Error('An error occurred during login.'));
        }
      }, 500);
    });
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
      return new Promise((resolve, reject) => {
          setTimeout(() => {
            try {
              let users = JSON.parse(localStorage.getItem('blinkit_users') || '[]');
              const userExists = users.some((u: any) => u.email === email);
              if (userExists) {
                reject(new Error('User with this email already exists.'));
                return;
              }
              const userData: User = { name, email, walletBalance: 0, addresses: [], selectedAddressId: null };
              const newUserForDb = { ...userData, password }; // Store password only in the master list
              users.push(newUserForDb);
              localStorage.setItem('blinkit_users', JSON.stringify(users));
              
              saveUser(userData);
              setOrders([]); // New user has no orders
              resolve();
            } catch(error) {
                reject(new Error('An error occurred during registration.'));
            }
          }, 500);
      });
  };

  const logout = () => {
    localStorage.removeItem('blinkit_user');
    setUser(null);
    setOrders([]);
  };

  const addAddress = (addressData: Omit<Address, 'id'>) => {
    if (!user) return;
    const newAddress: Address = { ...addressData, id: new Date().getTime().toString() };
    const updatedAddresses = [...user.addresses, newAddress];
    const updatedUser = { 
        ...user, 
        addresses: updatedAddresses,
        // If this is the first address, auto-select it
        selectedAddressId: user.selectedAddressId ?? newAddress.id,
    };
    saveUser(updatedUser);
  };
  
  const removeAddress = (addressId: string) => {
    if (!user) return;
    const updatedAddresses = user.addresses.filter(a => a.id !== addressId);
    const updatedUser = { ...user, addresses: updatedAddresses };
    // If the removed address was the selected one, unselect it
    if (user.selectedAddressId === addressId) {
      updatedUser.selectedAddressId = updatedAddresses.length > 0 ? updatedAddresses[0].id : null;
    }
    saveUser(updatedUser);
  };

  const selectAddress = (addressId: string) => {
    if (!user) return;
    const updatedUser = { ...user, selectedAddressId: addressId };
    saveUser(updatedUser);
  };
  
  const addOrder = (items: CartItem[], totalAmount: number, subtotal: number, deliveryFee: number, redeemedAmount: number, deliveryAddress: Address) => {
    if(!user) return;
    
    // 1. Calculate rewards
    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalEcoScore = items.reduce((sum, item) => sum + (item.ecologicalScore * item.quantity), 0);
    const avgEcoScore = cartCount > 0 ? totalEcoScore / cartCount : 0;
    const rewardPercentage = getRewardPercentage(avgEcoScore);
    const earnedRewards = subtotal * rewardPercentage;

    // 2. Update wallet balance
    const newWalletBalance = user.walletBalance - redeemedAmount + earnedRewards;
    const updatedUser: User = { ...user, walletBalance: newWalletBalance };

    // 3. Persist updated user data
    saveUser(updatedUser);

    const newOrder: Order = {
        id: new Date().getTime().toString(),
        date: new Date().toISOString(),
        items,
        totalAmount,
        subtotal,
        deliveryFee,
        rewardPointsEarned: earnedRewards,
        rewardPointsRedeemed: redeemedAmount,
        storeName: selectedStore.name,
        deliveryAddress, // Add delivery address to order
    };
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    saveOrders(user.email, updatedOrders);
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isAuthLoading,
    orders,
    login,
    register,
    logout,
    addOrder,
    addAddress,
    removeAddress,
    selectAddress
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
