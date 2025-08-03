import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications"],
  });

  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleAddUser = () => {
    // TODO: Implement add user functionality
    console.log('Add user clicked');
  };

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <button className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <i className="fas fa-bars text-lg"></i>
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
            <p className="text-sm text-slate-500">{currentDate}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative hidden sm:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-search text-slate-400"></i>
            </div>
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-80 pl-10 bg-slate-50 border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="Cari user, dokumen, atau aktivitas..."
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-2xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <i className="fas fa-bell text-lg"></i>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 block h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Quick Actions */}
          <Button
            onClick={handleAddUser}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <i className="fas fa-plus"></i>
            <span className="hidden sm:inline">Tambah User</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
