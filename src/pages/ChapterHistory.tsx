import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { UserRole, TimelineEvent } from '../types';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { History, Plus, Trash2, Calendar, Shield, Flag } from 'lucide-react';

export const ChapterHistory: React.FC = () => {
  const { timelineEvents, addTimelineEvent, deleteTimelineEvent } = useData();
  const { user } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<TimelineEvent>>({
    category: 'Fraternity'
  });

  const isAdmin = user?.role === UserRole.ADMIN;

  // Sort events by year (and then date roughly if possible, but basic string sort for now)
  const sortedEvents = [...timelineEvents].sort((a, b) => parseInt(a.year) - parseInt(b.year));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.year && formData.title && formData.description) {
      addTimelineEvent({
        year: formData.year,
        date: formData.date || formData.year,
        title: formData.title,
        description: formData.description,
        category: formData.category as 'Fraternity' | 'Sorority'
      });
      setIsModalOpen(false);
      setFormData({ category: 'Fraternity' });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <History size={28} className="text-amber-500" />
          <div>
            <h1 className="text-2xl font-bold text-blue-900">Chapter History</h1>
            <p className="text-slate-500 text-sm">A timeline of our legacy</p>
          </div>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={18} className="mr-2" /> Add Event
          </Button>
        )}
      </div>

      <div className="relative container mx-auto px-4 py-8">
        {/* Vertical Center Line */}
        <div className="absolute left-4 md:left-1/2 top-0 h-full w-0.5 bg-slate-200 transform -translate-x-1/2"></div>

        <div className="space-y-12">
          {sortedEvents.map((event, index) => {
            const isLeft = index % 2 === 0;
            const isFrat = event.category === 'Fraternity';
            const themeColor = isFrat ? 'border-blue-800' : 'border-amber-500';
            const iconColor = isFrat ? 'bg-blue-800' : 'bg-amber-500';
            const textColor = isFrat ? 'text-blue-900' : 'text-amber-700';

            return (
              <div key={event.id} className={`relative flex flex-col md:flex-row items-center ${isLeft ? 'md:flex-row-reverse' : ''}`}>
                
                {/* Content Card */}
                <div className="w-full md:w-5/12 ml-8 md:ml-0 md:px-6">
                  <div className={`bg-white p-6 rounded-lg shadow-md border-t-4 ${themeColor} relative hover:shadow-lg transition-shadow`}>
                    
                    {/* Date Badge */}
                    <div className="flex items-center justify-between mb-2">
                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${isFrat ? 'bg-blue-50 text-blue-800' : 'bg-amber-50 text-amber-700'}`}>
                         <Calendar size={12} className="mr-1"/> {event.date}
                       </span>
                       {isAdmin && (
                        <button 
                          onClick={() => deleteTimelineEvent(event.id)} 
                          className="text-slate-400 hover:text-red-500 transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 size={16} />
                        </button>
                       )}
                    </div>
                    
                    <h3 className={`text-xl font-bold ${textColor} mb-2`}>{event.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">
                      {event.description}
                    </p>
                    
                    {/* Category Tag */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                       {isFrat ? <Shield size={14} className="text-blue-400"/> : <Flag size={14} className="text-amber-400"/>}
                       <span className="text-xs font-medium text-slate-400">{event.category} History</span>
                    </div>

                    {/* Arrow for Desktop */}
                    <div className={`hidden md:block absolute top-6 w-3 h-3 bg-white border-t border-r border-slate-100 rotate-45 transform ${isLeft ? '-right-1.5 border-none shadow-sm' : '-left-1.5 border-none shadow-sm'}`}></div>
                  </div>
                </div>

                {/* Timeline Dot */}
                <div className={`absolute left-4 md:left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 ${iconColor}`}>
                   <span className="text-[10px] font-bold text-white">{event.year.slice(2)}</span>
                </div>

                {/* Empty Space for balancing */}
                <div className="w-full md:w-5/12"></div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add Historical Event"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Year" 
              required
              placeholder="1963"
              value={formData.year || ''} 
              onChange={e => setFormData({...formData, year: e.target.value})}
            />
            <Input 
              label="Specific Date" 
              placeholder="e.g. April 22, 1963"
              value={formData.date || ''} 
              onChange={e => setFormData({...formData, date: e.target.value})}
            />
          </div>
          
          <Input 
            label="Event Title" 
            required
            value={formData.title || ''} 
            onChange={e => setFormData({...formData, title: e.target.value})}
          />
          
          <Select 
            label="Category"
            options={[
              { label: 'Fraternity', value: 'Fraternity' },
              { label: 'Sorority', value: 'Sorority' }
            ]}
            value={formData.category}
            onChange={e => setFormData({...formData, category: e.target.value as 'Fraternity' | 'Sorority'})}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              className="w-full h-32 p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-800 focus:border-transparent text-sm resize-none"
              required
              value={formData.description || ''}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Describe the historical event..."
            />
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Add to Timeline</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};