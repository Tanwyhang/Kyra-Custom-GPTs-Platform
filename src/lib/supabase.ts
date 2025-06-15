import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are properly configured
if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl === 'your_supabase_project_url' || 
    supabaseAnonKey === 'your_supabase_anon_key') {
  console.error('Supabase configuration missing. Please set up your Supabase credentials in the .env file.');
  throw new Error('Supabase is not configured. Please click "Connect to Supabase" in the top right to set up your database connection.');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('Invalid Supabase URL format:', supabaseUrl);
  throw new Error('Invalid Supabase URL format. Please check your VITE_SUPABASE_URL in the .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          is_admin: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          is_admin?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          is_admin?: boolean;
          created_at?: string;
        };
      };
      models: {
        Row: {
          id: string;
          uploader_id: string;
          title: string;
          description: string | null;
          model_type: string;
          framework: string;
          tags: string[];
          accuracy: number | null;
          file_url: string | null;
          file_size: number | null;
          is_verified: boolean;
          download_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          uploader_id: string;
          title: string;
          description?: string | null;
          model_type: string;
          framework: string;
          tags?: string[];
          accuracy?: number | null;
          file_url?: string | null;
          file_size?: number | null;
          is_verified?: boolean;
          download_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          uploader_id?: string;
          title?: string;
          description?: string | null;
          model_type?: string;
          framework?: string;
          tags?: string[];
          accuracy?: number | null;
          file_url?: string | null;
          file_size?: number | null;
          is_verified?: boolean;
          download_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};