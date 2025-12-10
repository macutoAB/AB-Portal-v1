import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Edit2, Trash2, Plus, Building2 } from 'lucide-react';

export const Organizers: React.FC = () => {
  const { organizers, addOrganizer, updateOrganizer, deleteOrganizer } = useData();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const isAdmin = user?.role === UserRole.ADMIN;

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditItem(item);
      setFormData(item);
    } else {
      setEditItem(null);
      setFormData({});
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) updateOrganizer(editItem.id, formData);
    else addOrganizer(formData);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
          <Building2 className="text-amber-500" /> Organizers
        </h1>
        {isAdmin && <Button onClick={() => handleOpenModal()}><Plus size={18} className="mr-2"/> Add Organizer</Button>}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Batch</th>
              <th className="p-4">School</th>
              <th className="p-4">ID Number</th>
              {isAdmin && <th className="p-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {organizers.map(o => (
              <tr key={o.id}>
                <td className="p-4 font-medium">{o.lastName}, {o.firstName}</td>
                <td className="p-4">{o.batchYear}</td>
                <td className="p-4">{o.school}</td>
                <td className="p-4 text-slate-500">{o.idNumber}</td>
                {isAdmin && (
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleOpenModal(o)} className="text-blue-600"><Edit2 size={16}/></button>
                    <button onClick={() => deleteOrganizer(o.id)} className="text-red-600"><Trash2 size={16}/></button>
                  </td>
                )}
              </tr>
            ))}
             {organizers.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-slate-400">No organizers listed.</td></tr>}
          </tbody>
        </table>
      </div>
      
      {/* Simple Reuse of Modal logic for brevity, in real app abstract Form */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editItem ? 'Edit Organizer' : 'Add Organizer'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Last Name" required value={formData.lastName || ''} onChange={e => setFormData({...formData, lastName: e.target.value})} />
            <Input label="First Name" required value={formData.firstName || ''} onChange={e => setFormData({...formData, firstName: e.target.value})} />
          </div>
          <Input label="Batch Year" required value={formData.batchYear || ''} onChange={e => setFormData({...formData, batchYear: e.target.value})} />
          <Input label="School" value={formData.school || ''} onChange={e => setFormData({...formData, school: e.target.value})} />
          <Input label="ID Number" value={formData.idNumber || ''} onChange={e => setFormData({...formData, idNumber: e.target.value})} />
          <Input label="Chapter" value={formData.chapter || ''} onChange={e => setFormData({...formData, chapter: e.target.value})} />
          <div className="flex justify-end pt-4"><Button type="submit">Save</Button></div>
        </form>
      </Modal>
    </div>
  );
};