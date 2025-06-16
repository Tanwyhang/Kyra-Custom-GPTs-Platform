import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ModelSubmissionRequest {
  name: string;
  version?: string;
  description: string;
  category: string;
  tags: string[];
  licenseType: string;
  licenseText?: string;
  documentationUrl?: string;
  repositoryUrl?: string;
  systemPrompt: string;
  defaultConfig: {
    temperature: number;
    topP: number;
    maxTokens: number;
  };
  knowledgeContext?: string;
  knowledgeFiles?: Array<{
    name: string;
    size: number;
    type: string;
  }>;
  samplePrompts: string[];
  publisherName?: string;
  publisherEmail?: string;
  isPublic: boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const submissionData: ModelSubmissionRequest = await req.json()

    // Validate the submission
    const validation = validateSubmission(submissionData)
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ 
          error: 'Validation failed', 
          details: validation.errors,
          warnings: validation.warnings 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check for duplicate model names
    const { data: existingModel } = await supabase
      .from('published_models')
      .select('id, name, version')
      .eq('name', submissionData.name)
      .eq('version', submissionData.version || '1.0.0')
      .single()

    if (existingModel) {
      return new Response(
        JSON.stringify({ 
          error: 'Model with this name and version already exists',
          suggestion: 'Please use a different name or increment the version number'
        }),
        { 
          status: 409, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Insert the model
    const { data: newModel, error: insertError } = await supabase
      .from('published_models')
      .insert({
        name: submissionData.name,
        version: submissionData.version || '1.0.0',
        description: submissionData.description,
        category: submissionData.category,
        tags: submissionData.tags,
        license_type: submissionData.licenseType,
        license_text: submissionData.licenseText,
        documentation_url: submissionData.documentationUrl,
        repository_url: submissionData.repositoryUrl,
        system_prompt: submissionData.systemPrompt,
        default_temperature: submissionData.defaultConfig.temperature,
        default_top_p: submissionData.defaultConfig.topP,
        default_max_tokens: submissionData.defaultConfig.maxTokens,
        knowledge_context: submissionData.knowledgeContext,
        knowledge_files: submissionData.knowledgeFiles || [],
        publisher_name: submissionData.publisherName,
        publisher_email: submissionData.publisherEmail,
        is_public: submissionData.isPublic,
        validation_status: 'pending'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to submit model', 
          details: insertError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create sample prompts
    if (submissionData.samplePrompts && submissionData.samplePrompts.length > 0) {
      const sampleInserts = submissionData.samplePrompts
        .filter(prompt => prompt.trim())
        .map((prompt, index) => ({
          model_id: newModel.id,
          sample_type: 'prompt_template',
          title: `Sample Prompt ${index + 1}`,
          description: 'User-provided sample prompt',
          input_data: { prompt },
          tags: ['sample', 'user-provided']
        }))

      if (sampleInserts.length > 0) {
        await supabase
          .from('model_samples')
          .insert(sampleInserts)
      }
    }

    // Trigger automated validation
    await triggerValidation(supabase, newModel.id)

    return new Response(
      JSON.stringify({
        success: true,
        model: {
          id: newModel.id,
          name: newModel.name,
          version: newModel.version,
          status: newModel.validation_status
        },
        message: 'Model submitted successfully and validation has been initiated',
        warnings: validation.warnings
      }),
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Submission error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function validateSubmission(data: ModelSubmissionRequest): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Required fields validation
  if (!data.name || data.name.trim().length < 3) {
    errors.push('Model name must be at least 3 characters long')
  }

  if (!data.description || data.description.trim().length < 50) {
    errors.push('Description must be at least 50 characters long')
  }

  if (!data.category || data.category.trim().length === 0) {
    errors.push('Category is required')
  }

  if (!data.systemPrompt || data.systemPrompt.trim().length < 20) {
    errors.push('System prompt must be at least 20 characters long')
  }

  if (!data.licenseType || data.licenseType.trim().length === 0) {
    errors.push('License type is required')
  }

  // Configuration validation
  if (!data.defaultConfig) {
    errors.push('Default configuration is required')
  } else {
    if (data.defaultConfig.temperature < 0 || data.defaultConfig.temperature > 1) {
      errors.push('Temperature must be between 0 and 1')
    }

    if (data.defaultConfig.topP < 0 || data.defaultConfig.topP > 1) {
      errors.push('Top-p must be between 0 and 1')
    }

    if (data.defaultConfig.maxTokens < 1 || data.defaultConfig.maxTokens > 4096) {
      errors.push('Max tokens must be between 1 and 4096')
    }
  }

  // Tags validation
  if (!data.tags || data.tags.length === 0) {
    warnings.push('Adding tags will help users discover your model')
  } else if (data.tags.length > 10) {
    errors.push('Maximum 10 tags allowed')
  }

  // Sample prompts validation
  if (!data.samplePrompts || data.samplePrompts.filter(p => p.trim()).length === 0) {
    warnings.push('Adding sample prompts will help users understand your model')
  }

  // Knowledge context validation
  if (data.knowledgeContext && data.knowledgeContext.length > 50000) {
    errors.push('Knowledge context must be less than 50,000 characters')
  }

  // File validation
  if (data.knowledgeFiles && data.knowledgeFiles.length > 10) {
    errors.push('Maximum 10 knowledge files allowed')
  }

  // Name validation (alphanumeric, spaces, hyphens, underscores only)
  const nameRegex = /^[a-zA-Z0-9\s\-_]+$/
  if (data.name && !nameRegex.test(data.name)) {
    errors.push('Model name can only contain letters, numbers, spaces, hyphens, and underscores')
  }

  // Version validation
  if (data.version) {
    const versionRegex = /^\d+\.\d+\.\d+$/
    if (!versionRegex.test(data.version)) {
      errors.push('Version must follow semantic versioning format (e.g., 1.0.0)')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

async function triggerValidation(supabase: any, modelId: string) {
  try {
    // Insert initial validation record
    await supabase
      .from('model_validations')
      .insert({
        model_id: modelId,
        validation_type: 'automated',
        status: 'pending',
        validator_name: 'AI Validation System',
        validation_started_at: new Date().toISOString()
      })

    // Update model status to validating
    await supabase
      .from('published_models')
      .update({ validation_status: 'validating' })
      .eq('id', modelId)

    // In a real implementation, this would trigger an async validation process
    console.log(`Validation triggered for model ${modelId}`)
  } catch (error) {
    console.error('Failed to trigger validation:', error)
  }
}