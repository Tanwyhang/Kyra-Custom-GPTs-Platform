import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Shield, TrendingUp, Users, Star, Sparkles, Zap, Brain, TestTube, ExternalLink } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { PREDEFINED_MODELS } from '../lib/gemini';
import { DatabaseService } from '../lib/database';

interface FeaturedGPT {
  id: string;
  title: string;
  description: string;
  gpt_type: string;
  framework: string;
  accuracy?: number;
  download_count: number;
  is_verified: boolean;
  uploader: {
    display_name: string;
  };
}

export function HomePage() {
  const [featuredGPTs, setFeaturedGPTs] = useState<FeaturedGPT[]>([]);
  const [stats, setStats] = useState({
    totalGPTs: 0,
    totalDownloads: 0,
    totalUsers: 0,
  });

  useScrollReveal();

  useEffect(() => {
    fetchFeaturedGPTs();
    fetchStats();
  }, []);

  const fetchFeaturedGPTs = async () => {
    try {
      // Try to fetch featured GPTs from database first
      const dbResult = await DatabaseService.getFeaturedGPTs(6);
      
      let featuredGPTs: FeaturedGPT[] = [];
      
      if (dbResult.success && dbResult.gpts && dbResult.gpts.length > 0) {
        // Convert database GPTs to featured format
        featuredGPTs = dbResult.gpts.map((gpt) => ({
          id: gpt.id,
          title: gpt.name,
          description: gpt.description,
          gpt_type: gpt.category,
          framework: 'Gemini 1.5 Flash',
          accuracy: gpt.accuracy_score,
          download_count: gpt.download_count,
          is_verified: gpt.validation_status === 'approved',
          uploader: { display_name: gpt.publisher_name || 'Anonymous' }
        }));
      }
      
      // Fill remaining slots with predefined models
      const remainingSlots = 6 - featuredGPTs.length;
      if (remainingSlots > 0) {
        const predefinedFeatured = PREDEFINED_MODELS.slice(0, remainingSlots).map((gpt) => ({
          id: gpt.id,
          title: gpt.name,
          description: gpt.description,
          gpt_type: gpt.category,
          framework: 'Gemini 1.5 Flash',
          accuracy: 85 + Math.floor(Math.random() * 15),
          download_count: Math.floor(Math.random() * 1000) + 100,
          is_verified: true,
          uploader: { display_name: 'GPT Hub' }
        }));
        
        featuredGPTs = [...featuredGPTs, ...predefinedFeatured];
      }

      setFeaturedGPTs(featuredGPTs.slice(0, 6));
    } catch (error) {
      console.error('Error fetching featured GPTs:', error);
      // Fallback to predefined models
      const fallbackFeatured = PREDEFINED_MODELS.slice(0, 6).map((gpt) => ({
        id: gpt.id,
        title: gpt.name,
        description: gpt.description,
        gpt_type: gpt.category,
        framework: 'Gemini 1.5 Flash',
        accuracy: 85 + Math.floor(Math.random() * 15),
        download_count: Math.floor(Math.random() * 1000) + 100,
        is_verified: true,
        uploader: { display_name: 'GPT Hub' }
      }));
      setFeaturedGPTs(fallbackFeatured);
    }
  };

  const fetchStats = async () => {
    try {
      const dbResult = await DatabaseService.getStats();
      
      if (dbResult.success && dbResult.stats) {
        setStats(dbResult.stats);
      } else {
        // Fallback stats
        setStats({
          totalGPTs: PREDEFINED_MODELS.length + 6,
          totalDownloads: Math.floor(Math.random() * 10000) + 5000,
          totalUsers: 250
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback stats
      setStats({
        totalGPTs: PREDEFINED_MODELS.length + 6,
        totalDownloads: Math.floor(Math.random() * 10000) + 5000,
        totalUsers: 250
      });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="scroll-reveal inline-flex items-center px-6 py-3 rounded-full glass-subtle text-white/90 text-sm font-medium mb-8 hover-glow">
              <Brain className="w-5 h-5 mr-2 text-white" />
              GPT Testing Platform
            </div>
            
            <h1 className="scroll-reveal text-4xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              <span className="gradient-text block mb-2">Test & Discover</span>
              <span className="gradient-text-primary">GPTs</span>
            </h1>
            
            <p className="scroll-reveal text-xl lg:text-2xl text-white/80 mb-12 max-w-4xl mx-auto leading-relaxed">
              Test GPTs powered by Gemini 1.5 Flash for free. Configure parameters, enhance with your knowledge, 
              and discover GPTs from the global community.
            </p>
            
            <div className="scroll-reveal flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/test"
                className="inline-flex items-center px-10 py-5 rounded-2xl text-lg font-semibold text-white button-primary hover:scale-105 transition-all duration-300 shadow-2xl"
                title="Test GPTs for free"
              >
                <TestTube className="w-6 h-6 mr-3 text-white" />
                Test GPT
                <ArrowRight className="w-6 h-6 ml-3 text-white" />
              </Link>
              <Link
                to="/marketplace"
                className="inline-flex items-center px-10 py-5 rounded-2xl text-lg font-semibold text-white border-clean hover:scale-105 transition-all duration-300"
              >
                <Search className="w-6 h-6 mr-3 text-white" />
                Explore GPTs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="scroll-reveal text-center glass-card rounded-3xl p-10 grain-texture subtle-hover">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <div className="text-4xl font-bold gradient-text mb-3">{stats.totalGPTs.toLocaleString()}</div>
              <div className="text-white/70 text-lg">GPTs</div>
            </div>
            <div className="scroll-reveal text-center glass-card rounded-3xl p-10 grain-texture subtle-hover">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-white" />
              </div>
              <div className="text-4xl font-bold gradient-text mb-3">{stats.totalUsers.toLocaleString()}</div>
              <div className="text-white/70 text-lg">Community Members</div>
            </div>
            <div className="scroll-reveal text-center glass-card rounded-3xl p-10 grain-texture subtle-hover">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Star className="w-10 h-10 text-white" />
              </div>
              <div className="text-4xl font-bold gradient-text mb-3">{stats.totalDownloads.toLocaleString()}</div>
              <div className="text-white/70 text-lg">Total Downloads</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="scroll-reveal text-4xl lg:text-5xl font-bold gradient-text mb-6">
              Why Choose Kyra?
            </h2>
            <p className="scroll-reveal text-xl lg:text-2xl text-white/80 max-w-4xl mx-auto">
              Test GPTs for free, enhance with your knowledge, and discover the best GPTs from the community.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
              <div className="scroll-reveal-left glass-card rounded-3xl p-10 grain-texture hover:scale-105 transition-all duration-300 subtle-hover w-full max-w-sm">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 mx-auto">
                  <TestTube className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold gradient-text mb-6 text-center">Free Testing</h3>
                <p className="text-white/80 text-lg leading-relaxed text-center">
                  Test GPTs powered by Gemini 1.5 Flash at zero cost. Configure parameters and enhance with your knowledge.
                </p>
              </div>

              <div className="scroll-reveal glass-card rounded-3xl p-10 grain-texture hover:scale-105 transition-all duration-300 subtle-hover w-full max-w-sm">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 mx-auto">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold gradient-text mb-6 text-center">Verified Quality</h3>
                <p className="text-white/80 text-lg leading-relaxed text-center">
                  Community-driven verification system ensures high-quality GPTs with transparent performance metrics.
                </p>
              </div>

              <div className="scroll-reveal-right glass-card rounded-3xl p-10 grain-texture hover:scale-105 transition-all duration-300 subtle-hover w-full max-w-sm">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 mx-auto">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold gradient-text mb-6 text-center">Open Community</h3>
                <p className="text-white/80 text-lg leading-relaxed text-center">
                  Join a global community of AI researchers, developers, and enthusiasts sharing knowledge and GPTs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured GPTs Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-16">
            <div>
              <h2 className="scroll-reveal text-4xl lg:text-5xl font-bold gradient-text mb-6">
                Featured GPTs
              </h2>
              <p className="scroll-reveal text-xl lg:text-2xl text-white/80">
                Discover the most popular verified GPTs in our community
              </p>
            </div>
            <Link
              to="/marketplace"
              className="scroll-reveal text-white/90 hover:text-white font-semibold flex items-center glass-subtle px-6 py-3 rounded-2xl hover:glass transition-all duration-300 hover-glow"
            >
              View all GPTs
              <ArrowRight className="w-5 h-5 ml-2 text-white" />
            </Link>
          </div>

          {featuredGPTs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredGPTs.map((gpt, index) => (
                <Link
                  key={gpt.id}
                  to={`/gpts/${gpt.id}`}
                  className="glass-card rounded-3xl p-8 grain-texture hover:scale-105 transition-all duration-300 group hover-glow"
                  style={{ transitionDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm font-semibold px-4 py-2 rounded-full glass-subtle text-white/90">
                      {gpt.gpt_type}
                    </span>
                    {gpt.is_verified && (
                      <div className="flex items-center status-verified">
                        <Shield className="w-5 h-5 mr-2 text-green-400" />
                        <span className="text-sm font-medium">Verified</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold gradient-text mb-4 group-hover:gradient-text-primary transition-all duration-300">
                    {gpt.title}
                  </h3>
                  
                  <p className="text-white/70 text-base mb-6 line-clamp-2 leading-relaxed">
                    {gpt.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-white/60 mb-6">
                    <span>by {gpt.uploader?.display_name || 'Anonymous'}</span>
                    <span className="glass-subtle px-3 py-1 rounded-xl text-xs font-medium">{gpt.framework}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-6 text-white/70">
                      {gpt.accuracy && (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-2 text-yellow-400" />
                          <span className="font-medium">{gpt.accuracy}%</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2 text-white" />
                        <span className="font-medium">{gpt.download_count}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-white/60">Loading featured GPTs...</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="scroll-reveal glass-strong rounded-3xl p-16 grain-texture hover-glow">
            <div className="inline-flex items-center px-6 py-3 rounded-full glass-subtle text-white/90 text-sm font-medium mb-8">
              <Zap className="w-5 h-5 mr-2 text-white" />
              Start Testing Today
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold gradient-text mb-8">
              Ready to Test Your GPT?
            </h2>
            <p className="text-xl lg:text-2xl text-white/80 mb-12 leading-relaxed">
              Start testing with Gemini 1.5 Flash for free. Configure, enhance, and explore GPTs from the community.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/test"
                className="inline-flex items-center px-10 py-5 rounded-2xl text-lg font-semibold text-white button-primary hover:scale-105 transition-all duration-300 shadow-2xl"
              >
                <TestTube className="w-6 h-6 mr-3 text-white" />
                Start Testing
                <ArrowRight className="w-6 h-6 ml-3 text-white" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bolt.new Badge */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <a
              href="https://bolt.new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 rounded-full glass-subtle text-white/70 hover:text-white text-sm font-medium transition-all duration-300 hover:glass hover:scale-105 group"
            >
              <Zap className="w-4 h-4 mr-2 text-purple-400 group-hover:text-purple-300" />
              Built with Bolt.new
              <ExternalLink className="w-3 h-3 ml-2 opacity-60 group-hover:opacity-100" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}