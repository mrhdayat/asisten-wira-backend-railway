"use client";
import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Edit3, Trash2, FileText, Brain, Tag, Calendar, Eye, EyeOff } from "lucide-react";
import { useSearchParams } from "next/navigation";

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  keywords: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

function KnowledgeBaseContent() {
  const searchParams = useSearchParams();
  const chatbot_id = searchParams.get('chatbot_id');
  
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  
  const [newItem, setNewItem] = useState({
    title: "",
    content: "",
    keywords: "",
    category: "general"
  });

  const fetchKnowledgeBase = async () => {
    if (!chatbot_id) return;
    try {
      const response = await fetch(`/api/knowledge-base?chatbot_id=${chatbot_id}`);
      const result = await response.json();
      if (result.data) {
        setKnowledgeItems(result.data);
      }
    } catch (error) {
      console.error('Error fetching knowledge base:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledgeBase();
  }, [chatbot_id]);

  const handleCreateItem = async () => {
    if (!chatbot_id) return;
    try {
      const response = await fetch('/api/knowledge-base', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newItem,
          chatbot_id
        }),
      });

      if (response.ok) {
        setIsCreateDialogOpen(false);
        setNewItem({ title: "", content: "", keywords: "", category: "general" });
        fetchKnowledgeBase();
      }
    } catch (error) {
      console.error('Error creating knowledge item:', error);
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;
    try {
      const response = await fetch(`/api/knowledge-base?id=${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingItem),
      });

      if (response.ok) {
        setIsEditDialogOpen(false);
        setEditingItem(null);
        fetchKnowledgeBase();
      }
    } catch (error) {
      console.error('Error updating knowledge item:', error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const response = await fetch(`/api/knowledge-base?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchKnowledgeBase();
      }
    } catch (error) {
      console.error('Error deleting knowledge item:', error);
    }
  };

  const toggleItemStatus = async (item: KnowledgeItem) => {
    try {
      const response = await fetch(`/api/knowledge-base?id=${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...item,
          is_active: !item.is_active
        }),
      });

      if (response.ok) {
        fetchKnowledgeBase();
      }
    } catch (error) {
      console.error('Error toggling item status:', error);
    }
  };

  if (!chatbot_id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chatbot ID tidak ditemukan</h3>
          <p className="text-gray-600">Silakan kembali ke dashboard dan pilih chatbot yang valid.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading knowledge base...</p>
        </div>
      </div>
    );
  }

  const filteredItems = knowledgeItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", ...Array.from(new Set(knowledgeItems.map(item => item.category)))];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Knowledge Base</h1>
          <p className="text-gray-600">Kelola pengetahuan yang dimiliki chatbot Anda</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari pengetahuan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === "all" ? "Semua Kategori" : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Pengetahuan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Pengetahuan Baru</DialogTitle>
                <DialogDescription>
                  Tambahkan pengetahuan baru untuk chatbot Anda
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Judul</Label>
                  <Input
                    id="title"
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    placeholder="Masukkan judul pengetahuan"
                  />
                </div>
                <div>
                  <Label htmlFor="content">Konten</Label>
                  <Textarea
                    id="content"
                    value={newItem.content}
                    onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                    placeholder="Masukkan konten pengetahuan"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input
                    id="keywords"
                    value={newItem.keywords}
                    onChange={(e) => setNewItem({ ...newItem, keywords: e.target.value })}
                    placeholder="Masukkan keywords (pisahkan dengan koma)"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Kategori</Label>
                  <select
                    id="category"
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">Umum</option>
                    <option value="product">Produk</option>
                    <option value="service">Layanan</option>
                    <option value="policy">Kebijakan</option>
                    <option value="faq">FAQ</option>
                    <option value="support">Support</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleCreateItem} disabled={!newItem.title || !newItem.content}>
                    Tambah
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Knowledge Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                        {item.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600 text-sm">
                        {item.content.length > 100 ? `${item.content.substring(0, 100)}...` : item.content}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingItem(item);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
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
                      <span className="text-gray-500">Kategori:</span>
                      <Badge variant="secondary" className="capitalize">
                        {item.category}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Keywords:</span>
                      <span className="text-gray-600 text-xs">
                        {item.keywords || "Tidak ada keywords"}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Status:</span>
                      <Badge variant={item.is_active ? "default" : "secondary"}>
                        {item.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Dibuat:</span>
                      <span className="text-gray-600">
                        {new Date(item.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => toggleItemStatus(item)}
                    >
                      {item.is_active ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Nonaktifkan
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Aktifkan
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredItems.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada pengetahuan</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory !== "all" 
                ? "Tidak ada pengetahuan yang sesuai dengan filter Anda"
                : "Mulai dengan menambahkan pengetahuan pertama"
              }
            </p>
            {!searchTerm && selectedCategory === "all" && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Pengetahuan Pertama
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Pengetahuan</DialogTitle>
            <DialogDescription>
              Edit pengetahuan yang sudah ada
            </DialogDescription>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Judul</Label>
                <Input
                  id="edit-title"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-content">Konten</Label>
                <Textarea
                  id="edit-content"
                  value={editingItem.content}
                  onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="edit-keywords">Keywords</Label>
                <Input
                  id="edit-keywords"
                  value={editingItem.keywords}
                  onChange={(e) => setEditingItem({ ...editingItem, keywords: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Kategori</Label>
                <select
                  id="edit-category"
                  value={editingItem.category}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">Umum</option>
                  <option value="product">Produk</option>
                  <option value="service">Layanan</option>
                  <option value="policy">Kebijakan</option>
                  <option value="faq">FAQ</option>
                  <option value="support">Support</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleUpdateItem}>
                  Update
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function KnowledgeBasePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading knowledge base...</p>
        </div>
      </div>
    }>
      <KnowledgeBaseContent />
    </Suspense>
  );
}
