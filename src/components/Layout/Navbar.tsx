import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, Search, TestTube, Menu, X } from 'lucide-react';

export function Navbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="glass-dark grain-texture sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="icon-bg-primary p-2 rounded-2xl group-hover:shadow-lg transition-all duration-300 glow-effect">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text-primary">
              Kyra
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              to="/test"
              className={`flex items-center space-x-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                isActive('/test')
                  ? 'glass-strong text-white glow-effect'
                  : 'glass-subtle text-white/90 hover:text-white hover:glass'
              }`}
            >
              <TestTube className="w-4 h-4" />
              <span>Test GPT</span>
            </Link>

            <Link
              to="/marketplace"
              className={`flex items-center space-x-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                isActive('/marketplace')
                  ? 'glass-strong text-white glow-effect'
                  : 'glass-subtle text-white/90 hover:text-white hover:glass'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Marketplace</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white/90 hover:text-white transition-colors p-2 rounded-xl glass-subtle"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col space-y-3">
              <Link
                to="/test"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold text-white/90 hover:text-white glass-subtle hover:glass transition-all duration-300"
              >
                <TestTube className="w-4 h-4" />
                <span>Test GPT</span>
              </Link>

              <Link
                to="/marketplace"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold text-white/90 hover:text-white glass-subtle hover:glass transition-all duration-300"
              >
                <Search className="w-4 h-4" />
                <span>Marketplace</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}