import { Menu, X, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

function Header({ user, onMenu, isOpen }) {
  const logout = useAuthStore((s) => s.logout);
  return (
    <header className="sticky top-0 z-50 h-20 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-xl shadow-gray-200/50 px-6 flex items-center justify-between transition-all duration-200">
      <div className="flex items-center gap-3 ">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg shadow-primary/30">
            ID
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Admin Panel</h1>
            <p className="text-xs text-gray-500">Manage your platform</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={logout}
          className="hidden md:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-colors"
          aria-label="Logout"
        >
          <LogOut size={18} />
          <span className="hidden lg:inline">Logout</span>
        </button>
        <button
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          onClick={onMenu}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>
  );
}

export default Header;
