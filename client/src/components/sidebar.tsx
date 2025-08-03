import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const menuItems = [
    { path: "/", icon: "fas fa-chart-pie", label: "Dashboard", badge: null },
    { path: "/users", icon: "fas fa-users", label: "Manajemen User", badge: stats?.totalUsers },
    { path: "/activities", icon: "fas fa-chart-line", label: "Monitoring Aktivitas", badge: null },
    { path: "/documents", icon: "fas fa-file-alt", label: "Dokumen", badge: stats?.pendingDocs },
    { path: "/notifications", icon: "fas fa-bell", label: "Notifikasi", badge: 5 },
    { path: "/reports", icon: "fas fa-chart-bar", label: "Laporan", badge: null },
  ];

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r border-slate-200 shadow-lg">
        {/* Logo Section */}
        <div className="flex items-center flex-shrink-0 px-6 mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <i className="fas fa-users text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">DataKependudukan</h1>
              <p className="text-xs text-slate-500">Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <a
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-2xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <i className={`${item.icon} mr-3 ${isActive ? "text-blue-500" : "text-slate-400 group-hover:text-slate-600"}`}></i>
                  {item.label}
                  {item.badge && (
                    <span className={`ml-auto text-xs font-medium px-2 py-1 rounded-full ${
                      item.path === "/documents" 
                        ? "bg-amber-100 text-amber-800"
                        : item.path === "/notifications"
                        ? "bg-red-100 text-red-800 animate-pulse"
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <i className="fas fa-chevron-right ml-auto text-xs opacity-50"></i>
                  )}
                </a>
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-slate-200">
            <Link href="/settings">
              <a className="group flex items-center px-3 py-3 text-sm font-medium rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200">
                <i className="fas fa-cog mr-3 text-slate-400 group-hover:text-slate-600"></i>
                Pengaturan
              </a>
            </Link>
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="flex-shrink-0 p-4 border-t border-slate-200">
          <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
            <img 
              className="h-10 w-10 rounded-xl object-cover shadow-sm" 
              src={user?.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"} 
              alt="Administrator profile" 
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email || 'Admin'}
              </p>
              <p className="text-xs text-slate-500 truncate">Administrator</p>
            </div>
            <i className="fas fa-chevron-down text-slate-400 text-xs"></i>
          </div>
        </div>
      </div>
    </div>
  );
}
