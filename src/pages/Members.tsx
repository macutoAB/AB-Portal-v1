import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Member, Gender, UserRole, Semester } from '../types';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Edit2, Trash2, Plus, Search } from 'lucide-react';

export const Members: React.FC = () => {
  const { members, addMember, updateMember, deleteMember } = useData();
  const { user } = useAuth();
  
  const [viewMode, setViewMode] = useState<'table' | 'batch'>('table');
  const [activeTab, setActiveTab] = useState<'frat' | 'sor'>('frat'); // Frat = Male, Sor = Female
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBatch, setFilterBatch] = useState<string>('All'); // New state for Batch Filter
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Member | null>(null);
  const [formData, setFormData] = useState<Partial<Member>>({
    gender: Gender.MALE,
    semester: Semester.A
  });

  const isAdmin = user?.role === UserRole.ADMIN;

  // Extract unique batch years for the dropdown
  const uniqueBatches = useMemo(() => {
    const years = members
      .map(m => m.batchYear)
      .filter(y => y && y.trim() !== ''); // Filter out empty values
    // Remove duplicates and sort descending (newest first)
    return Array.from(new Set(years)).sort((a: string, b: string) => {
      // Try to parse as int for correct numerical sorting, fallback to string compare
      const intA = parseInt(a);
      const intB = parseInt(b);
      if (!isNaN(intA) && !isNaN(intB)) return intB - intA;
      return b.localeCompare(a);
    });
  }, [members]);

  // Filtering & Sorting Logic
  const filteredMembers = useMemo(() => {
    let result = members.filter(m => {
      // 1. Gender Filter
      const isCorrectGender = activeTab === 'frat' ? m.gender === Gender.MALE : m.gender === Gender.FEMALE;
      
      // 2. Batch Dropdown Filter
      const matchesBatchFilter = filterBatch === 'All' || m.batchYear === filterBatch;

      // 3. Search Text Filter
      const term = searchTerm.toLowerCase();
      
      // Safety check: Ensure fields exist before calling toLowerCase() to prevent crashes on null values
      const lastName = (m.lastName || '').toLowerCase();
      const firstName = (m.firstName || '').toLowerCase();
      const batchName = (m.batchName || '').toLowerCase();
      const batchYear = (m.batchYear || '').toString();

      const matchesSearch = 
        lastName.includes(term) ||
        firstName.includes(term) ||
        batchName.includes(term) ||
        batchYear.includes(term);

      return isCorrectGender && matchesBatchFilter && matchesSearch;
    });

    // Sort by Batch Year Ascending (Oldest first)
    return result.sort((a, b) => {
      const yearA = parseInt(a.batchYear) || 0;
      const yearB = parseInt(b.batchYear) || 0;
      return yearA - yearB;
    });
  }, [members, activeTab, searchTerm, filterBatch]);

  // Group by Batch for Batch View
  const groupedByBatch = useMemo(() => {
    const groups: Record<string, Member[]> = {};
    filteredMembers.forEach(m => {
      // Handle cases where batchYear might be missing
      const year = m.batchYear || 'Unknown';
      if (!groups[year]) groups[year] = [];
      groups[year].push(m);
    });
    // Sort keys (years) Ascending (Oldest first)
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0])); 
  }, [filteredMembers]);

  const handleOpenModal = (member?: Member) => {
    if (member) {
      setEditItem(member);
      setFormData(member);
    } else {
      setEditItem(null);
      setFormData({ 
        gender: activeTab === 'frat' ? Gender.MALE : Gender.FEMALE,
        semester: Semester.A,
        chapter: 'Alpha Beta'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) {
      updateMember(editItem.id, formData);
    } else {
      addMember(formData as any);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this member?')) {
      deleteMember(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-blue-900">Members Directory</h1>
        {isAdmin && (
          <Button onClick={() => handleOpenModal()}>
            <Plus size={18} className="mr-2" /> Add Member
          </Button>
        )}
      </div>

      {/* Tabs & Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="flex space-x-2 bg-slate-100 p-1 rounded-md">
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'frat' ? 'bg-white shadow-sm text-blue-800' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => { setActiveTab('frat'); setFilterBatch('All'); }}
          >
            Fraternity
          </button>
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'sor' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => { setActiveTab('sor'); setFilterBatch('All'); }}
          >
            Sorority
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4 w-full lg:w-auto">
          {/* Batch Filter Dropdown */}
          <div className="w-full md:w-40">
            <select
              className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-800 text-sm bg-white cursor-pointer"
              value={filterBatch}
              onChange={(e) => setFilterBatch(e.target.value)}
            >
              <option value="All">All Batches</option>
              {uniqueBatches.map(year => (
                <option key={year} value={year}>Batch {year}</option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search name, batch..."
              className="w-full pl-10 pr-4 py-2 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex bg-slate-100 rounded-md p-1 self-start md:self-auto">
             <button
               onClick={() => setViewMode('table')}
               className={`px-3 py-1 text-sm rounded ${viewMode === 'table' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
             >
               List
             </button>
             <button
               onClick={() => setViewMode('batch')}
               className={`px-3 py-1 text-sm rounded ${viewMode === 'batch' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
             >
               Batch
             </button>
          </div>
        </div>
      </div>

      {/* View Content */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Batch</th>
                  <th className="p-4">ID Number</th>
                  <th className="p-4">School</th>
                  <th className="p-4">Chapter</th>
                  {isAdmin && <th className="p-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-900">
                      {m.lastName}, {m.firstName} {m.middleName}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-900 font-medium">{m.batchYear}</span>
                        {m.semester && m.semester !== Semester.NA && (
                          <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100 font-medium" title="Semester">
                            {m.semester}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 block">{m.batchName}</span>
                    </td>
                    <td className="p-4 text-slate-600 font-mono">{m.idNumber}</td>
                    <td className="p-4 text-slate-600">{m.school}</td>
                    <td className="p-4 text-slate-600">{m.chapter}</td>
                    {isAdmin && (
                      <td className="p-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button onClick={() => handleOpenModal(m)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(m.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="p-8 text-center text-slate-500">No members found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedByBatch.map(([year, batchMembers]) => (
            <div key={year} className="bg-white rounded-lg shadow-sm border border-slate-100 p-4">
               <h3 className="text-lg font-bold text-blue-900 mb-3 border-b pb-2">Batch {year} <span className="text-slate-400 text-sm font-normal">({batchMembers.length})</span></h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {batchMembers.map(m => (
                   <div key={m.id} className="p-3 border rounded-md hover:border-blue-300 transition-colors bg-slate-50">
                     <p className="font-semibold text-slate-900">{m.lastName}, {m.firstName}</p>
                     <div className="flex items-center gap-2 mt-0.5">
                       <p className="text-xs text-slate-500">{m.batchName}</p>
                       {m.semester && m.semester !== Semester.NA && (
                         <span className="text-[10px] px-1 bg-slate-100 text-slate-600 rounded border border-slate-200">
                           {m.semester}
                         </span>
                       )}
                     </div>
                     <p className="text-xs text-slate-400 mt-1">{m.idNumber}</p>
                     {isAdmin && (
                       <div className="mt-2 flex gap-2">
                          <button onClick={() => handleOpenModal(m)} className="text-xs text-blue-600 hover:underline">Edit</button>
                       </div>
                     )}
                   </div>
                 ))}
               </div>
            </div>
          ))}
          {groupedByBatch.length === 0 && (
             <div className="p-12 text-center text-slate-500 bg-white rounded-lg border border-slate-100">
                No batches found matching your filters.
             </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editItem ? 'Edit Member' : 'Add New Member'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Input 
              label="Last Name" 
              required 
              value={formData.lastName || ''} 
              onChange={e => setFormData({...formData, lastName: e.target.value})}
            />
            <Input 
              label="First Name" 
              required 
              value={formData.firstName || ''} 
              onChange={e => setFormData({...formData, firstName: e.target.value})}
            />
            <Input 
              label="M.I." 
              value={formData.middleName || ''} 
              onChange={e => setFormData({...formData, middleName: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="Gender" 
              options={[{label: 'Male', value: Gender.MALE}, {label: 'Female', value: Gender.FEMALE}]}
              value={formData.gender}
              onChange={e => setFormData({...formData, gender: e.target.value as Gender})}
            />
             <Input 
              label="School" 
              value={formData.school || ''} 
              onChange={e => setFormData({...formData, school: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Batch Year" 
              required
              value={formData.batchYear || ''} 
              onChange={e => setFormData({...formData, batchYear: e.target.value})}
            />
            <Input 
              label="Batch Name" 
              value={formData.batchName || ''} 
              onChange={e => setFormData({...formData, batchName: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="ID Number" 
              value={formData.idNumber || ''} 
              onChange={e => setFormData({...formData, idNumber: e.target.value})}
            />
             <Select 
              label="Semester" 
              options={[
                {label: 'A', value: Semester.A}, 
                {label: 'B', value: Semester.B},
                {label: 'N/A', value: Semester.NA}
              ]}
              value={formData.semester}
              onChange={e => setFormData({...formData, semester: e.target.value as Semester})}
            />
          </div>
          
          <Input 
              label="Chapter" 
              value={formData.chapter || ''} 
              onChange={e => setFormData({...formData, chapter: e.target.value})}
          />

          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editItem ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};