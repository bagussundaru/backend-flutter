import { useEffect, useState } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Notifications() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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

  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ["/api/notifications"],
  });

  const createNotificationMutation = useMutation({
    mutationFn: async (notificationData: any) => {
      await apiRequest('POST', '/api/notifications', notificationData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      setIsCreateOpen(false);
      toast({
        title: "Success",
        description: "Notification sent successfully",
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
        description: "Failed to send notification",
        variant: "destructive",
      });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await apiRequest('PATCH', `/api/notifications/${notificationId}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
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
    },
  });

  const filteredNotifications = notifications?.filter((notification: any) =>
    notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleCreateNotification = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const notificationData = {
      title: formData.get('title') as string,
      message: formData.get('message') as string,
      type: formData.get('type') as string,
      targetType: formData.get('targetType') as string,
      targetId: formData.get('targetId') as string || null,
    };
    createNotificationMutation.mutate(notificationData);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return 'fas fa-check-circle text-emerald-600';
      case 'warning':
        return 'fas fa-exclamation-triangle text-amber-600';
      case 'error':
        return 'fas fa-times-circle text-red-600';
      default:
        return 'fas fa-info-circle text-blue-600';
    }
  };

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-100 text-emerald-800';
      case 'warning':
        return 'bg-amber-100 text-amber-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (notificationsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Sistem Notifikasi</h1>
          <p className="text-sm text-slate-500">Kirim dan kelola notifikasi untuk user</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl">
              <i className="fas fa-paper-plane mr-2"></i>
              Kirim Notifikasi
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Buat Notifikasi Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateNotification} className="space-y-4">
              <div>
                <Label htmlFor="title">Judul</Label>
                <Input id="title" name="title" required className="rounded-xl" />
              </div>
              <div>
                <Label htmlFor="message">Pesan</Label>
                <Textarea id="message" name="message" required className="rounded-xl" />
              </div>
              <div>
                <Label htmlFor="type">Jenis</Label>
                <Select name="type" required>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Pilih jenis notifikasi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="targetType">Target</Label>
                <Select name="targetType" required>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Pilih target" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua User</SelectItem>
                    <SelectItem value="user">User Spesifik</SelectItem>
                    <SelectItem value="role">Role Spesifik</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="targetId">Target ID (opsional)</Label>
                <Input 
                  id="targetId" 
                  name="targetId" 
                  className="rounded-xl" 
                  placeholder="Kosongkan untuk semua user"
                />
              </div>
              <Button 
                type="submit" 
                disabled={createNotificationMutation.isPending}
                className="w-full rounded-xl"
              >
                {createNotificationMutation.isPending ? 'Mengirim...' : 'Kirim Notifikasi'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="fas fa-search text-slate-400"></i>
          </div>
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-slate-200 rounded-2xl"
            placeholder="Cari notifikasi..."
          />
        </div>
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-indigo-700">{notifications?.length || 0}</p>
            <p className="text-sm text-indigo-600">Total Notifikasi</p>
          </CardContent>
        </Card>
      </div>

      {/* Notification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-700">
              {notifications?.filter((n: any) => n.type === 'info').length || 0}
            </p>
            <p className="text-sm text-blue-600">Info</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-700">
              {notifications?.filter((n: any) => n.type === 'success').length || 0}
            </p>
            <p className="text-sm text-emerald-600">Success</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-700">
              {notifications?.filter((n: any) => n.type === 'warning').length || 0}
            </p>
            <p className="text-sm text-amber-600">Warning</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-700">
              {notifications?.filter((n: any) => n.type === 'error').length || 0}
            </p>
            <p className="text-sm text-red-600">Error</p>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <i className="fas fa-bell text-blue-600"></i>
            <span>Daftar Notifikasi</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredNotifications.map((notification: any) => (
              <div
                key={notification.id}
                className={`flex items-start space-x-4 p-4 border rounded-2xl transition-all duration-200 ${
                  notification.isRead 
                    ? 'border-slate-200 bg-slate-50' 
                    : 'border-blue-200 bg-blue-50 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                  <i className={getNotificationIcon(notification.type)}></i>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-800">
                      {notification.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Badge className={getNotificationBadge(notification.type)}>
                        {notification.type}
                      </Badge>
                      {!notification.isRead && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs px-2 py-1 rounded-xl"
                          onClick={() => markAsReadMutation.mutate(notification.id)}
                          disabled={markAsReadMutation.isPending}
                        >
                          Mark Read
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-2">
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center space-x-4">
                      <span>Target: {notification.targetType}</span>
                      <span>
                        {new Date(notification.createdAt).toLocaleString('id-ID', {
                          year: 'numeric',
                          month: 'short',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {!notification.isRead && (
                      <span className="text-blue-600 font-medium">• Unread</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredNotifications.length === 0 && (
            <div className="text-center py-12">
              <i className="fas fa-bell text-4xl text-slate-300 mb-4"></i>
              <p className="text-slate-500">
                {searchQuery 
                  ? 'Tidak ada notifikasi yang sesuai dengan pencarian' 
                  : 'Belum ada notifikasi'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
