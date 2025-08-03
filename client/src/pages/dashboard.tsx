import { useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import StatsCard from "@/components/stats-card";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
    refetchInterval: 30000,
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/activities"],
    queryFn: async () => {
      const response = await fetch('/api/activities?limit=4');
      if (!response.ok) throw new Error('Failed to fetch activities');
      return response.json();
    },
  });

  const { data: pendingRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/requests", "pending"],
    queryFn: async () => {
      const response = await fetch('/api/requests/pending');
      if (!response.ok) throw new Error('Failed to fetch pending requests');
      return response.json();
    },
  });

  const handleRequestAction = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: 'approved' | 'rejected' }) => {
      await apiRequest('PATCH', `/api/requests/${requestId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Request updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update request",
        variant: "destructive",
      });
    },
  });

  const quickActions = [
    {
      title: "Tambah User Baru",
      description: "Daftarkan pengguna baru",
      icon: "fas fa-user-plus",
      color: "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100",
      iconBg: "bg-blue-500",
      chevronColor: "text-blue-500"
    },
    {
      title: "Kirim Notifikasi",
      description: "Blast informasi ke semua user",
      icon: "fas fa-paper-plane",
      color: "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 hover:from-emerald-100 hover:to-green-100",
      iconBg: "bg-emerald-500",
      chevronColor: "text-emerald-500"
    },
    {
      title: "Generate Laporan",
      description: "Export data ke CSV/PDF",
      icon: "fas fa-file-download",
      color: "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 hover:from-amber-100 hover:to-orange-100",
      iconBg: "bg-amber-500",
      chevronColor: "text-amber-500"
    },
    {
      title: "Kelola Dokumen",
      description: "Upload dan review dokumen",
      icon: "fas fa-folder-open",
      color: "bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 hover:from-purple-100 hover:to-indigo-100",
      iconBg: "bg-purple-500",
      chevronColor: "text-purple-500"
    }
  ];

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          change="+12.5%"
          changeType="positive"
          changeLabel="dari bulan lalu"
          icon="fas fa-users"
          iconColor="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatsCard
          title="Login Hari Ini"
          value={stats?.todayLogins || 0}
          change="+8.2%"
          changeType="positive"
          changeLabel="dari kemarin"
          icon="fas fa-sign-in-alt"
          iconColor="bg-gradient-to-br from-emerald-500 to-emerald-600"
        />
        <StatsCard
          title="Dokumen Pending"
          value={stats?.pendingDocs || 0}
          change="Perlu Review"
          changeType="neutral"
          icon="fas fa-file-alt"
          iconColor="bg-gradient-to-br from-amber-500 to-amber-600"
        />
        <StatsCard
          title="Request Perpanjangan"
          value={stats?.pendingRequests || 0}
          change="Urgent"
          changeType="negative"
          icon="fas fa-clock"
          iconColor="bg-gradient-to-br from-red-500 to-red-600"
        />
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-slate-100 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Aktivitas Login Harian</h3>
              <p className="text-sm text-slate-500">Data 7 hari terakhir</p>
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-xl hover:bg-blue-200 transition-colors">7D</button>
              <button className="px-3 py-1 text-xs font-medium text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">30D</button>
              <button className="px-3 py-1 text-xs font-medium text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">90D</button>
            </div>
          </div>
          
          {/* Chart Placeholder */}
          <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-dashed border-blue-200 flex items-center justify-center">
            <div className="text-center">
              <i className="fas fa-chart-line text-4xl text-blue-400 mb-4"></i>
              <p className="text-blue-600 font-medium">Chart Aktivitas Login</p>
              <p className="text-sm text-blue-400 mt-1">Implementasi dengan Chart.js</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 animate-slide-up">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Quick Actions</h3>
          
          <div className="space-y-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 group ${action.color}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${action.iconBg} rounded-xl flex items-center justify-center`}>
                    <i className={`${action.icon} text-white`}></i>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-slate-800">{action.title}</p>
                    <p className="text-xs text-slate-500">{action.description}</p>
                  </div>
                </div>
                <i className={`fas fa-chevron-right ${action.chevronColor} group-hover:translate-x-1 transition-transform`}></i>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities & Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Aktivitas Terbaru</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Lihat Semua</button>
          </div>

          <div className="space-y-4">
            {activitiesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              activities?.map((activity: any) => (
                <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'login' ? 'bg-blue-100' :
                    activity.type === 'upload' ? 'bg-amber-100' :
                    activity.type === 'request' ? 'bg-red-100' :
                    'bg-purple-100'
                  }`}>
                    <i className={`${
                      activity.type === 'login' ? 'fas fa-sign-in-alt text-blue-600' :
                      activity.type === 'upload' ? 'fas fa-file-upload text-amber-600' :
                      activity.type === 'request' ? 'fas fa-clock text-red-600' :
                      'fas fa-user-check text-purple-600'
                    }`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{activity.description}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(activity.createdAt).toLocaleString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: 'short'
                      })}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    activity.type === 'login' ? 'text-emerald-600 bg-emerald-100' :
                    activity.type === 'upload' ? 'text-amber-600 bg-amber-100' :
                    activity.type === 'request' ? 'text-red-600 bg-red-100' :
                    'text-purple-600 bg-purple-100'
                  }`}>
                    {activity.type === 'login' ? 'Login' :
                     activity.type === 'upload' ? 'Upload' :
                     activity.type === 'request' ? 'Request' :
                     'Aktivasi'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Request Pending</h3>
            <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">
              {pendingRequests?.length || 0} Pending
            </span>
          </div>

          <div className="space-y-4">
            {requestsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              pendingRequests?.slice(0, 3).map((request: any) => (
                <div key={request.id} className="border border-slate-200 rounded-2xl p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-slate-200 rounded-xl"></div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{request.title}</p>
                        <p className="text-xs text-slate-500">{request.type}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      request.priority === 'urgent' ? 'text-red-600 bg-red-100' : 'text-amber-600 bg-amber-100'
                    }`}>
                      {request.priority === 'urgent' ? 'Urgent' : 'Pending'}
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-600 mb-3">{request.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                      {new Date(request.createdAt).toLocaleDateString('id-ID')}
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="px-3 py-1 text-xs text-emerald-600 bg-emerald-100 border-emerald-200 hover:bg-emerald-200"
                        onClick={() => handleRequestAction.mutate({ requestId: request.id, status: 'approved' })}
                        disabled={handleRequestAction.isPending}
                      >
                        Setujui
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="px-3 py-1 text-xs text-red-600 bg-red-100 border-red-200 hover:bg-red-200"
                        onClick={() => handleRequestAction.mutate({ requestId: request.id, status: 'rejected' })}
                        disabled={handleRequestAction.isPending}
                      >
                        Tolak
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 animate-slide-up">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Status Sistem</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
              <i className="fas fa-server text-emerald-600 text-lg"></i>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">Server Status</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-emerald-600 font-medium">Online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <i className="fas fa-database text-blue-600 text-lg"></i>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">Database</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-emerald-600 font-medium">Healthy</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
              <i className="fas fa-shield-alt text-amber-600 text-lg"></i>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">Security</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-amber-600 font-medium">Monitoring</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
