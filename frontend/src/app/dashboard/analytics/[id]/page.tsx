"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, Users, MessageSquare, Clock, ThumbsUp, ThumbsDown, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface AnalyticsData {
  totalConversations: number;
  totalMessages: number;
  avgResponseTime: number;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  topIntents: Array<{
    intent: string;
    count: number;
  }>;
  dailyStats: Array<{
    date: string;
    conversations: number;
    sentiment: string;
  }>;
  recentConversations: Array<{
    id: string;
    userMessage: string;
    botResponse: string;
    sentiment: string;
    timestamp: string;
  }>;
}

export default function AnalyticsPage() {
  const params = useParams();
  const chatbotId = params.id as string;
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalConversations: 156,
    totalMessages: 1250,
    avgResponseTime: 0.85,
    sentimentDistribution: {
      positive: 65,
      neutral: 25,
      negative: 10
    },
    topIntents: [
      { intent: "Pertanyaan Produk", count: 45 },
      { intent: "Informasi Harga", count: 32 },
      { intent: "Customer Support", count: 28 },
      { intent: "Pengiriman", count: 21 },
      { intent: "Pembayaran", count: 15 }
    ],
    dailyStats: [
      { date: "2024-01-15", conversations: 12, sentiment: "positive" },
      { date: "2024-01-14", conversations: 18, sentiment: "positive" },
      { date: "2024-01-13", conversations: 15, sentiment: "neutral" },
      { date: "2024-01-12", conversations: 22, sentiment: "positive" },
      { date: "2024-01-11", conversations: 8, sentiment: "negative" }
    ],
    recentConversations: [
      {
        id: "1",
        userMessage: "Apakah produk ini tersedia dalam ukuran L?",
        botResponse: "Ya, produk tersebut tersedia dalam ukuran L. Stok saat ini tersedia 15 pieces. Apakah Anda ingin melakukan pemesanan?",
        sentiment: "positive",
        timestamp: "2024-01-15 14:30:00"
      },
      {
        id: "2", 
        userMessage: "Berapa lama pengiriman ke Jakarta?",
        botResponse: "Pengiriman ke Jakarta biasanya memakan waktu 2-3 hari kerja. Kami menggunakan ekspedisi terpercaya dengan asuransi.",
        sentiment: "neutral",
        timestamp: "2024-01-15 13:45:00"
      },
      {
        id: "3",
        userMessage: "Produk yang saya terima rusak!",
        botResponse: "Mohon maaf atas ketidaknyamanan ini. Saya akan segera menghubungkan Anda dengan tim customer service untuk penggantian produk.",
        sentiment: "negative", 
        timestamp: "2024-01-15 12:15:00"
      }
    ]
  });

  const [timeRange, setTimeRange] = useState("7d");

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return "text-green-600";
      case "negative": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return <ThumbsUp className="h-4 w-4" />;
      case "negative": return <ThumbsDown className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Dashboard
              </Button>
            </Link>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Analytics Chatbot</h1>
              <p className="text-slate-600">ID: {chatbotId}</p>
            </div>
            <div className="flex items-center gap-2">
              {["24h", "7d", "30d", "90d"].map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Percakapan</p>
                    <p className="text-3xl font-bold text-slate-800">{analyticsData.totalConversations}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
                <p className="text-sm text-green-600 mt-2">+12% dari minggu lalu</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Pesan</p>
                    <p className="text-3xl font-bold text-slate-800">{analyticsData.totalMessages}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-sm text-green-600 mt-2">+8% dari minggu lalu</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Waktu Respons Rata-rata</p>
                    <p className="text-3xl font-bold text-slate-800">{analyticsData.avgResponseTime}s</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-500" />
                </div>
                <p className="text-sm text-green-600 mt-2">-0.2s dari minggu lalu</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Sentimen Positif</p>
                    <p className="text-3xl font-bold text-slate-800">{analyticsData.sentimentDistribution.positive}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-500" />
                </div>
                <p className="text-sm text-green-600 mt-2">+5% dari minggu lalu</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Sentiment Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Distribusi Sentimen</CardTitle>
                <CardDescription>Analisis perasaan pelanggan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Positif</span>
                    </div>
                    <span className="text-sm text-slate-600">{analyticsData.sentimentDistribution.positive}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${analyticsData.sentimentDistribution.positive}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <span className="text-sm font-medium">Netral</span>
                    </div>
                    <span className="text-sm text-slate-600">{analyticsData.sentimentDistribution.neutral}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-gray-500 h-2 rounded-full" 
                      style={{ width: `${analyticsData.sentimentDistribution.neutral}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium">Negatif</span>
                    </div>
                    <span className="text-sm text-slate-600">{analyticsData.sentimentDistribution.negative}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${analyticsData.sentimentDistribution.negative}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Intents */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Topik Teratas</CardTitle>
                <CardDescription>Pertanyaan yang sering diajukan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.topIntents.map((intent, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{intent.intent}</span>
                      <Badge variant="secondary">{intent.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Conversations */}
        <motion.div 
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Percakapan Terbaru</CardTitle>
              <CardDescription>Interaksi terbaru dengan pelanggan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analyticsData.recentConversations.map((conversation) => (
                  <div key={conversation.id} className="border-l-4 border-slate-200 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      {getSentimentIcon(conversation.sentiment)}
                      <span className={`text-sm font-medium ${getSentimentColor(conversation.sentiment)}`}>
                        {conversation.sentiment === 'positive' ? 'Positif' : 
                         conversation.sentiment === 'negative' ? 'Negatif' : 'Netral'}
                      </span>
                      <span className="text-sm text-slate-500">{conversation.timestamp}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm"><strong>Pelanggan:</strong> {conversation.userMessage}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm"><strong>Bot:</strong> {conversation.botResponse}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
