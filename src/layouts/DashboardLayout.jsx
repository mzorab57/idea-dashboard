import { useAuthStore } from '../store/authStore';
import Sidebar from '../components/shared/Sidebar';
import Header from '../components/shared/Header';

function DashboardLayout({ children }) {
  const user = useAuthStore((s) => s.user);
  return (
    <div className="min-h-screen  mx-auto flex bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Header user={user} />
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;
