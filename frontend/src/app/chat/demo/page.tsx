"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Bot, 
  User, 
  ArrowLeft,
  Sparkles,
  Shield,
  Brain
} from "lucide-react";
import Link from "next/link";

interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: string;
  sentiment?: "positive" | "negative" | "neutral";
  confidence?: number;
  isHoaxDetected?: boolean;
  processingTime?: number;
}

export default function DemoChatPage() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [stats, setStats] = useState({
    totalMessages: 0,
    hoaxDetected: 0,
    avgSentiment: "positive"
  });

  useEffect(() => {
    // Initialize with demo greeting
    const greetingMessage: ChatMessage = {
      id: "demo-greeting",
      content: "🎉 Selamat datang di Demo Asisten Wira! Saya adalah chatbot AI yang dapat membantu bisnis UMKM. Coba tanyakan tentang produk, layanan, atau apa saja! Saya juga bisa mendeteksi hoax dan menganalisis sentimen. Silakan dicoba! 😊",
      sender: "bot",
      timestamp: new Date().toISOString(),
      sentiment: "positive",
      confidence: 0.95
    };
    setMessages([greetingMessage]);
  }, []);

  useEffect(() => {
    scrollToBottom();
    updateStats();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const updateStats = () => {
    const userMessages = messages.filter(m => m.sender === "user");
    const hoaxCount = messages.filter(m => m.isHoaxDetected).length;
    const positiveCount = messages.filter(m => m.sentiment === "positive").length;
    
    setStats({
      totalMessages: userMessages.length,
      hoaxDetected: hoaxCount,
      avgSentiment: positiveCount > messages.length / 2 ? "positive" : "neutral"
    });
  };

  const simulateTyping = () => {
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), Math.random() * 1000 + 1000);
  };

  const generateDemoResponse = async (userMessage: string): Promise<ChatMessage> => {
    const startTime = Date.now();
    const lowerMessage = userMessage.toLowerCase();
    let response = "";
    let sentiment: "positive" | "negative" | "neutral" = "neutral";
    let isHoaxDetected = false;
    
    // Enhanced demo responses with AI features showcase
    if (lowerMessage.includes("halo") || lowerMessage.includes("hai") || lowerMessage.includes("hello")) {
      response = "Halo! 👋 Saya Asisten Wira, chatbot AI yang dirancang khusus untuk UMKM Indonesia. Saya bisa membantu dengan:\n\n✨ Menjawab pertanyaan produk\n🛡️ Mendeteksi hoax/misinformasi\n📊 Analisis sentimen pelanggan\n🤖 Chat 24/7 tanpa henti\n\nAda yang ingin Anda coba?";
      sentiment = "positive";
    } else if (lowerMessage.includes("fitur") || lowerMessage.includes("kemampuan")) {
      response = "Saya memiliki berbagai fitur canggih:\n\n🧠 **AI Natural Language Processing** - Memahami bahasa natural Indonesia\n🛡️ **Deteksi Hoax** - Mengidentifikasi misinformasi otomatis\n📊 **Analisis Sentimen** - Memahami emosi pelanggan\n⚡ **Respons Real-time** - Jawaban instan 24/7\n🎯 **Konteks Bisnis** - Disesuaikan dengan industri Anda\n\nMau coba fitur mana dulu?";
      sentiment = "positive";
    } else if (lowerMessage.includes("hoax") || lowerMessage.includes("berita")) {
      response = "Saya bisa mendeteksi hoax dan misinformasi! Coba kirimkan teks yang mencurigakan atau berita yang ingin diverifikasi. Misalnya, coba ketik sesuatu seperti: 'Dapatkan jutaan rupiah gratis hanya dengan klik link ini!'";
      sentiment = "positive";
    } else if (lowerMessage.includes("sentimen")) {
      response = "Fitur analisis sentimen saya bisa mendeteksi emosi dalam teks:\n\n😊 **Positif**: Senang, puas, recommend\n😐 **Netral**: Pertanyaan biasa, informasi\n😞 **Negatif**: Kecewa, komplain, marah\n\nCoba tulis kalimat dengan emosi yang berbeda untuk melihat hasilnya!";
      sentiment = "positive";
    } else if (lowerMessage.includes("gratis") && (lowerMessage.includes("jutaan") || lowerMessage.includes("menang") || lowerMessage.includes("klik"))) {
      response = "⚠️ **PERINGATAN HOAX TERDETEKSI!** ⚠️\n\nTeks yang Anda kirim mengandung karakteristik penipuan online:\n• Janji keuntungan instan\n• Kata 'gratis' + 'jutaan'\n• Mengajak klik link\n\n🛡️ Saya melindungi bisnis Anda dari konten berbahaya seperti ini. Fitur ini otomatis akan memblokir atau memberi peringatan pada pelanggan!";
      isHoaxDetected = true;
      sentiment = "negative";
    } else if (lowerMessage.includes("bagus") || lowerMessage.includes("mantap") || lowerMessage.includes("recommended") || lowerMessage.includes("puas")) {
      response = "😊 **Sentimen Positif Terdeteksi!** Terima kasih atas feedback positif Anda! Saya mendeteksi:\n\n📊 Confidence: 92%\n💚 Sentiment: Sangat Positif\n🎯 Kategori: Customer Satisfaction\n\nData ini akan masuk ke dashboard analytics untuk membantu bisnis memahami kepuasan pelanggan!";
      sentiment = "positive";
    } else if (lowerMessage.includes("jelek") || lowerMessage.includes("buruk") || lowerMessage.includes("kecewa") || lowerMessage.includes("lambat")) {
      response = "😔 **Sentimen Negatif Terdeteksi.** Mohon maaf atas ketidaknyamanan yang Anda alami.\n\n📊 Analysis:\n• Confidence: 88%\n• Sentiment: Negatif\n• Priority: Tinggi\n\n🚨 Saya akan otomatis memberikan notifikasi kepada tim customer service untuk penanganan segera. Kepuasan Anda adalah prioritas kami!";
      sentiment = "negative";
    } else if (lowerMessage.includes("produk") || lowerMessage.includes("barang")) {
      response = "🛍️ Kami memiliki berbagai produk berkualitas tinggi! Saya bisa membantu Anda menemukan produk yang tepat. Beritahu saya:\n\n• Kategori produk yang dicari\n• Budget range\n• Spesifikasi khusus\n• Ukuran atau warna preferensi\n\nSaya akan memberikan rekomendasi terbaik berdasarkan data dan preferensi Anda!";
      sentiment = "positive";
    } else if (lowerMessage.includes("harga") || lowerMessage.includes("price")) {
      response = "💰 Untuk informasi harga terkini:\n\n✅ Semua harga sudah termasuk PPN\n🚚 Free ongkir untuk pembelian >Rp 300K\n💳 Tersedia cicilan 0% untuk kartu kredit\n🎁 Promo spesial setiap weekend\n\nSebutkan produk spesifik yang Anda minati untuk quote harga yang akurat!";
      sentiment = "positive";
    } else if (lowerMessage.includes("ai") || lowerMessage.includes("artificial")) {
      response = "🤖 **Tentang AI Saya:**\n\n🧠 Ditenagai oleh teknologi IBM Watson + Hugging Face\n🇮🇩 Dioptimalkan khusus untuk Bahasa Indonesia\n📚 Terus belajar dari setiap interaksi\n⚡ Processing time rata-rata <1 detik\n🎯 Accuracy rate 95% untuk industri UMKM\n\nSaya bukan bot biasa - saya adalah AI assistant yang cerdas!";
      sentiment = "positive";
    } else {
      response = "Terima kasih atas pertanyaan Anda! 🤔 Saya sedang memproses dengan AI engine saya...\n\nSebagai demo, coba tanyakan tentang:\n• 'Fitur apa saja yang kamu punya?'\n• 'Bagaimana cara deteksi hoax?'\n• 'Analisis sentimen gimana?'\n• Atau kirim teks untuk dianalisis!\n\n💡 Tip: Coba tulis 'Produk ini bagus sekali!' atau 'Saya kecewa dengan layanan ini' untuk melihat analisis sentimen real-time!";
      sentiment = "neutral";
    }

    const processingTime = Date.now() - startTime;

    return {
      id: Date.now().toString(),
      content: response,
      sender: "bot",
      timestamp: new Date().toISOString(),
      sentiment,
      confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0
      isHoaxDetected,
      processingTime
    };
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "user", 
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsLoading(true);
    simulateTyping();

    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      const botResponse = await generateDemoResponse(userMessage.content);
      setMessages(prev => [...prev, botResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickPrompts = [
    "Fitur apa saja yang kamu punya?",
    "Bagaimana cara deteksi hoax?",
    "Produk ini bagus sekali recommended!",
    "Saya kecewa dengan layanan ini",
    "Dapatkan jutaan rupiah gratis klik disini!"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/demo">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali ke Demo
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Demo Chatbot AI</h1>
                <p className="text-slate-600">Coba semua fitur Asisten Wira secara interaktif</p>
              </div>
            </div>
            
            {/* Live Stats */}
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{stats.totalMessages}</div>
                <div className="text-xs text-slate-500">Pesan</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">{stats.hoaxDetected}</div>
                <div className="text-xs text-slate-500">Hoax</div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-bold ${stats.avgSentiment === 'positive' ? 'text-green-600' : 'text-gray-600'}`}>
                  {stats.avgSentiment === 'positive' ? '😊' : '😐'}
                </div>
                <div className="text-xs text-slate-500">Mood</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-6xl p-4">
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Asisten Wira Demo</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>AI Active • Real-time Analysis</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className="max-w-[85%] flex gap-2">
                      {message.sender === "bot" && (
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      )}
                      
                      <div>
                        <div
                          className={`p-3 rounded-lg ${
                            message.sender === "user"
                              ? "bg-blue-500 text-white"
                              : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          <pre className="text-sm whitespace-pre-wrap font-sans">{message.content}</pre>
                          
                          {/* AI Analysis Badges */}
                          {message.sender === "bot" && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {message.sentiment && (
                                <Badge variant="outline" className="text-xs">
                                  <Brain className="h-3 w-3 mr-1" />
                                  {message.sentiment}
                                </Badge>
                              )}
                              {message.isHoaxDetected && (
                                <Badge variant="destructive" className="text-xs">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Hoax Alert
                                </Badge>
                              )}
                              {message.confidence && (
                                <Badge variant="secondary" className="text-xs">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  {(message.confidence * 100).toFixed(0)}%
                                </Badge>
                              )}
                              {message.processingTime && (
                                <Badge variant="outline" className="text-xs">
                                  ⚡ {message.processingTime}ms
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      
                      {message.sender === "user" && (
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {/* Typing indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="flex gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-slate-100 p-3 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Coba tanyakan sesuatu atau test fitur AI..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={isLoading || !newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions & Info */}
          <div className="space-y-6">
            {/* Quick Prompts */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">💡 Coba Prompt Ini</h3>
                <div className="space-y-2">
                  {quickPrompts.map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full text-left justify-start h-auto p-2 whitespace-normal"
                      onClick={() => setNewMessage(prompt)}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Features Demo */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">🚀 Fitur Yang Bisa Dicoba</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Brain className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">AI Natural Language</div>
                      <div className="text-slate-600">Tanya apa saja dalam bahasa natural</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Deteksi Hoax</div>
                      <div className="text-slate-600">Kirim teks mencurigakan untuk dianalisis</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Analisis Sentimen</div>
                      <div className="text-slate-600">Tulis kalimat emosional untuk deteksi mood</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold mb-2">Impressed? 🤩</h3>
                <p className="text-sm mb-3 opacity-90">
                  Buat chatbot AI seperti ini untuk bisnis Anda!
                </p>
                <Link href="/register">
                  <Button variant="secondary" size="sm" className="w-full">
                    Mulai Gratis Sekarang
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
