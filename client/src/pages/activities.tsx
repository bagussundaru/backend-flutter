import { useEffect, useState } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function Activities() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

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

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/activities"],
    queryFn: async () => {
      const response = await fetch('/api/activities?limit=100');
      if (!response.ok) {
        const error = new Error('Failed to fetch activities');
        if (response.status === 401) {
          throw new Error('401: Unauthorized');
        }
        throw error;
      }
      return response.json();
    },
  });

  const filteredActivities = activities?.filter((activity: any) => {
    const matchesSearch = activity.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || activity.type === typeFilter;
    return matchesSearch && matchesType;
  }) || [];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return 'fas fa-sign-in-alt';
      case 'upload':
        return 'fas fa-file-upload';
      case 'download':
        return 'fas fa-file-download';
      case 'request':
        return 'fas fa-clock';
      case 'review':
        return 'fas fa-eye';
      case 'notification':
        return 'fas fa-bell';
      default:
        return 'fas fa-activity';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'login':
        return 'bg-blue-100 text-blue-600';
      case 'upload':
        return 'bg-amber-100 text-amber-600';
      case 'download':
        return 'bg-emerald-100 text-emerald-600';
      case 'request':
        return 'bg-red-100 text-red-600';
      case 'review':
        return 'bg-purple-100 text-purple-600';
      case 'notification':
        return 'bg-indigo-100 text-indigo-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'login':
        return 'bg-blue-100 text-blue-800';
      case 'upload':
        return 'bg-amber-100 text-amber-800';
      case 'download':
        return 'bg-emerald-100 text-emerald-800';
      case 'request':
        return 'bg-red-100 text-red-800';
      case 'review':
        return 'bg-purple-100 text-purple-800';
      case 'notification':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const activityTypes = ['all', 'login', 'upload', 'download', 'request', 'review', 'notification'];

  if (activitiesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Monitoring Aktivitas</h1>
        <p className="text-sm text-slate-500">Pantau aktivitas user dalam sistem</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="fas fa-search text-slate-400"></i>
          </div>
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-slate-200 rounded-2xl"
            placeholder="Cari aktivitas..."
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="rounded-2xl">
            <SelectValue placeholder="Jenis Aktivitas" />
          </SelectTrigger>
          <SelectContent>
            {activityTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type === 'all' ? 'Semua Aktivitas' : type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-700">
              {activities?.filter((a: any) => a.type === 'login').length || 0}
            </p>
            <p className="text-sm text-blue-600">Total Login</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-700">
              {activities?.filter((a: any) => a.type === 'upload').length || 0}
            </p>
            <p className="text-sm text-amber-600">Upload Dokumen</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-700">
              {activities?.filter((a: any) => a.type === 'download').length || 0}
            </p>
            <p className="text-sm text-emerald-600">Download</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-700">
              {activities?.filter((a: any) => a.type === 'request').length || 0}
            </p>
            <p className="text-sm text-red-600">Request</p>
          </CardContent>
        </Card>
      </div>

      {/* Activities List */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <i className="fas fa-chart-line text-blue-600"></i>
            <span>Log Aktivitas</span>
            <Badge variant="secondary">{filteredActivities.length} aktivitas</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredActivities.map((activity: any) => (
              <div
                key={activity.id}
                className="flex items-center space-x-4 p-4 border border-slate-200 rounded-2xl hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.type)}`}>
                  <i className={`${getActivityIcon(activity.type)} text-lg`}></i>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {activity.description}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-xs text-slate-500">
                      {new Date(activity.createdAt).toLocaleString('id-ID', {
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {activity.metadata && (
                      <span className="text-xs text-slate-400">
                        • {JSON.stringify(activity.metadata).length > 50 
                           ? Object.keys(activity.metadata).join(', ') 
                           : JSON.stringify(activity.metadata)}
                      </span>
                    )}
                  </div>
                </div>
                
                <Badge className={getBadgeColor(activity.type)}>
                  {activity.type}
                </Badge>
              </div>
            ))}
          </div>

          {filteredActivities.length === 0 && (
            <div className="text-center py-12">
              <i className="fas fa-chart-line text-4xl text-slate-300 mb-4"></i>
              <p className="text-slate-500">
                {searchQuery || typeFilter !== 'all' 
                  ? 'Tidak ada aktivitas yang sesuai dengan filter' 
                  : 'Belum ada aktivitas tercatat'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
