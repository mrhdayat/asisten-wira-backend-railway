import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

// GET /api/knowledge-base - Get all knowledge base items for a chatbot
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chatbot_id = searchParams.get('chatbot_id');

    if (!chatbot_id) {
      return NextResponse.json(
        { error: 'chatbot_id is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('chatbot_id', chatbot_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching knowledge base:', error);
      return NextResponse.json(
        { error: 'Failed to fetch knowledge base' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Knowledge base GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/knowledge-base - Create new knowledge base item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chatbot_id, title, content, keywords, category } = body;

    if (!chatbot_id || !title || !content) {
      return NextResponse.json(
        { error: 'chatbot_id, title, and content are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('knowledge_base')
      .insert([
        {
          chatbot_id,
          title,
          content,
          keywords: keywords || '',
          category: category || 'general',
          is_active: true
        }
      ])
      .select();

    if (error) {
      console.error('Error creating knowledge base item:', error);
      return NextResponse.json(
        { error: 'Failed to create knowledge base item' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Knowledge base item created successfully',
      data: data[0] 
    });
  } catch (error) {
    console.error('Knowledge base POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/knowledge-base - Update knowledge base item
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, content, keywords, category, is_active } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('knowledge_base')
      .update({
        title,
        content,
        keywords: keywords || '',
        category: category || 'general',
        is_active: is_active !== undefined ? is_active : true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating knowledge base item:', error);
      return NextResponse.json(
        { error: 'Failed to update knowledge base item' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Knowledge base item updated successfully',
      data: data[0] 
    });
  } catch (error) {
    console.error('Knowledge base PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/knowledge-base - Delete knowledge base item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    
    const { error } = await supabase
      .from('knowledge_base')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting knowledge base item:', error);
      return NextResponse.json(
        { error: 'Failed to delete knowledge base item' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Knowledge base item deleted successfully' 
    });
  } catch (error) {
    console.error('Knowledge base DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
