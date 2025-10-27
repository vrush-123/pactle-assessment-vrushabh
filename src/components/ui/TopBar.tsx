// src/components/layout/TopBar.tsx
import { useAuthStore } from '../../store/authStore';
import type { Role } from '../../types';
import { useNavigate } from 'react-router-dom';

export const TopBar = () => {
  const { user, switchRole, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="flex justify-between items-center p-4 bg-white shadow-sm z-10">
      <div className="text-xl font-bold text-green-900">Pactle</div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <span>{user.name}</span>
        </div>
        
        <select
          value={user.role}
          onChange={(e) => switchRole(e.target.value as Role)}
          className="p-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="manager">Manager</option>
          <option value="sales_rep">Sales Rep</option>
          <option value="viewer">Viewer</option>
        </select>
        
        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:text-blue-600"
        >
          Log Out
        </button>
      </div>
    </header>
  );
};