"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Upload, Trash2, Plus, FileText, Brain, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface KnowledgeItem {
  id: string;
  content: string;
  source: string;
  category: string;
}

export default function EditChatbotPage() {
  const params = useParams();
  const router = useRouter();
  const chatbotId = params.id as string;
  
  const [chatbot, setChatbot] = useState({
    name: "Toko Baju Online Assistant",
    description: "Chatbot untuk membantu pelanggan memilih produk fashion",
    industry: "Fashion",
    greeting: "Halo! Selamat datang di toko kami. Ada yang bisa saya bantu?",
    personality: "Ramah dan helpful",
    language: "id"
  });

  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeItem[]>([
    {
      id: "1",
      content: "Kami menjual berbagai macam pakaian fashion untuk pria dan wanita. Tersedia ukuran S, M, L, XL, dan XXL.",
      source: "Manual Input",
      category: "Produk"
    },
    {
      id: "2",
      content: "Pengiriman gratis untuk pembelian di atas Rp 300.000. Estimasi pengiriman 2-5 hari kerja.",
      source: "FAQ",
      category: "Pengiriman"
    },
    {
      id: "3",
      content: "Metode pembayaran: Transfer Bank, E-wallet (OVO, DANA, GoPay), COD (Cash on Delivery).",
      source: "Policy",
      category: "Pembayaran"
    }
  ]);

  const [newKnowledge, setNewKnowledge] = useState({
    content: "",
    source: "",
    category: ""
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    alert("Chatbot berhasil disimpan!");
  };

  const handleAddKnowledge = () => {
    if (!newKnowledge.content.trim()) return;
    
    const item: KnowledgeItem = {
      id: Date.now().toString(),
      content: newKnowledge.content,
      source: newKnowledge.source || "Manual Input",
      category: newKnowledge.category || "Umum"
    };
    
    setKnowledgeBase(prev => [...prev, item]);
    setNewKnowledge({ content: "", source: "", category: "" });
  };

  const handleDeleteKnowledge = (id: string) => {
    setKnowledgeBase(prev => prev.filter(item => item.id !== id));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Simulate file processing
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const item: KnowledgeItem = {
        id: Date.now().toString(),
        content: content.substring(0, 500) + "...", // Truncate for demo
        source: file.name,
        category: "Upload"
      };
      setKnowledgeBase(prev => [...prev, item]);
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali ke Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Edit Chatbot</h1>
                <p className="text-slate-600">ID: {chatbotId}</p>
              </div>
            </div>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Basic Settings */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-blue-500" />
                  Pengaturan Dasar
                </CardTitle>
                <CardDescription>
                  Konfigurasi identitas dan perilaku chatbot
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Chatbot</Label>
                  <Input
                    id="name"
                    value={chatbot.name}
                    onChange={(e) => setChatbot(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nama chatbot Anda"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={chatbot.description}
                    onChange={(e) => setChatbot(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Jelaskan fungsi chatbot"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industri</Label>
                  <select
                    id="industry"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    value={chatbot.industry}
                    onChange={(e) => setChatbot(prev => ({ ...prev, industry: e.target.value }))}
                  >
                    <option value="Fashion">Fashion</option>
                    <option value="F&B">Makanan & Minuman</option>
                    <option value="Technology">Teknologi</option>
                    <option value="Beauty">Kecantikan</option>
                    <option value="Health">Kesehatan</option>
                    <option value="Education">Pendidikan</option>
                    <option value="Other">Lainnya</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="greeting">Pesan Pembuka</Label>
                  <Textarea
                    id="greeting"
                    value={chatbot.greeting}
                    onChange={(e) => setChatbot(prev => ({ ...prev, greeting: e.target.value }))}
                    placeholder="Pesan salam untuk pelanggan"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personality">Kepribadian Bot</Label>
                  <Input
                    id="personality"
                    value={chatbot.personality}
                    onChange={(e) => setChatbot(prev => ({ ...prev, personality: e.target.value }))}
                    placeholder="e.g., Ramah, Professional, Casual"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Bahasa</Label>
                  <select
                    id="language"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    value={chatbot.language}
                    onChange={(e) => setChatbot(prev => ({ ...prev, language: e.target.value }))}
                  >
                    <option value="id">Bahasa Indonesia</option>
                    <option value="en">English</option>
                    <option value="both">Bilingual (ID + EN)</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Test Chat */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-green-500" />
                  Test Chatbot
                </CardTitle>
                <CardDescription>
                  Coba chatbot dengan pengaturan terbaru
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Chat Interface */}
                  <div className="bg-slate-50 rounded-lg p-4 h-64 overflow-y-auto">
                    <div className="space-y-3">
                      <div className="flex justify-start">
                        <div className="bg-white p-3 rounded-lg max-w-xs shadow-sm">
                          <p className="text-sm">{chatbot.greeting}</p>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="bg-blue-500 text-white p-3 rounded-lg max-w-xs">
                          <p className="text-sm">Hai, saya mau tanya tentang produk Anda</p>
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-white p-3 rounded-lg max-w-xs shadow-sm">
                          <p className="text-sm">Tentu! Kami memiliki berbagai produk fashion. Apakah Anda mencari kategori tertentu?</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Test Input */}
                  <div className="flex gap-2">
                    <Input placeholder="Ketik pesan test..." className="flex-1" />
                    <Button size="sm">Kirim</Button>
                  </div>
                  
                  <div className="text-xs text-slate-500">
                    Mode: Test • Respons menggunakan pengaturan di atas
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Knowledge Base Management */}
        <motion.div 
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-purple-500" />
                Knowledge Base
              </CardTitle>
              <CardDescription>
                Kelola pengetahuan yang dimiliki chatbot Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Add New Knowledge */}
              <div className="space-y-4 mb-6 p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium">Tambah Pengetahuan Baru</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Konten</Label>
                    <Textarea
                      value={newKnowledge.content}
                      onChange={(e) => setNewKnowledge(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Masukkan informasi yang ingin diajarkan ke chatbot"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Sumber</Label>
                      <Input
                        value={newKnowledge.source}
                        onChange={(e) => setNewKnowledge(prev => ({ ...prev, source: e.target.value }))}
                        placeholder="e.g., FAQ, Manual, Website"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Kategori</Label>
                      <select
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        value={newKnowledge.category}
                        onChange={(e) => setNewKnowledge(prev => ({ ...prev, category: e.target.value }))}
                      >
                        <option value="">Pilih kategori</option>
                        <option value="Produk">Produk</option>
                        <option value="Pengiriman">Pengiriman</option>
                        <option value="Pembayaran">Pembayaran</option>
                        <option value="Customer Service">Customer Service</option>
                        <option value="Umum">Umum</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddKnowledge}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah
                  </Button>
                  <Button variant="outline" className="relative">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept=".txt,.pdf,.csv"
                      onChange={handleFileUpload}
                    />
                  </Button>
                </div>
              </div>

              {/* Knowledge Items */}
              <div className="space-y-4">
                <h4 className="font-medium">Pengetahuan Tersimpan ({knowledgeBase.length} item)</h4>
                {knowledgeBase.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2">
                        <Badge variant="outline">{item.category}</Badge>
                        <Badge variant="secondary">{item.source}</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteKnowledge(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-slate-700">{item.content}</p>
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
