import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { UserRole } from '../types';
import { Button } from './ui/Button';
import { Edit2, Save, X } from 'lucide-react';

interface EditableContentProps {
  pageId: string;
  defaultTitle: string;
}

export const EditableContent: React.FC<EditableContentProps> = ({ pageId, defaultTitle }) => {
  const { contentPages, updatePageContent } = useData();
  const { user } = useAuth();
  
  const pageData = contentPages.find(p => p.id === pageId);
  const content = pageData?.content || '';
  const lastUpdated = pageData?.lastUpdated;

  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  const isAdmin = user?.role === UserRole.ADMIN;

  const handleEdit = () => {
    setEditedContent(content);
    setIsEditing(true);
  };

  const handleSave = () => {
    updatePageContent(pageId, editedContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedContent(content);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">{pageData?.title || defaultTitle}</h1>
          {lastUpdated && (
            <p className="text-sm text-slate-400 mt-1">
              Last updated: {new Date(lastUpdated).toLocaleDateString()}
            </p>
          )}
        </div>
        
        {isAdmin && !isEditing && (
          <Button onClick={handleEdit} variant="secondary" className="flex items-center gap-2">
            <Edit2 size={16} /> Edit Content
          </Button>
        )}
        
        {isAdmin && isEditing && (
          <div className="flex gap-2">
            <Button onClick={handleCancel} variant="secondary" className="flex items-center gap-2">
              <X size={16} /> Cancel
            </Button>
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save size={16} /> Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 min-h-[400px]">
        {isEditing ? (
          <textarea
            className="w-full h-[600px] p-4 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-800 focus:border-transparent resize-y font-sans text-base leading-relaxed"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            placeholder="Enter content here..."
          />
        ) : (
          <div className="prose prose-slate max-w-none prose-headings:text-blue-900 prose-a:text-blue-700">
            {content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-slate-700 leading-relaxed whitespace-pre-line">
                {paragraph}
              </p>
            ))}
            {!content && (
              <p className="text-slate-400 italic text-center py-12">
                No content available. {isAdmin ? 'Click Edit to add content.' : ''}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};