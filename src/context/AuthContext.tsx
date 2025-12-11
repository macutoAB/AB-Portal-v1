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
const fetchWithTimeout = <T,>(promise: PromiseLike<T>, ms: number = 15000, errorMsg: string = 'Operation timed out'): Promise<T> => {
  const timeout = new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error(errorMsg)), ms)
  );
  return Promise.race([promise, timeout]);
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to fetch profile data given a user ID - WITH RETRY LOGIC
  const getProfileData = async (userId: string, email: string, retries = 3): Promise<User | null> => {
    try {
      const { data, error } = await fetchWithTimeout<any>(
        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single(),
        5000, // 5 second timeout for DB profile fetch
        'Database connection timed out'
      );

      if (error || !data) {
        console.warn('Error fetching profile:', error);
        // Retry logic for network glitches
        if (retries > 0) {
           console.log(`Retrying profile fetch... (${retries} attempts left)`);
           await new Promise(res => setTimeout(res, 1000)); // Wait 1s
           return getProfileData(userId, email, retries - 1);
        }
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
        // Increased timeout to 10s to account for Supabase "Cold Start" on free tier
        const { data: sessionData, error: sessionError } = await fetchWithTimeout<any>(
          supabase.auth.getSession(),
          10000, 
          'Session check timed out'
        );

        if (sessionError) throw sessionError;

        // 2. If Session exists, Fetch Profile
        if (sessionData.session?.user) {
          const userData = await getProfileData(sessionData.session.user.id, sessionData.session.user.email!);
          if (mounted && userData) {
            setUser(userData);
            setIsAuthenticated(true);
          } else if (mounted && !userData) {
             // Session exists but profile fetch failed (or user deleted from DB but not Auth)
             // Clean up to prevent stuck state
             console.warn("Session valid but profile missing. Clearing stale session.");
             await supabase.auth.signOut();
             localStorage.removeItem('apo_user');
             localStorage.removeItem('sb-' + (import.meta as any).env.VITE_SUPABASE_URL?.split('.')[0] + '-auth-token'); 
             setUser(null);
             setIsAuthenticated(false);
          }
        } else {
            // No session from Supabase, but maybe LocalStorage has junk? Clear it.
            if (localStorage.getItem('apo_user')) {
                console.log("Clearing stale local storage data");
                localStorage.removeItem('apo_user');
            }
            setUser(null);
            setIsAuthenticated(false);
        }
      } catch (error) {
        console.warn("Auth initialization finished with error:", error);
        // Nuclear option: If init fails, clear everything so the user can at least see the Login screen
        localStorage.removeItem('apo_user');
        setUser(null);
        setIsAuthenticated(false);
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
        // Only set loading if we don't already have a user
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
        localStorage.removeItem('apo_user');
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
      } else {
          // If login succeeds but profile fetch fails, force logout
          await supabase.auth.signOut();
          throw new Error("Login successful, but user profile could not be loaded.");
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
    localStorage.removeItem('apo_user');
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