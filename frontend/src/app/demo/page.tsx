"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Send, 
  Bot, 
  Shield, 
  Brain, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  MessageSquare
} from "lucide-react";
import Link from "next/link";

interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: string;
  sentiment?: string;
  hoaxCheck?: boolean;
}

export default function DemoPage() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content: "Halo! Saya adalah Asisten Wira, chatbot AI untuk UMKM. Bagaimana saya bisa membantu Anda hari ini?",
      sender: "bot",
      timestamp: new Date().toISOString()
    }
  ]);
  
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Demo states for AI features
  const [hoaxText, setHoaxText] = useState("");
  const [hoaxResult, setHoaxResult] = useState<{
    is_hoax: boolean;
    confidence: number;
    explanation: string;
  } | null>(null);
  const [sentimentText, setSentimentText] = useState("");
  const [sentimentResult, setSentimentResult] = useState<{
    sentiment: string;
    confidence: number;
    emotions?: Record<string, number>;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "user",
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: getDemoResponse(newMessage),
        sender: "bot",
        timestamp: new Date().toISOString(),
        sentiment: "positive",
        hoaxCheck: false
      };
      
      setChatMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
    }, 2000);
  };

  const getDemoResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes("produk") || lowerMessage.includes("barang")) {
      return "Kami memiliki berbagai produk berkualitas! Apakah Anda mencari kategori tertentu? Saya bisa membantu merekomendasikan produk yang sesuai dengan kebutuhan Anda.";
    } else if (lowerMessage.includes("harga") || lowerMessage.includes("price")) {
      return "Untuk informasi harga terbaru, silakan kunjungi halaman produk kami. Kami juga sering memberikan promo menarik! Apakah ada produk spesifik yang ingin Anda tanyakan harganya?";
    } else if (lowerMessage.includes("pengiriman") || lowerMessage.includes("delivery")) {
      return "Kami melayani pengiriman ke seluruh Indonesia dengan berbagai pilihan ekspedisi. Estimasi pengiriman 2-5 hari kerja. Biaya pengiriman akan dihitung otomatis saat checkout.";
    } else {
      return "Terima kasih atas pertanyaan Anda! Saya sedang belajar untuk memberikan jawaban yang lebih baik. Tim customer service kami juga siap membantu jika diperlukan.";
    }
  };

  const analyzeHoax = async () => {
    if (!hoaxText.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate hoax detection
    setTimeout(() => {
      const isHoax = hoaxText.toLowerCase().includes("gratis") && hoaxText.toLowerCase().includes("klik") 
                     || hoaxText.toLowerCase().includes("menang") && hoaxText.toLowerCase().includes("jutaan");
      
      setHoaxResult({
        is_hoax: isHoax,
        confidence: isHoax ? 0.87 : 0.23,
        explanation: isHoax 
          ? "Teks ini menunjukkan karakteristik umum dari penipuan online dengan janji keuntungan instan."
          : "Teks ini tampaknya tidak mengandung indikasi misinformasi atau penipuan."
      });
      
      setIsAnalyzing(false);
    }, 1500);
  };

  const analyzeSentiment = async () => {
    if (!sentimentText.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate sentiment analysis
    setTimeout(() => {
      const positiveWords = ["bagus", "senang", "puas", "recommended", "mantap"];
      const negativeWords = ["buruk", "kecewa", "jelek", "lambat", "mahal"];
      
      const hasPositive = positiveWords.some(word => sentimentText.toLowerCase().includes(word));
      const hasNegative = negativeWords.some(word => sentimentText.toLowerCase().includes(word));
      
      let sentiment = "neutral";
      let confidence = 0.6;
      
      if (hasPositive && !hasNegative) {
        sentiment = "positive";
        confidence = 0.85;
      } else if (hasNegative && !hasPositive) {
        sentiment = "negative";
        confidence = 0.82;
      }
      
      setSentimentResult({
        sentiment,
        confidence,
        emotions: {
          joy: sentiment === "positive" ? 0.8 : 0.2,
          trust: sentiment === "positive" ? 0.7 : 0.3,
          sadness: sentiment === "negative" ? 0.7 : 0.1,
          anger: sentiment === "negative" ? 0.6 : 0.1,
          neutral: sentiment === "neutral" ? 0.8 : 0.3
        }
      });
      
      setIsAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center text-slate-600 hover:text-slate-800 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke beranda
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Title */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Demo Asisten Wira
          </h1>
          <p className="text-xl text-slate-600">
            Coba langsung fitur-fitur AI canggih untuk UMKM Anda
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Chatbot Demo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bot className="h-5 w-5 mr-2 text-blue-500" />
                  Chatbot Demo
                </CardTitle>
                <CardDescription>
                  Coba berbicara dengan AI assistant seperti pelanggan Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-96">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.sender === "user"
                            ? "bg-blue-500 text-white"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        {message.sender === "bot" && (
                          <div className="flex gap-2 mt-2">
                            {message.sentiment && (
                              <Badge variant="outline" className="text-xs">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Sentimen: {message.sentiment}
                              </Badge>
                            )}
                            {message.hoaxCheck !== undefined && (
                              <Badge variant="outline" className="text-xs">
                                <Shield className="h-3 w-3 mr-1" />
                                Cek Hoax: Aman
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 p-3 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Tulis pesan Anda..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={isLoading}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Features Demo */}
          <div className="space-y-6">
            {/* Hoax Detection */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-red-500" />
                    Deteksi Hoax
                  </CardTitle>
                  <CardDescription>
                    Coba fitur deteksi misinformasi dan penipuan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Masukkan teks yang ingin dianalisis..."
                    value={hoaxText}
                    onChange={(e) => setHoaxText(e.target.value)}
                    rows={3}
                  />
                  <Button 
                    onClick={analyzeHoax} 
                    disabled={isAnalyzing || !hoaxText.trim()}
                    className="w-full"
                  >
                    {isAnalyzing ? "Menganalisis..." : "Analisis Hoax"}
                  </Button>
                  
                  {hoaxResult && (
                    <div className={`p-4 rounded-lg ${hoaxResult.is_hoax ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}>
                      <div className="flex items-center mb-2">
                        {hoaxResult.is_hoax ? (
                          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        )}
                        <span className="font-medium">
                          {hoaxResult.is_hoax ? "Potensi Hoax Terdeteksi" : "Tidak Terdeteksi Hoax"}
                        </span>
                      </div>
                      <p className="text-sm mb-2">
                        Tingkat kepercayaan: {(hoaxResult.confidence * 100).toFixed(1)}%
                      </p>
                      <p className="text-sm text-slate-600">
                        {hoaxResult.explanation}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Sentiment Analysis */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-purple-500" />
                    Analisis Sentimen
                  </CardTitle>
                  <CardDescription>
                    Pahami emosi dan perasaan dari teks pelanggan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Masukkan review atau komentar pelanggan..."
                    value={sentimentText}
                    onChange={(e) => setSentimentText(e.target.value)}
                    rows={3}
                  />
                  <Button 
                    onClick={analyzeSentiment} 
                    disabled={isAnalyzing || !sentimentText.trim()}
                    className="w-full"
                  >
                    {isAnalyzing ? "Menganalisis..." : "Analisis Sentimen"}
                  </Button>
                  
                  {sentimentResult && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Sentimen:</span>
                        <Badge 
                          variant={sentimentResult.sentiment === "positive" ? "default" : 
                                  sentimentResult.sentiment === "negative" ? "destructive" : "secondary"}
                        >
                          {sentimentResult.sentiment === "positive" ? "Positif" :
                           sentimentResult.sentiment === "negative" ? "Negatif" : "Netral"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Kepercayaan:</span>
                        <span>{(sentimentResult.confidence * 100).toFixed(1)}%</span>
                      </div>
                      
                      {sentimentResult.emotions && (
                        <div>
                          <p className="font-medium mb-2">Distribusi Emosi:</p>
                          <div className="space-y-2">
                            {Object.entries(sentimentResult.emotions).map(([emotion, score]) => (
                              <div key={emotion} className="flex items-center justify-between text-sm">
                                <span className="capitalize">{emotion}</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-20 bg-slate-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-500 h-2 rounded-full" 
                                      style={{ width: `${(score as number) * 100}%` }}
                                    ></div>
                                  </div>
                                  <span>{((score as number) * 100).toFixed(0)}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Call to Action */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="p-8">
            <h3 className="text-2xl font-bold text-slate-800 mb-4">
              Impressed dengan Demo?
            </h3>
            <p className="text-slate-600 mb-6">
              Daftar sekarang dan buat chatbot AI pertama Anda dalam hitungan menit!
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/register">
                <Button size="lg">
                  Daftar Gratis Sekarang
                </Button>
              </Link>
              <Link href="/chat/demo">
                <Button variant="outline" size="lg">
                  Coba Chatbot Demo
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
