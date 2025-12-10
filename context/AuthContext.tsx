import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { User } from '../types';
import { MOCK_USERS } from '../services/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const stored = localStorage.getItem('apo_user');
        if (stored) {
          const parsedUser = JSON.parse(stored);
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth restoration failed', error);
        localStorage.removeItem('apo_user');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 800));

    // Retrieve users from "Database" (LocalStorage)
    const storedUsers = localStorage.getItem('apo_users_db');
    const users: User[] = storedUsers ? JSON.parse(storedUsers) : MOCK_USERS;

    const account = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (account) {
      if (account.status !== 'active') {
        throw new Error('Account is inactive. Please contact the administrator.');
      }

      // Create session user object (exclude password)
      const sessionUser: User = {
        id: account.id,
        name: account.name,
        email: account.email,
        role: account.role,
        status: account.status
      };
      
      localStorage.setItem('apo_user', JSON.stringify(sessionUser));
      
      // Ensure the "database" is initialized if it wasn't already (e.g. first login)
      if (!storedUsers) {
        localStorage.setItem('apo_users_db', JSON.stringify(users));
      }

      setUser(sessionUser);
      setIsAuthenticated(true);
    } else {
      throw new Error('Invalid email or password');
    }
  };

  const logout = () => {
    localStorage.removeItem('apo_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};