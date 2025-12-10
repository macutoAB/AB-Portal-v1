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

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to fetch profile data given a user ID
  const getProfileData = async (userId: string, email: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

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
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Define the full authentication check sequence
        const performAuthCheck = async () => {
          // 1. Get Session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;

          // 2. If Session exists, Fetch Profile
          if (session?.user) {
            const userData = await getProfileData(session.user.id, session.user.email!);
            if (userData) {
              return userData;
            }
          }
          return null;
        };

        // Define a strict timeout promise (4 seconds)
        const timeoutPromise = new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('Auth check timed out')), 4000)
        );

        // Race the Auth Check against the Timeout
        // This ensures the spinner ALWAYS disappears after 4 seconds max
        const resultUser = await Promise.race([
          performAuthCheck(),
          timeoutPromise
        ]);

        if (mounted && resultUser) {
          setUser(resultUser);
          setIsAuthenticated(true);
        }

      } catch (error) {
        console.warn("Auth initialization finished with specific state:", error);
        // We do NOT sign out here to avoid clearing a valid (but slow) local session.
        // The UI will just show logged out, and if the network recovers, a reload will fix it.
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
        // When signing in, we might need to fetch the profile again if we don't have it
        setIsLoading(true);
        try {
          const userData = await getProfileData(session.user.id, session.user.email!);
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          }
        } catch (e) {
          console.error("Profile fetch failed on change state", e);
        } finally {
          setIsLoading(false);
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
  }, []);

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
    await supabase.auth.signOut();
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