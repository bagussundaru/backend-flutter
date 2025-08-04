import { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  CreditCard, 
  Download,
  RefreshCw,
  Zap
} from "lucide-react";

export default function QuotaMonitoring() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [userFilter, setUserFilter] = useState("all");
  const [quotaTypeFilter, setQuotaTypeFilter] = useState("all");

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

  const { data: quotaData = [], isLoading: quotaLoading } = useQuery({
    queryKey: ["/api/quota-usage"],
    enabled: isAuthenticated,
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/pnbp-transactions"],
    enabled: isAuthenticated,
  });

  const { data: quotaStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/quota-stats"],
    enabled: isAuthenticated,
  });

  const resetQuotaMutation = useMutation({
    mutationFn: async ({ userId, quotaType }: { userId: string; quotaType: string }) => {
      await apiRequest('POST', `/api/quota-usage/${userId}/reset`, { quotaType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quota-usage"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quota-stats"] });
      toast({
        title: "Sukses",
        description: "Kuota berhasil direset",
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
        description: "Gagal mereset kuota",
        variant: "destructive",
      });
    },
  });

  const filteredQuotaData = quotaData.filter((quota: any) => {
    const matchesUser = userFilter === "all" || quota.userId === userFilter;
    const matchesType = quotaTypeFilter === "all" || quota.quotaType === quotaTypeFilter;
    return matchesUser && matchesType;
  });

  const getQuotaUsagePercentage = (used: number, total: number) => {
    return Math.min(Math.round((used / total) * 100), 100);
  };

  const getQuotaStatusColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-green-600";
  };

  const getQuotaStatusBadge = (percentage: number) => {
    if (percentage >= 90) {
      return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Kritis</Badge>;
    }
    if (percentage >= 70) {
      return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Peringatan</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Normal</Badge>;
  };

  const getTransactionStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Selesai</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Gagal</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading || quotaLoading || transactionsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Monitoring Kuota & PNBP
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Pantau penggunaan kuota akses dan transaksi PNBP secara real-time
          </p>
        </div>
        <Button 
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ["/api/quota-usage"] });
            queryClient.invalidateQueries({ queryKey: ["/api/pnbp-transactions"] });
            queryClient.invalidateQueries({ queryKey: ["/api/quota-stats"] });
          }}
          variant="outline"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Kuota Terpakai
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {quotaStats?.totalUsed || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+12.5%</span>
              <span className="text-gray-500 ml-1">dari bulan lalu</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  User Aktif
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {quotaStats?.activeUsers || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+5.2%</span>
              <span className="text-gray-500 ml-1">dari minggu lalu</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Transaksi PNBP
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(quotaStats?.totalRevenue || 0)}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                <CreditCard className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-red-600">-2.1%</span>
              <span className="text-gray-500 ml-1">dari bulan lalu</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Alert Kuota
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {quotaStats?.alertsCount || 0}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-gray-500">User dengan kuota &gt;90%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={quotaTypeFilter} onValueChange={setQuotaTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Semua Tipe Kuota" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe Kuota</SelectItem>
                <SelectItem value="access">Akses API</SelectItem>
                <SelectItem value="download">Download</SelectItem>
                <SelectItem value="api_calls">API Calls</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quota Usage Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Penggunaan Kuota Per User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredQuotaData.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Tidak ada data kuota
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Belum ada data penggunaan kuota yang tersedia
                </p>
              </div>
            ) : (
              filteredQuotaData.map((quota: any) => {
                const percentage = getQuotaUsagePercentage(quota.usedAmount, quota.totalQuota);
                return (
                  <div key={quota.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{quota.quotaType}</Badge>
                        <span className="font-medium">User ID: {quota.userId}</span>
                        {getQuotaStatusBadge(percentage)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${getQuotaStatusColor(percentage)}`}>
                          {quota.usedAmount} / {quota.totalQuota}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resetQuotaMutation.mutate({ 
                            userId: quota.userId, 
                            quotaType: quota.quotaType 
                          })}
                          disabled={resetQuotaMutation.isPending}
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Reset: {formatDate(quota.resetDate)}</span>
                      <span>{percentage}% terpakai</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* PNBP Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Transaksi PNBP Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Tidak ada transaksi
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Belum ada transaksi PNBP yang tercatat
                </p>
              </div>
            ) : (
              transactions.slice(0, 10).map((transaction: any) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded">
                      <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {transaction.transactionId}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        User: {transaction.userId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(transaction.transactionDate)}
                      </p>
                    </div>
                    {getTransactionStatusBadge(transaction.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}