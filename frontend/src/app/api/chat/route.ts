import { NextRequest, NextResponse } from 'next/server';
import { callReplicateAPI, callHuggingFaceAPI, callIBMWatsonAPI, generateSimpleResponse } from '@/lib/ai-services';
import { getSupabaseClient } from '@/lib/supabase';

// POST /api/chat - Process chat message
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 === CHAT API START ===');
    
    const body = await request.json();
    const { message, chatbot_id, chat_mode = 'hybrid' } = body;
    
    console.log('📝 Message:', message);
    console.log('🤖 Chat Mode:', chat_mode);
    console.log('🆔 Chatbot ID:', chatbot_id);
    
    if (!message || !chatbot_id) {
      return NextResponse.json(
        { success: false, error: 'Message and chatbot_id are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    
    // First, check knowledge base if mode allows it
    let knowledgeBaseResponse = null;
    let responseSource = 'ai_service';
    
    if (chat_mode === 'knowledge-base' || chat_mode === 'hybrid') {
      console.log('🔍 Checking knowledge base first...');
      
      try {
        const { data: kbItems } = await supabase
          .from('knowledge_base')
          .select('*')
          .eq('chatbot_id', chatbot_id)
          .eq('is_active', true);
        
        if (kbItems && kbItems.length > 0) {
          // Simple keyword matching for knowledge base
          const userMessageLower = message.toLowerCase();
          const matchedItem = kbItems.find(item => {
            const keywords = item.keywords?.toLowerCase().split(',').map((k: string) => k.trim()) || [];
            const title = item.title?.toLowerCase() || '';
            const content = item.content?.toLowerCase() || '';
            
            return keywords.some((keyword: string) => userMessageLower.includes(keyword)) ||
                   userMessageLower.includes(title) ||
                   userMessageLower.includes(content);
          });
          
          if (matchedItem) {
            console.log('✅ Knowledge base match found:', matchedItem.title);
            knowledgeBaseResponse = matchedItem.content;
            responseSource = 'knowledge_base';
          } else {
            console.log('❌ No knowledge base match found');
          }
        }
      } catch (kbError) {
        console.error('❌ Error checking knowledge base:', kbError);
      }
    }
    
    let finalResponse = '';
    let confidence = 0.8;
    let sentiment = 'positive';
    
    // Determine response based on mode and knowledge base results
    if (chat_mode === 'knowledge-base') {
      if (knowledgeBaseResponse) {
        finalResponse = knowledgeBaseResponse;
        confidence = 0.95;
        sentiment = 'positive';
      } else {
        finalResponse = 'Maaf, saya tidak memiliki informasi tentang hal tersebut dalam knowledge base. Silakan hubungi admin untuk menambahkan informasi yang diperlukan.';
        confidence = 0.3;
        sentiment = 'neutral';
      }
    } else if (chat_mode === 'ai') {
      // AI mode only - skip knowledge base
      console.log('🤖 Using AI mode only...');
      try {
        const aiResponse = await callHuggingFaceAPI(message, []);
        finalResponse = aiResponse.response;
        confidence = aiResponse.confidence;
        sentiment = aiResponse.sentiment;
      } catch (aiError) {
        console.error('❌ AI service failed:', aiError);
        finalResponse = 'Maaf, AI service sedang tidak tersedia. Silakan coba lagi nanti.';
        confidence = 0.2;
        sentiment = 'negative';
      }
    } else {
      // Hybrid mode - knowledge base first, then AI fallback
      if (knowledgeBaseResponse) {
        finalResponse = knowledgeBaseResponse;
        confidence = 0.95;
        sentiment = 'positive';
      } else {
        console.log('🤖 No KB match, trying AI services...');
        try {
          const aiResponse = await callHuggingFaceAPI(message, []);
          finalResponse = aiResponse.response;
          confidence = aiResponse.confidence;
          sentiment = aiResponse.sentiment;
        } catch (aiError) {
          console.error('❌ AI service failed:', aiError);
          finalResponse = 'Maaf, saya tidak memiliki informasi tentang hal tersebut dan AI service sedang tidak tersedia. Silakan hubungi admin untuk bantuan.';
          confidence = 0.2;
          sentiment = 'negative';
        }
      }
    }
    
    // Save conversation to database
    try {
      await supabase
        .from('conversations')
        .insert([
          {
            chatbot_id,
            user_message: message,
            bot_response: finalResponse,
            sentiment,
            source: responseSource,
            knowledge_id: responseSource === 'knowledge_base' && knowledgeBaseResponse ? matchedItem?.id : null
          }
        ]);
      console.log('✅ Conversation saved to database');
    } catch (saveError) {
      console.error('❌ Error saving conversation:', saveError);
    }
    
    console.log('🎯 === FINAL RESULT ===');
    console.log('📤 Final Response:', finalResponse);
    console.log('🎯 Confidence:', confidence);
    console.log('😊 Sentiment:', sentiment);
    console.log('📚 Source:', responseSource);
    console.log('🚀 === CHAT API END ===');
    
    return NextResponse.json({
      success: true,
      response: finalResponse,
      confidence,
      sentiment,
      source: responseSource
    });
    
  } catch (error) {
    console.error('❌ Chat API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        response: 'Maaf, terjadi kesalahan dalam memproses pesan Anda. Silakan coba lagi.'
      },
      { status: 500 }
    );
  }
}
