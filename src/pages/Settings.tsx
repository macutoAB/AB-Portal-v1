import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ShieldCheck, Settings as SettingsIcon, Image, Type, Save, Upload, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export const Settings: React.FC = () => {
  const { appSettings, updateAppSettings } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [chapterName, setChapterName] = useState(appSettings.chapterName);
  const [logoUrl, setLogoUrl] = useState(appSettings.logoUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `chapter-logo-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    setIsUploading(true);
    setMessage('');

    try {
      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('app-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data } = supabase.storage
        .from('app-assets')
        .getPublicUrl(filePath);

      if (data) {
        setLogoUrl(data.publicUrl);
        setMessage('Image uploaded successfully! Click Save Configuration to apply.');
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      setMessage(`Upload failed: ${error.message || 'Check if "app-assets" bucket exists and is public.'}`);
    } finally {
      setIsUploading(false);
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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
             
             <div className="flex items-end gap-3">
               <div className="flex-1">
                 <Input 
                    label="Logo URL" 
                    value={logoUrl} 
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                 />
               </div>
               
               <div className="mb-[1px]">
                 <input 
                   type="file" 
                   ref={fileInputRef}
                   onChange={handleFileUpload}
                   className="hidden" 
                   accept="image/png, image/jpeg, image/jpg"
                 />
                 <Button 
                   type="button" 
                   variant="secondary" 
                   onClick={() => fileInputRef.current?.click()}
                   disabled={isUploading}
                   className="whitespace-nowrap"
                 >
                   {isUploading ? (
                     <Loader2 size={18} className="animate-spin mr-2" />
                   ) : (
                     <Upload size={18} className="mr-2" />
                   )}
                   {isUploading ? 'Uploading...' : 'Upload Logo'}
                 </Button>
               </div>
             </div>

             <p className="text-xs text-slate-400 mt-2">
               Upload an image or enter a direct link (PNG/JPG). If left empty, the default shield icon will be used.
             </p>
             
             {logoUrl && (
               <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-100 flex flex-col items-center">
                 <span className="text-xs font-medium text-slate-400 mb-2">Preview</span>
                 <img src={logoUrl} alt="Logo Preview" className="h-24 w-auto object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
               </div>
             )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving || isUploading} className="flex items-center gap-2">
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </form>
    </div>
  );
};