import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Shield, Users, FileText, Bell, BarChart3 } from "lucide-react";
import logoPath from "@assets/image_1754216364556.png";

export default function Landing() {
  return (
    <div className="min-h-screen gradient-indo-primary flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Card className="shadow-2xl border-0 glass-effect">
          <CardContent className="p-12 text-center">
            {/* Logo Section */}
            <div className="flex justify-center mb-8">
              <img 
                src={logoPath} 
                alt="Kementerian Dalam Negeri" 
                className="h-24 w-auto object-contain"
              />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Data Kependudukan
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
              Sistem Manajemen Data Penduduk
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-12">
              Kementerian Dalam Negeri Republik Indonesia
            </p>
            
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Manajemen Pengguna</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Kelola data dan akses pengguna sistem</p>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Dokumen Digital</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Proses dan validasi dokumen kependudukan</p>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Analitik & Laporan</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Dashboard dan laporan data real-time</p>
              </div>
            </div>
            
            {/* Features List */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-8 mb-8 border border-white/20">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Fitur Sistem Keamanan Tinggi
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Monitoring Aktivitas Real-time</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Sistem Approval Workflow</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Notifikasi Terintegrasi</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Enkripsi Data Tingkat Tinggi</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Audit Trail Lengkap</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Multi-level Authorization</span>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              size="lg"
            >
              <Shield className="mr-2 h-5 w-5" />
              Akses Sistem Aman
            </Button>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
              Sistem resmi Kementerian Dalam Negeri Republik Indonesia<br />
              untuk pengelolaan data kependudukan nasional
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
