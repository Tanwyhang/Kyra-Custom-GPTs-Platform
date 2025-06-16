import React from 'react';
import { Brain, Github, Twitter, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="glass-dark grain-texture border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="icon-bg-primary p-3 rounded-2xl glow-effect">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text-primary">AI GPT Hub</span>
            </div>
            <p className="text-white/70 text-base leading-relaxed">
              The decentralized platform for sharing and discovering AI GPTs.
              Built by the community, for the community.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-bold mb-6 text-white text-lg">Platform</h3>
            <ul className="space-y-3 text-base text-white/70">
              <li><a href="/marketplace" className="hover:text-white transition-colors hover:gradient-text-accent">Marketplace</a></li>
              <li><a href="/upload" className="hover:text-white transition-colors hover:gradient-text-accent">Upload GPT</a></li>
              <li><a href="/dashboard" className="hover:text-white transition-colors hover:gradient-text-accent">Dashboard</a></li>
              <li><a href="/docs" className="hover:text-white transition-colors hover:gradient-text-accent">Documentation</a></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-bold mb-6 text-white text-lg">Community</h3>
            <ul className="space-y-3 text-base text-white/70">
              <li><a href="#" className="hover:text-white transition-colors hover:gradient-text-accent">Guidelines</a></li>
              <li><a href="#" className="hover:text-white transition-colors hover:gradient-text-accent">Support</a></li>
              <li><a href="#" className="hover:text-white transition-colors hover:gradient-text-accent">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition-colors hover:gradient-text-accent">Blog</a></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-bold mb-6 text-white text-lg">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-white/70 hover:text-white transition-colors p-3 glass-subtle rounded-2xl hover:glass hover-glow">
                <Github className="w-6 h-6" />
              </a>
              <a href="#" className="text-white/70 hover:text-white transition-colors p-3 glass-subtle rounded-2xl hover:glass hover-glow">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="text-white/70 hover:text-white transition-colors p-3 glass-subtle rounded-2xl hover:glass hover-glow">
                <Mail className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-16 pt-10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/70 text-base">
            © 2025 AI GPT Hub. All rights reserved.
          </p>
          <div className="flex space-x-8 mt-6 md:mt-0">
            <a href="#" className="text-white/70 hover:text-white text-base transition-colors hover:gradient-text-accent">Privacy Policy</a>
            <a href="#" className="text-white/70 hover:text-white text-base transition-colors hover:gradient-text-accent">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}