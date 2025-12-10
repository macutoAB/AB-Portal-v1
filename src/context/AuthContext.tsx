import { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../supabaseClient';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to prevent any async operation from hanging indefinitely
// Use PromiseLike to accept both Promises and thenables (like Supabase builders)
const fetchWithTimeout = <T,>(promise: PromiseLike<T>, ms: number = 3000, errorMsg: string = 'Operation timed out'): Promise<T> => {
  const timeout = new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error(errorMsg)), ms)
  );
  return Promise.race([promise, timeout]);
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to fetch profile data given a user ID - NOW WITH TIMEOUT PROTECTION
  const getProfileData = async (userId: string, email: string): Promise<User | null> => {
    try {
      const { data, error } = await fetchWithTimeout(
        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single(),
        4000, // 4 second strict timeout for DB
        'Database connection timed out'
      );

      if (error || !data) {
        console.warn('Error fetching profile or profile not found:', error);
        return null;
      }

      if (data.status !== 'active') {
        throw new Error('Account is inactive. Please contact the administrator.');
      }

      return {
        id: data.id,
        name: data.name,
        email: email,
        role: data.role as UserRole,
        status: data.status,
      };
    } catch (err) {
      console.error("Profile fetch failed:", err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // 1. Get Session with strict timeout
        const { data: sessionData, error: sessionError } = await fetchWithTimeout(
          supabase.auth.getSession(),
          3000,
          'Session check timed out'
        );

        if (sessionError) throw sessionError;

        // 2. If Session exists, Fetch Profile
        if (sessionData.session?.user) {
          const userData = await getProfileData(sessionData.session.user.id, sessionData.session.user.email!);
          if (mounted && userData) {
            setUser(userData);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.warn("Auth initialization finished with error:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes (Login, Logout, Auto-Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        // Only set loading if we don't already have a user (prevents flashing on page focus/refresh)
        if (!user) setIsLoading(true);
        
        try {
          const userData = await getProfileData(session.user.id, session.user.email!);
          if (mounted && userData) {
            setUser(userData);
            setIsAuthenticated(true);
          }
        } catch (e) {
          console.error("Profile fetch failed on change state", e);
        } finally {
          if (mounted) setIsLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Remove user dependency to prevent loop

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    if (data.user) {
      const userData = await getProfileData(data.user.id, data.user.email!);
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
      }
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Error signing out:", e);
    }
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