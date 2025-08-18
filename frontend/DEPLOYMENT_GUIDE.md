# 🚀 Deployment Guide - Asisten Wira Next.js

## **Overview**

Proyek ini telah dimigrasi dari FastAPI + Next.js menjadi **Fullstack Next.js** untuk deployment yang lebih mudah dan efisien.

## **🔄 Perubahan yang Telah Dilakukan**

### **Backend → API Routes**

- ✅ FastAPI endpoints → Next.js API routes
- ✅ Python dependencies → Node.js packages
- ✅ Database connection via Supabase
- ✅ JWT authentication middleware
- ✅ AI services integration

### **Struktur Baru**

```
frontend/
├── src/
│   ├── app/
│   │   ├── api/           # API Routes (Backend)
│   │   │   ├── auth/      # Authentication
│   │   │   ├── chatbots/  # Chatbot management
│   │   │   ├── chat/      # Chat processing
│   │   │   └── knowledge-base/ # Knowledge base
│   │   └── ...            # Frontend pages
│   ├── lib/
│   │   └── ai-services.ts # AI service utilities
│   └── middleware.ts      # JWT authentication
```

## **🚀 Deployment Steps**

### **1. Setup Environment Variables**

```bash
# Copy env_template.txt to .env.local
cp env_template.txt .env.local

# Edit .env.local dengan nilai yang sesuai
nano .env.local
```

### **2. Install Dependencies**

```bash
cd frontend
npm install
```

### **3. Build & Test Local**

```bash
npm run build
npm run start
```

### **4. Deploy ke Vercel**

```bash
# Install Vercel CLI
npm i -g vercel

# Login ke Vercel
vercel login

# Deploy
vercel --prod
```

## **🔑 Environment Variables yang Diperlukan**

### **Supabase (Required)**

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### **AI Services (Optional)**

```env
HUGGINGFACE_API_TOKEN=your_huggingface_token
REPLICATE_API_TOKEN=your_replicate_token
IBM_ORCHESTRATE_API_KEY=your_ibm_key
```

### **Security (Required)**

```env
JWT_SECRET_KEY=your_jwt_secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## **📊 API Endpoints**

### **Authentication**

- `POST /api/auth` - User login

### **Chatbots**

- `GET /api/chatbots` - Get all chatbots
- `POST /api/chatbots` - Create new chatbot

### **Chat**

- `POST /api/chat` - Process chat message

### **Knowledge Base**

- `GET /api/knowledge-base?chatbot_id=123` - Get KB items
- `POST /api/knowledge-base` - Add KB item

## **🔒 Security Features**

- ✅ JWT token authentication
- ✅ Protected API routes
- ✅ CORS configuration
- ✅ Input validation
- ✅ Error handling

## **🤖 AI Services Integration**

### **Available Providers**

1. **Simple AI** (Default) - Basic keyword matching
2. **HuggingFace** - Advanced NLP models
3. **Replicate** - Cloud AI inference
4. **IBM Watson** - Enterprise AI (Premium)

### **Usage**

```typescript
// In chat API
{
  "message": "Halo, apa kabar?",
  "chatbot_id": "123",
  "user_id": "456",
  "ai_provider": "huggingface" // or "replicate", "simple"
}
```

## **📱 Frontend Features**

- ✅ Responsive design
- ✅ Dark/Light theme
- ✅ Real-time chat
- ✅ Dashboard analytics
- ✅ User management
- ✅ Knowledge base editor

## **🚨 Troubleshooting**

### **Common Issues**

1. **Build Error**: Pastikan semua dependencies terinstall
2. **API Error**: Check environment variables
3. **Database Error**: Verify Supabase connection
4. **AI Service Error**: Check API tokens

### **Debug Commands**

```bash
# Check build
npm run build

# Check linting
npm run lint

# Check types
npx tsc --noEmit
```

## **📈 Performance Optimization**

- ✅ API routes optimization
- ✅ Static generation where possible
- ✅ Image optimization
- ✅ Bundle analysis
- ✅ Lazy loading

## **🔮 Future Enhancements**

- [ ] Edge runtime for AI processing
- [ ] Real-time chat with WebSocket
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Payment integration

## **📞 Support**

Jika ada masalah atau pertanyaan:

1. Check error logs di Vercel dashboard
2. Verify environment variables
3. Test API endpoints locally
4. Check Supabase connection

---

**🎉 Selamat! Proyek Anda siap di-deploy ke Vercel tanpa masalah Python dependencies!**
