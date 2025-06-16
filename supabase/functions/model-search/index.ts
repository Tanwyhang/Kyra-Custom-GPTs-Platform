import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

interface SearchParams {
  query?: string;
  category?: string;
  tags?: string[];
  minRating?: number;
  sortBy?: 'created_at' | 'download_count' | 'rating_average' | 'name';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  validationStatus?: string;
  featured?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const searchParams: SearchParams = {
      query: url.searchParams.get('query') || undefined,
      category: url.searchParams.get('category') || undefined,
      tags: url.searchParams.get('tags')?.split(',') || undefined,
      minRating: url.searchParams.get('minRating') ? parseFloat(url.searchParams.get('minRating')!) : undefined,
      sortBy: (url.searchParams.get('sortBy') as any) || 'created_at',
      sortOrder: (url.searchParams.get('sortOrder') as any) || 'desc',
      limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : 20,
      offset: url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : 0,
      validationStatus: url.searchParams.get('validationStatus') || 'approved',
      featured: url.searchParams.get('featured') === 'true'
    }

    // Build the query
    let query = supabase
      .from('published_models')
      .select(`
        id,
        name,
        version,
        description,
        category,
        tags,
        license_type,
        default_temperature,
        default_top_p,
        default_max_tokens,
        validation_status,
        accuracy_score,
        publisher_name,
        is_public,
        is_featured,
        download_count,
        rating_average,
        rating_count,
        created_at,
        updated_at,
        published_at
      `)

    // Apply filters
    if (searchParams.validationStatus) {
      query = query.eq('validation_status', searchParams.validationStatus)
    }

    query = query.eq('is_public', true)

    if (searchParams.category) {
      query = query.eq('category', searchParams.category)
    }

    if (searchParams.minRating) {
      query = query.gte('rating_average', searchParams.minRating)
    }

    if (searchParams.featured) {
      query = query.eq('is_featured', true)
    }

    if (searchParams.tags && searchParams.tags.length > 0) {
      query = query.overlaps('tags', searchParams.tags)
    }

    // Apply text search
    if (searchParams.query) {
      query = query.or(`name.ilike.%${searchParams.query}%,description.ilike.%${searchParams.query}%`)
    }

    // Apply sorting
    const ascending = searchParams.sortOrder === 'asc'
    query = query.order(searchParams.sortBy!, { ascending })

    // Apply pagination
    query = query.range(searchParams.offset!, searchParams.offset! + searchParams.limit! - 1)

    const { data: models, error, count } = await query

    if (error) {
      console.error('Search error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to search models' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('published_models')
      .select('*', { count: 'exact', head: true })
      .eq('is_public', true)
      .eq('validation_status', searchParams.validationStatus || 'approved')

    return new Response(
      JSON.stringify({
        models: models || [],
        pagination: {
          total: totalCount || 0,
          limit: searchParams.limit!,
          offset: searchParams.offset!,
          hasMore: (searchParams.offset! + searchParams.limit!) < (totalCount || 0)
        },
        filters: searchParams
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Search error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})