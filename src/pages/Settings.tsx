import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ShieldCheck, Settings as SettingsIcon, Image, Type, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Settings: React.FC = () => {
  const { appSettings, updateAppSettings } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [chapterName, setChapterName] = useState(appSettings.chapterName);
  const [logoUrl, setLogoUrl] = useState(appSettings.logoUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Update local state when context changes (e.g. initial fetch)
  useEffect(() => {
    setChapterName(appSettings.chapterName);
    setLogoUrl(appSettings.logoUrl);
  }, [appSettings]);

  if (user?.role !== UserRole.ADMIN) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <ShieldCheck size={48} className="mb-4 text-slate-300" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p>You do not have permission to view this page.</p>
        <Button className="mt-4" onClick={() => navigate('/')}>Return to Dashboard</Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    
    try {
      await updateAppSettings({
        chapterName,
        logoUrl
      });
      setMessage('Settings updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error(error);
      setMessage('Failed to update settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <SettingsIcon size={28} className="text-slate-400" />
        <div>
          <h1 className="text-2xl font-bold text-blue-900">System Settings</h1>
          <p className="text-slate-500 text-sm">Configure application appearance</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {message && (
          <div className={`p-4 rounded-md text-sm font-medium ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-6">
          
          {/* Chapter Name */}
          <div>
             <div className="flex items-center gap-2 mb-4">
               <Type size={20} className="text-blue-600" />
               <h3 className="text-lg font-semibold text-slate-800">Chapter Identity</h3>
             </div>
             <Input 
                label="Chapter Name" 
                value={chapterName} 
                onChange={(e) => setChapterName(e.target.value)}
                placeholder="e.g. ALPHA BETA"
                required
             />
             <p className="text-xs text-slate-400 mt-2">This name appears on the Login screen and the Sidebar navigation.</p>
          </div>

          <hr className="border-slate-100" />

          {/* Logo URL */}
          <div>
             <div className="flex items-center gap-2 mb-4">
               <Image size={20} className="text-amber-500" />
               <h3 className="text-lg font-semibold text-slate-800">Logo Configuration</h3>
             </div>
             <Input 
                label="Logo URL" 
                value={logoUrl} 
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
             />
             <p className="text-xs text-slate-400 mt-2">
               Enter a direct link to an image (PNG/JPG). If left empty, the default shield icon will be used.
             </p>
             
             {logoUrl && (
               <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-100 flex flex-col items-center">
                 <span className="text-xs font-medium text-slate-400 mb-2">Preview</span>
                 <img src={logoUrl} alt="Logo Preview" className="h-20 w-auto object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
               </div>
             )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving} className="flex items-center gap-2">
            <Save size={18} />
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </form>
    </div>
  );
};