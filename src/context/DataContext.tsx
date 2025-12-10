import { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { Member, Organizer, Affiliate, GrandChancellor, User, UserRole, ContentPage, TimelineEvent, AppSettings } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../supabaseClient';

interface DataContextType {
  members: Member[];
  organizers: Organizer[];
  affiliates: Affiliate[];
  grandChancellors: GrandChancellor[];
  users: User[];
  contentPages: ContentPage[];
  timelineEvents: TimelineEvent[];
  appSettings: AppSettings;
  
  addMember: (data: Omit<Member, 'id' | 'dateCreated' | 'dateUpdated'>) => Promise<void>;
  updateMember: (id: string, data: Partial<Member>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  
  addOrganizer: (data: Omit<Organizer, 'id' | 'dateCreated' | 'dateUpdated'>) => Promise<void>;
  updateOrganizer: (id: string, data: Partial<Organizer>) => Promise<void>;
  deleteOrganizer: (id: string) => Promise<void>;
  
  addAffiliate: (data: Omit<Affiliate, 'id' | 'dateCreated' | 'dateUpdated'>) => Promise<void>;
  updateAffiliate: (id: string, data: Partial<Affiliate>) => Promise<void>;
  deleteAffiliate: (id: string) => Promise<void>;
  
  addChancellor: (data: Omit<GrandChancellor, 'id' | 'dateCreated' | 'dateUpdated'>) => Promise<void>;
  updateChancellor: (id: string, data: Partial<GrandChancellor>) => Promise<void>;
  deleteChancellor: (id: string) => Promise<void>;

  addUser: (data: Omit<User, 'id'> & { password?: string }) => Promise<void>;
  updateUser: (id: string, data: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  updatePageContent: (id: string, content: string) => Promise<void>;

  addTimelineEvent: (data: Omit<TimelineEvent, 'id' | 'dateCreated'>) => Promise<void>;
  deleteTimelineEvent: (id: string) => Promise<void>;

  updateAppSettings: (settings: Partial<AppSettings>) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: PropsWithChildren) => {
  const { user: currentUser } = useAuth();
  
  const [members, setMembers] = useState<Member[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [grandChancellors, setGrandChancellors] = useState<GrandChancellor[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [contentPages, setContentPages] = useState<ContentPage[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  
  // Default Settings
  const [appSettings, setAppSettings] = useState<AppSettings>({
    chapterName: 'ALPHA BETA',
    logoUrl: '' // Empty string means use default icon
  });

  // Fetch data on mount or login
  useEffect(() => {
    // We fetch settings even if not logged in (for Login page)
    fetchSettings();

    if (currentUser) {
      fetchAllData();
    }
  }, [currentUser]);

  const fetchSettings = async () => {
    // We reuse 'contentPages' table for config to avoid new tables
    // IDs: 'config_app_name', 'config_app_logo'
    const { data } = await supabase.from('contentPages').select('*').in('id', ['config_app_name', 'config_app_logo']);
    
    if (data) {
      const nameConfig = data.find(d => d.id === 'config_app_name');
      const logoConfig = data.find(d => d.id === 'config_app_logo');
      
      setAppSettings(prev => ({
        chapterName: nameConfig?.content || 'ALPHA BETA',
        logoUrl: logoConfig?.content || ''
      }));
    }
  };

  const fetchAllData = async () => {
    const { data: membersData } = await supabase.from('members').select('*');
    if (membersData) setMembers(membersData);

    const { data: organizersData } = await supabase.from('organizers').select('*');
    if (organizersData) setOrganizers(organizersData);

    const { data: affiliatesData } = await supabase.from('affiliates').select('*');
    if (affiliatesData) setAffiliates(affiliatesData);

    const { data: gcData } = await supabase.from('grandChancellors').select('*');
    if (gcData) setGrandChancellors(gcData);

    // Only admins can see user list
    if (currentUser?.role === UserRole.ADMIN) {
      const { data: profilesData } = await supabase.from('profiles').select('*');
      if (profilesData) {
        const formattedUsers: User[] = profilesData.map(p => ({
          id: p.id,
          name: p.name,
          email: p.email,
          role: p.role,
          status: p.status
        }));
        setUsers(formattedUsers);
      }
    }

    const { data: contentData } = await supabase.from('contentPages').select('*');
    if (contentData) setContentPages(contentData);

    const { data: timelineData } = await supabase.from('timelineEvents').select('*');
    if (timelineData) setTimelineEvents(timelineData);
  };

  const checkPermission = () => {
    if (currentUser?.role !== UserRole.ADMIN) {
      throw new Error("Unauthorized: Admins only");
    }
  };

  // --- CRUD Implementations ---

  const addMember = async (data: any) => {
    checkPermission();
    const { data: newRecord, error } = await supabase.from('members').insert(data).select().single();
    if (error) throw error;
    if (newRecord) setMembers(prev => [...prev, newRecord]);
  };

  const updateMember = async (id: string, data: any) => {
    checkPermission();
    const { data: updated, error } = await supabase.from('members').update({ ...data, dateUpdated: new Date() }).eq('id', id).select().single();
    if (error) throw error;
    if (updated) setMembers(prev => prev.map(m => m.id === id ? updated : m));
  };

  const deleteMember = async (id: string) => {
    checkPermission();
    const { error } = await supabase.from('members').delete().eq('id', id);
    if (error) throw error;
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const addOrganizer = async (data: any) => {
    checkPermission();
    const { data: newRecord, error } = await supabase.from('organizers').insert(data).select().single();
    if (error) throw error;
    if (newRecord) setOrganizers(prev => [...prev, newRecord]);
  };

  const updateOrganizer = async (id: string, data: any) => {
    checkPermission();
    const { data: updated, error } = await supabase.from('organizers').update({ ...data, dateUpdated: new Date() }).eq('id', id).select().single();
    if (error) throw error;
    if (updated) setOrganizers(prev => prev.map(m => m.id === id ? updated : m));
  };

  const deleteOrganizer = async (id: string) => {
    checkPermission();
    const { error } = await supabase.from('organizers').delete().eq('id', id);
    if (error) throw error;
    setOrganizers(prev => prev.filter(m => m.id !== id));
  };

  const addAffiliate = async (data: any) => {
    checkPermission();
    const { data: newRecord, error } = await supabase.from('affiliates').insert(data).select().single();
    if (error) throw error;
    if (newRecord) setAffiliates(prev => [...prev, newRecord]);
  };

  const updateAffiliate = async (id: string, data: any) => {
    checkPermission();
    const { data: updated, error } = await supabase.from('affiliates').update({ ...data, dateUpdated: new Date() }).eq('id', id).select().single();
    if (error) throw error;
    if (updated) setAffiliates(prev => prev.map(m => m.id === id ? updated : m));
  };

  const deleteAffiliate = async (id: string) => {
    checkPermission();
    const { error } = await supabase.from('affiliates').delete().eq('id', id);
    if (error) throw error;
    setAffiliates(prev => prev.filter(m => m.id !== id));
  };

  const addChancellor = async (data: any) => {
    checkPermission();
    const { data: newRecord, error } = await supabase.from('grandChancellors').insert(data).select().single();
    if (error) throw error;
    if (newRecord) setGrandChancellors(prev => [...prev, newRecord]);
  };

  const updateChancellor = async (id: string, data: any) => {
    checkPermission();
    const { data: updated, error } = await supabase.from('grandChancellors').update({ ...data, dateUpdated: new Date() }).eq('id', id).select().single();
    if (error) throw error;
    if (updated) setGrandChancellors(prev => prev.map(m => m.id === id ? updated : m));
  };

  const deleteChancellor = async (id: string) => {
    checkPermission();
    const { error } = await supabase.from('grandChancellors').delete().eq('id', id);
    if (error) throw error;
    setGrandChancellors(prev => prev.filter(m => m.id !== id));
  };

  const updatePageContent = async (id: string, content: string) => {
    checkPermission();
    const { data: existing } = await supabase.from('contentPages').select('id').eq('id', id).single();
    
    let result;
    if (existing) {
       result = await supabase.from('contentPages').update({ content, lastUpdated: new Date() }).eq('id', id).select().single();
    } else {
       result = await supabase.from('contentPages').insert({ id, title: id, content }).select().single();
    }
    
    if (result.error) throw result.error;
    if (result.data) {
      setContentPages(prev => {
        const exists = prev.find(p => p.id === id);
        if (exists) return prev.map(p => p.id === id ? result.data : p);
        return [...prev, result.data];
      });
    }
  };

  const addTimelineEvent = async (data: any) => {
    checkPermission();
    const { data: newRecord, error } = await supabase.from('timelineEvents').insert(data).select().single();
    if (error) throw error;
    if (newRecord) setTimelineEvents(prev => [...prev, newRecord]);
  };

  const deleteTimelineEvent = async (id: string) => {
    checkPermission();
    const { error } = await supabase.from('timelineEvents').delete().eq('id', id);
    if (error) throw error;
    setTimelineEvents(prev => prev.filter(t => t.id !== id));
  };

  const addUser = async (_data: any) => {
    checkPermission();
    alert("Please create the user in Supabase Auth Dashboard first, then add their details here matching the email.");
    window.open('https://supabase.com/dashboard/project/_/auth/users', '_blank');
  };

  const updateUser = async (id: string, data: any) => {
    checkPermission();
    const { error } = await supabase.from('profiles').update(data).eq('id', id);
    if (error) throw error;
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
  };

  const deleteUser = async (id: string) => {
    checkPermission();
    if (currentUser?.id === id) {
      alert("Cannot delete self");
      return;
    }
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) throw error;
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const updateAppSettings = async (settings: Partial<AppSettings>) => {
    checkPermission();
    
    if (settings.chapterName !== undefined) {
      await updatePageContent('config_app_name', settings.chapterName);
      setAppSettings(prev => ({ ...prev, chapterName: settings.chapterName! }));
    }
    
    if (settings.logoUrl !== undefined) {
      await updatePageContent('config_app_logo', settings.logoUrl);
      setAppSettings(prev => ({ ...prev, logoUrl: settings.logoUrl! }));
    }
  };

  return (
    <DataContext.Provider value={{
      members, organizers, affiliates, grandChancellors, users, contentPages, timelineEvents, appSettings,
      addMember, updateMember, deleteMember,
      addOrganizer, updateOrganizer, deleteOrganizer,
      addAffiliate, updateAffiliate, deleteAffiliate,
      addChancellor, updateChancellor, deleteChancellor,
      addUser, updateUser, deleteUser,
      updatePageContent,
      addTimelineEvent, deleteTimelineEvent,
      updateAppSettings
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};