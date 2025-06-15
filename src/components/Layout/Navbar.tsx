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
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg group-hover:shadow-lg transition-all duration-200">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Model Hub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/marketplace"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/marketplace')
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Marketplace</span>
            </Link>

            {user && (
              <Link
                to="/upload"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/upload')
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Upload Model</span>
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'text-purple-600 bg-purple-50'
                      : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/signin"
                  className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:shadow-lg transition-all duration-200 hover:scale-105"
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
              className="text-gray-700 hover:text-purple-600 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              <Link
                to="/marketplace"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50"
              >
                <Search className="w-4 h-4" />
                <span>Marketplace</span>
              </Link>

              {user ? (
                <>
                  <Link
                    to="/upload"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Model</span>
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50"
                  >
                    <User className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-3 pt-3 border-t border-gray-200">
                  <Link
                    to="/signin"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-sm font-medium text-gray-700 hover:text-purple-600 px-3 py-2"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium text-center"
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