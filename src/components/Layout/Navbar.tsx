import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, Search, Upload, User, LogOut, Menu, X } from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';

export function Navbar() {
  const { user, signOut } = useAuthContext();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  return (
    <nav className="glass grain-texture sticky top-0 z-50 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group floating-element">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-xl group-hover:shadow-lg transition-all duration-300 glow-effect">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">
              AI Model Hub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              to="/marketplace"
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                isActive('/marketplace')
                  ? 'glass-strong text-white glow-effect'
                  : 'glass-subtle text-white/80 hover:text-white hover:glass'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Marketplace</span>
            </Link>

            {user && (
              <Link
                to="/upload"
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive('/upload')
                    ? 'glass-strong text-white glow-effect'
                    : 'glass-subtle text-white/80 hover:text-white hover:glass'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Upload Model</span>
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive('/dashboard')
                      ? 'glass-strong text-white glow-effect'
                      : 'glass-subtle text-white/80 hover:text-white hover:glass'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium text-white/80 hover:text-red-300 glass-subtle hover:glass transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/signin"
                  className="text-sm font-medium text-white/80 hover:text-white transition-colors px-4 py-2 rounded-xl glass-subtle hover:glass"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="glass-button text-white px-6 py-2 rounded-xl text-sm font-medium hover:scale-105 transition-all duration-300"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white/80 hover:text-white transition-colors p-2 rounded-lg glass-subtle"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <div className="flex flex-col space-y-3">
              <Link
                to="/marketplace"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium text-white/80 hover:text-white glass-subtle hover:glass transition-all duration-300"
              >
                <Search className="w-4 h-4" />
                <span>Marketplace</span>
              </Link>

              {user ? (
                <>
                  <Link
                    to="/upload"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium text-white/80 hover:text-white glass-subtle hover:glass transition-all duration-300"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Model</span>
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium text-white/80 hover:text-white glass-subtle hover:glass transition-all duration-300"
                  >
                    <User className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium text-white/80 hover:text-red-300 glass-subtle hover:glass transition-all duration-300 w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-3 pt-3 border-t border-white/20">
                  <Link
                    to="/signin"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-sm font-medium text-white/80 hover:text-white px-4 py-3 rounded-xl glass-subtle hover:glass transition-all duration-300"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="glass-button text-white px-4 py-3 rounded-xl text-sm font-medium text-center transition-all duration-300"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}