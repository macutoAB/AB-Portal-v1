import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { UserRole, Gender } from '../types';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Edit2, Trash2, Plus, Network } from 'lucide-react';

export const Affiliated: React.FC = () => {
  const { affiliates, addAffiliate, updateAffiliate, deleteAffiliate } = useData();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'frat' | 'sor'>('frat');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    gender: Gender.MALE
  });

  const isAdmin = user?.role === UserRole.ADMIN;

  const filteredAffiliates = useMemo(() => {
    return affiliates.filter(a => {
      const targetGender = activeTab === 'frat' ? Gender.MALE : Gender.FEMALE;
      // Handle legacy data where gender might be undefined by defaulting to Male if null
      const itemGender = a.gender || Gender.MALE;
      return itemGender === targetGender;
    });
  }, [affiliates, activeTab]);

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditItem(item);
      setFormData(item);
    } else {
      setEditItem(null);
      setFormData({
        gender: activeTab === 'frat' ? Gender.MALE : Gender.FEMALE,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) updateAffiliate(editItem.id, formData);
    else addAffiliate(formData);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
          <Network className="text-blue-600" /> Affiliated Members
        </h1>
        {isAdmin && <Button onClick={() => handleOpenModal()}><Plus size={18} className="mr-2"/> Add Affiliate</Button>}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-slate-100 p-1 rounded-md w-fit">
        <button 
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'frat' ? 'bg-white shadow-sm text-blue-800' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('frat')}
        >
          Fraternity
        </button>
        <button 
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'sor' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('sor')}
        >
          Sorority
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Batch</th>
              <th className="p-4">School</th>
              <th className="p-4">Origin Chapter</th>
              {isAdmin && <th className="p-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAffiliates.map(a => (
              <tr key={a.id}>
                <td className="p-4 font-medium">{a.lastName}, {a.firstName}</td>
                <td className="p-4">{a.batchYear}</td>
                <td className="p-4">{a.school}</td>
                <td className="p-4 text-slate-500">{a.chapter}</td>
                {isAdmin && (
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleOpenModal(a)} className="text-blue-600"><Edit2 size={16}/></button>
                    <button onClick={() => deleteAffiliate(a.id)} className="text-red-600"><Trash2 size={16}/></button>
                  </td>
                )}
              </tr>
            ))}
            {filteredAffiliates.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-slate-400">No affiliates found for this category.</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editItem ? 'Edit Affiliate' : 'Add Affiliate'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Last Name" required value={formData.lastName || ''} onChange={e => setFormData({...formData, lastName: e.target.value})} />
            <Input label="First Name" required value={formData.firstName || ''} onChange={e => setFormData({...formData, firstName: e.target.value})} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <Input label="Batch Year" required value={formData.batchYear || ''} onChange={e => setFormData({...formData, batchYear: e.target.value})} />
             <Select 
              label="Gender" 
              options={[{label: 'Male', value: Gender.MALE}, {label: 'Female', value: Gender.FEMALE}]}
              value={formData.gender}
              onChange={e => setFormData({...formData, gender: e.target.value as Gender})}
            />
          </div>

          <Input label="School" value={formData.school || ''} onChange={e => setFormData({...formData, school: e.target.value})} />
          <Input label="Origin Chapter" required value={formData.chapter || ''} onChange={e => setFormData({...formData, chapter: e.target.value})} />
          <Input label="ID Number" value={formData.idNumber || ''} onChange={e => setFormData({...formData, idNumber: e.target.value})} />
          
          <div className="flex justify-end pt-4"><Button type="submit">Save</Button></div>
        </form>
      </Modal>
    </div>
  );
};