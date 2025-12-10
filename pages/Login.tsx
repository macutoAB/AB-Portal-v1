import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Lock, ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-blue-950 p-8 text-center relative overflow-hidden">
           {/* Decorative circles */}
           <div className="absolute top-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
           <div className="absolute bottom-0 right-0 w-24 h-24 bg-amber-500 opacity-10 rounded-full translate-x-1/3 translate-y-1/3"></div>

           <div className="relative z-10 inline-flex items-center justify-center w-20 h-20 rounded-full bg-white mb-4 shadow-lg">
             <ShieldCheck size={40} className="text-blue-900" />
           </div>
           <h1 className="relative z-10 text-3xl font-bold text-white tracking-wide">APO <span className="text-amber-400">ALPHA BETA</span></h1>
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
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : (
                <>
                  <Lock size={16} />
                  <span>Sign In</span>
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-xs text-slate-400 border-t pt-6 border-slate-100">
             <p className="font-semibold text-slate-500 mb-2">All Rights Reserved 2026</p>
            <p><span className="font-mono bg-slate-100 px-1 rounded text-slate-600">Developed By:</span> <span className="font-mono bg-slate-100 px-1 rounded text-slate-600">TAMZ 0102-11-47809</span></p>
            <p className="mt-1"><span className="font-mono bg-slate-100 px-1 rounded text-slate-600">ALPHA PHI OMEGA</span> <span className="font-mono bg-slate-100 px-1 rounded text-slate-600"> Philippines Incorporated</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};
