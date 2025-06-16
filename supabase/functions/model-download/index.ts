import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

interface DownloadRequest {
  modelId: string;
  downloadType: 'full_model' | 'config_only' | 'samples_only';
  intendedUse?: string;
  userAgent?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method === 'POST') {
      const downloadRequest: DownloadRequest = await req.json()

      // Validate model exists and is approved
      const { data: model, error: modelError } = await supabase
        .from('published_models')
        .select('*')
        .eq('id', downloadRequest.modelId)
        .eq('is_public', true)
        .eq('validation_status', 'approved')
        .single()

      if (modelError || !model) {
        return new Response(
          JSON.stringify({ error: 'Model not found or not available for download' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Log the download
      const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
      
      await supabase
        .from('model_download_logs')
        .insert({
          model_id: downloadRequest.modelId,
          download_type: downloadRequest.downloadType,
          user_agent: downloadRequest.userAgent || req.headers.get('user-agent'),
          ip_address: clientIP,
          intended_use: downloadRequest.intendedUse
        })

      // Prepare download data based on type
      let downloadData: any = {}

      switch (downloadRequest.downloadType) {
        case 'config_only':
          downloadData = {
            name: model.name,
            version: model.version,
            description: model.description,
            category: model.category,
            tags: model.tags,
            systemPrompt: model.system_prompt,
            defaultConfig: {
              temperature: model.default_temperature,
              topP: model.default_top_p,
              maxTokens: model.default_max_tokens
            },
            knowledgeContext: model.knowledge_context,
            license: {
              type: model.license_type,
              text: model.license_text
            }
          }
          break

        case 'samples_only':
          const { data: samples } = await supabase
            .from('model_samples')
            .select('*')
            .eq('model_id', downloadRequest.modelId)

          downloadData = {
            modelInfo: {
              name: model.name,
              version: model.version
            },
            samples: samples || []
          }
          break

        case 'full_model':
        default:
          // Get samples and validations
          const [samplesResult, validationsResult] = await Promise.all([
            supabase
              .from('model_samples')
              .select('*')
              .eq('model_id', downloadRequest.modelId),
            supabase
              .from('model_validations')
              .select('*')
              .eq('model_id', downloadRequest.modelId)
              .eq('status', 'passed')
          ])

          downloadData = {
            metadata: {
              name: model.name,
              version: model.version,
              description: model.description,
              category: model.category,
              tags: model.tags,
              publisher: model.publisher_name,
              license: {
                type: model.license_type,
                text: model.license_text
              },
              documentation: model.documentation_url,
              repository: model.repository_url,
              downloadCount: model.download_count,
              rating: {
                average: model.rating_average,
                count: model.rating_count
              },
              createdAt: model.created_at,
              publishedAt: model.published_at
            },
            configuration: {
              systemPrompt: model.system_prompt,
              defaultConfig: {
                temperature: model.default_temperature,
                topP: model.default_top_p,
                maxTokens: model.default_max_tokens
              },
              knowledgeContext: model.knowledge_context,
              knowledgeFiles: model.knowledge_files
            },
            samples: samplesResult.data || [],
            validations: validationsResult.data || [],
            usage: {
              instructions: "This model configuration can be used with the Gemini 1.5 Flash API",
              apiEndpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent",
              requiredHeaders: ["Content-Type: application/json", "Authorization: Bearer YOUR_API_KEY"],
              exampleRequest: {
                contents: [{
                  parts: [{
                    text: "SYSTEM_PROMPT + USER_MESSAGE"
                  }]
                }],
                generationConfig: {
                  temperature: model.default_temperature,
                  topP: model.default_top_p,
                  maxOutputTokens: model.default_max_tokens
                }
              }
            }
          }
          break
      }

      return new Response(
        JSON.stringify({
          success: true,
          downloadType: downloadRequest.downloadType,
          data: downloadData,
          downloadedAt: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'GET') {
      // Get download statistics
      const url = new URL(req.url)
      const modelId = url.searchParams.get('modelId')

      if (!modelId) {
        return new Response(
          JSON.stringify({ error: 'Model ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data: stats, error } = await supabase
        .from('model_download_logs')
        .select('download_type, downloaded_at, intended_use')
        .eq('model_id', modelId)

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch download statistics' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Aggregate statistics
      const downloadStats = {
        total: stats?.length || 0,
        byType: stats?.reduce((acc: any, download: any) => {
          acc[download.download_type] = (acc[download.download_type] || 0) + 1
          return acc
        }, {}),
        recentDownloads: stats?.slice(-10) || []
      }

      return new Response(
        JSON.stringify({ statistics: downloadStats }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Download error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})