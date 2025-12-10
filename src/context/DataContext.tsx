import { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { Member, Organizer, Affiliate, GrandChancellor, User, UserRole, ContentPage, TimelineEvent } from '../types';
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

  // Fetch data on mount or login
  useEffect(() => {
    if (currentUser) {
      fetchAllData();
    }
  }, [currentUser]);

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
      // We join auth.users via profiles table
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

  // User Management
  // Note: Creating a user via client SDK only creates in auth.users if "Enable Signups" is on.
  // It won't automatically create a profile entry unless we use a Database Trigger (recommended) 
  // or manually insert into profiles here.
  const addUser = async (_data: any) => {
    checkPermission();
    // 1. Create Auth User (Admin only feature usually requires Service Role key on backend, 
    // but client SDK allow signUp. However, signUp logs you in as that user immediately).
    // WORKAROUND: For this portal, we will just insert into 'profiles' and assume the user signs up themselves,
    // OR (Better for this demo) we assume you create the Auth User in Supabase Dashboard, 
    // and this function just creates the Profile linkage.
    alert("Please create the user in Supabase Auth Dashboard first, then add their details here matching the email.");
    
    // Attempting to create profile record
    // We cannot know the UUID until they sign up. 
    // This part is complex without a backend function (Edge Function).
    // For now, we will just throw an alert guiding the admin.
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
    // Only deletes profile. Auth user remains unless deleted from Dashboard.
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) throw error;
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  return (
    <DataContext.Provider value={{
      members, organizers, affiliates, grandChancellors, users, contentPages, timelineEvents,
      addMember, updateMember, deleteMember,
      addOrganizer, updateOrganizer, deleteOrganizer,
      addAffiliate, updateAffiliate, deleteAffiliate,
      addChancellor, updateChancellor, deleteChancellor,
      addUser, updateUser, deleteUser,
      updatePageContent,
      addTimelineEvent, deleteTimelineEvent
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