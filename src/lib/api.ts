/**
 * API client for model publishing and management
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface ModelSubmission {
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

interface SearchParams {
  query?: string;
  category?: string;
  tags?: string[];
  minRating?: number;
  sortBy?: 'created_at' | 'download_count' | 'rating_average' | 'name';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  featured?: boolean;
}

interface DownloadRequest {
  modelId: string;
  downloadType: 'full_model' | 'config_only' | 'samples_only';
  intendedUse?: string;
}

class ModelAPI {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    this.baseUrl = `${SUPABASE_URL}/functions/v1`;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    };
  }

  /**
   * Submit a new model for publication
   */
  async submitModel(submission: ModelSubmission): Promise<{
    success: boolean;
    model?: {
      id: string;
      name: string;
      version: string;
      status: string;
    };
    message?: string;
    warnings?: string[];
    error?: string;
    details?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/model-submission`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(submission),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit model');
      }

      return data;
    } catch (error) {
      console.error('Model submission error:', error);
      throw error;
    }
  }

  /**
   * Search for published models
   */
  async searchModels(params: SearchParams = {}): Promise<{
    models: any[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
    filters: SearchParams;
  }> {
    try {
      const searchParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            searchParams.append(key, value.join(','));
          } else {
            searchParams.append(key, value.toString());
          }
        }
      });

      const response = await fetch(`${this.baseUrl}/model-search?${searchParams}`, {
        method: 'GET',
        headers: this.headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search models');
      }

      return data;
    } catch (error) {
      console.error('Model search error:', error);
      throw error;
    }
  }

  /**
   * Get model validation status
   */
  async getValidationStatus(modelId: string): Promise<{
    validations: any[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/model-validation?modelId=${modelId}`, {
        method: 'GET',
        headers: this.headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch validation status');
      }

      return data;
    } catch (error) {
      console.error('Validation status error:', error);
      throw error;
    }
  }

  /**
   * Trigger model validation
   */
  async triggerValidation(modelId: string, validationType: 'automated' | 'manual' | 'performance' | 'safety'): Promise<{
    success: boolean;
    validation: any;
    modelStatus: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/model-validation`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          modelId,
          validationType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to trigger validation');
      }

      return data;
    } catch (error) {
      console.error('Validation trigger error:', error);
      throw error;
    }
  }

  /**
   * Download a model
   */
  async downloadModel(request: DownloadRequest): Promise<{
    success: boolean;
    downloadType: string;
    data: any;
    downloadedAt: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/model-download`, {
        method: 'POST',
        headers: {
          ...this.headers,
          'User-Agent': navigator.userAgent,
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to download model');
      }

      return data;
    } catch (error) {
      console.error('Model download error:', error);
      throw error;
    }
  }

  /**
   * Get download statistics for a model
   */
  async getDownloadStats(modelId: string): Promise<{
    statistics: {
      total: number;
      byType: Record<string, number>;
      recentDownloads: any[];
    };
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/model-download?modelId=${modelId}`, {
        method: 'GET',
        headers: this.headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch download statistics');
      }

      return data;
    } catch (error) {
      console.error('Download stats error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const modelAPI = new ModelAPI();

// Export types
export type {
  ModelSubmission,
  SearchParams,
  DownloadRequest,
};