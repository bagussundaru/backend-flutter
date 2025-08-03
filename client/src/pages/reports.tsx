import { useEffect, useState } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { DateRange } from "react-day-picker";

export default function Reports() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [reportType, setReportType] = useState('monthly');
  const [exportFormat, setExportFormat] = useState('csv');

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

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
  });

  const { data: documents } = useQuery({
    queryKey: ["/api/documents"],
  });

  const { data: activities } = useQuery({
    queryKey: ["/api/activities"],
    queryFn: async () => {
      const response = await fetch('/api/activities?limit=1000');
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('401: Unauthorized');
        }
        throw new Error('Failed to fetch activities');
      }
      return response.json();
    },
  });

  const handleExport = (format: string) => {
    try {
      let data: any[] = [];
      let filename = '';
      let headers: string[] = [];

      switch (reportType) {
        case 'users':
          data = users || [];
          filename = `users_report_${new Date().toISOString().split('T')[0]}`;
          headers = ['ID', 'Name', 'Email', 'Role', 'Status', 'Quota', 'Created At'];
          break;
        case 'activities':
          data = activities || [];
          filename = `activities_report_${new Date().toISOString().split('T')[0]}`;
          headers = ['ID', 'Type', 'Description', 'User ID', 'Created At'];
          break;
        case 'documents':
          data = documents || [];
          filename = `documents_report_${new Date().toISOString().split('T')[0]}`;
          headers = ['ID', 'Title', 'Category', 'Status', 'File Size', 'Created At'];
          break;
        default:
          data = [stats];
          filename = `stats_report_${new Date().toISOString().split('T')[0]}`;
          headers = ['Total Users', 'Active Users', 'Today Logins', 'Pending Docs', 'Pending Requests'];
      }

      if (format === 'csv') {
        exportToCSV(data, headers, filename);
      } else {
        exportToPDF(data, headers, filename);
      }

      toast({
        title: "Success",
        description: `Report exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export report",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = (data: any[], headers: string[], filename: string) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => {
        return headers.map(header => {
          const key = header.toLowerCase().replace(/\s+/g, '');
          let value = '';
          
          switch (reportType) {
            case 'users':
              switch (header) {
                case 'ID': value = row.id || ''; break;
                case 'Name': value = `${row.firstName || ''} ${row.lastName || ''}`.trim() || row.email || ''; break;
                case 'Email': value = row.email || ''; break;
                case 'Role': value = row.role || ''; break;
                case 'Status': value = row.isActive ? 'Active' : 'Inactive'; break;
                case 'Quota': value = row.quota || ''; break;
                case 'Created At': value = new Date(row.createdAt).toLocaleDateString(); break;
              }
              break;
            case 'activities':
              switch (header) {
                case 'ID': value = row.id || ''; break;
                case 'Type': value = row.type || ''; break;
                case 'Description': value = row.description || ''; break;
                case 'User ID': value = row.userId || ''; break;
                case 'Created At': value = new Date(row.createdAt).toLocaleDateString(); break;
              }
              break;
            case 'documents':
              switch (header) {
                case 'ID': value = row.id || ''; break;
                case 'Title': value = row.title || ''; break;
                case 'Category': value = row.category || ''; break;
                case 'Status': value = row.status || ''; break;
                case 'File Size': value = `${(row.fileSize / 1024 / 1024).toFixed(2)} MB`; break;
                case 'Created At': value = new Date(row.createdAt).toLocaleDateString(); break;
              }
              break;
            default:
              switch (header) {
                case 'Total Users': value = row.totalUsers || 0; break;
                case 'Active Users': value = row.activeUsers || 0; break;
                case 'Today Logins': value = row.todayLogins || 0; break;
                case 'Pending Docs': value = row.pendingDocs || 0; break;
                case 'Pending Requests': value = row.pendingRequests || 0; break;
              }
          }
          
          return `"${value.toString().replace(/"/g, '""')}"`;
        }).join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  const exportToPDF = (data: any[], headers: string[], filename: string) => {
    // Simple PDF export using HTML and print
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${filename}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #1e40af; margin-bottom: 10px; }
          .header p { color: #64748b; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
          th { background-color: #f8fafc; font-weight: 600; color: #374151; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .footer { margin-top: 30px; text-align: center; color: #9ca3af; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>DataKependudukan Report</h1>
          <p>Generated on ${new Date().toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>
        <table>
          <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${data.map(row => {
              return `<tr>${headers.map(header => {
                let value = '';
                
                switch (reportType) {
                  case 'users':
                    switch (header) {
                      case 'ID': value = row.id || ''; break;
                      case 'Name': value = `${row.firstName || ''} ${row.lastName || ''}`.trim() || row.email || ''; break;
                      case 'Email': value = row.email || ''; break;
                      case 'Role': value = row.role || ''; break;
                      case 'Status': value = row.isActive ? 'Active' : 'Inactive'; break;
                      case 'Quota': value = row.quota || ''; break;
                      case 'Created At': value = new Date(row.createdAt).toLocaleDateString(); break;
                    }
                    break;
                  case 'activities':
                    switch (header) {
                      case 'ID': value = row.id || ''; break;
                      case 'Type': value = row.type || ''; break;
                      case 'Description': value = row.description || ''; break;
                      case 'User ID': value = row.userId || ''; break;
                      case 'Created At': value = new Date(row.createdAt).toLocaleDateString(); break;
                    }
                    break;
                  case 'documents':
                    switch (header) {
                      case 'ID': value = row.id || ''; break;
                      case 'Title': value = row.title || ''; break;
                      case 'Category': value = row.category || ''; break;
                      case 'Status': value = row.status || ''; break;
                      case 'File Size': value = `${(row.fileSize / 1024 / 1024).toFixed(2)} MB`; break;
                      case 'Created At': value = new Date(row.createdAt).toLocaleDateString(); break;
                    }
                    break;
                  default:
                    switch (header) {
                      case 'Total Users': value = row.totalUsers || 0; break;
                      case 'Active Users': value = row.activeUsers || 0; break;
                      case 'Today Logins': value = row.todayLogins || 0; break;
                      case 'Pending Docs': value = row.pendingDocs || 0; break;
                      case 'Pending Requests': value = row.pendingRequests || 0; break;
                    }
                }
                
                return `<td>${value}</td>`;
              }).join('')}</tr>`;
            }).join('')}
          </tbody>
        </table>
        <div class="footer">
          <p>© 2025 DataKependudukan - Dashboard Admin</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const reportTypes = [
    { value: 'monthly', label: 'Laporan Bulanan', icon: 'fas fa-calendar-alt' },
    { value: 'users', label: 'Data User', icon: 'fas fa-users' },
    { value: 'activities', label: 'Log Aktivitas', icon: 'fas fa-chart-line' },
    { value: 'documents', label: 'Data Dokumen', icon: 'fas fa-file-alt' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Laporan & Analytics</h1>
        <p className="text-sm text-slate-500">Generate dan export laporan sistem</p>
      </div>

      {/* Report Configuration */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <i className="fas fa-chart-bar text-blue-600"></i>
            <span>Konfigurasi Laporan</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Jenis Laporan
              </label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center space-x-2">
                        <i className={`${type.icon} text-slate-500`}></i>
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Format Export
              </label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger className="rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-file-csv text-emerald-500"></i>
                      <span>CSV</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="pdf">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-file-pdf text-red-500"></i>
                      <span>PDF</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => handleExport(exportFormat)}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <i className="fas fa-download mr-2"></i>
                Export Laporan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Users</p>
                <p className="text-3xl font-bold text-blue-700 mt-1">{stats?.totalUsers || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <i className="fas fa-users text-white text-lg"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">Login Hari Ini</p>
                <p className="text-3xl font-bold text-emerald-700 mt-1">{stats?.todayLogins || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <i className="fas fa-sign-in-alt text-white text-lg"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">Total Dokumen</p>
                <p className="text-3xl font-bold text-amber-700 mt-1">{documents?.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                <i className="fas fa-file-alt text-white text-lg"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Aktivitas</p>
                <p className="text-3xl font-bold text-purple-700 mt-1">{activities?.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <i className="fas fa-chart-line text-white text-lg"></i>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Preview */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <i className="fas fa-table text-blue-600"></i>
              <span>Preview Data</span>
            </div>
            <Badge variant="secondary">
              {reportType === 'users' ? users?.length || 0 :
               reportType === 'activities' ? activities?.length || 0 :
               reportType === 'documents' ? documents?.length || 0 :
               'Summary'} items
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reportType === 'monthly' && (
            <div className="text-center py-12">
              <i className="fas fa-chart-pie text-4xl text-blue-400 mb-4"></i>
              <p className="text-blue-600 font-medium">Grafik Analytics Bulanan</p>
              <p className="text-sm text-blue-400 mt-1">Implementasi dengan Chart.js akan ditampilkan di sini</p>
            </div>
          )}

          {reportType === 'users' && (
            <div className="space-y-3">
              {users?.slice(0, 5).map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                      <i className="fas fa-user text-blue-600 text-sm"></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}
                      </p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <Badge variant={user.isActive ? 'default' : 'secondary'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))}
              <p className="text-xs text-slate-500 text-center mt-4">
                Preview menampilkan 5 data pertama. Export untuk melihat semua data.
              </p>
            </div>
          )}

          {reportType === 'activities' && (
            <div className="space-y-3">
              {activities?.slice(0, 5).map((activity: any) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-2xl">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    activity.type === 'login' ? 'bg-blue-100' :
                    activity.type === 'upload' ? 'bg-amber-100' :
                    'bg-emerald-100'
                  }`}>
                    <i className={`${
                      activity.type === 'login' ? 'fas fa-sign-in-alt text-blue-600' :
                      activity.type === 'upload' ? 'fas fa-file-upload text-amber-600' :
                      'fas fa-activity text-emerald-600'
                    } text-sm`}></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{activity.description}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(activity.createdAt).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <Badge variant="secondary">{activity.type}</Badge>
                </div>
              ))}
              <p className="text-xs text-slate-500 text-center mt-4">
                Preview menampilkan 5 data pertama. Export untuk melihat semua data.
              </p>
            </div>
          )}

          {reportType === 'documents' && (
            <div className="space-y-3">
              {documents?.slice(0, 5).map((document: any) => (
                <div key={document.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center">
                      <i className="fas fa-file-alt text-purple-600 text-sm"></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{document.title}</p>
                      <p className="text-xs text-slate-500">
                        {document.category} • {(document.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Badge variant={
                    document.status === 'approved' ? 'default' :
                    document.status === 'rejected' ? 'destructive' :
                    'secondary'
                  }>
                    {document.status}
                  </Badge>
                </div>
              ))}
              <p className="text-xs text-slate-500 text-center mt-4">
                Preview menampilkan 5 data pertama. Export untuk melihat semua data.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export History */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <i className="fas fa-history text-blue-600"></i>
            <span>Riwayat Export</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <i className="fas fa-download text-4xl text-slate-300 mb-4"></i>
            <p className="text-slate-500">Riwayat export akan ditampilkan di sini</p>
            <p className="text-sm text-slate-400 mt-1">Fitur ini akan melacak semua laporan yang telah diexport</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
