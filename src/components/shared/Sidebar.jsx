import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Book, Users, Settings, Folder, Layers, BookOpen, X } from 'lucide-react';

function Sidebar({ open = false, onClose }) {
  const { pathname } = useLocation();

  const isActive = (path) => pathname === path;

  return (
    <>
      <aside className="hidden md:flex w-72 overflow-y-auto border-r border-gray-100 bg-white flex-col h-screen sticky top-0 shadow-sm">
        <div className="px-6 py-8 flex items-center gap-3 border-b border-gray-100">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
            <BookOpen className="text-white" size={26} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Idea Foundation</h2>
            <p className="text-[10px] text-gray-400 -mt-1">BOOK STORE</p>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          <SidebarLink to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" active={isActive('/dashboard')} />
          <SidebarLink to="/dashboard/books" icon={<Book size={20} />} label="Books" active={isActive('/dashboard/books')} />
          <SidebarLink to="/dashboard/authors" icon={<Users size={20} />} label="Authors" active={isActive('/dashboard/authors')} />
          <SidebarLink to="/dashboard/users" icon={<Users size={20} />} label="Users" active={isActive('/dashboard/users')} />
          <SidebarLink to="/dashboard/categories" icon={<Folder size={20} />} label="Categories" active={isActive('/dashboard/categories')} />
          <SidebarLink to="/dashboard/subcategories" icon={<Layers size={20} />} label="Subcategories" active={isActive('/dashboard/subcategories')} />
          <div className="pt-4 mt-4 border-t border-gray-100">
            <SidebarLink to="/dashboard/settings" icon={<Settings size={20} />} label="Settings" active={isActive('/dashboard/settings')} />
          </div>
        </nav>
      </aside>
      <div className={`md:hidden ${open ? 'fixed inset-0 z-50' : 'hidden'}`}>
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-2xl flex flex-col">
          <div className="px-4 py-4 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <BookOpen className="text-white" size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-gray-900">Idea</h2>
                <p className="text-[10px] text-gray-400 -mt-1">BOOK STORE</p>
              </div>
            </div>
            <button className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-700" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <SidebarLink to="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" active={isActive('/dashboard')} />
            <SidebarLink to="/dashboard/books" icon={<Book size={18} />} label="Books" active={isActive('/dashboard/books')} />
            <SidebarLink to="/dashboard/authors" icon={<Users size={18} />} label="Authors" active={isActive('/dashboard/authors')} />
            <SidebarLink to="/dashboard/users" icon={<Users size={18} />} label="Users" active={isActive('/dashboard/users')} />
            <SidebarLink to="/dashboard/categories" icon={<Folder size={18} />} label="Categories" active={isActive('/dashboard/categories')} />
            <SidebarLink to="/dashboard/subcategories" icon={<Layers size={18} />} label="Subcategories" active={isActive('/dashboard/subcategories')} />
            <div className="pt-3 mt-3 border-t border-gray-100">
              <SidebarLink to="/dashboard/settings" icon={<Settings size={18} />} label="Settings" active={isActive('/dashboard/settings')} />
            </div>
          </nav>
        </aside>
      </div>
    </>
  );
}

// Reusable Link Component
function SidebarLink({ to, icon, label, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all duration-200 group
        ${active 
          ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
        }`}
    >
      <span className={active ? 'text-white' : 'text-gray-400 group-hover:text-primary'}>
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}

export default Sidebar;
