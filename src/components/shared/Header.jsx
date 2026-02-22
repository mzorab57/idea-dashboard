import { useAuthStore } from '../../store/authStore';
import { LogOut, User, Bell } from 'lucide-react';

function Header({ user }) {
  const logout = useAuthStore((s) => s.logout);

  return (
    <header className="sticky top-0 z-50 h-20 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-xl shadow-gray-200/50 px-6 flex items-center justify-between transition-all duration-200">
      {/* Left: Logo/Brand */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg shadow-primary/30">
          ID
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-xs text-gray-500">Manage your platform</p>
        </div>
      </div>

      {/* Right: User Section */}
      <div className="flex items-center gap-6">


       

        {/* Logout Button */}
        <button
          onClick={logout}
          className="group relative overflow-hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-all hover:scale-105"
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-r from-red-500 to-red-600 transition-opacity" />
          <LogOut size={18} className="relative z-10" />
          <span className="relative z-10 hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
