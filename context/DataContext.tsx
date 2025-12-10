import React, { createContext, useContext, useState, useEffect, ReactNode, PropsWithChildren } from 'react';
import { Member, Organizer, Affiliate, GrandChancellor, User, UserRole, ContentPage, TimelineEvent } from '../types';
import { MOCK_MEMBERS, MOCK_ORGANIZERS, MOCK_AFFILIATES, MOCK_CHANCELLORS, MOCK_USERS, MOCK_CONTENT, MOCK_TIMELINE } from '../services/mockData';
import { useAuth } from './AuthContext';

interface DataContextType {
  members: Member[];
  organizers: Organizer[];
  affiliates: Affiliate[];
  grandChancellors: GrandChancellor[];
  users: User[];
  contentPages: ContentPage[];
  timelineEvents: TimelineEvent[];
  
  addMember: (data: Omit<Member, 'id' | 'dateCreated' | 'dateUpdated'>) => void;
  updateMember: (id: string, data: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  
  addOrganizer: (data: Omit<Organizer, 'id' | 'dateCreated' | 'dateUpdated'>) => void;
  updateOrganizer: (id: string, data: Partial<Organizer>) => void;
  deleteOrganizer: (id: string) => void;
  
  addAffiliate: (data: Omit<Affiliate, 'id' | 'dateCreated' | 'dateUpdated'>) => void;
  updateAffiliate: (id: string, data: Partial<Affiliate>) => void;
  deleteAffiliate: (id: string) => void;
  
  addChancellor: (data: Omit<GrandChancellor, 'id' | 'dateCreated' | 'dateUpdated'>) => void;
  updateChancellor: (id: string, data: Partial<GrandChancellor>) => void;
  deleteChancellor: (id: string) => void;

  addUser: (data: Omit<User, 'id'>) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;

  updatePageContent: (id: string, content: string) => void;

  addTimelineEvent: (data: Omit<TimelineEvent, 'id' | 'dateCreated'>) => void;
  deleteTimelineEvent: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: PropsWithChildren) => {
  const { user: currentUser } = useAuth();
  
  // Initialize with Mock Data if localStorage is empty
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('apo_members');
    return saved ? JSON.parse(saved) : MOCK_MEMBERS;
  });

  const [organizers, setOrganizers] = useState<Organizer[]>(() => {
    const saved = localStorage.getItem('apo_organizers');
    return saved ? JSON.parse(saved) : MOCK_ORGANIZERS;
  });

  const [affiliates, setAffiliates] = useState<Affiliate[]>(() => {
    const saved = localStorage.getItem('apo_affiliates');
    return saved ? JSON.parse(saved) : MOCK_AFFILIATES;
  });

  const [grandChancellors, setGrandChancellors] = useState<GrandChancellor[]>(() => {
    const saved = localStorage.getItem('apo_chancellors');
    return saved ? JSON.parse(saved) : MOCK_CHANCELLORS;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('apo_users_db');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [contentPages, setContentPages] = useState<ContentPage[]>(() => {
    const saved = localStorage.getItem('apo_content_pages');
    return saved ? JSON.parse(saved) : MOCK_CONTENT;
  });

  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(() => {
    const saved = localStorage.getItem('apo_timeline');
    return saved ? JSON.parse(saved) : MOCK_TIMELINE;
  });

  // Persistence Effects
  useEffect(() => localStorage.setItem('apo_members', JSON.stringify(members)), [members]);
  useEffect(() => localStorage.setItem('apo_organizers', JSON.stringify(organizers)), [organizers]);
  useEffect(() => localStorage.setItem('apo_affiliates', JSON.stringify(affiliates)), [affiliates]);
  useEffect(() => localStorage.setItem('apo_chancellors', JSON.stringify(grandChancellors)), [grandChancellors]);
  useEffect(() => localStorage.setItem('apo_users_db', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('apo_content_pages', JSON.stringify(contentPages)), [contentPages]);
  useEffect(() => localStorage.setItem('apo_timeline', JSON.stringify(timelineEvents)), [timelineEvents]);

  // Generic helper to check permission
  const checkPermission = () => {
    if (currentUser?.role !== UserRole.ADMIN) {
      throw new Error("Unauthorized: Admins only");
    }
  };

  // CRUD Implementations for Members
  const addMember = (data: Omit<Member, 'id' | 'dateCreated' | 'dateUpdated'>) => {
    checkPermission();
    const newMember: Member = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      dateCreated: new Date().toISOString(),
      dateUpdated: new Date().toISOString(),
    };
    setMembers(prev => [...prev, newMember]);
  };

  const updateMember = (id: string, data: Partial<Member>) => {
    checkPermission();
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...data, dateUpdated: new Date().toISOString() } : m));
  };

  const deleteMember = (id: string) => {
    checkPermission();
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  // CRUD for Organizers
  const addOrganizer = (data: Omit<Organizer, 'id' | 'dateCreated' | 'dateUpdated'>) => {
    checkPermission();
    const newItem: Organizer = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      dateCreated: new Date().toISOString(),
      dateUpdated: new Date().toISOString(),
    };
    setOrganizers(prev => [...prev, newItem]);
  };

  const updateOrganizer = (id: string, data: Partial<Organizer>) => {
    checkPermission();
    setOrganizers(prev => prev.map(m => m.id === id ? { ...m, ...data, dateUpdated: new Date().toISOString() } : m));
  };

  const deleteOrganizer = (id: string) => {
    checkPermission();
    setOrganizers(prev => prev.filter(m => m.id !== id));
  };

  // CRUD for Affiliates
  const addAffiliate = (data: Omit<Affiliate, 'id' | 'dateCreated' | 'dateUpdated'>) => {
    checkPermission();
    const newItem: Affiliate = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      dateCreated: new Date().toISOString(),
      dateUpdated: new Date().toISOString(),
    };
    setAffiliates(prev => [...prev, newItem]);
  };

  const updateAffiliate = (id: string, data: Partial<Affiliate>) => {
    checkPermission();
    setAffiliates(prev => prev.map(m => m.id === id ? { ...m, ...data, dateUpdated: new Date().toISOString() } : m));
  };

  const deleteAffiliate = (id: string) => {
    checkPermission();
    setAffiliates(prev => prev.filter(m => m.id !== id));
  };

  // CRUD for Chancellors
  const addChancellor = (data: Omit<GrandChancellor, 'id' | 'dateCreated' | 'dateUpdated'>) => {
    checkPermission();
    const newItem: GrandChancellor = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      dateCreated: new Date().toISOString(),
      dateUpdated: new Date().toISOString(),
    };
    setGrandChancellors(prev => [...prev, newItem]);
  };

  const updateChancellor = (id: string, data: Partial<GrandChancellor>) => {
    checkPermission();
    setGrandChancellors(prev => prev.map(m => m.id === id ? { ...m, ...data, dateUpdated: new Date().toISOString() } : m));
  };

  const deleteChancellor = (id: string) => {
    checkPermission();
    setGrandChancellors(prev => prev.filter(m => m.id !== id));
  };

  // CRUD for Users
  const addUser = (data: Omit<User, 'id'>) => {
    checkPermission();
    const newUser: User = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, data: Partial<User>) => {
    checkPermission();
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
  };

  const deleteUser = (id: string) => {
    checkPermission();
    if (currentUser?.id === id) {
      alert("You cannot delete your own account.");
      return;
    }
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  // Content Management
  const updatePageContent = (id: string, content: string) => {
    checkPermission();
    setContentPages(prev => prev.map(p => 
      p.id === id ? { ...p, content, lastUpdated: new Date().toISOString() } : p
    ));
  };

  // Timeline Management
  const addTimelineEvent = (data: Omit<TimelineEvent, 'id' | 'dateCreated'>) => {
    checkPermission();
    const newEvent: TimelineEvent = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      dateCreated: new Date().toISOString(),
    };
    // Sort logic handled in render, but could sort here if desired.
    setTimelineEvents(prev => [...prev, newEvent]);
  };

  const deleteTimelineEvent = (id: string) => {
    checkPermission();
    setTimelineEvents(prev => prev.filter(t => t.id !== id));
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