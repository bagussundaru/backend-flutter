# DataKependudukan - Panduan Setup Lokal

## Overview
Aplikasi DataKependudukan kini sudah dikonfigurasi untuk berjalan di lokal tanpa dependensi Replit atau database eksternal.

## Prasyarat
- Node.js (v18 atau lebih baru)
- npm atau yarn

## Cara Menjalankan di Lokal

### 1. Install Dependencies
```bash
npm install
```

### 2. Konfigurasi Environment
File `.env` sudah dikonfigurasi untuk development lokal:
```
NODE_ENV=development
REPLIT_DOMAINS=localhost:3000
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/datakependudukan_dev
CLIENT_ID=local-dev-client
CLIENT_SECRET=local-dev-secret
SESSION_SECRET=local-session-secret-12345
```

### 3. Jalankan Aplikasi
```bash
npm run dev
```

Aplikasi akan berjalan di:
- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend API**: http://localhost:3000 (Express server)

## Fitur yang Tersedia di Development Mode

### 1. Database In-Memory
- Tidak memerlukan PostgreSQL eksternal
- Data tersimpan di memory selama server berjalan
- Sample data sudah tersedia untuk testing

### 2. Authentication Bypass
- Auth middleware di-skip di development mode
- Semua API endpoint bisa diakses tanpa login
- Endpoint `/api/login` mengembalikan response mock

### 3. Sample Data
- **Users**: Admin user dan 2 sample users
- **Documents**: Sample dokumen PKS dan Juknis
- **Activities**: Sample aktivitas login, upload, download
- **Requests**: Sample request perpanjangan dan reset kuota
- **Agreements**: Sample perjanjian PKS

### 4. API Endpoints

#### User Management
- `GET /api/auth/user` - Info user (mock)
- `GET /api/users` - Daftar semua user

#### Documents
- `GET /api/documents` - Semua dokumen
- `POST /api/documents` - Upload dokumen baru
- `GET /api/documents/:id` - Detail dokumen

#### Activities
- `GET /api/activities` - Aktivitas terbaru
- `POST /api/activities` - Catat aktivitas baru

#### Requests
- `GET /api/requests` - Semua permintaan
- `POST /api/requests` - Buat permintaan baru
- `GET /api/requests/pending` - Permintaan pending

#### Statistics
- `GET /api/stats` - Statistik dashboard

## Testing API dengan curl

### 1. Get Dashboard Stats
```bash
curl http://localhost:3000/api/stats
```

### 2. Get All Users
```bash
curl http://localhost:3000/api/users
```

### 3. Get All Documents
```bash
curl http://localhost:3000/api/documents
```

### 4. Get Recent Activities
```bash
curl http://localhost:3000/api/activities
```

### 5. Get Pending Requests
```bash
curl http://localhost:3000/api/requests/pending
```

## Struktur Proyek

```
DataKependudukan-1/
├── client/                 # Frontend React
├── server/                 # Backend Express
│   ├── index.ts           # Entry point server
│   ├── replitAuth.ts      # Auth configuration (bypass di dev)
│   ├── routes.ts          # API routes
│   ├── mockStorage.ts     # In-memory database
│   └── storage.ts         # Database configuration
├── shared/                # Shared types dan schema
├── uploads/              # File uploads
├── .env                  # Environment variables
└── package.json          # Dependencies
```

## Troubleshooting

### Error: Port 3000 sudah digunakan
```bash
# Ganti port di .env
PORT=3001
```

### Error: Node modules
```bash
# Hapus node_modules dan install ulang
rm -rf node_modules package-lock.json
npm install
```

### Error: Database connection
- Di development mode, database error akan otomatis fallback ke in-memory database
- Tidak perlu setup PostgreSQL untuk testing

## Production Setup
Untuk production, pastikan:
1. Set `NODE_ENV=production`
2. Provide `DATABASE_URL` yang valid
3. Provide semua environment variables Replit

## Support
Jika ada masalah, cek terminal untuk error messages atau gunakan developer tools di browser untuk debugging.