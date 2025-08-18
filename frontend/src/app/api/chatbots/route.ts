import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

// GET /api/chatbots - Get all chatbots with stats
export async function GET() {
  try {
    console.log('🚀 Chatbots API: Starting GET request...');
    
    const supabase = getSupabaseClient();
    console.log('✅ Supabase client created successfully');
    
    // Get all chatbots
    const { data: chatbots, error: chatbotsError } = await supabase
      .from('chatbots')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (chatbotsError) {
      console.error('❌ Error fetching chatbots:', chatbotsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch chatbots' },
        { status: 500 }
      );
    }
    
    console.log('📊 Found chatbots:', chatbots?.length || 0);
    
    // Get stats for each chatbot
    const chatbotsWithStats = await Promise.all(
      (chatbots || []).map(async (chatbot) => {
        // Get knowledge base count
        const { count: knowledgeCount } = await supabase
          .from('knowledge_base')
          .select('*', { count: 'exact', head: true })
          .eq('chatbot_id', chatbot.id);
        
        // Get conversation count
        const { count: conversationCount } = await supabase
          .from('conversations')
          .select('*', { count: 'exact', head: true })
          .eq('chatbot_id', chatbot.id);
        
        // Get average sentiment
        const { data: conversations } = await supabase
          .from('conversations')
          .select('sentiment')
          .eq('chatbot_id', chatbot.id)
          .not('sentiment', 'is', null);
        
        let sentimentScore = 0;
        if (conversations && conversations.length > 0) {
          const sentimentValues = conversations.map(c => {
            switch (c.sentiment) {
              case 'positive': return 1;
              case 'neutral': return 0.5;
              case 'negative': return 0;
              default: return 0.5;
            }
          });
          sentimentScore = sentimentValues.reduce((a: number, b: number) => a + b, 0) / sentimentValues.length;
        }
        
        return {
          ...chatbot,
          knowledge_base_size: knowledgeCount || 0,
          total_conversations: conversationCount || 0,
          sentiment_score: Math.round(sentimentScore * 100)
        };
      })
    );
    
    console.log('✅ Chatbots with stats prepared successfully');
    
    return NextResponse.json({
      success: true,
      data: chatbotsWithStats
    });
  } catch (error) {
    console.error('❌ Error in chatbots GET:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/chatbots - Create new chatbot
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Chatbots API: Starting POST request...');
    
    const body = await request.json();
    const { name, description, industry } = body;
    
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }
    
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('chatbots')
      .insert([
        {
          name,
          description,
          industry,
          is_active: true
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating chatbot:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create chatbot' },
        { status: 500 }
      );
    }
    
    console.log('✅ Chatbot created successfully:', data);
    
    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('❌ Error in chatbots POST:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/chatbots/[id] - Delete chatbot
export async function DELETE(request: NextRequest) {
  try {
    console.log('🚀 Chatbots API: Starting DELETE request...');
    
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Chatbot ID is required' },
        { status: 400 }
      );
    }
    
    const supabase = getSupabaseClient();
    
    // First, delete related records (knowledge base and conversations)
    console.log('🗑️ Deleting related records for chatbot:', id);
    
    // Delete conversations
    const { error: conversationsError } = await supabase
      .from('conversations')
      .delete()
      .eq('chatbot_id', id);
    
    if (conversationsError) {
      console.error('❌ Error deleting conversations:', conversationsError);
    } else {
      console.log('✅ Conversations deleted successfully');
    }
    
    // Delete knowledge base items
    const { error: knowledgeError } = await supabase
      .from('knowledge_base')
      .delete()
      .eq('chatbot_id', id);
    
    if (knowledgeError) {
      console.error('❌ Error deleting knowledge base:', knowledgeError);
    } else {
      console.log('✅ Knowledge base items deleted successfully');
    }
    
    // Finally, delete the chatbot
    const { error: chatbotError } = await supabase
      .from('chatbots')
      .delete()
      .eq('id', id);
    
    if (chatbotError) {
      console.error('❌ Error deleting chatbot:', chatbotError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete chatbot' },
        { status: 500 }
      );
    }
    
    console.log('✅ Chatbot deleted successfully:', id);
    
    return NextResponse.json({
      success: true,
      message: 'Chatbot deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error in chatbots DELETE:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/chatbots/[id] - Update chatbot
export async function PUT(request: NextRequest) {
  try {
    console.log('🚀 Chatbots API: Starting PUT request...');
    
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    console.log('🆔 Chatbot ID:', id);
    
    if (!id) {
      console.log('❌ No chatbot ID provided');
      return NextResponse.json(
        { success: false, error: 'Chatbot ID is required' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    console.log('📝 Request body:', body);
    
    const { name, description, industry, is_active, deployment_url, status } = body;
    
    console.log('🔍 Extracted fields:', {
      name,
      description,
      industry,
      is_active,
      deployment_url,
      status
    });
    
    if (!name) {
      console.log('❌ Name is required but not provided');
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }
    
    const supabase = getSupabaseClient();
    
    const updateData: any = {
      name,
      description,
      industry,
      is_active,
      updated_at: new Date().toISOString()
    };
    
    // Add optional fields if provided
    if (deployment_url) updateData.deployment_url = deployment_url;
    if (status) updateData.status = status;
    
    console.log('📊 Update data to send:', updateData);
    
    const { data, error } = await supabase
      .from('chatbots')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase update error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update chatbot', details: error.message },
        { status: 500 }
      );
    }
    
    console.log('✅ Chatbot updated successfully:', data);
    
    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('❌ Error in chatbots PUT:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
