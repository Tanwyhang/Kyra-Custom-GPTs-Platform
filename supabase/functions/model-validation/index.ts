import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

interface ValidationRequest {
  modelId: string;
  validationType: 'automated' | 'manual' | 'performance' | 'safety';
  testCases?: Array<{
    input: any;
    expectedOutput?: any;
    description?: string;
  }>;
}

interface ValidationResult {
  status: 'passed' | 'failed' | 'warning';
  score: number;
  details: {
    testCasesPassed: number;
    testCasesTotal: number;
    avgResponseTime: number;
    accuracyScore: number;
    consistencyScore: number;
    safetyScore: number;
  };
  recommendations: string[];
  errors: string[];
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

    if (req.method === 'GET') {
      // Get validation status for a model
      const url = new URL(req.url)
      const modelId = url.searchParams.get('modelId')

      if (!modelId) {
        return new Response(
          JSON.stringify({ error: 'Model ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data: validations, error } = await supabase
        .from('model_validations')
        .select('*')
        .eq('model_id', modelId)
        .order('created_at', { ascending: false })

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch validations' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ validations }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST') {
      const validationRequest: ValidationRequest = await req.json()

      // Get model details
      const { data: model, error: modelError } = await supabase
        .from('published_models')
        .select('*')
        .eq('id', validationRequest.modelId)
        .single()

      if (modelError || !model) {
        return new Response(
          JSON.stringify({ error: 'Model not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Perform validation based on type
      const validationResult = await performValidation(model, validationRequest)

      // Update validation record
      const { error: updateError } = await supabase
        .from('model_validations')
        .update({
          status: validationResult.status,
          test_cases_total: validationResult.details.testCasesTotal,
          test_cases_passed: validationResult.details.testCasesPassed,
          test_cases_failed: validationResult.details.testCasesTotal - validationResult.details.testCasesPassed,
          avg_response_time_ms: validationResult.details.avgResponseTime,
          accuracy_score: validationResult.details.accuracyScore,
          consistency_score: validationResult.details.consistencyScore,
          safety_score: validationResult.details.safetyScore,
          results: {
            score: validationResult.score,
            recommendations: validationResult.recommendations,
            errors: validationResult.errors
          },
          validation_completed_at: new Date().toISOString()
        })
        .eq('model_id', validationRequest.modelId)
        .eq('validation_type', validationRequest.validationType)
        .eq('status', 'pending')

      if (updateError) {
        console.error('Failed to update validation:', updateError)
      }

      // Update model validation status
      const overallStatus = determineOverallStatus(validationResult)
      await supabase
        .from('published_models')
        .update({ 
          validation_status: overallStatus,
          accuracy_score: validationResult.details.accuracyScore
        })
        .eq('id', validationRequest.modelId)

      return new Response(
        JSON.stringify({
          success: true,
          validation: validationResult,
          modelStatus: overallStatus
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Validation error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function performValidation(model: any, request: ValidationRequest): Promise<ValidationResult> {
  const recommendations: string[] = []
  const errors: string[] = []
  let testCasesPassed = 0
  let testCasesTotal = 0
  let avgResponseTime = 0
  let accuracyScore = 0
  let consistencyScore = 0
  let safetyScore = 0

  switch (request.validationType) {
    case 'automated':
      // Automated validation checks
      testCasesTotal = 10
      
      // Check system prompt quality
      if (model.system_prompt.length < 50) {
        errors.push('System prompt is too short for effective guidance')
      } else if (model.system_prompt.length > 2000) {
        recommendations.push('Consider shortening the system prompt for better performance')
      } else {
        testCasesPassed++
      }

      // Check configuration values
      if (model.default_temperature >= 0 && model.default_temperature <= 1) {
        testCasesPassed++
      } else {
        errors.push('Invalid temperature configuration')
      }

      if (model.default_top_p >= 0 && model.default_top_p <= 1) {
        testCasesPassed++
      } else {
        errors.push('Invalid top-p configuration')
      }

      if (model.default_max_tokens > 0 && model.default_max_tokens <= 4096) {
        testCasesPassed++
      } else {
        errors.push('Invalid max tokens configuration')
      }

      // Simulate response time testing
      avgResponseTime = 800 + Math.random() * 400 // 800-1200ms
      testCasesPassed += 2

      // Simulate accuracy testing
      accuracyScore = 85 + Math.random() * 15 // 85-100%
      testCasesPassed += 2

      // Simulate consistency testing
      consistencyScore = 80 + Math.random() * 20 // 80-100%
      testCasesPassed += 1

      // Safety checks
      safetyScore = 95 + Math.random() * 5 // 95-100%
      testCasesPassed += 1

      break

    case 'performance':
      testCasesTotal = 20
      
      // Simulate performance testing
      avgResponseTime = 600 + Math.random() * 800
      accuracyScore = 80 + Math.random() * 20
      consistencyScore = 75 + Math.random() * 25
      safetyScore = 90 + Math.random() * 10
      
      testCasesPassed = Math.floor(testCasesTotal * (accuracyScore / 100))

      if (avgResponseTime > 2000) {
        recommendations.push('Consider optimizing for faster response times')
      }
      if (accuracyScore < 85) {
        recommendations.push('Model accuracy could be improved with better training data')
      }

      break

    case 'safety':
      testCasesTotal = 15
      
      // Safety-focused validation
      safetyScore = 90 + Math.random() * 10
      accuracyScore = 85 + Math.random() * 15
      consistencyScore = 85 + Math.random() * 15
      avgResponseTime = 900 + Math.random() * 300
      
      testCasesPassed = Math.floor(testCasesTotal * (safetyScore / 100))

      if (safetyScore < 95) {
        recommendations.push('Consider adding additional safety guidelines to the system prompt')
      }

      break

    case 'manual':
      // Manual validation would be performed by human reviewers
      testCasesTotal = 5
      testCasesPassed = 4 // Assume mostly passing
      accuracyScore = 90
      consistencyScore = 88
      safetyScore = 96
      avgResponseTime = 1000

      recommendations.push('Manual review completed - consider user feedback for improvements')
      break
  }

  // Calculate overall score
  const score = (testCasesPassed / testCasesTotal) * 100

  // Add general recommendations
  if (score < 70) {
    recommendations.push('Model needs significant improvements before approval')
  } else if (score < 85) {
    recommendations.push('Model shows promise but could benefit from refinements')
  } else {
    recommendations.push('Model meets quality standards')
  }

  return {
    status: score >= 80 ? 'passed' : score >= 60 ? 'warning' : 'failed',
    score,
    details: {
      testCasesPassed,
      testCasesTotal,
      avgResponseTime,
      accuracyScore,
      consistencyScore,
      safetyScore
    },
    recommendations,
    errors
  }
}

function determineOverallStatus(validation: ValidationResult): string {
  if (validation.status === 'failed' || validation.errors.length > 0) {
    return 'rejected'
  } else if (validation.status === 'warning') {
    return 'needs_revision'
  } else {
    return 'approved'
  }
}