import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { GrandChancellor, UserRole } from '../types';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Edit2, Trash2, Plus, Award } from 'lucide-react';

export const GrandChancellors: React.FC = () => {
  const { grandChancellors, addChancellor, updateChancellor, deleteChancellor } = useData();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'GC' | 'GLC'>('GC');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<GrandChancellor | null>(null);
  const [formData, setFormData] = useState<Partial<GrandChancellor>>({});

  const isAdmin = user?.role === UserRole.ADMIN;

  const filteredData = grandChancellors.filter(c => c.type === activeTab);

  const handleOpenModal = (item?: GrandChancellor) => {
    if (item) {
      setEditItem(item);
      setFormData(item);
    } else {
      setEditItem(null);
      setFormData({ type: activeTab });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) {
      updateChancellor(editItem.id, formData);
    } else {
      addChancellor(formData as any);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-900">Roll of Honors</h1>
        {isAdmin && (
          <Button onClick={() => handleOpenModal()}>
            <Plus size={18} className="mr-2" /> Add Entry
          </Button>
        )}
      </div>

       <div className="flex space-x-2 border-b border-slate-200">
          <button 
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'GC' ? 'border-blue-800 text-blue-800' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('GC')}
          >
            Grand Chancellors
          </button>
          <button 
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'GLC' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('GLC')}
          >
            Grand-Lady Chancellors
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((item) => (
            <div key={item.id} className="bg-white rounded-lg p-6 shadow-sm border border-slate-100 relative group overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${activeTab === 'GC' ? 'bg-blue-800' : 'bg-amber-500'}`}></div>
              <div className="flex justify-between items-start">
                <div>
                   <div className="flex items-center gap-2 mb-2">
                     <Award className={`w-5 h-5 ${activeTab === 'GC' ? 'text-blue-800' : 'text-amber-500'}`} />
                     <span className="font-bold text-slate-900 text-lg">{item.year}</span>
                   </div>
                   <h3 className="text-xl font-medium text-slate-800">{item.firstName} {item.lastName}</h3>
                   <p className="text-slate-500">{item.term}</p>
                </div>
                {isAdmin && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(item)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                    <button onClick={() => deleteChancellor(item.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {filteredData.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 italic">
              No records found for this roll.
            </div>
          )}
        </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editItem ? 'Edit Entry' : `Add to Roll of ${activeTab === 'GC' ? 'Grand Chancellors' : 'Lady Chancellors'}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <Input 
              label="First Name" 
              required 
              value={formData.firstName || ''} 
              onChange={e => setFormData({...formData, firstName: e.target.value})}
            />
            <Input 
              label="Last Name" 
              required 
              value={formData.lastName || ''} 
              onChange={e => setFormData({...formData, lastName: e.target.value})}
            />
          </div>
          <Input 
              label="Middle Name" 
              value={formData.middleName || ''} 
              onChange={e => setFormData({...formData, middleName: e.target.value})}
            />
          <div className="grid grid-cols-2 gap-4">
             <Input 
              label="Year" 
              required 
              value={formData.year || ''} 
              onChange={e => setFormData({...formData, year: e.target.value})}
            />
            <Input 
              label="Term" 
              placeholder="e.g. 1st Semester"
              value={formData.term || ''} 
              onChange={e => setFormData({...formData, term: e.target.value})}
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editItem ? 'Update' : 'Add'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};