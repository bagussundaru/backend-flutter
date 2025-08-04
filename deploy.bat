@echo off

REM Script untuk membantu deployment ke GitHub dan Vercel di Windows

echo Memastikan semua perubahan sudah di-commit...
git add .
git commit -m "Persiapan deployment ke Vercel"

echo Pushing ke GitHub...
git push origin main

REM Deploy ke Vercel (jika Vercel CLI sudah terinstall)
where vercel >nul 2>nul
if %ERRORLEVEL% == 0 (
  echo Deploying ke Vercel...
  vercel --prod
) else (
  echo Vercel CLI tidak terinstall. Silakan install dengan 'npm install -g vercel' atau deploy melalui dashboard Vercel.
)

echo Proses deployment selesai!
pause