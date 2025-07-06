
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Order, CartItem } from '../types';

interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  orders: Order[];
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  addOrder: (items: CartItem[], totalAmount: number) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAuthLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('blinkit_user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        loadOrders(parsedUser.email);
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
            const foundUser = users.find((u: any) => u.email === email && u.password === password);
            if (foundUser) {
              const userData = { name: foundUser.name, email: foundUser.email };
              localStorage.setItem('blinkit_user', JSON.stringify(userData));
              setUser(userData);
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
              const newUser = { name, email, password };
              users.push(newUser);
              localStorage.setItem('blinkit_users', JSON.stringify(users));
              
              const userData = { name, email };
              localStorage.setItem('blinkit_user', JSON.stringify(userData));
              setUser(userData);
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
  
  const addOrder = (items: CartItem[], totalAmount: number) => {
    if(!user) return;
    const newOrder: Order = {
        id: new Date().getTime().toString(),
        date: new Date().toISOString(),
        items,
        totalAmount,
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
