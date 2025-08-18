# 🚀 Deployment Guide - Asisten Wira

## Quick Deployment Summary

### ✅ What's Been Built

1. **Frontend (Next.js 14)**

   - Modern landing page with animations
   - Authentication system (register/login)
   - Dashboard for chatbot management
   - Demo page for AI features
   - Responsive design with ShadCN UI + Aceternity UI

2. **Backend (FastAPI)**

   - Complete API with authentication
   - Supabase integration for database
   - AI services (IBM Orchestrate + Hugging Face)
   - Hoax detection and sentiment analysis
   - Conversation logging and analytics

3. **Database (Supabase)**

   - PostgreSQL with Row Level Security
   - Tables for users, chatbots, conversations
   - Knowledge base with vector support
   - Analytics and usage tracking

4. **AI Integration**
   - IBM Orchestrate for enterprise features
   - Hugging Face for free tier
   - Automatic fallback system
   - Indonesian language support

## 🏃‍♂️ Quick Start (Development)

### 1. Start Backend

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn main:app --reload --port 8000
```

### 2. Start Frontend

```bash
cd frontend
npm run dev
```

### 3. Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 🔧 Environment Setup

### Backend (.env)

```env
SUPABASE_URL=https://dkxiszylxbgtenfsmzdk.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
IBM_ORCHESTRATE_API_KEY=your-ibm-api-key
IBM_ORCHESTRATE_BASE_URL=your-ibm-base-url
HUGGINGFACE_API_TOKEN=your-hf-token
REPLICATE_API_TOKEN=your-replicate-token
JWT_SECRET_KEY=your-secret-key
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://dkxiszylxbgtenfsmzdk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🌐 Production Deployment

### 1. Database Setup (Supabase)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create new project (if not already created)
3. Run SQL from `backend/database/schema.sql`
4. Enable Row Level Security
5. Configure authentication settings

### 2. Backend Deployment (Render/Fly.io)

#### Option A: Render

1. Connect GitHub repository
2. Choose "Web Service"
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables
6. Deploy

#### Option B: Fly.io

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Initialize and deploy
cd backend
fly launch
fly deploy
```

### 3. Frontend Deployment (Vercel)

1. Connect GitHub repository to Vercel
2. Set framework preset: "Next.js"
3. Add environment variables
4. Deploy automatically

## 📊 Database Schema Setup

Run this SQL in Supabase SQL Editor:

```sql
-- Copy the entire content from backend/database/schema.sql
-- This creates all necessary tables and policies
```

## 🔑 API Keys Setup

### IBM Orchestrate

1. Go to IBM Cloud Console
2. Create Watson service
3. Get API key and instance URL
4. Add to environment variables

### Hugging Face

1. Go to [Hugging Face](https://huggingface.co/)
2. Create account and get API token
3. Add to environment variables

### Replicate (Optional)

1. Go to [Replicate](https://replicate.com/)
2. Get API token
3. Add to environment variables

## 🧪 Testing

### Backend API Test

```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy","service":"asisten-wira-api"}
```

### Frontend Test

1. Visit http://localhost:3000
2. Test registration and login
3. Try demo features
4. Create a test chatbot

## 📱 Features Available

### ✅ Currently Working

- User registration and authentication
- Chatbot creation and management
- AI chat responses (with fallback)
- Hoax detection (basic)
- Sentiment analysis (basic)
- Dashboard analytics
- Demo page with live testing

### 🚧 In Development

- Advanced vector search for knowledge base
- File upload processing
- Real-time chat widget
- Advanced analytics dashboard
- Subscription management

## 🚨 Known Issues & Solutions

### Issue: SSL Warning

```
NotOpenSSLWarning: urllib3 v2 only supports OpenSSL 1.1.1+
```

**Solution**: This is a warning only, application works fine. To fix, update system OpenSSL.

### Issue: Dependency Conflicts

**Solution**: Use the simplified requirements.txt with flexible version constraints.

### Issue: Supabase Connection

**Solution**: Ensure environment variables are correctly set and Supabase project is active.

## 📈 Scaling Considerations

### For Production

1. **Database**: Use Supabase Pro for better performance
2. **Backend**: Scale horizontally with load balancer
3. **Frontend**: Use Vercel Pro for better performance
4. **AI**: Implement proper rate limiting and caching
5. **Storage**: Use Supabase Storage for file uploads

### Performance Optimizations

1. Implement Redis caching for AI responses
2. Use CDN for static assets
3. Optimize database queries with indexes
4. Implement proper error handling and logging

## 📞 Support & Troubleshooting

### Common Commands

```bash
# Backend logs
cd backend && python -m uvicorn main:app --log-level debug

# Frontend logs
cd frontend && npm run dev

# Database migrations
# Use Supabase migrations for schema changes

# Check API health
curl http://localhost:8000/health
```

### Debugging Tips

1. Check browser console for frontend errors
2. Check terminal output for backend errors
3. Verify environment variables are loaded
4. Test API endpoints individually
5. Check Supabase logs for database issues

## 🎯 Next Steps

1. **Setup Database**: Run schema.sql in Supabase
2. **Deploy Backend**: Choose Render or Fly.io
3. **Deploy Frontend**: Connect to Vercel
4. **Test Integration**: Ensure all services communicate
5. **Add SSL**: Configure custom domain with HTTPS
6. **Monitor**: Set up logging and error tracking

---

**🎉 Your Asisten Wira platform is ready for deployment!**

For technical support or questions, refer to the main README.md file.
