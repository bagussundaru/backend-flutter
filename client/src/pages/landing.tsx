import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg">
                <i className="fas fa-users text-white text-3xl"></i>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-slate-800 mb-4">DataKependudukan</h1>
            <p className="text-xl text-slate-600 mb-8">Dashboard Admin Manajemen Data</p>
            
            <div className="bg-slate-50 rounded-2xl p-6 mb-8">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Fitur Unggulan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-check text-emerald-500"></i>
                  <span>Monitoring Aktivitas User</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-check text-emerald-500"></i>
                  <span>Manajemen Dokumen</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-check text-emerald-500"></i>
                  <span>Sistem Notifikasi</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-check text-emerald-500"></i>
                  <span>Laporan & Analytics</span>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              size="lg"
            >
              <i className="fas fa-sign-in-alt mr-2"></i>
              Masuk ke Dashboard
            </Button>
            
            <p className="text-xs text-slate-500 mt-6">
              Dashboard resmi untuk administrator sistem data kependudukan
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
