# 🚀 Panduan Deployment Gratis - Asisten Wira

## 🎯 Overview

Panduan lengkap untuk deploy Asisten Wira secara gratis menggunakan:

- **Frontend**: Vercel (Free tier)
- **Backend**: Render.com (Free tier)
- **Database**: Supabase (Free tier)
- **AI Services**: Hugging Face (Free tier) + IBM (Trial)

## 📋 Prerequisites

### 1. Akun yang Diperlukan (Semua Gratis!)

- [GitHub](https://github.com) - Untuk repository
- [Vercel](https://vercel.com) - Frontend hosting
- [Render](https://render.com) - Backend hosting
- [Supabase](https://supabase.com) - Database
- [Hugging Face](https://huggingface.co) - AI models

### 2. Tools yang Diperlukan

- Git (sudah terinstall)
- Node.js 18+ (sudah terinstall)
- Python 3.9+ (sudah terinstall)

## 🗄️ Step 1: Setup Database (Supabase)

### 1.1 Create Supabase Project

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Isi:
   - **Name**: `asisten-wira`
   - **Database Password**: Buat password yang kuat
   - **Region**: Singapore (terdekat dengan Indonesia)
4. Wait 2-3 menit sampai project ready

### 1.2 Setup Database Schema

1. Di Supabase dashboard, buka **SQL Editor**
2. Copy paste isi file `backend/database/schema_clean.sql`
3. Click **Run**
4. Pastikan semua tabel terbuat tanpa error

### 1.3 Get API Keys

1. Di Supabase dashboard, buka **Settings** → **API**
2. Copy:
   - **Project URL**
   - **anon/public key**
   - **service_role key** (untuk backend)

## 🏗️ Step 2: Prepare Code for Deployment

### 2.1 Create Environment Files

**Backend (.env)**:

```bash
# Copy dari env_template.txt dan update dengan keys Supabase Anda
cd backend
cp env_template.txt .env
```

**Frontend (.env.local)**:

```bash
# Copy dari env_template.txt
cd frontend
cp env_template.txt .env.local
```

### 2.2 Update CORS Origins

Di `backend/main.py`, update:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-app-name.vercel.app"],
    # Ganti your-app-name dengan nama app Vercel Anda nanti
)
```

### 2.3 Push to GitHub

```bash
# Initialize git (jika belum)
git init
git add .
git commit -m "Initial commit - Asisten Wira"

# Create repository di GitHub, lalu:
git remote add origin https://github.com/yourusername/asisten-wira.git
git push -u origin main
```

## ⚡ Step 3: Deploy Backend (Render.com)

### 3.1 Create Render Account

1. Buka [Render.com](https://render.com)
2. Sign up dengan GitHub account
3. Connect GitHub repository

### 3.2 Create Web Service

1. Dashboard Render → **New** → **Web Service**
2. Select repository: `asisten-wira`
3. Konfigurasi:
   - **Name**: `asisten-wira-api`
   - **Environment**: `Python 3`
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`

### 3.3 Add Environment Variables

Di Render dashboard, tambahkan environment variables:

```
SUPABASE_URL=https://dkxiszylxbgtenfsmzdk.supabase.co
SUPABASE_ANON_KEY=[your-supabase-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-supabase-service-role-key]
HUGGINGFACE_API_TOKEN=your_huggingface_api_token_here
IBM_ORCHESTRATE_API_KEY=your_ibm_orchestrate_api_key_here
IBM_ORCHESTRATE_BASE_URL=your_ibm_orchestrate_base_url_here
JWT_SECRET_KEY=your_jwt_secret_key_here_change_this_in_production
ENVIRONMENT=production
DEBUG=False
PORT=8000
```

### 3.4 Deploy

1. Click **Create Web Service**
2. Wait 5-10 menit untuk build process
3. Setelah selesai, akan dapat URL seperti: `https://asisten-wira-api.onrender.com`

### 3.5 Test Backend

```bash
curl https://asisten-wira-api.onrender.com/health
# Should return: {"status":"healthy","service":"asisten-wira-api"}
```

## 🌐 Step 4: Deploy Frontend (Vercel)

### 4.1 Create Vercel Account

1. Buka [Vercel.com](https://vercel.com)
2. Sign up dengan GitHub account

### 4.2 Import Project

1. Vercel Dashboard → **New Project**
2. Import dari GitHub repository
3. Select: `asisten-wira`
4. Konfigurasi:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 4.3 Add Environment Variables

Di Vercel dashboard, tambahkan:

```
NEXT_PUBLIC_SUPABASE_URL=https://dkxiszylxbgtenfsmzdk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-supabase-anon-key]
NEXT_PUBLIC_API_URL=https://asisten-wira-api.onrender.com
NEXT_PUBLIC_ENABLE_DEMO=true
NEXT_PUBLIC_ENABLE_IBM_INTEGRATION=true
```

### 4.4 Deploy

1. Click **Deploy**
2. Wait 2-3 menit untuk build
3. Akan dapat URL seperti: `https://asisten-wira-123.vercel.app`

## 🔗 Step 5: Connect Frontend & Backend

### 5.1 Update CORS

1. Update `backend/main.py` dengan URL Vercel yang benar:

```python
allow_origins=["http://localhost:3000", "https://asisten-wira-123.vercel.app"],
```

2. Commit dan push changes:

```bash
git add .
git commit -m "Update CORS origins"
git push
```

3. Render akan auto-redeploy backend

### 5.2 Update Frontend API URL

1. Di Vercel dashboard, update environment variable:

```
NEXT_PUBLIC_API_URL=https://asisten-wira-api.onrender.com
```

2. Redeploy frontend di Vercel

## ✅ Step 6: Testing Complete Deployment

### 6.1 Test Frontend

1. Buka URL Vercel Anda
2. Test navigasi ke semua halaman:
   - Landing page
   - Register/Login
   - Dashboard
   - Demo page
   - Analytics
   - Settings

### 6.2 Test Backend Integration

1. Test registration: Buat akun baru
2. Test login dengan akun tersebut
3. Test create chatbot di dashboard
4. Test AI features di demo page

### 6.3 Test Database

1. Check Supabase dashboard → **Table Editor**
2. Pastikan data masuk ke table `profiles`, `chatbots`, etc.

## 🎉 Your Live URLs

Setelah deployment sukses, Anda akan memiliki:

- **Frontend**: `https://asisten-wira-123.vercel.app`
- **Backend API**: `https://asisten-wira-api.onrender.com`
- **API Docs**: `https://asisten-wira-api.onrender.com/docs`
- **Database**: Supabase dashboard

## 💡 Tips Optimasi Gratis

### Frontend (Vercel)

- ✅ Bandwidth: 100GB/month
- ✅ Build time: 6000 minutes/month
- ✅ Functions: 100GB-hrs/month
- ✅ Custom domains support

### Backend (Render)

- ✅ 750 hours/month (cukup untuk 1 bulan penuh)
- ⚠️ Sleep setelah 15 menit tidak aktif
- ⚠️ Cold start ~30 detik

### Database (Supabase)

- ✅ 2 projects
- ✅ 500MB database
- ✅ 2GB bandwidth/month
- ✅ 50K monthly active users

### AI Services (Hugging Face)

- ✅ Rate limit: 1000 requests/hour
- ✅ Model inference API gratis
- ⚠️ Response time lebih lambat di free tier

## 🚨 Troubleshooting

### Backend tidak bisa diakses

1. Check Render logs di dashboard
2. Pastikan environment variables sudah benar
3. Test endpoint `/health` dulu

### Frontend tidak connect ke backend

1. Check CORS settings di backend
2. Pastikan `NEXT_PUBLIC_API_URL` benar
3. Check browser console untuk errors

### Database connection error

1. Verify Supabase API keys
2. Check Row Level Security policies
3. Test dengan simple query dulu

### AI features tidak berfungsi

1. Verify Hugging Face API token
2. Check rate limits
3. Test dengan model sederhana dulu

## 📊 Monitoring

### Free Tools untuk Monitoring:

1. **Vercel Analytics**: Built-in performance monitoring
2. **Render Metrics**: Basic CPU/memory usage
3. **Supabase Monitoring**: Database performance
4. **UptimeRobot**: Free uptime monitoring (optional)

## 🔄 Updates & Maintenance

### Automatic Deployments:

- **Frontend**: Auto-deploy setiap push ke main branch
- **Backend**: Auto-deploy setiap push ke main branch
- **Database**: Manual migration via Supabase dashboard

### Regular Maintenance:

1. Monitor Render free hours usage
2. Check Supabase storage usage
3. Monitor API rate limits
4. Update dependencies monthly

---

## 🎯 Hasil Akhir

Setelah mengikuti panduan ini, Anda akan memiliki:

✅ **Platform Asisten Wira yang fully functional**  
✅ **Deploy secara gratis dengan free tiers**  
✅ **Database PostgreSQL dengan Supabase**  
✅ **AI integration dengan Hugging Face**  
✅ **Auto-deployment dari GitHub**  
✅ **SSL certificate otomatis**  
✅ **Professional URLs untuk branding**

**Total Biaya: Rp 0,-** 🎉

Dengan batasan free tier yang sangat reasonable untuk development dan testing!
