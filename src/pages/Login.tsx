import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Lock, ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get auth state
  const { login, isAuthenticated, isLoading } = useAuth();
  const { appSettings } = useData();
  const navigate = useNavigate();

  // 1. Auto-redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      // Navigation happens automatically due to the useEffect above
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Invalid credentials. Please try again.');
      setIsSubmitting(false);
    }
  };

  // If the global auth is loading, just show a simple spinner or blank
  if (isLoading) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-slate-50">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800"></div>
       </div>
     );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-blue-950 p-8 text-center relative overflow-hidden">
           {/* Decorative circles */}
           <div className="absolute top-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
           <div className="absolute bottom-0 right-0 w-24 h-24 bg-amber-500 opacity-10 rounded-full translate-x-1/3 translate-y-1/3"></div>

           <div className="relative z-10 inline-flex items-center justify-center w-24 h-24 rounded-full bg-white mb-4 shadow-lg overflow-hidden">
             {appSettings.logoUrl ? (
               <img src={appSettings.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
             ) : (
               <ShieldCheck size={40} className="text-blue-900" />
             )}
           </div>
           <h1 className="relative z-10 text-3xl font-bold text-white tracking-wide">APO <span className="text-amber-400">{appSettings.chapterName}</span></h1>
           <p className="relative z-10 text-blue-200 mt-2 text-sm">Chapter Management Portal</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-md bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                {error}
              </div>
            )}
            
            <Input 
              label="Email Address" 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@alphabeta.org"
            />
            
            <Input 
              label="Password" 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <Button 
              type="submit" 
              className="w-full flex items-center justify-center space-x-2 bg-blue-800 hover:bg-blue-900"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : (
                <>
                  <Lock size={16} />
                  <span>Sign In</span>
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-xs text-slate-400 border-t pt-6 border-slate-100">
             <p className="font-semibold text-slate-500 mb-2">All Rights Reserved 2025</p>
            <p className="mb-1"><span className="font-mono bg-slate-100 px-1 rounded text-slate-600">Developed By:</span> <span className="font-mono bg-slate-100 px-1 rounded text-slate-600">TAMZ 0102-11-47809</span></p>
            <p><span className="font-mono bg-slate-100 px-1 rounded text-slate-600">ALPHA PHI OMEGA</span> <span className="font-mono bg-slate-100 px-1 rounded text-slate-600"> Philippines Incorporated</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};