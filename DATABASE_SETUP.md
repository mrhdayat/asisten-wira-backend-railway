# 🗄️ Database Setup Guide - Asisten Wira

## ❌ Masalah yang Terjadi

Error: `42501: must be owner of table users` terjadi karena kita mencoba memodifikasi tabel `auth.users` yang merupakan tabel sistem Supabase.

## ✅ Solusi

### Langkah 1: Gunakan Schema yang Benar

Gunakan file `backend/database/schema_clean.sql` yang sudah diperbaiki, bukan `schema.sql` yang lama.

### Langkah 2: Setup Database di Supabase

1. **Buka Supabase Dashboard**

   - Pergi ke https://supabase.com/dashboard
   - Pilih project Anda yang sudah ada

2. **Buka SQL Editor**

   - Klik tab "SQL Editor" di sidebar kiri
   - Klik "New Query"

3. **Copy-Paste Schema yang Benar**
   - Copy seluruh isi dari file `backend/database/schema_clean.sql`
   - Paste ke SQL Editor
   - Klik "Run" atau tekan Ctrl+Enter

### Langkah 3: Verifikasi Setup

Setelah menjalankan script, Anda harus melihat:

- ✅ 8 tabel baru dibuat
- ✅ Indexes dibuat
- ✅ Row Level Security policies dibuat
- ✅ Triggers untuk updated_at dibuat
- ✅ Pesan sukses di output

### Langkah 4: Test Koneksi

Jalankan query test ini di SQL Editor:

```sql
-- Test query untuk memastikan semua tabel ada
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'profiles', 'chatbots', 'knowledge_base', 'conversations',
    'ai_analytics', 'file_uploads', 'subscriptions', 'usage_tracking'
  );
```

Harus mengembalikan 8 baris dengan nama tabel.

## 🔧 Troubleshooting

### Jika Masih Ada Error:

1. **Error: "relation already exists"**

   ```sql
   -- Drop existing tables first (HATI-HATI!)
   DROP TABLE IF EXISTS usage_tracking CASCADE;
   DROP TABLE IF EXISTS subscriptions CASCADE;
   DROP TABLE IF EXISTS file_uploads CASCADE;
   DROP TABLE IF EXISTS ai_analytics CASCADE;
   DROP TABLE IF EXISTS conversations CASCADE;
   DROP TABLE IF EXISTS knowledge_base CASCADE;
   DROP TABLE IF EXISTS chatbots CASCADE;
   DROP TABLE IF EXISTS profiles CASCADE;
   ```

2. **Error: "permission denied"**

   - Pastikan Anda login sebagai owner project
   - Cek role permissions di Supabase dashboard

3. **Error: "function does not exist"**
   - Jalankan bagian function dan trigger secara terpisah
   - Pastikan PostgreSQL version compatible

### Manual Setup (Jika Auto Script Gagal):

**Step 1: Buat tabel satu per satu**

```sql
-- 1. Profiles table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    business_name TEXT,
    industry TEXT,
    avatar_url TEXT,
    subscription_plan TEXT DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Step 2: Enable RLS**

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

**Step 3: Create Policies**

```sql
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
```

Ulangi untuk semua tabel lainnya.

## 🚀 Quick Commands

### Backend Server

```bash
cd /Users/dracoseven/asisten-wira/backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

### Frontend Server

```bash
cd /Users/dracoseven/asisten-wira/frontend
npm run dev
```

### Check API Health

```bash
curl http://localhost:8000/health
```

## 📊 Expected Database Structure

Setelah setup berhasil, Anda akan memiliki:

```
📁 Supabase Database
├── 🔐 auth.users (managed by Supabase)
├── 👤 profiles (user data)
├── 🤖 chatbots (chatbot configs)
├── 📚 knowledge_base (training data)
├── 💬 conversations (chat logs)
├── 🧠 ai_analytics (AI processing results)
├── 📁 file_uploads (file management)
├── 💳 subscriptions (plan management)
└── 📊 usage_tracking (usage metrics)
```

## ✅ Validation Checklist

- [ ] Schema script run without errors
- [ ] All 8 tables created
- [ ] RLS policies active
- [ ] Backend server starts successfully
- [ ] Frontend connects to Supabase
- [ ] Registration/login works
- [ ] Dashboard loads chatbots

## 📞 Need Help?

Jika masih ada masalah:

1. Check Supabase project status
2. Verify API keys in environment variables
3. Check network connectivity
4. Review Supabase logs
5. Test with simple queries first

---

**🎯 Tujuan**: Database yang berfungsi penuh untuk Asisten Wira platform!
