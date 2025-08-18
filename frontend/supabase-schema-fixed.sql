-- Comprehensive Supabase Database Schema for Asisten Wira (Development Version)
-- Run these commands in Supabase SQL Editor to create a complete development setup

-- Drop existing tables if they exist (to avoid conflicts)
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS knowledge_base CASCADE;
DROP TABLE IF EXISTS chatbots CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS ai_analytics CASCADE;
DROP TABLE IF EXISTS file_uploads CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS usage_tracking CASCADE;

-- Create profiles table (extends auth.users) - NO user_id constraint for development
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    business_name TEXT,
    industry TEXT,
    avatar_url TEXT,
    subscription_plan TEXT DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chatbots table (NO user_id constraint for development)
CREATE TABLE IF NOT EXISTS chatbots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    industry TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'training', 'active', 'inactive')),
    knowledge_base_size INTEGER DEFAULT 0,
    total_conversations INTEGER DEFAULT 0,
    deployment_url TEXT,
    embed_code TEXT,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create knowledge_base table (NO user_id constraint for development)
CREATE TABLE IF NOT EXISTS knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chatbot_id UUID REFERENCES chatbots(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    source TEXT,
    keywords TEXT,
    category TEXT DEFAULT 'general',
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversations table (NO user_id constraint for development)
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chatbot_id UUID REFERENCES chatbots(id) ON DELETE CASCADE NOT NULL,
    session_id TEXT,
    user_message TEXT NOT NULL,
    bot_response TEXT NOT NULL,
    sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    confidence FLOAT,
    source TEXT DEFAULT 'ai_service',
    knowledge_id UUID REFERENCES knowledge_base(id),
    is_hoax_detected BOOLEAN DEFAULT FALSE,
    response_time_ms INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_analytics table (NO user_id constraint for development)
CREATE TABLE IF NOT EXISTS ai_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chatbot_id UUID REFERENCES chatbots(id) ON DELETE CASCADE NOT NULL,
    analysis_type TEXT NOT NULL CHECK (analysis_type IN ('sentiment', 'hoax', 'intent')),
    input_text TEXT NOT NULL,
    result JSONB NOT NULL,
    confidence FLOAT,
    model_used TEXT,
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create file_uploads table (NO user_id constraint for development)
CREATE TABLE IF NOT EXISTS file_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chatbot_id UUID REFERENCES chatbots(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_size INTEGER,
    file_type TEXT,
    storage_path TEXT,
    processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    extracted_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Create subscriptions table (NO user_id constraint for development)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_name TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usage_tracking table (NO user_id constraint for development)
CREATE TABLE IF NOT EXISTS usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chatbot_id UUID REFERENCES chatbots(id) ON DELETE CASCADE,
    usage_type TEXT NOT NULL CHECK (usage_type IN ('chat_message', 'hoax_detection', 'sentiment_analysis', 'file_upload')),
    count INTEGER DEFAULT 1,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_chatbots_created_at ON chatbots(created_at);
CREATE INDEX IF NOT EXISTS idx_chatbots_status ON chatbots(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_chatbot_id ON knowledge_base(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_conversations_chatbot_id ON conversations(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_sentiment ON conversations(sentiment);
CREATE INDEX IF NOT EXISTS idx_ai_analytics_chatbot_id ON ai_analytics(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_ai_analytics_type ON ai_analytics(analysis_type);
CREATE INDEX IF NOT EXISTS idx_file_uploads_chatbot_id ON file_uploads(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_chatbot_id_date ON usage_tracking(chatbot_id, date);

-- Enable Row Level Security on our custom tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbots ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies (Development-friendly - allow all operations)

-- Profiles policies - Allow all operations for development
DROP POLICY IF EXISTS "Allow all profiles operations" ON profiles;
CREATE POLICY "Allow all profiles operations" ON profiles FOR ALL USING (true) WITH CHECK (true);

-- Chatbots policies - Allow all operations for development
DROP POLICY IF EXISTS "Allow all chatbots operations" ON chatbots;
CREATE POLICY "Allow all chatbots operations" ON chatbots FOR ALL USING (true) WITH CHECK (true);

-- Knowledge base policies - Allow all operations for development
DROP POLICY IF EXISTS "Allow all knowledge base operations" ON knowledge_base;
CREATE POLICY "Allow all knowledge base operations" ON knowledge_base FOR ALL USING (true) WITH CHECK (true);

-- Conversations policies - Allow all operations for development
DROP POLICY IF EXISTS "Allow all conversations operations" ON conversations;
CREATE POLICY "Allow all conversations operations" ON conversations FOR ALL USING (true) WITH CHECK (true);

-- AI Analytics policies - Allow all operations for development
DROP POLICY IF EXISTS "Allow all ai analytics operations" ON ai_analytics;
CREATE POLICY "Allow all ai analytics operations" ON ai_analytics FOR ALL USING (true) WITH CHECK (true);

-- File uploads policies - Allow all operations for development
DROP POLICY IF EXISTS "Allow all file uploads operations" ON file_uploads;
CREATE POLICY "Allow all file uploads operations" ON file_uploads FOR ALL USING (true) WITH CHECK (true);

-- Subscription policies - Allow all operations for development
DROP POLICY IF EXISTS "Allow all subscriptions operations" ON subscriptions;
CREATE POLICY "Allow all subscriptions operations" ON subscriptions FOR ALL USING (true) WITH CHECK (true);

-- Usage tracking policies - Allow all operations for development
DROP POLICY IF EXISTS "Allow all usage tracking operations" ON usage_tracking;
CREATE POLICY "Allow all usage tracking operations" ON usage_tracking FOR ALL USING (true) WITH CHECK (true);

-- Create functions for automatic updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at (drop first if exists)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chatbots_updated_at ON chatbots;
CREATE TRIGGER update_chatbots_updated_at BEFORE UPDATE ON chatbots 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_knowledge_base_updated_at ON knowledge_base;
CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON knowledge_base 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO chatbots (name, description, industry, status) VALUES 
('Toko Baju Online Assistant', 'Chatbot untuk membantu pelanggan memilih produk fashion', 'fashion', 'active'),
('Warung Makan Support Bot', 'Assistant untuk menjawab pertanyaan menu dan pemesanan', 'fnb', 'active'),
('Tech Support Bot', 'Chatbot untuk membantu troubleshooting produk teknologi', 'technology', 'active')
ON CONFLICT DO NOTHING;

-- Insert sample knowledge base items
INSERT INTO knowledge_base (chatbot_id, title, content, keywords, category) VALUES 
(
    (SELECT id FROM chatbots WHERE name = 'Toko Baju Online Assistant' LIMIT 1),
    'Produk Unggulan',
    'Produk unggulan kami adalah baju batik dengan harga mulai dari Rp 150.000. Kami juga menyediakan berbagai pilihan fashion lainnya.',
    'produk, baju, batik, harga',
    'product'
),
(
    (SELECT id FROM chatbots WHERE name = 'Toko Baju Online Assistant' LIMIT 1),
    'Kebijakan Pengembalian',
    'Kami menerima pengembalian produk dalam waktu 7 hari dengan kondisi produk yang masih baru dan tidak rusak.',
    'pengembalian, return, kebijakan',
    'policy'
),
(
    (SELECT id FROM chatbots WHERE name = 'Warung Makan Support Bot' LIMIT 1),
    'Menu Favorit',
    'Menu favorit pelanggan kami adalah Nasi Goreng Spesial (Rp 25.000) dan Soto Ayam (Rp 20.000).',
    'menu, nasi goreng, soto, harga',
    'product'
),
(
    (SELECT id FROM chatbots WHERE name = 'Warung Makan Support Bot' LIMIT 1),
    'Jam Operasional',
    'Kami buka setiap hari dari jam 06:00 - 22:00 WIB. Untuk pemesanan online, kami terima hingga jam 21:00 WIB.',
    'jam buka, operasional, waktu',
    'info'
),
(
    (SELECT id FROM chatbots WHERE name = 'Tech Support Bot' LIMIT 1),
    'Troubleshooting WiFi',
    'Jika WiFi tidak bisa connect, coba restart router, pastikan password benar, dan periksa apakah device dalam range yang cukup.',
    'wifi, troubleshooting, router, password',
    'support'
)
ON CONFLICT DO NOTHING;

-- Insert sample conversations for testing
INSERT INTO conversations (chatbot_id, user_message, bot_response, sentiment, source) VALUES 
(
    (SELECT id FROM chatbots WHERE name = 'Toko Baju Online Assistant' LIMIT 1),
    'Halo, ada baju batik apa saja?',
    'Halo! Kami punya berbagai pilihan baju batik dengan harga mulai dari Rp 150.000. Ada batik modern, batik klasik, dan batik casual. Ada yang ingin Anda lihat?',
    'positive',
    'knowledge_base'
),
(
    (SELECT id FROM chatbots WHERE name = 'Warung Makan Support Bot' LIMIT 1),
    'Jam berapa buka?',
    'Kami buka setiap hari dari jam 06:00 - 22:00 WIB. Untuk pemesanan online, kami terima hingga jam 21:00 WIB.',
    'positive',
    'knowledge_base'
),
(
    (SELECT id FROM chatbots WHERE name = 'Tech Support Bot' LIMIT 1),
    'WiFi saya tidak bisa connect',
    'Jika WiFi tidak bisa connect, coba restart router, pastikan password benar, dan periksa apakah device dalam range yang cukup.',
    'neutral',
    'knowledge_base'
)
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Asisten Wira COMPREHENSIVE database schema created successfully!';
    RAISE NOTICE 'Tables created: profiles, chatbots, knowledge_base, conversations, ai_analytics, file_uploads, subscriptions, usage_tracking';
    RAISE NOTICE 'Row Level Security enabled with DEVELOPMENT policies (allow all operations)';
    RAISE NOTICE 'NO user_id constraints - Development friendly!';
    RAISE NOTICE 'Sample data inserted for testing';
    RAISE NOTICE 'Ready to use! 🚀';
END $$;
