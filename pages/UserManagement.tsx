import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { User, UserRole } from '../types';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Edit2, Trash2, Plus, Shield, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const UserManagement: React.FC = () => {
  const { users, addUser, updateUser, deleteUser } = useData();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});

  // Security check - just in case
  if (currentUser?.role !== UserRole.ADMIN) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <Shield size={48} className="mb-4 text-slate-300" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p>You do not have permission to view this page.</p>
        <Button className="mt-4" onClick={() => navigate('/')}>Return to Dashboard</Button>
      </div>
    );
  }

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditItem(user);
      // Don't populate password on edit for security visual
      setFormData({ ...user, password: '' }); 
    } else {
      setEditItem(null);
      setFormData({ role: UserRole.GUEST, status: 'active' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editItem) {
      // If password field is empty during edit, don't update it
      const dataToUpdate = { ...formData };
      if (!dataToUpdate.password) {
        delete dataToUpdate.password;
      }
      updateUser(editItem.id, dataToUpdate);
    } else {
      if (!formData.password) {
        alert("Password is required for new users.");
        return;
      }
      addUser(formData as any);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
          <Shield className="text-amber-500" /> User Management
        </h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={18} className="mr-2" /> Add User
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-900">{u.name}</td>
                  <td className="p-4 text-slate-600 font-mono">{u.email}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      u.role === UserRole.ADMIN 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">
                     <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      u.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {u.status === 'active' ? <CheckCircle size={12}/> : <XCircle size={12}/>}
                      {u.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => handleOpenModal(u)} 
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit User"
                      >
                        <Edit2 size={16} />
                      </button>
                      
                      {currentUser?.id !== u.id && (
                        <button 
                          onClick={() => deleteUser(u.id)} 
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editItem ? 'Edit User' : 'Add New User'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Full Name" 
            required 
            value={formData.name || ''} 
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
          <Input 
            label="Email Address" 
            type="email"
            required 
            value={formData.email || ''} 
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="Role" 
              options={[
                { label: 'Admin', value: UserRole.ADMIN }, 
                { label: 'Guest', value: UserRole.GUEST }
              ]}
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
            />
            <Select 
              label="Status" 
              options={[
                { label: 'Active', value: 'active' }, 
                { label: 'Inactive', value: 'inactive' }
              ]}
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value as 'active' | 'inactive'})}
            />
          </div>
          
          <div className="border-t pt-4 mt-2">
            <Input 
              label={editItem ? "New Password (leave blank to keep current)" : "Password"} 
              type="password"
              placeholder={editItem ? "••••••••" : "Enter password"}
              value={formData.password || ''} 
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editItem ? 'Update User' : 'Create User'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};