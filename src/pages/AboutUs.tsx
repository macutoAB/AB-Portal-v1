import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Button } from '../components/ui/Button';
import { Target, Users, Heart, Globe, Edit2, Save, X, Eye } from 'lucide-react';

// Helper Component for Individual Editable Sections
interface EditableBlockProps {
  id: string;
  defaultContent: string;
  renderView: (content: string) => React.ReactNode;
  renderEdit?: (content: string, setContent: (val: string) => void) => React.ReactNode;
}

const EditableBlock: React.FC<EditableBlockProps> = ({ id, defaultContent, renderView, renderEdit }) => {
  const { contentPages, updatePageContent } = useData();
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;

  const pageData = contentPages.find(p => p.id === id);
  // Fallback to defaultContent if the database entry is empty or missing content
  const content = (pageData?.content && pageData.content.trim() !== '') ? pageData.content : defaultContent;
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempContent, setTempContent] = useState(content);

  const handleEdit = () => {
    setTempContent(content);
    setIsEditing(true);
  };

  const handleSave = () => {
    updatePageContent(id, tempContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempContent(content);
    setIsEditing(false);
  };

  return (
    <div className="relative group">
      {/* Edit Button Overlay for Admin */}
      {isAdmin && !isEditing && (
        <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button onClick={handleEdit} variant="secondary" size="sm" className="shadow-sm border-blue-200">
            <Edit2 size={14} className="mr-1"/> Edit
          </Button>
        </div>
      )}

      {isEditing ? (
        <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-blue-200 animate-in fade-in zoom-in-95 duration-200 relative z-30">
          {renderEdit ? (
            renderEdit(tempContent, setTempContent)
          ) : (
             <textarea
              className="w-full h-32 p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-800 focus:border-transparent resize-y text-sm"
              value={tempContent}
              onChange={(e) => setTempContent(e.target.value)}
            />
          )}
          <div className="flex justify-end space-x-2 mt-3">
            <Button onClick={handleCancel} variant="secondary" size="sm"><X size={14} className="mr-1"/> Cancel</Button>
            <Button onClick={handleSave} size="sm"><Save size={14} className="mr-1"/> Save</Button>
          </div>
        </div>
      ) : (
        renderView(content)
      )}
    </div>
  );
};

export const AboutUs: React.FC = () => {
  return (
    <div className="space-y-12 max-w-6xl mx-auto pb-12">
      
      {/* 1. Header & Intro Section */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-slate-900">About Us</h1>
        <EditableBlock 
          id="about_intro" 
          defaultContent="Alpha Phi Omega is a national coeducational service fraternity founded on the cardinal principles of Leadership, Friendship, and Service."
          renderView={(text) => (
             <p className="text-slate-600 text-lg leading-relaxed max-w-3xl whitespace-pre-line border border-transparent rounded-lg p-2 -ml-2">
               {text}
             </p>
          )}
        />
      </div>

      {/* 2. Principles Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Leadership */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow relative">
           <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-800">
            <Target size={32} strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Leadership</h3>
          <EditableBlock 
            id="about_leadership"
            defaultContent="We develop leaders who are effective, efficient, and ethical, ready to guide their communities towards a better future."
            renderView={(text) => <p className="text-slate-500 leading-relaxed">{text}</p>}
          />
        </div>

        {/* Friendship */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow relative">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-6 text-amber-500">
            <Users size={32} strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Friendship</h3>
          <EditableBlock 
            id="about_friendship"
            defaultContent="We foster a brotherhood and sisterhood that transcends time, distance, and differences, creating lifelong bonds."
            renderView={(text) => <p className="text-slate-500 leading-relaxed">{text}</p>}
          />
        </div>

        {/* Service */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow relative">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-500">
            <Heart size={32} strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Service</h3>
          <EditableBlock 
            id="about_service"
            defaultContent="We are dedicated to a program of service to the campus, to the community, to the nation, and to the fraternity."
            renderView={(text) => <p className="text-slate-500 leading-relaxed">{text}</p>}
          />
        </div>
      </div>

      {/* 3. Mission Banner */}
      <EditableBlock 
        id="about_mission"
        defaultContent="To prepare campus and community leaders through service. We strive to be the premier service-based leadership development organization, providing a welcoming environment for all students to grow and serve together."
        renderView={(text) => (
          <div className="relative bg-blue-950 rounded-2xl p-8 md:p-12 overflow-hidden shadow-lg">
            {/* Background Graphic */}
            <div className="absolute -right-10 -bottom-20 text-blue-900 opacity-20 pointer-events-none">
              <Globe size={300} strokeWidth={0.5} />
            </div>
            
            <div className="relative z-10 max-w-3xl">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-blue-100 text-lg leading-relaxed whitespace-pre-line">
                {text}
              </p>
            </div>
          </div>
        )}
      />

      {/* 4. Vision Section (New) */}
      <EditableBlock 
        id="about_vision"
        defaultContent="To be the premier, inclusive, campus-based, leadership development organization through the provision of service to others and the creation of community."
        renderView={(text) => (
          <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-xl p-8 md:p-10 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <Eye size={120} className="text-amber-600"/>
             </div>
             <div className="relative z-10">
                <h2 className="text-2xl font-bold text-slate-800 mb-3 flex items-center gap-3">
                  <span className="text-amber-600">Our Vision</span>
                </h2>
                <p className="text-slate-700 text-lg leading-relaxed max-w-4xl italic">
                  "{text}"
                </p>
             </div>
          </div>
        )}
      />
    </div>
  );
};