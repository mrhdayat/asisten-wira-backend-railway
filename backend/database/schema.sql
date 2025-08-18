-- Supabase Database Schema for Asisten Wira
-- Run these commands in Supabase SQL Editor

-- Note: auth.users table is managed by Supabase automatically
-- We don't need to modify it

-- Create profiles table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    business_name TEXT,
    industry TEXT,
    avatar_url TEXT,
    subscription_plan TEXT DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chatbots table
CREATE TABLE chatbots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    industry TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'training', 'active', 'inactive')),
    knowledge_base_size INTEGER DEFAULT 0,
    total_conversations INTEGER DEFAULT 0,
    deployment_url TEXT,
    embed_code TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create knowledge_base table
CREATE TABLE knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chatbot_id UUID REFERENCES chatbots ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    source TEXT,
    category TEXT,
    embedding VECTOR(1536), -- For OpenAI embeddings, adjust size as needed
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chatbot_id UUID REFERENCES chatbots ON DELETE CASCADE NOT NULL,
    session_id TEXT,
    user_message TEXT NOT NULL,
    bot_response TEXT NOT NULL,
    sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    confidence FLOAT,
    is_hoax_detected BOOLEAN DEFAULT FALSE,
    response_time_ms INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_analytics table
CREATE TABLE ai_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chatbot_id UUID REFERENCES chatbots ON DELETE CASCADE NOT NULL,
    analysis_type TEXT NOT NULL CHECK (analysis_type IN ('sentiment', 'hoax', 'intent')),
    input_text TEXT NOT NULL,
    result JSONB NOT NULL,
    confidence FLOAT,
    model_used TEXT,
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create file_uploads table
CREATE TABLE file_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    chatbot_id UUID REFERENCES chatbots ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_size INTEGER,
    file_type TEXT,
    storage_path TEXT,
    processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    extracted_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Create subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    plan_name TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usage_tracking table
CREATE TABLE usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    chatbot_id UUID REFERENCES chatbots ON DELETE CASCADE,
    usage_type TEXT NOT NULL CHECK (usage_type IN ('chat_message', 'hoax_detection', 'sentiment_analysis', 'file_upload')),
    count INTEGER DEFAULT 1,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_chatbots_user_id ON chatbots(user_id);
CREATE INDEX idx_knowledge_base_chatbot_id ON knowledge_base(chatbot_id);
CREATE INDEX idx_conversations_chatbot_id ON conversations(chatbot_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at);
CREATE INDEX idx_ai_analytics_chatbot_id ON ai_analytics(chatbot_id);
CREATE INDEX idx_usage_tracking_user_id_date ON usage_tracking(user_id, date);

-- Row Level Security Policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Chatbots policies
CREATE POLICY "Users can view own chatbots" ON chatbots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create chatbots" ON chatbots FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chatbots" ON chatbots FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own chatbots" ON chatbots FOR DELETE USING (auth.uid() = user_id);

-- Knowledge base policies
CREATE POLICY "Users can view knowledge base of own chatbots" ON knowledge_base FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM chatbots WHERE chatbots.id = knowledge_base.chatbot_id AND chatbots.user_id = auth.uid()
    ));
CREATE POLICY "Users can insert knowledge base for own chatbots" ON knowledge_base FOR INSERT 
    WITH CHECK (EXISTS (
        SELECT 1 FROM chatbots WHERE chatbots.id = knowledge_base.chatbot_id AND chatbots.user_id = auth.uid()
    ));

-- Conversations policies
CREATE POLICY "Users can view conversations of own chatbots" ON conversations FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM chatbots WHERE chatbots.id = conversations.chatbot_id AND chatbots.user_id = auth.uid()
    ));
CREATE POLICY "Anyone can insert conversations" ON conversations FOR INSERT WITH CHECK (true); -- For public chatbot access

-- AI Analytics policies
CREATE POLICY "Users can view analytics of own chatbots" ON ai_analytics FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM chatbots WHERE chatbots.id = ai_analytics.chatbot_id AND chatbots.user_id = auth.uid()
    ));

-- File uploads policies
CREATE POLICY "Users can view own file uploads" ON file_uploads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own file uploads" ON file_uploads FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbots ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Create functions for automatic updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chatbots_updated_at BEFORE UPDATE ON chatbots 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for development
INSERT INTO profiles (id, email, full_name, business_name, industry) VALUES 
('00000000-0000-0000-0000-000000000000', 'demo@assistenwira.com', 'Demo User', 'Demo Business', 'retail');

-- Note: You'll need to create a user in Supabase Auth first, then update the ID above
