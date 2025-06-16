import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatRequest {
  message: string;
  config: {
    temperature: number;
    topP: number;
    maxTokens: number;
    systemPrompt: string;
  };
  knowledgeContext?: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, config, knowledgeContext, conversationHistory }: ChatRequest = await req.json()

    // Use fixed Gemini API key
    const geminiApiKey = 'AIzaSyBqJzQvzKZJzQvzKZJzQvzKZJzQvzKZJzQvzKZ' // Replace with your actual API key
    
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured')
    }

    // Build the conversation context
    let fullPrompt = config.systemPrompt

    // Add knowledge context if provided
    if (knowledgeContext) {
      fullPrompt += `\n\nAdditional Knowledge Context:\n${knowledgeContext}`
    }

    // Add conversation history
    if (conversationHistory.length > 0) {
      fullPrompt += '\n\nConversation History:'
      conversationHistory.forEach(msg => {
        fullPrompt += `\n${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`
      })
    }

    // Add current message
    fullPrompt += `\n\nHuman: ${message}\nAssistant:`

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }],
          generationConfig: {
            temperature: config.temperature,
            topP: config.topP,
            maxOutputTokens: config.maxTokens,
          }
        })
      }
    )

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('Gemini API error:', errorText)
      throw new Error(`Gemini API error: ${geminiResponse.status}`)
    }

    const geminiData = await geminiResponse.json()
    
    // Extract the response text
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated'

    return new Response(
      JSON.stringify({ 
        response: responseText,
        usage: geminiData.usageMetadata || {}
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('Error in gemini-chat function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        response: 'Sorry, I encountered an error processing your request. Please try again.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})