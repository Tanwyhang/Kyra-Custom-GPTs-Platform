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
  const [error, setError] = useState('');

  const { signUp } = useAuthContext();
  const navigate = useNavigate();
  useScrollReveal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await signUp(email, password, displayName);

    if (error) {
      setError(error.message);
    } else {
      navigate('/dashboard');
    }

    setLoading(false);
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

        <form className="scroll-reveal-scale mt-8 space-y-8 glass-strong p-10 rounded-3xl grain-texture hover-glow" onSubmit={handleSubmit}>
          {error && (
            <div className="glass-subtle border border-red-400/30 text-red-300 px-6 py-4 rounded-2xl text-sm font-medium">
              {error}
            </div>
          )}

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
              disabled={loading}
              className="group relative w-full flex justify-center py-4 px-6 text-base font-semibold rounded-2xl text-white button-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}