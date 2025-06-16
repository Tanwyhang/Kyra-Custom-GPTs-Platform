import { supabase } from './supabase';

export interface GPTSubmission {
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

export interface PublishedGPT {
  id: string;
  name: string;
  version: string;
  description: string;
  category: string;
  tags: string[];
  license_type: string;
  license_text?: string;
  documentation_url?: string;
  repository_url?: string;
  system_prompt: string;
  default_temperature: number;
  default_top_p: number;
  default_max_tokens: number;
  knowledge_context?: string;
  knowledge_files?: any[];
  validation_status: string;
  validation_notes?: string;
  accuracy_score?: number;
  response_time_ms?: number;
  token_efficiency?: number;
  publisher_name?: string;
  publisher_email?: string;
  is_public: boolean;
  is_featured: boolean;
  download_count: number;
  rating_average: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export class DatabaseService {
  /**
   * Submit a new GPT to the database
   */
  static async submitGPT(submission: GPTSubmission): Promise<{
    success: boolean;
    gpt?: PublishedGPT;
    error?: string;
  }> {
    try {
      // Validate submission
      const validation = this.validateSubmission(submission);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Check for duplicate name/version
      const { data: existing } = await supabase
        .from('published_models')
        .select('id, name, version')
        .eq('name', submission.name)
        .eq('version', submission.version || '1.0.0')
        .single();

      if (existing) {
        return {
          success: false,
          error: 'A GPT with this name and version already exists'
        };
      }

      // Insert the GPT
      const { data: newGPT, error: insertError } = await supabase
        .from('published_models')
        .insert({
          name: submission.name,
          version: submission.version || '1.0.0',
          description: submission.description,
          category: submission.category,
          tags: submission.tags,
          license_type: submission.licenseType,
          license_text: submission.licenseText,
          documentation_url: submission.documentationUrl,
          repository_url: submission.repositoryUrl,
          system_prompt: submission.systemPrompt,
          default_temperature: submission.defaultConfig.temperature,
          default_top_p: submission.defaultConfig.topP,
          default_max_tokens: submission.defaultConfig.maxTokens,
          knowledge_context: submission.knowledgeContext,
          knowledge_files: submission.knowledgeFiles || [],
          publisher_name: submission.publisherName,
          publisher_email: submission.publisherEmail,
          is_public: submission.isPublic,
          validation_status: 'pending'
        })
        .select()
        .single();

      if (insertError) {
        console.error('Database insert error:', insertError);
        return {
          success: false,
          error: 'Failed to save GPT to database'
        };
      }

      // Create sample prompts if provided
      if (submission.samplePrompts && submission.samplePrompts.length > 0) {
        const sampleInserts = submission.samplePrompts
          .filter(prompt => prompt.trim())
          .map((prompt, index) => ({
            model_id: newGPT.id,
            sample_type: 'prompt_template',
            title: `Sample Prompt ${index + 1}`,
            description: 'User-provided sample prompt',
            input_data: { prompt },
            tags: ['sample', 'user-provided']
          }));

        if (sampleInserts.length > 0) {
          await supabase
            .from('model_samples')
            .insert(sampleInserts);
        }
      }

      // Trigger automated validation
      await this.triggerValidation(newGPT.id);

      return {
        success: true,
        gpt: newGPT
      };
    } catch (error) {
      console.error('Error submitting GPT:', error);
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  }

  /**
   * Search for published GPTs
   */
  static async searchGPTs(params: {
    query?: string;
    category?: string;
    tags?: string[];
    sortBy?: string;
    sortOrder?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{
    success: boolean;
    gpts?: PublishedGPT[];
    total?: number;
    error?: string;
  }> {
    try {
      let query = supabase
        .from('published_models')
        .select('*', { count: 'exact' })
        .eq('is_public', true)
        .eq('validation_status', 'approved');

      // Apply filters
      if (params.category) {
        query = query.eq('category', params.category);
      }

      if (params.tags && params.tags.length > 0) {
        query = query.overlaps('tags', params.tags);
      }

      if (params.query) {
        query = query.or(`name.ilike.%${params.query}%,description.ilike.%${params.query}%`);
      }

      // Apply sorting
      const sortBy = params.sortBy || 'created_at';
      const ascending = params.sortOrder === 'asc';
      query = query.order(sortBy, { ascending });

      // Apply pagination
      const limit = params.limit || 20;
      const offset = params.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data: gpts, error, count } = await query;

      if (error) {
        console.error('Search error:', error);
        return {
          success: false,
          error: 'Failed to search GPTs'
        };
      }

      return {
        success: true,
        gpts: gpts || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Error searching GPTs:', error);
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  }

  /**
   * Get a specific GPT by ID
   */
  static async getGPT(id: string): Promise<{
    success: boolean;
    gpt?: PublishedGPT;
    error?: string;
  }> {
    try {
      const { data: gpt, error } = await supabase
        .from('published_models')
        .select('*')
        .eq('id', id)
        .eq('is_public', true)
        .single();

      if (error || !gpt) {
        return {
          success: false,
          error: 'GPT not found'
        };
      }

      return {
        success: true,
        gpt
      };
    } catch (error) {
      console.error('Error fetching GPT:', error);
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  }

  /**
   * Log a GPT interaction/download
   */
  static async logInteraction(gptId: string, interactionType: string = 'chat'): Promise<void> {
    try {
      await supabase
        .from('model_download_logs')
        .insert({
          model_id: gptId,
          download_type: interactionType,
          user_agent: navigator.userAgent,
          downloaded_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging interaction:', error);
    }
  }

  /**
   * Get featured GPTs
   */
  static async getFeaturedGPTs(limit: number = 6): Promise<{
    success: boolean;
    gpts?: PublishedGPT[];
    error?: string;
  }> {
    try {
      const { data: gpts, error } = await supabase
        .from('published_models')
        .select('*')
        .eq('is_public', true)
        .eq('validation_status', 'approved')
        .eq('is_featured', true)
        .order('rating_average', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching featured GPTs:', error);
        return {
          success: false,
          error: 'Failed to fetch featured GPTs'
        };
      }

      return {
        success: true,
        gpts: gpts || []
      };
    } catch (error) {
      console.error('Error fetching featured GPTs:', error);
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  }

  /**
   * Get GPT statistics
   */
  static async getStats(): Promise<{
    success: boolean;
    stats?: {
      totalGPTs: number;
      totalDownloads: number;
      totalUsers: number;
    };
    error?: string;
  }> {
    try {
      const [gptCount, downloadCount] = await Promise.all([
        supabase
          .from('published_models')
          .select('*', { count: 'exact', head: true })
          .eq('is_public', true)
          .eq('validation_status', 'approved'),
        supabase
          .from('model_download_logs')
          .select('*', { count: 'exact', head: true })
      ]);

      return {
        success: true,
        stats: {
          totalGPTs: gptCount.count || 0,
          totalDownloads: downloadCount.count || 0,
          totalUsers: 250 // Mock user count for now
        }
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        success: false,
        error: 'Failed to fetch statistics'
      };
    }
  }

  /**
   * Validate GPT submission
   */
  private static validateSubmission(submission: GPTSubmission): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Required fields
    if (!submission.name || submission.name.trim().length < 3) {
      errors.push('GPT name must be at least 3 characters long');
    }

    if (!submission.description || submission.description.trim().length < 50) {
      errors.push('Description must be at least 50 characters long');
    }

    if (!submission.category || submission.category.trim().length === 0) {
      errors.push('Category is required');
    }

    if (!submission.systemPrompt || submission.systemPrompt.trim().length < 20) {
      errors.push('System prompt must be at least 20 characters long');
    }

    if (!submission.licenseType || submission.licenseType.trim().length === 0) {
      errors.push('License type is required');
    }

    // Configuration validation
    if (!submission.defaultConfig) {
      errors.push('Default configuration is required');
    } else {
      if (submission.defaultConfig.temperature < 0 || submission.defaultConfig.temperature > 1) {
        errors.push('Temperature must be between 0 and 1');
      }

      if (submission.defaultConfig.topP < 0 || submission.defaultConfig.topP > 1) {
        errors.push('Top-p must be between 0 and 1');
      }

      if (submission.defaultConfig.maxTokens < 1 || submission.defaultConfig.maxTokens > 4096) {
        errors.push('Max tokens must be between 1 and 4096');
      }
    }

    // Tags validation
    if (submission.tags && submission.tags.length > 10) {
      errors.push('Maximum 10 tags allowed');
    }

    // Knowledge context validation
    if (submission.knowledgeContext && submission.knowledgeContext.length > 50000) {
      errors.push('Knowledge context must be less than 50,000 characters');
    }

    // File validation
    if (submission.knowledgeFiles && submission.knowledgeFiles.length > 10) {
      errors.push('Maximum 10 knowledge files allowed');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Trigger automated validation for a GPT
   */
  private static async triggerValidation(gptId: string): Promise<void> {
    try {
      // Insert initial validation record
      await supabase
        .from('model_validations')
        .insert({
          model_id: gptId,
          validation_type: 'automated',
          status: 'pending',
          validator_name: 'AI Validation System',
          validation_started_at: new Date().toISOString()
        });

      // Update GPT status to validating
      await supabase
        .from('published_models')
        .update({ validation_status: 'validating' })
        .eq('id', gptId);

      // In a real implementation, this would trigger an async validation process
      console.log(`Validation triggered for GPT ${gptId}`);
    } catch (error) {
      console.error('Failed to trigger validation:', error);
    }
  }
}