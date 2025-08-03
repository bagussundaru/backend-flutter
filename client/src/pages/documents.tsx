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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Documents() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

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

  const { data: documents, isLoading: documentsLoading } = useQuery({
    queryKey: ["/api/documents"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setIsUploadOpen(false);
      toast({
        title: "Success",
        description: "Document uploaded successfully",
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
        description: "Failed to upload document",
        variant: "destructive",
      });
    },
  });

  const updateDocumentMutation = useMutation({
    mutationFn: async ({ documentId, updates }: { documentId: string; updates: any }) => {
      await apiRequest('PATCH', `/api/documents/${documentId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Success",
        description: "Document updated successfully",
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
        description: "Failed to update document",
        variant: "destructive",
      });
    },
  });

  const filteredDocuments = documents?.filter((doc: any) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  }) || [];

  const handleUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    uploadMutation.mutate(formData);
  };

  const handleStatusUpdate = (documentId: string, status: string) => {
    updateDocumentMutation.mutate({
      documentId,
      updates: { status }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-100 text-emerald-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'PKS':
        return 'fas fa-handshake';
      case 'Juknis':
        return 'fas fa-book';
      case 'POC':
        return 'fas fa-flask';
      default:
        return 'fas fa-file-alt';
    }
  };

  if (documentsLoading) {
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
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Dokumen</h1>
          <p className="text-sm text-slate-500">Upload, review, dan kelola dokumen</p>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl">
              <i className="fas fa-upload mr-2"></i>
              Upload Dokumen
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Dokumen Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <Label htmlFor="title">Judul Dokumen</Label>
                <Input id="title" name="title" required className="rounded-xl" />
              </div>
              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea id="description" name="description" className="rounded-xl" />
              </div>
              <div>
                <Label htmlFor="category">Kategori</Label>
                <Select name="category" required>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PKS">PKS</SelectItem>
                    <SelectItem value="Juknis">Juknis</SelectItem>
                    <SelectItem value="POC">POC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="file">File</Label>
                <Input id="file" name="file" type="file" required className="rounded-xl" />
              </div>
              <Button 
                type="submit" 
                disabled={uploadMutation.isPending}
                className="w-full rounded-xl"
              >
                {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="fas fa-search text-slate-400"></i>
          </div>
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-slate-200 rounded-2xl"
            placeholder="Cari dokumen..."
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="rounded-2xl">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="rounded-2xl">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            <SelectItem value="PKS">PKS</SelectItem>
            <SelectItem value="Juknis">Juknis</SelectItem>
            <SelectItem value="POC">POC</SelectItem>
          </SelectContent>
        </Select>
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-700">{documents?.length || 0}</p>
            <p className="text-sm text-purple-600">Total Dokumen</p>
          </CardContent>
        </Card>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((document: any) => (
          <Card key={document.id} className="shadow-lg border-0 hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <i className={`${getCategoryIcon(document.category)} text-blue-600`}></i>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{document.title}</CardTitle>
                    <p className="text-sm text-slate-500">{document.category}</p>
                  </div>
                </div>
                {getStatusBadge(document.status)}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                {document.description || 'Tidak ada deskripsi'}
              </p>
              
              <div className="space-y-2 text-xs text-slate-500 mb-4">
                <div className="flex items-center justify-between">
                  <span>Ukuran:</span>
                  <span>{(document.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Upload:</span>
                  <span>{new Date(document.createdAt).toLocaleDateString('id-ID')}</span>
                </div>
              </div>

              {document.status === 'pending' && (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                    onClick={() => handleStatusUpdate(document.id, 'approved')}
                    disabled={updateDocumentMutation.isPending}
                  >
                    <i className="fas fa-check mr-1"></i>
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
                    onClick={() => handleStatusUpdate(document.id, 'rejected')}
                    disabled={updateDocumentMutation.isPending}
                  >
                    <i className="fas fa-times mr-1"></i>
                    Reject
                  </Button>
                </div>
              )}

              {document.status === 'approved' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full rounded-xl"
                >
                  <i className="fas fa-download mr-2"></i>
                  Download
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <i className="fas fa-file-alt text-4xl text-slate-300 mb-4"></i>
          <p className="text-slate-500">
            {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' 
              ? 'Tidak ada dokumen yang sesuai dengan filter' 
              : 'Belum ada dokumen terupload'}
          </p>
        </div>
      )}
    </div>
  );
}
