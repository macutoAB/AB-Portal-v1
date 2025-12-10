import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Button } from '../components/ui/Button';
import { Target, Users, Heart, Globe, Edit2, Save, X } from 'lucide-react';

export const AboutUs: React.FC = () => {
  const { contentPages, updatePageContent } = useData();
  const { user } = useAuth();
  
  const pageId = 'about';
  const pageData = contentPages.find(p => p.id === pageId);
  const content = pageData?.content || '';

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
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header & Intro Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">About Us</h1>
          {isAdmin && !isEditing && (
             <Button onClick={handleEdit} variant="ghost" size="sm" className="text-slate-400 hover:text-blue-600">
               <Edit2 size={16} className="mr-2"/> Edit Intro
             </Button>
          )}
        </div>

        {isEditing ? (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200">
             <textarea
              className="w-full h-32 p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-800 focus:border-transparent resize-y"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
            />
            <div className="flex justify-end space-x-2 mt-3">
              <Button onClick={handleCancel} variant="secondary" size="sm">Cancel</Button>
              <Button onClick={handleSave} size="sm">Save</Button>
            </div>
          </div>
        ) : (
          <p className="text-slate-600 text-lg leading-relaxed max-w-3xl">
            {content || "No description available."}
          </p>
        )}
      </div>

      {/* Principles Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Leadership */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-800">
            <Target size={32} strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Leadership</h3>
          <p className="text-slate-500 leading-relaxed">
            We develop leaders who are effective, efficient, and ethical, ready to guide their communities towards a better future.
          </p>
        </div>

        {/* Friendship */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-6 text-amber-500">
            <Users size={32} strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Friendship</h3>
          <p className="text-slate-500 leading-relaxed">
            We foster a brotherhood and sisterhood that transcends time, distance, and differences, creating lifelong bonds.
          </p>
        </div>

        {/* Service */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-500">
            <Heart size={32} strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Service</h3>
          <p className="text-slate-500 leading-relaxed">
            We are dedicated to a program of service to the campus, to the community, to the nation, and to the fraternity.
          </p>
        </div>
      </div>

      {/* Mission Banner */}
      <div className="relative bg-blue-950 rounded-2xl p-8 md:p-12 overflow-hidden shadow-lg">
        {/* Background Graphic */}
        <div className="absolute -right-10 -bottom-20 text-blue-900 opacity-20 pointer-events-none">
          <Globe size={300} strokeWidth={0.5} />
        </div>
        
        <div className="relative z-10 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Our Mission</h2>
          <p className="text-blue-100 text-lg leading-relaxed">
            To prepare campus and community leaders through service. We strive to be the premier service-based
            leadership development organization, providing a welcoming environment for all students to grow and serve
            together.
          </p>
        </div>
      </div>
    </div>
  );
};