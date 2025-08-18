// AI Services Integration
export interface AIResponse {
  response: string;
  confidence: number;
  sentiment?: string;
  is_hoax_detected?: boolean;
}

// Replicate AI Service with IBM Granite Model (Primary Choice)
export async function callReplicateAPI(
  message: string, 
  knowledgeBase: string[]
): Promise<AIResponse> {
  try {
    console.log('🚀 Calling Replicate API with IBM Granite model...');
    
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "ibm-granite/granite-3.3-8b-instruct",
        input: {
          prompt: `You are a helpful AI assistant for Indonesian businesses. Please answer in Indonesian language naturally and helpfully.

User Question: ${message}

Please provide a helpful, accurate, and natural response in Indonesian:`,
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Replicate API HTTP error:', response.status, errorText);
      throw new Error(`Replicate API HTTP error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Replicate API response:', data);
    
    // For Replicate, we need to poll for the result
    if (data.status === 'starting' || data.status === 'processing') {
      console.log('⏳ Replicate API is processing, starting polling...');
      
      // Poll for the result with longer timeout for AI models
      const maxAttempts = 60; // 60 attempts (2 minutes)
      const pollInterval = 2000; // 2 seconds
      let attempts = 0;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        attempts++;
        
        console.log(`🔄 Polling attempt ${attempts}/${maxAttempts}...`);
        
        try {
          const pollResponse = await fetch(data.urls.get, {
            headers: {
              'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
            },
          });
          
          if (!pollResponse.ok) {
            console.log(`⚠️ Poll response error: ${pollResponse.status}`);
            continue;
          }
          
          const pollData = await pollResponse.json();
          console.log(`📊 Poll status: ${pollData.status}`);
          
          if (pollData.status === 'succeeded') {
            console.log('✅ Replicate API completed successfully!');
            console.log('📤 Final output:', pollData.output);
            
            // Ensure we have a real response
            if (pollData.output) {
              let responseText;
              
              // Handle different output formats
              if (Array.isArray(pollData.output)) {
                // If output is array, join it into string
                responseText = pollData.output.join('');
                console.log('🔄 Array output detected, joining into string:', responseText);
              } else if (typeof pollData.output === 'string') {
                // If output is string, use as is
                responseText = pollData.output;
              } else {
                // If output is unexpected format, convert to string
                responseText = String(pollData.output);
                console.log('🔄 Unexpected output format, converting to string:', responseText);
              }
              
              if (responseText && responseText.trim()) {
                return {
                  response: responseText.trim(),
                  confidence: 0.95,
                  sentiment: 'positive'
                };
              } else {
                throw new Error('Replicate API returned empty response after processing');
              }
            } else {
              throw new Error('Replicate API returned empty response');
            }
          } else if (pollData.status === 'failed') {
            console.error('❌ Replicate API failed:', pollData.error);
            throw new Error(`Replicate API failed: ${pollData.error}`);
          } else if (pollData.status === 'canceled') {
            console.error('❌ Replicate API was canceled');
            throw new Error('Replicate API was canceled');
          }
          
          // Still processing, continue polling
          console.log('⏳ Still processing, continuing to poll...');
          
        } catch (pollError) {
          console.log(`⚠️ Poll attempt ${attempts} failed:`, (pollError as Error).message);
          if (attempts === maxAttempts) {
            throw new Error(`Polling failed after ${maxAttempts} attempts: ${(pollError as Error).message}`);
          }
        }
      }
      
      // Timeout reached - this is critical, don't fall back to simple
      throw new Error(`Replicate API timeout after ${maxAttempts * pollInterval / 1000} seconds`);
    }
    
    // If we get here, something unexpected happened
    if (data.output) {
      let responseText;
      
      // Handle different output formats
      if (Array.isArray(data.output)) {
        // If output is array, join it into string
        responseText = data.output.join('');
        console.log('🔄 Array output detected, joining into string:', responseText);
      } else if (typeof data.output === 'string') {
        // If output is string, use as is
        responseText = data.output;
      } else {
        // If output is unexpected format, convert to string
        responseText = String(data.output);
        console.log('🔄 Unexpected output format, converting to string:', responseText);
      }
      
      if (responseText && responseText.trim()) {
        return {
          response: responseText.trim(),
          confidence: 0.9,
          sentiment: 'neutral'
        };
      } else {
        throw new Error('Replicate API returned empty response after processing');
      }
    } else {
      throw new Error('Replicate API returned unexpected response format');
    }
  } catch (error) {
    console.error('Replicate API error:', error);
    throw error; // Re-throw to let the caller handle fallback
  }
}

// HuggingFace AI Service with OpenAI GPT-OSS 20B Model using Router API (Secondary Choice)
export async function callHuggingFaceAPI(
  message: string, 
  knowledgeBase: string[]
): Promise<AIResponse> {
  try {
    console.log('🚀 Calling HuggingFace Router API with OpenAI GPT-OSS 20B model...');
    
    const response = await fetch(
      `https://router.huggingface.co/v1/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b:fireworks-ai",
          messages: [
            {
              role: "system",
              content: `You are a helpful AI assistant for Indonesian businesses. Please answer in Indonesian language naturally and helpfully.

IMPORTANT FORMATTING RULES:
1. Use CLEAN, READABLE formatting without Markdown symbols
2. NO **bold** symbols, NO | table separators, NO --- lines, NO ### headings
3. Use simple bullet points with • or - for lists
4. Use clear section breaks with blank lines
5. Format tables with simple text alignment (no | characters)
6. Make responses easy to read for non-technical users
7. Provide complete, detailed answers with proper structure
8. Use Indonesian language naturally and professionally`
            },
            {
              role: "user",
              content: message
            }
          ],
          max_tokens: 2000, // Increased from 500 to 2000 for complete answers
          temperature: 0.7,
          top_p: 0.9,
          stream: false, // Ensure complete response
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HuggingFace Router API HTTP error:', response.status, errorText);
      throw new Error(`HuggingFace Router API HTTP error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('HuggingFace Router API response:', data);
    
    // Get the complete response content
    let fullResponse = data.choices?.[0]?.message?.content;
    
    if (!fullResponse) {
      throw new Error("No response content received from HuggingFace Router API");
    }
    
    // Clean up any remaining Markdown characters for better readability
    fullResponse = fullResponse
      .replace(/\*\*/g, '') // Remove ** bold markers
      .replace(/\|/g, ' ') // Replace | with spaces
      .replace(/---+/g, '') // Remove --- lines
      .replace(/#{1,6}\s*/g, '') // Remove # headings
      .replace(/>\s*/g, '') // Remove > blockquote markers
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Clean up multiple line breaks
      .trim();
    
    console.log('📤 Full HuggingFace Response Length:', fullResponse.length, 'characters');
    console.log('📤 Cleaned HuggingFace Response:', fullResponse);
    
    return {
      response: fullResponse,
      confidence: 0.95, // Increased confidence for complete responses
      sentiment: 'positive'
    };
  } catch (error) {
    console.error('HuggingFace Router API error:', error);
    throw error; // Re-throw to let the caller handle fallback
  }
}

// IBM Watson Orchestrate Service (IBM Demo Fallback)
export async function callIBMWatsonAPI(
  message: string,
  knowledgeBase: string[]
): Promise<AIResponse> {
  try {
    console.log('🚀 Calling IBM Watson Orchestrate API (IBM Demo Fallback)...');
    
    if (!process.env.IBM_ORCHESTRATE_API_KEY || !process.env.IBM_ORCHESTRATE_BASE_URL) {
      throw new Error('IBM Watson credentials not configured');
    }

    const response = await fetch(`${process.env.IBM_ORCHESTRATE_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.IBM_ORCHESTRATE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "ibm-granite-3.3-8b-instruct",
        messages: [
          {
            role: "system",
            content: "You are a helpful AI assistant for Indonesian businesses. Please answer in Indonesian language naturally and helpfully."
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('IBM Watson API HTTP error:', response.status, errorText);
      throw new Error(`IBM Watson API HTTP error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('IBM Watson API response:', data);
    
    return {
      response: data.choices?.[0]?.message?.content || "Maaf, saya tidak bisa memproses pesan Anda saat ini.",
      confidence: 0.9,
      sentiment: 'neutral'
    };
  } catch (error) {
    console.error('IBM Watson API error:', error);
    throw error; // Re-throw to let the caller handle fallback
  }
}

// Simple AI Response (Last Resort Fallback)
export function generateSimpleResponse(
  message: string,
  knowledgeBase: string[]
): AIResponse {
  const lowerMessage = message.toLowerCase();
  
  // Enhanced keyword matching for production fallback
  if (lowerMessage.includes('halo') || lowerMessage.includes('hai') || lowerMessage.includes('hello')) {
    return {
      response: "Halo! 👋 Saya adalah Asisten Wira, chatbot AI yang siap membantu bisnis UMKM Indonesia. Ada yang bisa saya bantu hari ini?",
      confidence: 0.8,
      sentiment: 'positive'
    };
  }
  
  if (lowerMessage.includes('terima kasih') || lowerMessage.includes('thanks')) {
    return {
      response: "Sama-sama! 😊 Senang bisa membantu Anda. Ada yang lain yang bisa saya bantu?",
      confidence: 0.9,
      sentiment: 'positive'
    };
  }
  
  if (lowerMessage.includes('apa kabar') || lowerMessage.includes('how are you')) {
    return {
      response: "Kabar saya baik, terima kasih! 😊 Bagaimana dengan Anda? Ada yang bisa saya bantu terkait bisnis atau produk?",
      confidence: 0.8,
      sentiment: 'positive'
    };
  }

  // Business-related responses for production
  if (lowerMessage.includes('bisnis') || lowerMessage.includes('business')) {
    return {
      response: "Saya siap membantu Anda dengan berbagai aspek bisnis UMKM! Mulai dari strategi pemasaran, manajemen keuangan, hingga digitalisasi bisnis. Ada topik spesifik yang ingin Anda diskusikan?",
      confidence: 0.85,
      sentiment: 'positive'
    };
  }

  if (lowerMessage.includes('umkm') || lowerMessage.includes('sme')) {
    return {
      response: "UMKM adalah tulang punggung ekonomi Indonesia! Saya bisa membantu dengan tips pengembangan bisnis, akses keuangan, digitalisasi, dan strategi ekspansi pasar. Ada yang ingin Anda tanyakan?",
      confidence: 0.85,
      sentiment: 'positive'
    };
  }

  if (lowerMessage.includes('pemasaran') || lowerMessage.includes('marketing')) {
    return {
      response: "Pemasaran digital sangat penting untuk UMKM! Saya bisa membantu dengan strategi social media marketing, content marketing, SEO, dan digital advertising. Mau mulai dari mana?",
      confidence: 0.8,
      sentiment: 'positive'
    };
  }

  if (lowerMessage.includes('keuangan') || lowerMessage.includes('finance')) {
    return {
      response: "Manajemen keuangan yang baik adalah kunci sukses bisnis! Saya bisa membantu dengan budgeting, cash flow management, dan strategi pengembangan modal. Ada yang ingin Anda pelajari?",
      confidence: 0.8,
      sentiment: 'positive'
    };
  }

  // Location-based responses
  if (lowerMessage.includes('kalimantan') || lowerMessage.includes('borneo')) {
    return {
      response: "Kalimantan adalah pulau terbesar ketiga di dunia! Untuk Kalimantan Selatan, ibukotanya adalah Banjarmasin. Kalimantan kaya akan sumber daya alam dan potensi bisnis. Ada yang ingin Anda ketahui lebih lanjut?",
      confidence: 0.9,
      sentiment: 'positive'
    };
  }

  if (lowerMessage.includes('banjarmasin') || lowerMessage.includes('kalimantan selatan')) {
    return {
      response: "Banjarmasin adalah ibukota Kalimantan Selatan! Kota ini terkenal dengan pasar terapung, budaya Banjar, dan potensi bisnis yang berkembang pesat. Saya bisa membantu Anda dengan informasi lebih detail tentang Banjarmasin.",
      confidence: 0.9,
      sentiment: 'positive'
    };
  }

  // Technology-related responses
  if (lowerMessage.includes('ai') || lowerMessage.includes('artificial intelligence') || lowerMessage.includes('machine learning')) {
    return {
      response: "AI dan Machine Learning adalah teknologi masa depan yang sangat berguna untuk bisnis! Mulai dari chatbot customer service, analisis data pelanggan, hingga otomatisasi proses bisnis. Saya bisa membantu menjelaskan lebih detail!",
      confidence: 0.85,
      sentiment: 'positive'
    };
  }

  if (lowerMessage.includes('website') || lowerMessage.includes('web') || lowerMessage.includes('online')) {
    return {
      response: "Website dan presence online sangat penting untuk UMKM! Mulai dari website sederhana, social media presence, hingga e-commerce platform. Saya bisa membantu dengan tips dan strategi digitalisasi bisnis Anda!",
      confidence: 0.85,
      sentiment: 'positive'
    };
  }
  
  // Default response with helpful guidance
  return {
    response: "Maaf, AI services sedang dalam maintenance. Tapi saya tetap bisa membantu dengan informasi umum tentang bisnis UMKM, Kalimantan, teknologi, dan lainnya. Silakan tanyakan hal spesifik yang ingin Anda ketahui!",
    confidence: 0.6,
    sentiment: 'neutral'
  };
}
