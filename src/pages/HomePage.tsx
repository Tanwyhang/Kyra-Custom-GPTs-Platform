import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Upload, Search, Shield, TrendingUp, Users, Star, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FeaturedModel {
  id: string;
  title: string;
  description: string;
  model_type: string;
  framework: string;
  accuracy: number;
  download_count: number;
  is_verified: boolean;
  uploader: {
    display_name: string;
  };
}

export function HomePage() {
  const [featuredModels, setFeaturedModels] = useState<FeaturedModel[]>([]);
  const [stats, setStats] = useState({
    totalModels: 0,
    totalDownloads: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    fetchFeaturedModels();
    fetchStats();
  }, []);

  const fetchFeaturedModels = async () => {
    const { data } = await supabase
      .from('models')
      .select(`
        *,
        uploader:users(display_name)
      `)
      .eq('is_verified', true)
      .order('download_count', { ascending: false })
      .limit(6);

    if (data) {
      setFeaturedModels(data);
    }
  };

  const fetchStats = async () => {
    const [modelsResult, usersResult] = await Promise.all([
      supabase.from('models').select('id, download_count').eq('is_verified', true),
      supabase.from('users').select('id'),
    ]);

    const totalModels = modelsResult.data?.length || 0;
    const totalDownloads = modelsResult.data?.reduce((sum, model) => sum + model.download_count, 0) || 0;
    const totalUsers = usersResult.data?.length || 0;

    setStats({ totalModels, totalDownloads, totalUsers });
  };

  return (
    <div className="min-h-screen">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full blur-xl floating-element"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-pink-400/20 to-purple-400/20 rounded-full blur-xl floating-element"></div>
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-xl floating-element"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-xl floating-element"></div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full glass-subtle text-white/80 text-sm font-medium mb-6 floating-element">
              <Sparkles className="w-4 h-4 mr-2" />
              Decentralized AI Model Platform
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-bold mb-6">
              <span className="gradient-text">Discover & Share</span>
              <br />
              <span className="gradient-text-primary">AI Models</span>
            </h1>
            
            <p className="text-xl text-white/70 mb-8 max-w-3xl mx-auto leading-relaxed">
              The decentralized platform for machine learning models. Upload, discover, and collaborate 
              with the global AI community. Transparent, open, and community-driven.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/marketplace"
                className="inline-flex items-center px-8 py-4 rounded-2xl text-lg font-medium text-white glass-button hover:scale-105 transition-all duration-300 glow-effect"
              >
                <Search className="w-5 h-5 mr-2" />
                Explore Models
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                to="/upload"
                className="inline-flex items-center px-8 py-4 rounded-2xl text-lg font-medium text-white glass-strong hover:scale-105 transition-all duration-300"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload Model
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center glass-card rounded-2xl p-8 grain-texture floating-element">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 glow-effect">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold gradient-text mb-2">{stats.totalModels.toLocaleString()}</div>
              <div className="text-white/60">AI Models</div>
            </div>
            <div className="text-center glass-card rounded-2xl p-8 grain-texture floating-element">
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 glow-effect">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold gradient-text mb-2">{stats.totalUsers.toLocaleString()}</div>
              <div className="text-white/60">Community Members</div>
            </div>
            <div className="text-center glass-card rounded-2xl p-8 grain-texture floating-element">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 glow-effect">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold gradient-text mb-2">{stats.totalDownloads.toLocaleString()}</div>
              <div className="text-white/60">Total Downloads</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold gradient-text mb-4">
              Why Choose AI Model Hub?
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Built for the community, by the community. Transparent, secure, and accessible to all.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card rounded-2xl p-8 grain-texture hover:scale-105 transition-all duration-300 floating-element">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 w-12 h-12 rounded-xl flex items-center justify-center mb-6 glow-effect">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold gradient-text mb-4">Verified Quality</h3>
              <p className="text-white/70">
                Community-driven verification system ensures high-quality models with transparent performance metrics.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8 grain-texture hover:scale-105 transition-all duration-300 floating-element">
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 w-12 h-12 rounded-xl flex items-center justify-center mb-6 glow-effect">
                <Search className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold gradient-text mb-4">Easy Discovery</h3>
              <p className="text-white/70">
                Advanced search and filtering capabilities help you find the perfect model for your specific needs.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8 grain-texture hover:scale-105 transition-all duration-300 floating-element">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 w-12 h-12 rounded-xl flex items-center justify-center mb-6 glow-effect">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold gradient-text mb-4">Open Community</h3>
              <p className="text-white/70">
                Join a global community of AI researchers, developers, and enthusiasts sharing knowledge and models.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Models Section */}
      {featuredModels.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl font-bold gradient-text mb-4">
                  Featured Models
                </h2>
                <p className="text-xl text-white/70">
                  Discover the most popular verified models in our community
                </p>
              </div>
              <Link
                to="/marketplace"
                className="text-white/80 hover:text-white font-medium flex items-center glass-subtle px-4 py-2 rounded-xl hover:glass transition-all duration-300"
              >
                View all models
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredModels.map((model, index) => (
                <Link
                  key={model.id}
                  to={`/models/${model.id}`}
                  className="glass-card rounded-2xl p-6 grain-texture hover:scale-105 transition-all duration-300 group floating-element"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-medium px-3 py-1 rounded-full glass-subtle text-white/80">
                      {model.model_type}
                    </span>
                    {model.is_verified && (
                      <div className="flex items-center text-green-400">
                        <Shield className="w-4 h-4 mr-1" />
                        <span className="text-xs">Verified</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-semibold gradient-text mb-2 group-hover:gradient-text-primary transition-all duration-300">
                    {model.title}
                  </h3>
                  
                  <p className="text-white/60 text-sm mb-4 line-clamp-2">
                    {model.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-white/50 mb-4">
                    <span>by {model.uploader?.display_name || 'Anonymous'}</span>
                    <span className="glass-subtle px-2 py-1 rounded-lg text-xs">{model.framework}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4 text-white/60">
                      {model.accuracy && (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1 text-yellow-400" />
                          <span>{model.accuracy}%</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span>{model.download_count}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-strong rounded-3xl p-12 grain-texture">
            <h2 className="text-3xl font-bold gradient-text mb-6">
              Ready to Join the AI Revolution?
            </h2>
            <p className="text-xl text-white/70 mb-8">
              Start sharing your models or discover the perfect AI solution for your project.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center px-8 py-4 rounded-2xl text-lg font-medium text-white glass-button hover:scale-105 transition-all duration-300 glow-effect"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}