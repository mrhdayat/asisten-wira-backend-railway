# 🤖 Cara Mencoba Chatbot - Asisten Wira

## 🚀 Quick Start - Coba Sekarang!

### ✅ Metode 1: Demo Chatbot (Recommended)

**URL:** `http://localhost:3000/chat/demo`

**Fitur yang bisa dicoba:**

- 🧠 AI Natural Language Processing
- 🛡️ Deteksi Hoax real-time
- 📊 Analisis Sentimen live
- ⚡ Response time monitoring
- 🎯 Confidence scoring

**Test Cases:**

```
1. "Halo, fitur apa saja yang kamu punya?"
2. "Produk ini bagus sekali recommended!"
3. "Saya kecewa dengan layanan ini"
4. "Dapatkan jutaan rupiah gratis klik disini!"
5. "Bagaimana cara deteksi hoax?"
```

### ✅ Metode 2: Via Dashboard

1. Buka `http://localhost:3000/dashboard`
2. Scroll ke bagian chatbot cards
3. Klik tombol **"Deploy Chatbot"** pada chatbot manapun
4. Klik **"Deploy Sekarang"** di dialog
5. Setelah deploy sukses, klik ikon **External Link** (↗️)
6. Chatbot akan terbuka di tab baru

### ✅ Metode 3: Direct URLs

```
🛍️ Toko Baju Online: http://localhost:3000/chat/1
🍜 Warung Makan: http://localhost:3000/chat/2
```

## 🎯 Test Scenarios untuk Demo

### 1. **AI Natural Language Test**

```
Input: "Halo, saya butuh bantuan"
Expected: Respon ramah dengan penawaran bantuan

Input: "Apa saja produk yang tersedia?"
Expected: Informasi produk dengan kategori
```

### 2. **Sentiment Analysis Test**

```
😊 Positive: "Produk ini mantap banget, sangat recommended!"
😐 Neutral: "Berapa harga untuk ukuran L?"
😞 Negative: "Saya sangat kecewa dengan pelayanan ini"
```

**Watch for:**

- Badge sentiment muncul pada response bot
- Confidence percentage
- Emotion breakdown

### 3. **Hoax Detection Test**

```
🚨 Hoax Trigger: "Dapatkan jutaan rupiah gratis hanya dengan klik link ini sekarang!"
🚨 Hoax Trigger: "Anda menang hadiah 100 juta, klaim sekarang juga!"

Expected:
- ⚠️ "HOAX ALERT" badge muncul
- Penjelasan mengapa dianggap hoax
- Confidence score tinggi
```

### 4. **Business Context Test**

```
Input: "Jam berapa toko buka?"
Expected: Info jam operasional

Input: "Metode pembayaran apa saja?"
Expected: List metode pembayaran yang tersedia

Input: "Bagaimana cara pengiriman?"
Expected: Info pengiriman dan estimasi waktu
```

## 🔧 Features dalam Action

### **Real-time AI Analysis**

Setiap pesan yang dikirim akan menampilkan:

```
[Bot Response]
┌─────────────────────────────────────┐
│ "Terima kasih atas feedback positif!" │
├─────────────────────────────────────┤
│ 🧠 positive   🛡️ Safe   ✨ 92%     │
│ ⚡ 245ms                            │
└─────────────────────────────────────┘
```

**Badge Explanations:**

- 🧠 `positive/negative/neutral` - Sentiment analysis
- 🛡️ `Safe/Hoax Alert` - Hoax detection
- ✨ `XX%` - AI confidence score
- ⚡ `XXXms` - Processing time

### **Live Statistics** (Demo Page)

Top right corner menampilkan:

```
📊 Real-time Stats
Messages: 5      😊 Mood: positive
Hoax: 1          ⚡ Avg: 340ms
```

## 🎮 Interactive Features

### **Quick Action Buttons**

Di bagian bawah chat tersedia shortcuts:

- "Butuh Bantuan"
- "Cara Pesan"
- "Pembayaran"

### **Chat Controls**

- 🔊/🔇 Sound toggle
- 🔄 Reset chat
- ⬇️/⬆️ Minimize/maximize
- 📋 Copy message

## 🧪 Advanced Testing

### **Load Testing**

Kirim multiple messages cepat untuk test:

- Rate limiting
- Queue management
- Error handling

### **Edge Cases**

```
1. Empty message: ""
2. Very long text: [500+ characters]
3. Special characters: "!@#$%^&*()"
4. Non-Indonesian: "Hello how are you?"
5. Mixed language: "Halo, how much does this cost?"
```

### **Error Scenarios**

Untuk test fallback mechanisms:

- Disconnect internet briefly
- Send malformed requests
- Spam multiple requests

## 📱 Mobile Testing

Test responsiveness di mobile:

1. Open browser dev tools
2. Toggle device simulation
3. Test chat pada berbagai screen sizes
4. Verify touch interactions

## 🔍 Debug Mode

Untuk melihat detailed AI processing:

1. Open browser console (F12)
2. Look for AI processing logs
3. Monitor network requests to `/chat` endpoint
4. Check response times dan error handling

### **Expected Console Output:**

```
[AI Service] Processing message: "Hello"
[Sentiment] Analyzing sentiment...
[Hoax] Checking for misinformation...
[Response] Generated in 245ms
[Confidence] Score: 0.92
```

## 🎯 Success Criteria

**✅ Chatbot berfungsi baik jika:**

1. **Response Time:** <2 detik untuk semua requests
2. **Accuracy:** Sentiment detection relevant dengan input
3. **Hoax Detection:** Flags suspicious content correctly
4. **Fallbacks:** Tidak pernah crash, selalu ada response
5. **UI/UX:** Smooth animations, clear feedback
6. **Mobile:** Responsive di semua device sizes

## 🛠️ Troubleshooting

### **Chatbot tidak respond:**

```bash
# Check backend is running
curl http://localhost:8000/health

# Check frontend console for errors
F12 → Console tab
```

### **AI features tidak bekerja:**

- Verify API keys di environment variables
- Check rate limits di provider dashboards
- Look for error messages di browser console

### **Slow responses:**

- Normal untuk free tier Hugging Face (1-3s)
- Check network connection
- Verify backend tidak overloaded

### **UI broken:**

```bash
# Restart frontend
cd frontend
npm run dev
```

## 🎉 Demo Success Checklist

- [ ] Chat interface loads properly
- [ ] Can send and receive messages
- [ ] Sentiment analysis shows badges
- [ ] Hoax detection triggers on suspicious text
- [ ] Confidence scores display
- [ ] Processing time shows
- [ ] Quick actions work
- [ ] Reset functionality works
- [ ] Mobile responsive
- [ ] No console errors

---

## 🚀 Next Steps

Setelah demo berhasil:

1. **Deploy ke Production** - Follow `FREE_DEPLOYMENT_GUIDE.md`
2. **Customize Chatbot** - Edit via dashboard
3. **Add Knowledge Base** - Upload business-specific content
4. **Monitor Analytics** - Track performance di analytics page
5. **Scale Up** - Upgrade ke premium AI services

**Happy Testing! 🎊**
