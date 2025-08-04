# Data Kependudukan - Aplikasi Manajemen Data Kependudukan

Aplikasi web untuk manajemen data kependudukan, termasuk pengelolaan PKS/Juknis/POC dan monitoring kuota.

## Fitur

- Dashboard dengan statistik dan informasi penting
- Manajemen PKS/Juknis/POC
- Monitoring Kuota penggunaan
- Manajemen Pengguna
- Manajemen Dokumen
- Aktivitas dan Notifikasi
- Laporan

## Teknologi

- Frontend: React, Vite, TailwindCSS, shadcn/ui
- Backend: Node.js, Express
- Database: In-memory (development), dapat dikonfigurasi untuk database produksi

## Deployment

Aplikasi ini dikonfigurasi untuk deployment di Vercel.

### Cara Deploy ke Vercel

1. Fork repository ini
2. Buat project baru di Vercel
3. Hubungkan dengan repository GitHub Anda
4. Deploy

## Pengembangan Lokal

```bash
# Install dependencies
npm install

# Jalankan server development
npm run dev

# Build untuk production
npm run build

# Jalankan server production
npm start
```

## Struktur Proyek

- `/client` - Kode frontend React
- `/server` - Kode backend Express
- `/shared` - Kode yang digunakan bersama antara frontend dan backend
- `/api` - Konfigurasi serverless functions untuk Vercel

## Lisensi

MIT