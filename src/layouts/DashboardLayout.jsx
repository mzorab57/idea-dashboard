import React from 'react';
import { useAuthStore } from '../store/authStore';
import Sidebar from '../components/shared/Sidebar';
import Header from '../components/shared/Header';

function DashboardLayout({ children }) {
  const user = useAuthStore((s) => s.user);
  const hydrate = useAuthStore((s) => s.hydrate);
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => { hydrate(); }, [hydrate]);
  return (
    <div className="min-h-screen mx-auto flex  bg-gray-50">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex-1 overflow-hidden">
        <Header user={user} isOpen={open} onMenu={() => setOpen((v) => !v)} />
        <main className="">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;
