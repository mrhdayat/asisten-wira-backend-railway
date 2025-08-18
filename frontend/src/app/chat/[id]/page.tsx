"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Bot, 
  User, 
  Minimize2, 
  Maximize2, 
  Volume2, 
  VolumeX,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Copy,
  ExternalLink,
  Brain
} from "lucide-react";
import { useParams } from "next/navigation";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  sentiment?: string;
  source?: string;
}

interface ChatbotConfig {
  id: string;
  name: string;
  greeting: string;
  avatar?: string;
  primaryColor: string;
  isActive: boolean;
  description?: string; // Added for customer access header
}

export default function ChatPage() {
  const params = useParams();
  const chatbotId = params.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [chatMode, setChatMode] = useState<'knowledge-base' | 'ai' | 'hybrid'>('hybrid');

  const [chatbot, setChatbot] = useState<ChatbotConfig>({
    id: chatbotId,
    name: "Asisten Toko Online",
    greeting: "Halo! Selamat datang di toko kami. Ada yang bisa saya bantu hari ini? 😊",
    primaryColor: "#3B82F6",
    isActive: true,
    description: "Chat dengan AI Assistant kami untuk mendapatkan informasi dan bantuan."
  });

  useEffect(() => {
    // Initialize with greeting message
    const greetingMessage: Message = {
      id: "greeting",
      text: chatbot.greeting,
      sender: "bot",
      timestamp: new Date(),
      sentiment: "positive"
    };
    setMessages([greetingMessage]);
  }, [chatbot.greeting]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const simulateTyping = () => {
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 1500);
  };

  const generateBotResponse = async (userMessage: string): Promise<Message> => {
    if (!userMessage.trim()) {
      throw new Error("Message cannot be empty");
    }

    const userMsg: Message = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: userMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          chatbot_id: params.id,
          chat_mode: chatMode,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("AI Response:", data);

      const botMsg: Message = {
        id: `bot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text: data.response || "Maaf, saya tidak bisa memproses pesan Anda saat ini.",
        sender: "bot",
        timestamp: new Date(),
        sentiment: data.sentiment || "neutral",
        source: data.source || "ai_service",
      };

      setMessages(prev => [...prev, botMsg]);
      return botMsg;
    } catch (error) {
      console.error("Error calling AI service:", error);
      
      const errorMsg: Message = {
        id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text: "Maaf, terjadi kesalahan dalam memproses pesan Anda. Silakan coba lagi.",
        sender: "bot",
        timestamp: new Date(),
        sentiment: "negative",
        source: "error",
      };

      setMessages(prev => [...prev, errorMsg]);
      return errorMsg;
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // Don't add user message here - generateBotResponse will handle it
    setInputMessage("");
    setIsLoading(true);
    simulateTyping();

    try {
      // Call AI service - it will handle adding both user and bot messages
      await generateBotResponse(inputMessage);
      
      // Play notification sound if enabled
      if (isSoundEnabled) {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {}); // Ignore if audio fails
      }
      
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      const errorMessage: Message = {
        id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text: "Maaf, terjadi kesalahan sistem. Silakan coba lagi dalam beberapa saat.",
        sender: "bot",
        timestamp: new Date(),
        sentiment: "negative"
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetChat = () => {
    setMessages([{
      id: "greeting-reset",
      text: chatbot.greeting,
      sender: "bot",
      timestamp: new Date(),
      sentiment: "positive"
    }]);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    // TODO: Show toast notification
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case "positive": return "text-green-600";
      case "negative": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  if (!chatbot.isActive) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-8">
            <Bot className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Chatbot Tidak Aktif</h2>
            <p className="text-slate-600">
              Chatbot ini sedang tidak aktif atau dalam maintenance. 
              Silakan hubungi administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header for Customer Access */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {chatbot?.name || 'AI Assistant'}
              </h1>
              <p className="text-sm text-gray-500">
                {chatbot?.description || 'Chat dengan AI Assistant kami'}
              </p>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            Powered by Asisten Wira
          </div>
        </div>
      </div>
      
      {/* Chat Container */}
      <div className="max-w-4xl mx-auto p-4">
        {/* Chat Mode Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Mode Chat</h3>
            <div className="text-xs text-gray-500">
              Pilih cara chatbot merespons
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setChatMode('knowledge-base')}
              className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                chatMode === 'knowledge-base'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              📚 Knowledge Base Only
            </button>
            
            <button
              onClick={() => setChatMode('ai')}
              className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                chatMode === 'ai'
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              🤖 AI Mode
            </button>
            
            <button
              onClick={() => setChatMode('hybrid')}
              className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                chatMode === 'hybrid'
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              🔄 Hybrid (KB + AI)
            </button>
          </div>
          
          <div className="mt-2 text-xs text-gray-500">
            {chatMode === 'knowledge-base' && 'Chatbot hanya akan menjawab berdasarkan knowledge base yang sudah di-setup'}
            {chatMode === 'ai' && 'Chatbot akan menggunakan AI untuk semua pertanyaan'}
            {chatMode === 'hybrid' && 'Chatbot akan mencari di knowledge base dulu, jika tidak ada baru menggunakan AI'}
          </div>
        </div>
        
        {/* Header */}
        <motion.div 
          className="bg-white rounded-t-lg border-b p-4 shadow-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: chatbot.primaryColor }}
              >
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-semibold text-slate-800">{chatbot.name}</h1>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-slate-500">Online</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              >
                {isSoundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={resetChat}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Chat Messages */}
        <AnimatePresence>
          {!isMinimized && (
            <motion.div 
              className="bg-white h-96 overflow-y-auto p-4 space-y-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 384 }}
              exit={{ opacity: 0, height: 0 }}
            >
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] ${message.sender === "user" ? "order-2" : "order-1"}`}>
                    <div
                      className={`p-3 rounded-lg ${
                        message.sender === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      
                      {/* Message metadata for bot messages */}
                      {message.sender === "bot" && (
                        <div className="flex items-center gap-2 mt-2 text-xs opacity-75">
                          {message.sentiment && (
                            <Badge variant="outline" className="text-xs">
                              Sentimen: {message.sentiment}
                            </Badge>
                          )}
                          {message.source === "hoax_detected" && (
                            <Badge variant="destructive" className="text-xs">
                              ⚠️ Hoax Detected
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-slate-200"
                            onClick={() => copyMessage(message.text)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {/* Timestamp */}
                    <p className="text-xs text-slate-500 mt-1 px-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    message.sender === "user" 
                      ? "bg-blue-500 text-white order-1 ml-2" 
                      : "bg-slate-300 text-slate-700 order-2 mr-2"
                  }`}>
                    {message.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
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
                  <div className="bg-slate-100 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <motion.div 
          className="bg-white rounded-b-lg border-t p-4 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ketik pesan Anda..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={isLoading || !inputMessage.trim()}
              style={{ backgroundColor: chatbot.primaryColor }}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-2 mt-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setInputMessage("Halo, saya butuh bantuan")}
            >
              Butuh Bantuan
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setInputMessage("Bagaimana cara memesan produk?")}
            >
              Cara Pesan
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setInputMessage("Apa saja metode pembayaran?")}
            >
              Pembayaran
            </Button>
          </div>
          
          <p className="text-xs text-slate-500 mt-2 text-center">
            Powered by Asisten Wira AI • Tekan Enter untuk kirim
          </p>
        </motion.div>
      </div>
    </div>
  );
}
