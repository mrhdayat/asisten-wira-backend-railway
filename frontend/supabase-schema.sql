-- Simplified Supabase Database Schema for Asisten Wira (Development Version)
-- Run these commands in Supabase SQL Editor

-- Create chatbots table (simplified for development)
CREATE TABLE IF NOT EXISTS chatbots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    industry TEXT,
    is_active BOOLEAN DEFAULT true,
    deployment_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create knowledge_base table (simplified for development)
CREATE TABLE IF NOT EXISTS knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chatbot_id UUID REFERENCES chatbots(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    keywords TEXT,
    category TEXT DEFAULT 'general',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversations table (simplified for development)
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chatbot_id UUID REFERENCES chatbots(id) ON DELETE CASCADE NOT NULL,
    user_message TEXT NOT NULL,
    bot_response TEXT NOT NULL,
    sentiment_score INTEGER,
    source TEXT DEFAULT 'ai_service',
    knowledge_id UUID REFERENCES knowledge_base(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chatbots_created_at ON chatbots(created_at);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_chatbot_id ON knowledge_base(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_conversations_chatbot_id ON conversations(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);

-- Insert sample data for testing
INSERT INTO chatbots (name, description, industry) VALUES 
('Toko Baju Online Assistant', 'Chatbot untuk membantu pelanggan memilih produk fashion', 'fashion'),
('Warung Makan Support Bot', 'Assistant untuk menjawab pertanyaan menu dan pemesanan', 'fnb')
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
    (SELECT id FROM chatbots WHERE name = 'Warung Makan Support Bot' LIMIT 1),
    'Menu Favorit',
    'Menu favorit pelanggan kami adalah Nasi Goreng Spesial (Rp 25.000) dan Soto Ayam (Rp 20.000).',
    'menu, nasi goreng, soto, harga',
    'product'
)
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Asisten Wira simplified database schema created successfully!';
    RAISE NOTICE 'Tables created: chatbots, knowledge_base, conversations';
    RAISE NOTICE 'Sample data inserted for testing';
    RAISE NOTICE 'Ready to use! 🚀';
END $$;
