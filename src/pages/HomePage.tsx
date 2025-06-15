import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Upload, Search, Shield, TrendingUp, Users, Star } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              Discover & Share
              <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI Models
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The decentralized platform for machine learning models. Upload, discover, and collaborate 
              with the global AI community. Transparent, open, and community-driven.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/marketplace"
                className="inline-flex items-center px-8 py-4 rounded-xl text-lg font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Search className="w-5 h-5 mr-2" />
                Explore Models
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                to="/upload"
                className="inline-flex items-center px-8 py-4 rounded-xl text-lg font-medium text-purple-600 bg-white border-2 border-purple-600 hover:bg-purple-50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload Model
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stats.totalModels.toLocaleString()}</div>
              <div className="text-gray-600">AI Models</div>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-teal-600 to-cyan-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stats.totalUsers.toLocaleString()}</div>
              <div className="text-gray-600">Community Members</div>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-orange-600 to-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stats.totalDownloads.toLocaleString()}</div>
              <div className="text-gray-600">Total Downloads</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose AI Model Hub?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built for the community, by the community. Transparent, secure, and accessible to all.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Verified Quality</h3>
              <p className="text-gray-600">
                Community-driven verification system ensures high-quality models with transparent performance metrics.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
              <div className="bg-gradient-to-r from-teal-600 to-cyan-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Search className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Easy Discovery</h3>
              <p className="text-gray-600">
                Advanced search and filtering capabilities help you find the perfect model for your specific needs.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
              <div className="bg-gradient-to-r from-orange-600 to-red-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Open Community</h3>
              <p className="text-gray-600">
                Join a global community of AI researchers, developers, and enthusiasts sharing knowledge and models.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Models Section */}
      {featuredModels.length > 0 && (
        <section className="py-20 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Featured Models
                </h2>
                <p className="text-xl text-gray-600">
                  Discover the most popular verified models in our community
                </p>
              </div>
              <Link
                to="/marketplace"
                className="text-purple-600 hover:text-purple-700 font-medium flex items-center"
              >
                View all models
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredModels.map((model) => (
                <Link
                  key={model.id}
                  to={`/models/${model.id}`}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                      {model.model_type}
                    </span>
                    {model.is_verified && (
                      <div className="flex items-center text-green-600">
                        <Shield className="w-4 h-4 mr-1" />
                        <span className="text-xs">Verified</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                    {model.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {model.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>by {model.uploader?.display_name || 'Anonymous'}</span>
                    <div className="flex items-center space-x-4">
                      {model.accuracy && (
                        <span>{model.accuracy}% acc.</span>
                      )}
                      <span>{model.download_count} downloads</span>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Join the AI Revolution?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Start sharing your models or discover the perfect AI solution for your project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center px-8 py-4 rounded-xl text-lg font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}