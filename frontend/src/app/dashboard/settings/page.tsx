"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, User, Building, CreditCard, Key, Bell, Shield } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    fullName: "John Doe",
    email: "john@example.com",
    businessName: "Toko Online Sukses",
    industry: "Fashion",
    phone: "+62 812-3456-7890",
    address: "Jl. Sudirman No. 123, Jakarta"
  });

  const [apiKeys, setApiKeys] = useState({
    huggingfaceToken: "hf_****************************",
    ibmApiKey: "****************************",
    replicateToken: "r8_****************************"
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    pushNotifications: true,
    weeklyReports: true
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    alert("Profil berhasil disimpan!");
  };

  const handleSaveApiKeys = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    alert("API Keys berhasil disimpan!");
  };

  const handleSaveNotifications = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    alert("Pengaturan notifikasi berhasil disimpan!");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Pengaturan</h1>
              <p className="text-slate-600">Kelola profil dan konfigurasi akun Anda</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-500" />
                  Profil Pengguna
                </CardTitle>
                <CardDescription>
                  Informasi dasar akun dan bisnis Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nama Lengkap</Label>
                    <Input
                      id="fullName"
                      value={profile.fullName}
                      onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Nama Bisnis</Label>
                    <Input
                      id="businessName"
                      value={profile.businessName}
                      onChange={(e) => setProfile(prev => ({ ...prev, businessName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industri</Label>
                    <select
                      id="industry"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      value={profile.industry}
                      onChange={(e) => setProfile(prev => ({ ...prev, industry: e.target.value }))}
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
                    <Label htmlFor="phone">Nomor Telepon</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Alamat Bisnis</Label>
                  <Textarea
                    id="address"
                    value={profile.address}
                    onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                    rows={3}
                  />
                </div>
                <Button onClick={handleSaveProfile} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Menyimpan..." : "Simpan Profil"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Subscription */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-green-500" />
                  Langganan
                </CardTitle>
                <CardDescription>
                  Status dan manajemen paket langganan Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-green-500">Free Plan</Badge>
                      <span className="text-sm text-green-700">Aktif</span>
                    </div>
                    <p className="text-sm text-slate-600">
                      • 2 Chatbot aktif<br />
                      • 100 percakapan/bulan<br />
                      • Dukungan komunitas
                    </p>
                  </div>
                  <Button variant="outline">
                    Upgrade Plan
                  </Button>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-slate-500">
                    Butuh lebih banyak fitur? <Link href="/pricing" className="text-blue-600 hover:underline">Lihat paket premium</Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* API Keys */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="h-5 w-5 mr-2 text-purple-500" />
                  API Keys
                </CardTitle>
                <CardDescription>
                  Konfigurasi API keys untuk layanan AI eksternal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <Shield className="h-4 w-4 inline mr-1" />
                    API keys Anda dienkripsi dan disimpan dengan aman. Kami tidak pernah menyimpan keys dalam bentuk plain text.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="huggingfaceToken">Hugging Face API Token</Label>
                    <Input
                      id="huggingfaceToken"
                      type="password"
                      value={apiKeys.huggingfaceToken}
                      onChange={(e) => setApiKeys(prev => ({ ...prev, huggingfaceToken: e.target.value }))}
                      placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    />
                    <p className="text-xs text-slate-500">
                      Dapatkan token gratis di <a href="https://huggingface.co/settings/tokens" target="_blank" className="text-blue-600 hover:underline">Hugging Face Settings</a>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ibmApiKey">IBM Watson API Key (Opsional)</Label>
                    <Input
                      id="ibmApiKey"
                      type="password"
                      value={apiKeys.ibmApiKey}
                      onChange={(e) => setApiKeys(prev => ({ ...prev, ibmApiKey: e.target.value }))}
                      placeholder="Untuk fitur premium dan enterprise"
                    />
                    <p className="text-xs text-slate-500">
                      Fitur premium untuk analisis enterprise-grade
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="replicateToken">Replicate API Token (Opsional)</Label>
                    <Input
                      id="replicateToken"
                      type="password"
                      value={apiKeys.replicateToken}
                      onChange={(e) => setApiKeys(prev => ({ ...prev, replicateToken: e.target.value }))}
                      placeholder="r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    />
                    <p className="text-xs text-slate-500">
                      Untuk model AI tambahan dan fitur eksperimental
                    </p>
                  </div>
                </div>

                <Button onClick={handleSaveApiKeys} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Menyimpan..." : "Simpan API Keys"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-orange-500" />
                  Notifikasi
                </CardTitle>
                <CardDescription>
                  Atur preferensi notifikasi dan laporan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Alerts</Label>
                      <p className="text-sm text-slate-500">Notifikasi penting via email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.emailAlerts}
                      onChange={(e) => setNotifications(prev => ({ ...prev, emailAlerts: e.target.checked }))}
                      className="w-4 h-4"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMS Alerts</Label>
                      <p className="text-sm text-slate-500">Notifikasi urgent via SMS</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.smsAlerts}
                      onChange={(e) => setNotifications(prev => ({ ...prev, smsAlerts: e.target.checked }))}
                      className="w-4 h-4"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-slate-500">Notifikasi real-time di browser</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.pushNotifications}
                      onChange={(e) => setNotifications(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                      className="w-4 h-4"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Weekly Reports</Label>
                      <p className="text-sm text-slate-500">Laporan mingguan performa chatbot</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.weeklyReports}
                      onChange={(e) => setNotifications(prev => ({ ...prev, weeklyReports: e.target.checked }))}
                      className="w-4 h-4"
                    />
                  </div>
                </div>

                <Button onClick={handleSaveNotifications} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Menyimpan..." : "Simpan Pengaturan"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>
                  Tindakan irreversible yang memerlukan konfirmasi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-4 border border-red-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-red-800">Delete Account</h4>
                    <p className="text-sm text-red-600">Hapus permanen akun dan semua data</p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Hapus Akun
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
