import { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, FileText, Clock, CheckCircle, XCircle, AlertTriangle, Download, RefreshCw } from "lucide-react";

export default function Agreements() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

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

  const { data: agreements = [], isLoading: agreementsLoading } = useQuery({
    queryKey: ["/api/agreements"],
    enabled: isAuthenticated,
  });

  const { data: expiringAgreements = [], isLoading: expiringLoading } = useQuery({
    queryKey: ["/api/agreements/expiring"],
    enabled: isAuthenticated,
  });

  const renewalMutation = useMutation({
    mutationFn: async (agreementId: string) => {
      await apiRequest('POST', `/api/agreements/${agreementId}/renewal`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agreements"] });
      toast({
        title: "Sukses",
        description: "Permohonan perpanjangan telah diajukan",
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
        description: "Gagal mengajukan perpanjangan",
        variant: "destructive",
      });
    },
  });

  const downloadDocument = useMutation({
    mutationFn: async (documentId: string) => {
      const response = await fetch(`/api/documents/${documentId}/download`);
      if (!response.ok) throw new Error('Download failed');
      return response.blob();
    },
    onSuccess: (blob, documentId) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `document-${documentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Sukses",
        description: "Dokumen berhasil diunduh",
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
        description: "Gagal mengunduh dokumen",
        variant: "destructive",
      });
    },
  });

  const filteredAgreements = agreements.filter((agreement: any) => {
    const matchesSearch = agreement.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agreement.agreementNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || agreement.status === statusFilter;
    const matchesType = typeFilter === "all" || agreement.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Aktif</Badge>;
      case 'expired':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Expired</Badge>;
      case 'pending_renewal':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending Renewal</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'PKS':
        return <Badge className="bg-blue-100 text-blue-800">PKS</Badge>;
      case 'Juknis':
        return <Badge className="bg-purple-100 text-purple-800">Juknis</Badge>;
      case 'POC':
        return <Badge className="bg-orange-100 text-orange-800">POC</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysUntilExpiry = (endDate: string) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading || agreementsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
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
            Manajemen PKS, Juknis & POC
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Kelola dokumen perjanjian kerja sama, petunjuk teknis, dan proof of concept
          </p>
        </div>
      </div>

      {/* Expiring Agreements Alert */}
      {expiringAgreements.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <AlertTriangle className="h-5 w-5" />
              Peringatan Masa Berlaku
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700 dark:text-yellow-300 mb-4">
              {expiringAgreements.length} dokumen akan berakhir dalam 30 hari ke depan:
            </p>
            <div className="space-y-2">
              {expiringAgreements.slice(0, 3).map((agreement: any) => (
                <div key={agreement.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTypeBadge(agreement.type)}
                    <span className="font-medium">{agreement.agreementNumber}</span>
                    <span className="text-sm text-gray-500">
                      Berakhir {formatDate(agreement.endDate)} 
                      ({getDaysUntilExpiry(agreement.endDate)} hari lagi)
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => renewalMutation.mutate(agreement.id)}
                    disabled={renewalMutation.isPending || agreement.renewalRequested}
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    {agreement.renewalRequested ? 'Diajukan' : 'Perpanjang'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Cari berdasarkan tipe atau nomor dokumen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Semua Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="PKS">PKS</SelectItem>
                <SelectItem value="Juknis">Juknis</SelectItem>
                <SelectItem value="POC">POC</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="pending_renewal">Pending Renewal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Agreements List */}
      <div className="grid gap-4">
        {filteredAgreements.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Tidak ada dokumen
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Tidak ada dokumen yang sesuai dengan kriteria pencarian
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAgreements.map((agreement: any) => (
            <Card key={agreement.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {getTypeBadge(agreement.type)}
                      {getStatusBadge(agreement.status)}
                      {agreement.renewalRequested && (
                        <Badge className="bg-blue-100 text-blue-800">
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Renewal Diajukan
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {agreement.agreementNumber || `${agreement.type} Agreement`}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-300">
                          Mulai: {formatDate(agreement.startDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-300">
                          Berakhir: {formatDate(agreement.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-300">
                          {getDaysUntilExpiry(agreement.endDate) > 0 
                            ? `${getDaysUntilExpiry(agreement.endDate)} hari lagi`
                            : 'Sudah berakhir'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadDocument.mutate(agreement.documentId)}
                      disabled={downloadDocument.isPending}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    
                    {agreement.status === 'active' && getDaysUntilExpiry(agreement.endDate) <= 90 && (
                      <Button
                        size="sm"
                        onClick={() => renewalMutation.mutate(agreement.id)}
                        disabled={renewalMutation.isPending || agreement.renewalRequested}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        {agreement.renewalRequested ? 'Diajukan' : 'Perpanjang'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}