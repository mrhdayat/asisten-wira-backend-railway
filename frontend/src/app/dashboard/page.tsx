"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Edit3, Trash2, FileText, Brain, Tag, Eye, AlertTriangle, MessageSquare, ExternalLink, Copy, Rocket } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Custom CSS for enhanced animations
const customStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
    50% { box-shadow: 0 0 30px rgba(147, 51, 234, 0.8); }
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  .animate-glow {
    animation: glow 2s ease-in-out infinite;
  }
`;

interface Chatbot {
  id: string;
  name: string;
  description: string;
  industry: string;
  is_active: boolean;
  created_at: string;
  knowledge_base_size: number;
  total_conversations: number;
  sentiment_score: number;
  deployment_url?: string; // Added deployment_url
}

interface DashboardStats {
  totalChatbots: number;
  totalConversations: number;
  averageSentiment: number;
  activeStatus: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
 
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [chatbotToDelete, setChatbotToDelete] = useState<Chatbot | null>(null);
  const [editingChatbot, setEditingChatbot] = useState<Chatbot | null>(null);
  const [copiedChatbotId, setCopiedChatbotId] = useState<string | null>(null);
  
  const [newChatbot, setNewChatbot] = useState({
    name: "",
    description: "",
    industry: "general"
  });

  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalChatbots: 0,
    totalConversations: 0,
    averageSentiment: 0,
    activeStatus: 0
  });

  const fetchDashboardData = async () => {
    try {
      console.log('🚀 Fetching dashboard data...');
      const response = await fetch('/api/chatbots');
      const result = await response.json();
      
      if (result.success && result.data) {
        setChatbots(result.data);
        
        // Calculate dashboard stats
        const totalChatbots = result.data.length;
        const totalConversations = result.data.reduce((sum: number, chatbot: Chatbot) => sum + chatbot.total_conversations, 0);
        const averageSentiment = result.data.length > 0 
          ? Math.round(result.data.reduce((sum: number, chatbot: Chatbot) => sum + chatbot.sentiment_score, 0) / result.data.length)
          : 0;
        const activeStatus = result.data.filter((chatbot: Chatbot) => chatbot.is_active).length;
        
        setDashboardStats({
          totalChatbots,
          totalConversations,
          averageSentiment,
          activeStatus
        });
        
        console.log('✅ Dashboard data fetched successfully');
      } else {
        console.error('❌ Failed to fetch dashboard data:', result.error);
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateChatbot = async () => {
    try {
      const response = await fetch('/api/chatbots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newChatbot),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Chatbot created successfully');
        setIsCreateDialogOpen(false);
        setNewChatbot({ name: "", description: "", industry: "general" });
        fetchDashboardData(); // Refresh data
      } else {
        console.error('❌ Failed to create chatbot:', result.error);
      }
    } catch (error) {
      console.error('❌ Error creating chatbot:', error);
    }
  };

  const handleDeleteChatbot = async () => {
    if (!chatbotToDelete) return;
    
    try {
      console.log('🗑️ Deleting chatbot:', chatbotToDelete.id);
      
      const response = await fetch(`/api/chatbots?id=${chatbotToDelete.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Chatbot deleted successfully');
        setIsDeleteDialogOpen(false);
        setChatbotToDelete(null);
        fetchDashboardData(); // Refresh data
      } else {
        console.error('❌ Failed to delete chatbot:', result.error);
      }
    } catch (error) {
      console.error('❌ Error deleting chatbot:', error);
    }
  };

  const handleEditChatbot = async () => {
    if (!editingChatbot) return;
    
    try {
      console.log('✏️ Updating chatbot:', editingChatbot.id);
      
      const response = await fetch(`/api/chatbots?id=${editingChatbot.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingChatbot.name,
          description: editingChatbot.description,
          industry: editingChatbot.industry,
          is_active: editingChatbot.is_active
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Chatbot updated successfully');
        setIsEditDialogOpen(false);
        setEditingChatbot(null);
        fetchDashboardData(); // Refresh data
      } else {
        console.error('❌ Failed to update chatbot:', result.error);
      }
    } catch (error) {
      console.error('❌ Error updating chatbot:', error);
    }
  };

  const confirmDelete = (chatbot: Chatbot) => {
    setChatbotToDelete(chatbot);
    setIsDeleteDialogOpen(true);
  };

  const startEdit = (chatbot: Chatbot) => {
    setEditingChatbot({ ...chatbot });
    setIsEditDialogOpen(true);
  };

  const handleDeploy = async (chatbotId: string) => {
    try {
      console.log('🚀 Deploying chatbot:', chatbotId);
      
      // Generate deployment URL
      const deploymentUrl = `${window.location.origin}/chat/${chatbotId}`;
      
      console.log('📡 Deployment URL:', deploymentUrl);
      
      // Update chatbot with deployment URL
      const response = await fetch(`/api/chatbots?id=${chatbotId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: chatbots.find(c => c.id === chatbotId)?.name || 'Chatbot',
          description: chatbots.find(c => c.id === chatbotId)?.description || '',
          industry: chatbots.find(c => c.id === chatbotId)?.industry || 'general',
          is_active: true,
          deployment_url: deploymentUrl,
          status: 'active'
        }),
      });

      console.log('📊 Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Chatbot deployed successfully:', result);
        
        fetchDashboardData(); // Refresh data
        alert(`Chatbot berhasil di-deploy!\n\nCustomer dapat mengakses chatbot di:\n${deploymentUrl}\n\nURL telah disalin ke clipboard.`);
        
        // Copy URL to clipboard
        navigator.clipboard.writeText(deploymentUrl);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to deploy chatbot:', response.status, errorText);
        
        // Try to parse error response
        try {
          const errorData = JSON.parse(errorText);
          alert(`Gagal deploy chatbot: ${errorData.error || 'Unknown error'}`);
        } catch {
          alert(`Gagal deploy chatbot. Status: ${response.status}\nError: ${errorText}`);
        }
      }
    } catch (error) {
      console.error('❌ Error deploying chatbot:', error);
      alert('Terjadi kesalahan saat deploy. Silakan coba lagi.');
    }
  };

  const handleCopyUrl = async (url: string, chatbotId: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedChatbotId(chatbotId);
      
      // Reset feedback after 2 seconds
      setTimeout(() => {
        setCopiedChatbotId(null);
      }, 2000);
      
      console.log('✅ URL copied to clipboard:', url);
    } catch (error) {
      console.error('❌ Failed to copy URL:', error);
      alert('Gagal menyalin URL ke clipboard');
    }
  };

  const filteredChatbots = chatbots.filter(chatbot => {
    const matchesSearch = chatbot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chatbot.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = selectedIndustry === "all" || chatbot.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  const industries = ["all", ...Array.from(new Set(chatbots.map(c => c.industry)))];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          {/* Simple Loading with Chatbot Logo */}
          <div className="relative mb-8">
            {/* Chatbot Logo */}
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg mx-auto mb-6">
              <Brain className="h-12 w-12 text-white" />
            </div>
            
            {/* Progress Bar */}
            <div className="w-64 h-3 bg-gray-200 rounded-full overflow-hidden mx-auto">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse" style={{ width: '75%' }}></div>
            </div>
          </div>
          
          {/* Loading Text */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-800">
              Loading Dashboard
            </h2>
            <p className="text-gray-600">Memuat data chatbot dan analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Inject custom CSS */}
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      
      <div className="max-w-7xl mx-auto">
      {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Kelola chatbot dan pantau performa bisnis Anda</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Brain className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Chatbots</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalChatbots}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Percakapan</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalConversations}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Tag className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Rata-rata Sentimen</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.averageSentiment}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Eye className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Status Aktif</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.activeStatus}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari chatbot..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {industries.map(industry => (
                <option key={industry} value={industry}>
                  {industry === "all" ? "Semua Industri" : industry.charAt(0).toUpperCase() + industry.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Buat Chatbot
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Buat Chatbot Baru</DialogTitle>
                <DialogDescription>
                  Buat chatbot baru untuk bisnis Anda
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nama Chatbot</Label>
                  <Input
                    id="name"
                    value={newChatbot.name}
                    onChange={(e) => setNewChatbot({ ...newChatbot, name: e.target.value })}
                    placeholder="Masukkan nama chatbot"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={newChatbot.description}
                    onChange={(e) => setNewChatbot({ ...newChatbot, description: e.target.value })}
                    placeholder="Deskripsi chatbot"
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Industri</Label>
                  <select
                    id="industry"
                    value={newChatbot.industry}
                    onChange={(e) => setNewChatbot({ ...newChatbot, industry: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">Umum</option>
                    <option value="fashion">Fashion</option>
                    <option value="fnb">Makanan & Minuman</option>
                    <option value="technology">Teknologi</option>
                    <option value="healthcare">Kesehatan</option>
                    <option value="education">Pendidikan</option>
                    <option value="finance">Keuangan</option>
                    <option value="travel">Perjalanan</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleCreateChatbot} disabled={!newChatbot.name}>
                    Buat Chatbot
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Chatbots Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChatbots.map((chatbot, index) => (
                <motion.div
                  key={chatbot.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                        {chatbot.name}
                      </CardTitle>
                      <CardDescription className="text-gray-600 text-sm">
                        {chatbot.description || "Tidak ada deskripsi"}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => confirmDelete(chatbot)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                        </div>
                      </div>
                    </CardHeader>
                <CardContent className="pt-0">
                      <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Industri:</span>
                      <Badge variant="secondary" className="capitalize">
                        {chatbot.industry}
                      </Badge>
                          </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Pengetahuan:</span>
                      <span className="font-medium">{chatbot.knowledge_base_size} item</span>
                          </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Percakapan:</span>
                      <span className="font-medium">{chatbot.total_conversations}</span>
                        </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Sentimen:</span>
                      <Badge 
                        variant={chatbot.sentiment_score >= 70 ? "default" : chatbot.sentiment_score >= 40 ? "secondary" : "destructive"}
                        className="text-xs"
                      >
                        {chatbot.sentiment_score}%
                          </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Status:</span>
                      <Badge variant={chatbot.is_active ? "default" : "secondary"}>
                        {chatbot.is_active ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Dibuat:</span>
                      <span className="text-gray-600">
                        {new Date(chatbot.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                        </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-3 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // Navigate to chat interface
                          window.location.href = `/chat/${chatbot.id}`;
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Test
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => startEdit(chatbot)}
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // Navigate to knowledge base page
                          window.location.href = `/dashboard/knowledge-base?chatbot_id=${chatbot.id}`;
                        }}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        KB
                      </Button>
                    </div>
                    
                    {/* Deploy Status */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      {chatbot.deployment_url ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-green-600 font-medium">🟢 Deployed</span>
                            <Badge variant="outline" className="text-xs">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Live
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 break-all">
                            {chatbot.deployment_url}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 text-xs"
                              onClick={() => chatbot.deployment_url && window.open(chatbot.deployment_url, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Visit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 text-xs"
                              onClick={() => handleCopyUrl(chatbot.deployment_url || '', chatbot.id)}
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              {copiedChatbotId === chatbot.id ? "Disalin!" : "Salin URL"}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-orange-600 font-medium">🟡 Not Deployed</span>
                            <Badge variant="secondary" className="text-xs">
                              Draft
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">
                            Deploy chatbot untuk customer access
                          </p>
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="w-full text-xs"
                            onClick={() => handleDeploy(chatbot.id)}
                          >
                            <Rocket className="h-3 w-3 mr-1" />
                            Deploy Now
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

        {filteredChatbots.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada chatbot</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedIndustry !== "all" 
                ? "Tidak ada chatbot yang sesuai dengan filter Anda"
                : "Mulai dengan membuat chatbot pertama Anda"
              }
            </p>
            {!searchTerm && selectedIndustry === "all" && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Buat Chatbot Pertama
              </Button>
          )}
        </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Konfirmasi Hapus
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus chatbot <strong>&quot;{chatbotToDelete?.name}&quot;</strong>?
              <br />
              <span className="text-red-600 font-medium">
                Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait (knowledge base, percakapan, dll).
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteChatbot}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus Chatbot
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Chatbot Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-600">
              <Edit3 className="h-5 w-5" />
              Edit Chatbot
            </DialogTitle>
            <DialogDescription>
              Edit informasi chatbot Anda
            </DialogDescription>
          </DialogHeader>
          {editingChatbot && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nama Chatbot</Label>
                <Input
                  id="edit-name"
                  value={editingChatbot.name}
                  onChange={(e) => setEditingChatbot({ ...editingChatbot, name: e.target.value })}
                  placeholder="Masukkan nama chatbot"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Deskripsi</Label>
                <Textarea
                  id="edit-description"
                  value={editingChatbot.description || ""}
                  onChange={(e) => setEditingChatbot({ ...editingChatbot, description: e.target.value })}
                  placeholder="Deskripsi chatbot"
                />
              </div>
              <div>
                <Label htmlFor="edit-industry">Industri</Label>
                <select
                  id="edit-industry"
                  value={editingChatbot.industry}
                  onChange={(e) => setEditingChatbot({ ...editingChatbot, industry: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">Umum</option>
                  <option value="fashion">Fashion</option>
                  <option value="fnb">Makanan & Minuman</option>
                  <option value="technology">Teknologi</option>
                  <option value="healthcare">Kesehatan</option>
                  <option value="education">Pendidikan</option>
                  <option value="finance">Keuangan</option>
                  <option value="travel">Perjalanan</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-active"
                  checked={editingChatbot.is_active}
                  onChange={(e) => setEditingChatbot({ ...editingChatbot, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="edit-active">Aktif</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleEditChatbot} disabled={!editingChatbot.name}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Update Chatbot
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
