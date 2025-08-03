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
import { Switch } from "@/components/ui/switch";

export default function Users() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

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

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: any }) => {
      await apiRequest('PATCH', `/api/users/${userId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User updated successfully",
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
        description: "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users?.filter((user: any) =>
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleToggleUserStatus = (userId: string, isActive: boolean) => {
    updateUserMutation.mutate({
      userId,
      updates: { isActive: !isActive }
    });
  };

  const handleUpdateQuota = (userId: string, quota: number) => {
    updateUserMutation.mutate({
      userId,
      updates: { quota }
    });
  };

  if (usersLoading) {
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
          <h1 className="text-2xl font-bold text-slate-800">Manajemen User</h1>
          <p className="text-sm text-slate-500">Kelola user dan pengaturan akses</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl">
          <i className="fas fa-user-plus mr-2"></i>
          Tambah User
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-search text-slate-400"></i>
            </div>
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-slate-200 rounded-2xl"
              placeholder="Cari user berdasarkan nama atau email..."
            />
          </div>
        </div>
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-700">{users?.length || 0}</p>
            <p className="text-sm text-blue-600">Total Users</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <i className="fas fa-users text-blue-600"></i>
            <span>Daftar User</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user: any) => (
              <div key={user.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl hover:border-blue-300 hover:shadow-md transition-all duration-200">
                <div className="flex items-center space-x-4">
                  <img
                    src={user.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"}
                    alt="User avatar"
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <p className="font-medium text-slate-800">
                      {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}
                    </p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        Quota: {user.quota}/100
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-slate-600">
                      {new Date(user.createdAt).toLocaleDateString('id-ID')}
                    </p>
                    <p className="text-xs text-slate-500">Terdaftar</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-slate-600">
                      {user.isActive ? 'Aktif' : 'Nonaktif'}
                    </label>
                    <Switch
                      checked={user.isActive}
                      onCheckedChange={() => handleToggleUserStatus(user.id, user.isActive)}
                      disabled={updateUserMutation.isPending}
                    />
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => {
                      const newQuota = prompt(`Update quota untuk ${user.email} (current: ${user.quota}):`, user.quota.toString());
                      if (newQuota && !isNaN(parseInt(newQuota))) {
                        handleUpdateQuota(user.id, parseInt(newQuota));
                      }
                    }}
                  >
                    <i className="fas fa-edit"></i>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <i className="fas fa-users text-4xl text-slate-300 mb-4"></i>
              <p className="text-slate-500">
                {searchQuery ? 'Tidak ada user yang sesuai dengan pencarian' : 'Belum ada user terdaftar'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
