import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Network, 
  Crown, 
  LogOut,
  X,
  Shield,
  History,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Members', path: '/members', icon: <Users size={20} /> },
    { name: 'Organizers', path: '/organizers', icon: <UserPlus size={20} /> },
    { name: 'Affiliated', path: '/affiliated', icon: <Network size={20} /> },
    { name: 'Roll of GC/GLC', path: '/grand-chancellors', icon: <Crown size={20} /> },
    { name: 'Chapter History', path: '/history', icon: <History size={20} /> },
    { name: 'About Us', path: '/about', icon: <Info size={20} /> },
  ];

  if (user?.role === UserRole.ADMIN) {
    navItems.push({ name: 'User Management', path: '/users', icon: <Shield size={20} /> });
  }

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-40 w-64 bg-blue-950 text-white transform transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:inset-auto shadow-xl
  `;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={sidebarClasses}>
        <div className="flex items-center justify-between p-4 h-16 bg-blue-900 border-b border-blue-800">
          <h1 className="text-xl font-bold tracking-wider text-amber-400">APO ALPHA BETA</h1>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-blue-300 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 border-b border-blue-900/50 bg-blue-900/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-lg font-bold text-blue-950 shadow-md">
              {user?.name.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-blue-50">{user?.name}</p>
              <p className="text-xs text-blue-300 uppercase tracking-wide">{user?.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-800 text-amber-400 shadow-md translate-x-1' 
                    : 'text-blue-200 hover:bg-blue-900 hover:text-white hover:translate-x-1'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-blue-900">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 py-2 w-full text-blue-300 hover:bg-red-900/30 hover:text-red-400 rounded-md transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};