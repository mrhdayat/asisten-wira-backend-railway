"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Bot, Brain, Shield, TrendingUp, Users, Zap } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div 
            className="font-bold text-2xl text-slate-800"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Asisten Wira
          </motion.div>
          <motion.div 
            className="space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href="/login">
              <Button variant="ghost">Masuk</Button>
            </Link>
            <Link href="/register">
              <Button>Daftar Gratis</Button>
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 text-sm" variant="secondary">
              🚀 Platform AI No-Code untuk UMKM Indonesia
            </Badge>
            <h1 className="text-6xl md:text-7xl font-bold text-slate-800 mb-6 leading-tight">
              Chatbot AI untuk{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                UMKM Anda
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Buat, latih, dan kelola chatbot cerdas tanpa coding. Layani pelanggan 24/7, 
              deteksi hoax, dan analisis sentimen - semua dalam satu platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8 py-6">
                  Mulai Gratis Sekarang
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                  Lihat Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              Fitur Unggulan Asisten Wira
            </h2>
            <p className="text-xl text-slate-600">
              Teknologi AI terdepan yang mudah digunakan untuk UMKM
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Bot,
                title: "Chatbot No-Code",
                description: "Buat chatbot AI tanpa perlu keahlian programming. Drag & drop interface yang mudah dipahami.",
                color: "bg-blue-500"
              },
              {
                icon: Brain,
                title: "AI Powered by IBM",
                description: "Didukung teknologi Watsonx dan Granite dari IBM untuk respons yang akurat dan cerdas.",
                color: "bg-purple-500"
              },
              {
                icon: Shield,
                title: "Deteksi Hoax",
                description: "Lindungi bisnis Anda dari misinformasi dengan AI detector hoax yang canggih.",
                color: "bg-red-500"
              },
              {
                icon: TrendingUp,
                title: "Analisis Sentimen",
                description: "Pahami perasaan pelanggan melalui dashboard analitik yang komprehensif.",
                color: "bg-green-500"
              },
              {
                icon: Users,
                title: "Layanan 24/7",
                description: "Chatbot Anda bekerja tanpa henti, melayani pelanggan kapan saja mereka butuhkan.",
                color: "bg-orange-500"
              },
              {
                icon: Zap,
                title: "Deploy Instant",
                description: "Integrasikan ke website dengan satu klik. Copy-paste script dan chatbot siap digunakan.",
                color: "bg-yellow-500"
              }
            ].map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto max-w-4xl">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              Cara Kerja yang Sederhana
            </h2>
            <p className="text-xl text-slate-600">
              Hanya 3 langkah untuk memiliki chatbot AI yang siap melayani pelanggan
            </p>
          </motion.div>

          <motion.div 
            className="space-y-12"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                step: "01",
                title: "Daftar & Buat Proyek",
                description: "Daftarkan akun gratis dan buat proyek chatbot pertama Anda dalam hitungan menit."
              },
              {
                step: "02", 
                title: "Latih AI dengan Konten Bisnis",
                description: "Upload dokumen, FAQ, atau daftar produk. AI akan mempelajari bisnis Anda secara otomatis."
              },
              {
                step: "03",
                title: "Deploy & Mulai Melayani",
                description: "Dapatkan kode embed dan pasang di website. Chatbot siap melayani pelanggan 24/7."
              }
            ].map((step, index) => (
              <motion.div 
                key={index}
                className="flex items-center gap-8"
                variants={fadeInUp}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {step.step}
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-slate-800 mb-2">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto text-center max-w-3xl">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Siap Memberdayakan UMKM Anda dengan AI?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Bergabunglah dengan ribuan UMKM Indonesia yang sudah menggunakan Asisten Wira
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Mulai Perjalanan AI Anda
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-slate-900 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-xl mb-4">Asisten Wira</h3>
              <p className="text-slate-400">
                Platform AI No-Code untuk pemberdayaan UMKM Indonesia
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produk</h4>
              <ul className="space-y-2 text-slate-400">
                <li>Chatbot Builder</li>
                <li>Deteksi Hoax</li>
                <li>Analisis Sentimen</li>
                <li>Dashboard Analytics</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Dukungan</h4>
              <ul className="space-y-2 text-slate-400">
                <li>Dokumentasi</li>
                <li>Tutorial</li>
                <li>Kontak Support</li>
                <li>Community</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Perusahaan</h4>
              <ul className="space-y-2 text-slate-400">
                <li>Tentang Kami</li>
                <li>Karir</li>
                <li>Blog</li>
                <li>Kontak</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2025 Asisten Wira. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}