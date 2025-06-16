import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting initial session:', error);
      }
      console.log('Initial session:', session?.user?.email || 'No user');
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email || 'No user');
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle user profile creation for OAuth sign-ins
        if (event === 'SIGNED_IN' && session?.user) {
          await ensureUserProfile(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const ensureUserProfile = async (user: User) => {
    try {
      console.log('Ensuring user profile for:', user.email);
      
      // Check if user profile exists
      const { data: existingUserArray, error: selectError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id);

      if (selectError) {
        console.error('Error checking user profile:', selectError);
        return;
      }

      // Check if user profile doesn't exist
      if (!existingUserArray || existingUserArray.length === 0) {
        console.log('Creating user profile...');
        
        // Sanitize display name to prevent encoding issues
        const sanitizeText = (text: string | null | undefined): string | null => {
          if (!text) return null;
          // Remove any non-printable characters and ensure it's valid UTF-8
          return text.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim() || null;
        };

        // Create user profile if it doesn't exist
        const { error } = await supabase.from('users').insert({
          id: user.id,
          email: user.email!,
          display_name: sanitizeText(user.user_metadata?.display_name || user.user_metadata?.full_name),
          avatar_url: user.user_metadata?.avatar_url || null,
        });

        if (error) {
          console.error('Error creating user profile:', error);
        } else {
          console.log('User profile created successfully');
        }
      } else {
        console.log('User profile already exists');
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with email:', email);
      
      // Sanitize input to prevent encoding issues
      const sanitizedEmail = email.trim().toLowerCase();
      const sanitizedPassword = password.trim();

      if (!sanitizedEmail || !sanitizedPassword) {
        return { error: { message: 'Email and password are required' } };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitizedEmail)) {
        return { error: { message: 'Please enter a valid email address' } };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: sanitizedPassword,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }

      console.log('Sign in successful for:', data.user?.email);

      // Ensure user profile exists after successful sign in
      if (data.user) {
        await ensureUserProfile(data.user);
      }

      return { error: null };
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      return { error: { message: 'An unexpected error occurred. Please try again.' } };
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Attempting Google sign in...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Google sign in error:', error);
        return { data, error };
      }

      console.log('Google sign in initiated');
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected Google sign in error:', error);
      return { data: null, error: { message: 'Failed to initiate Google sign in' } };
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      console.log('Attempting to sign up with email:', email);
      
      // Sanitize input to prevent encoding issues
      const sanitizedEmail = email.trim().toLowerCase();
      const sanitizedPassword = password.trim();
      const sanitizedDisplayName = displayName?.trim().replace(/[\x00-\x1F\x7F-\x9F]/g, '') || null;

      if (!sanitizedEmail || !sanitizedPassword) {
        return { data: null, error: { message: 'Email and password are required' } };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitizedEmail)) {
        return { data: null, error: { message: 'Please enter a valid email address' } };
      }

      // Validate password strength
      if (sanitizedPassword.length < 6) {
        return { data: null, error: { message: 'Password must be at least 6 characters long' } };
      }

      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: sanitizedPassword,
        options: {
          data: {
            display_name: sanitizedDisplayName,
          },
        },
      });

      if (error) {
        console.error('Sign up error:', error);
        return { data, error };
      }

      console.log('Sign up successful for:', data.user?.email);

      if (data.user && !error) {
        // Create user profile
        console.log('Creating user profile after signup...');
        
        const { error: profileError } = await supabase.from('users').insert({
          id: data.user.id,
          email: data.user.email!,
          display_name: sanitizedDisplayName,
        });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          // Don't return the profile error as the main error since auth was successful
        } else {
          console.log('User profile created successfully after signup');
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error('Unexpected sign up error:', error);
      return { data: null, error: { message: 'An unexpected error occurred. Please try again.' } };
    }
  };

  const signOut = async () => {
    try {
      console.log('Attempting to sign out...');
      
      // Clear user state immediately for better UX
      setUser(null);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        // Restore user state if sign out failed
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        return { error };
      }
      
      console.log('Sign out successful');
      
      // Redirect to home page after successful sign out
      window.location.href = '/';
      
      return { error: null };
    } catch (error) {
      console.error('Unexpected sign out error:', error);
      // Restore user state if sign out failed
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      return { error };
    }
  };

  return {
    user,
    loading,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
  };
}