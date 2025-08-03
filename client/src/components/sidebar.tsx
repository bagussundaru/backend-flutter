import { 
  Home, 
  Users, 
  FileText, 
  Activity, 
  Bell, 
  BarChart3, 
  Settings,
  LogOut,
  User
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import logoPath from "@assets/image_1754216364556.png";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Pengguna", href: "/users", icon: Users },
  { name: "Dokumen", href: "/documents", icon: FileText },
  { name: "Aktivitas", href: "/activities", icon: Activity },
  { name: "Notifikasi", href: "/notifications", icon: Bell },
  { name: "Laporan", href: "/reports", icon: BarChart3 },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  
  const { data: stats = {} } = useQuery({
    queryKey: ["/api/stats"],
  });
  
  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
  });

  const totalUsers = stats.totalUsers || 0;
  const pendingDocs = stats.pendingDocs || 0;
  const unreadNotifications = notifications.filter((n: any) => !n.isRead).length;

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header with Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <img 
            src={logoPath} 
            alt="Kementerian Dalam Negeri" 
            className="h-10 w-auto object-contain"
          />
          <div>
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">
              Kemendagri
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Data Kependudukan
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          let badgeCount = 0;
          if (item.name === "Pengguna") badgeCount = totalUsers;
          if (item.name === "Dokumen") badgeCount = pendingDocs;
          if (item.name === "Notifikasi") badgeCount = unreadNotifications;

          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start gap-3 ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="flex-1 text-left">{item.name}</span>
                {badgeCount > 0 && (
                  <Badge 
                    variant={isActive ? "secondary" : "outline"} 
                    className="ml-auto"
                  >
                    {badgeCount}
                  </Badge>
                )}
              </Button>
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* User Profile Section */}
      <div className="p-4">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
          {user?.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt="Profile"
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
              {user?.firstName || user?.lastName 
                ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
                : user?.email || 'User'
              }
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
          </div>
        </div>

        {/* Settings and Logout */}
        <div className="mt-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3 text-gray-600 dark:text-gray-300">
            <Settings className="h-4 w-4" />
            <span>Pengaturan</span>
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
            asChild
          >
            <a href="/api/logout">
              <LogOut className="h-4 w-4" />
              <span>Keluar</span>
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}