import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const { signUp, signInWithGoogle } = useAuthContext();
  const navigate = useNavigate();
  useScrollReveal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedDisplayName = displayName.trim();

    if (!trimmedEmail || !trimmedPassword || !trimmedDisplayName) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // Password validation
    if (trimmedPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    // Display name validation
    if (trimmedDisplayName.length < 2) {
      setError('Display name must be at least 2 characters long');
      setLoading(false);
      return;
    }

    if (trimmedDisplayName.length > 50) {
      setError('Display name must be less than 50 characters');
      setLoading(false);
      return;
    }

    try {
      const { error } = await signUp(trimmedEmail, trimmedPassword, trimmedDisplayName);

      if (error) {
        if (error.message?.includes('User already registered')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else if (error.message?.includes('Password should be at least')) {
          setError('Password must be at least 6 characters long');
        } else {
          setError(error.message || 'An error occurred during sign up. Please try again.');
        }
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setError('');

    try {
      const { error } = await signInWithGoogle();

      if (error) {
        setError('Failed to sign up with Google. Please try again or use email/password.');
        setGoogleLoading(false);
      }
      // Note: If successful, the user will be redirected by Supabase
    } catch (error) {
      console.error('Google sign up error:', error);
      setError('Failed to sign up with Google. Please try again.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 relative">
        <div className="text-center">
          <div className="scroll-reveal inline-flex items-center px-6 py-3 rounded-full glass-subtle text-white/90 text-sm font-semibold mb-8 hover-glow">
            <Sparkles className="w-5 h-5 mr-2" />
            Join the Community
          </div>
          <h2 className="scroll-reveal text-4xl font-bold gradient-text-primary mb-4">
            Create Account
          </h2>
          <p className="scroll-reveal text-base text-white/70">
            Already have an account?{' '}
            <Link to="/signin" className="font-semibold gradient-text-accent hover:text-white transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <div className="scroll-reveal-scale mt-8 space-y-6 glass-strong p-10 rounded-3xl grain-texture hover-glow">
          {error && (
            <div className="glass-subtle border border-red-400/30 text-red-300 px-6 py-4 rounded-2xl text-sm font-medium">
              {error}
            </div>
          )}

          {/* Google Sign Up Button */}
          <button
            onClick={handleGoogleSignUp}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center px-6 py-4 rounded-2xl text-base font-semibold glass-subtle hover:glass transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 hover:border-white/20"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleLoading ? 'Signing up with Google...' : 'Continue with Google'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 glass-subtle text-white/60 rounded-full">Or create account with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="displayName" className="block text-sm font-semibold text-white/90 mb-3">
                  Display Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-white/50" />
                  </div>
                  <input
                    id="displayName"
                    name="displayName"
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="glass-input appearance-none relative block w-full pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base transition-all duration-300"
                    placeholder="Enter your display name"
                    minLength={2}
                    maxLength={50}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-white/90 mb-3">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-white/50" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass-input appearance-none relative block w-full pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base transition-all duration-300"
                    placeholder="Enter your email"
                    maxLength={254} // Standard email max length
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-white/90 mb-3">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-white/50" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glass-input appearance-none relative block w-full pl-12 pr-12 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base transition-all duration-300"
                    placeholder="Enter your password (min. 6 characters)"
                    maxLength={128} // Reasonable password max length
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-white/50 hover:text-white/70 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-white/50 hover:text-white/70 transition-colors" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="group relative w-full flex justify-center py-4 px-6 text-base font-semibold rounded-2xl text-white button-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
              >
                {loading ? 'Creating account...' : 'Create account with Email'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}