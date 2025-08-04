#!/bin/bash

# Script untuk membantu deployment ke GitHub dan Vercel

# Pastikan semua perubahan sudah di-commit
echo "Memastikan semua perubahan sudah di-commit..."
git add .
git commit -m "Persiapan deployment ke Vercel"

# Push ke GitHub
echo "Pushing ke GitHub..."
git push origin main

# Deploy ke Vercel (jika Vercel CLI sudah terinstall)
if command -v vercel &> /dev/null; then
  echo "Deploying ke Vercel..."
  vercel --prod
else
  echo "Vercel CLI tidak terinstall. Silakan install dengan 'npm install -g vercel' atau deploy melalui dashboard Vercel."
fi

echo "Proses deployment selesai!"