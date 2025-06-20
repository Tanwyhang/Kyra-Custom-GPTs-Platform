import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logging
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key exists:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables');
}

// Test URL validity
try {
  new URL(supabaseUrl);
  console.log('Supabase URL is valid');
} catch (error) {
  console.error('Invalid Supabase URL:', error);
  throw new Error(`Invalid Supabase URL: ${supabaseUrl}`);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
});

// Test database connection
supabase.from('models').select('count', { count: 'exact', head: true })
  .then(({ error, count })  => {
    if (error) {
      console.error('Database connection test failed:', error);
    } else {
      console.log('Database connection test successful, model count:', count);
    }
  })
  .catch(error => {
    console.error('Database connection test error:', error);
  });

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
          uploader_id: string | null;
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
          uploader_id?: string | null;
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
          uploader_id?: string | null;
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
      model_downloads: {
        Row: {
          id: string;
          model_id: string | null;
          user_id: string | null;
          downloaded_at: string;
        };
        Insert: {
          id?: string;
          model_id?: string | null;
          user_id?: string | null;
          downloaded_at?: string;
        };
        Update: {
          id?: string;
          model_id?: string | null;
          user_id?: string | null;
          downloaded_at?: string;
        };
      };
    };
  };
};