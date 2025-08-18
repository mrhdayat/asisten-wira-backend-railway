# 🚀 Asisten Wira AI

**Platform AI No-Code untuk Pemberdayaan UMKM Indonesia**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://docker.com)

## 🌟 Fitur Unggulan

- 🤖 **AI Chatbot No-Code** - Buat chatbot tanpa programming
- 🧠 **Multi-Provider AI** - IBM Granite, OpenAI GPT-OSS-20B, Hugging Face
- 🛡️ **Hoax Detection** - Deteksi misinformasi dengan AI
- 📊 **Sentiment Analysis** - Analisis perasaan pelanggan
- 🌐 **24/7 Service** - Chatbot bekerja tanpa henti
- ⚡ **Instant Deploy** - Integrasi website dengan satu klik
- 📱 **Responsive Design** - Bekerja di semua device

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (untuk development)
- Python 3.9+ (untuk development)

### 1. Clone Repository

```bash
git clone https://github.com/mrhdayat/asisten-wira-ai.git
cd asisten-wira-ai
```

### 2. Setup Environment

```bash
# Copy environment template
cp env.docker .env

# Edit .env dengan API keys Anda
nano .env
```

### 3. Jalankan dengan Docker

```bash
# Start semua services
./start-docker.sh

# Atau manual
docker-compose up -d
```

### 4. Akses Aplikasi

- 🌐 **Frontend**: http://localhost:3000
- 🔌 **Backend API**: http://localhost:8000
- 💬 **Chat Demo**: http://localhost:3000/chat/2

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   AI Services   │
│   (Next.js)     │◄──►│   (FastAPI)     │◄──►│   (IBM/Replicate│
│                 │    │                 │    │   /HuggingFace) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Supabase      │    │   Docker        │    │   Environment   │
│   (Database)    │    │   (Container)   │    │   (Config)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend

- **Next.js 14** - React framework dengan App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **ShadCN UI** - Beautiful components
- **Framer Motion** - Smooth animations

### Backend

- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation
- **JWT** - Authentication

### AI & ML

- **IBM Watsonx** - Enterprise AI models
- **Replicate** - Cloud AI inference
- **Hugging Face** - Open source AI models
- **Multi-tier Fallback** - Robust AI service

### Infrastructure

- **Docker** - Containerization
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Database
- **Row Level Security** - Data protection

## 📚 Documentation

- 📖 [AI Architecture](AI_ARCHITECTURE.md)
- 🔌 [AI Providers Comparison](AI_PROVIDERS_COMPARISON.md)
- 🗄️ [Database Setup](DATABASE_SETUP.md)
- 🚀 [Deployment Guide](DEPLOYMENT.md)
- 💰 [Free Deployment Guide](FREE_DEPLOYMENT_GUIDE.md)
- 🧪 [Cara Mencoba Chatbot](CARA_MENCOBA_CHATBOT.md)

## 🎯 Use Cases

### UMKM Fashion

- Rekomendasi produk berdasarkan preferensi
- Informasi ukuran dan warna
- Tracking pesanan

### UMKM F&B

- Menu recommendations
- Reservasi dan pemesanan
- Feedback collection

### UMKM Services

- Appointment booking
- FAQ automation
- Customer support 24/7

## 🔧 Development

### Backend Development

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# atau
venv\Scripts\activate     # Windows

pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Testing

```bash
# Test AI Service
cd backend
python test_ai_service_new.py

# Test Backend
curl http://localhost:8000/health
curl http://localhost:8000/ai/status
```

## 🚀 Deployment

### Free Tier Options

- **Frontend**: Vercel, Netlify
- **Backend**: Render, Fly.io, Railway
- **Database**: Supabase (free tier)
- **AI Models**: Hugging Face Spaces

### Production

- **Docker**: Production-ready containers
- **Environment Variables**: Secure configuration
- **Health Checks**: Monitoring & alerts
- **Logging**: Structured logging

## 🤝 Contributing

Kami menyambut kontribusi! Lihat [CONTRIBUTING.md](CONTRIBUTING.md) untuk panduan lengkap.

### How to Contribute

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request


## 🙏 Acknowledgments

- **IBM** - Watsonx dan Granite models
- **Hugging Face** - Open source AI community
- **Supabase** - Backend-as-a-Service
- **Next.js Team** - Amazing React framework
- **FastAPI** - Modern Python web framework

## 📞 Support

- 📧 **Email**: support@asistenwira.ai
- 💬 **Discord**: [Join our community](https://discord.gg/asistenwira)
- 📖 **Documentation**: [docs.asistenwira.ai](https://docs.asistenwira.ai)
- 🐛 **Issues**: [GitHub Issues](https://github.com/mrhdayat/asisten-wira-ai/issues)

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=mrhdayat/asisten-wira-ai&type=Date)](https://star-history.com/#mrhdayat/asisten-wira-ai&Date)

---

<div align="center">
Made with ❤️ for UMKM Indonesia
<br>
<a href="https://asistenwira.ai">🌐 Website</a> • 
<a href="https://docs.asistenwira.ai">📚 Docs</a> • 
<a href="https://demo.asistenwira.ai">🚀 Demo</a>
</div>
