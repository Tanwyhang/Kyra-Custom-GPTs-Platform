import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Shield, TrendingUp, Users, Star, Sparkles, Zap, Brain, TestTube } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

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

// Featured models for demonstration
const FEATURED_MODELS: FeaturedModel[] = [
  {
    id: '1',
    title: 'Advanced Image Classifier',
    description: 'A state-of-the-art image classification model trained on ImageNet with 95% accuracy.',
    model_type: 'Computer Vision',
    framework: 'TensorFlow',
    accuracy: 95.2,
    download_count: 1250,
    is_verified: true,
    uploader: { display_name: 'AI Researcher' }
  },
  {
    id: '2',
    title: 'Sentiment Analysis BERT',
    description: 'Fine-tuned BERT model for sentiment analysis on social media text.',
    model_type: 'Natural Language Processing',
    framework: 'PyTorch',
    accuracy: 92.8,
    download_count: 890,
    is_verified: true,
    uploader: { display_name: 'NLP Expert' }
  },
  {
    id: '3',
    title: 'Speech Recognition Model',
    description: 'Real-time speech recognition model optimized for mobile devices.',
    model_type: 'Speech',
    framework: 'TensorFlow.js',
    accuracy: 88.5,
    download_count: 567,
    is_verified: false,
    uploader: { display_name: 'Mobile Dev' }
  },
  {
    id: '4',
    title: 'Object Detection YOLO',
    description: 'Fast and accurate object detection model for real-time applications.',
    model_type: 'Computer Vision',
    framework: 'PyTorch',
    accuracy: 89.3,
    download_count: 743,
    is_verified: true,
    uploader: { display_name: 'Vision Expert' }
  },
  {
    id: '5',
    title: 'Text Summarization Model',
    description: 'Transformer-based model for automatic text summarization.',
    model_type: 'Natural Language Processing',
    framework: 'TensorFlow',
    accuracy: 91.7,
    download_count: 456,
    is_verified: true,
    uploader: { display_name: 'NLP Researcher' }
  },
  {
    id: '6',
    title: 'Recommendation Engine',
    description: 'Collaborative filtering model for personalized recommendations.',
    model_type: 'Reinforcement Learning',
    framework: 'Scikit-learn',
    accuracy: 87.2,
    download_count: 321,
    is_verified: false,
    uploader: { display_name: 'ML Engineer' }
  }
];

export function HomePage() {
  const [featuredModels, setFeaturedModels] = useState<FeaturedModel[]>([]);
  const [stats, setStats] = useState({
    totalModels: 0,
    totalDownloads: 0,
    totalUsers: 0,
  });

  useScrollReveal();

  useEffect(() => {
    fetchFeaturedModels();
    fetchStats();
  }, []);

  const fetchFeaturedModels = async () => {
    // Show featured models
    setFeaturedModels(FEATURED_MODELS);
  };

  const fetchStats = async () => {
    const totalModels = FEATURED_MODELS.length;
    const totalDownloads = FEATURED_MODELS.reduce((sum, model) => sum + model.download_count, 0);
    const totalUsers = 250; // Mock user count

    setStats({ totalModels, totalDownloads, totalUsers });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="scroll-reveal inline-flex items-center px-6 py-3 rounded-full glass-subtle text-white/90 text-sm font-medium mb-8 hover-glow">
              <Brain className="w-5 h-5 mr-2 text-white" />
              AI Model Testing Platform
            </div>
            
            <h1 className="scroll-reveal text-4xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              <span className="gradient-text block mb-2">Test & Discover</span>
              <span className="gradient-text-primary">AI Models</span>
            </h1>
            
            <p className="scroll-reveal text-xl lg:text-2xl text-white/80 mb-12 max-w-4xl mx-auto leading-relaxed">
              Test AI models powered by Gemini 1.5 Flash for free. Configure parameters, enhance with your knowledge, 
              and discover models from the global community.
            </p>
            
            <div className="scroll-reveal flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/test"
                className="inline-flex items-center px-10 py-5 rounded-2xl text-lg font-semibold text-white button-primary hover:scale-105 transition-all duration-300 shadow-2xl"
                title="Test AI models for free"
              >
                <TestTube className="w-6 h-6 mr-3 text-white" />
                Test Model
                <ArrowRight className="w-6 h-6 ml-3 text-white" />
              </Link>
              <Link
                to="/marketplace"
                className="inline-flex items-center px-10 py-5 rounded-2xl text-lg font-semibold text-white border-clean hover:scale-105 transition-all duration-300"
              >
                <Search className="w-6 h-6 mr-3 text-white" />
                Explore Models
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
              <div className="text-4xl font-bold gradient-text mb-3">{stats.totalModels.toLocaleString()}</div>
              <div className="text-white/70 text-lg">AI Models</div>
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
              Why Choose AI Model Hub?
            </h2>
            <p className="scroll-reveal text-xl lg:text-2xl text-white/80 max-w-4xl mx-auto">
              Test models for free, enhance with your knowledge, and discover the best AI models from the community.
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
                  Test AI models powered by Gemini 1.5 Flash at zero cost. Configure parameters and enhance with your knowledge.
                </p>
              </div>

              <div className="scroll-reveal glass-card rounded-3xl p-10 grain-texture hover:scale-105 transition-all duration-300 subtle-hover w-full max-w-sm">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 mx-auto">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold gradient-text mb-6 text-center">Verified Quality</h3>
                <p className="text-white/80 text-lg leading-relaxed text-center">
                  Community-driven verification system ensures high-quality models with transparent performance metrics.
                </p>
              </div>

              <div className="scroll-reveal-right glass-card rounded-3xl p-10 grain-texture hover:scale-105 transition-all duration-300 subtle-hover w-full max-w-sm">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 mx-auto">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold gradient-text mb-6 text-center">Open Community</h3>
                <p className="text-white/80 text-lg leading-relaxed text-center">
                  Join a global community of AI researchers, developers, and enthusiasts sharing knowledge and models.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Models Section */}
      {featuredModels.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-16">
              <div>
                <h2 className="scroll-reveal text-4xl lg:text-5xl font-bold gradient-text mb-6">
                  Featured Models
                </h2>
                <p className="scroll-reveal text-xl lg:text-2xl text-white/80">
                  Discover the most popular verified models in our community
                </p>
              </div>
              <Link
                to="/marketplace"
                className="scroll-reveal text-white/90 hover:text-white font-semibold flex items-center glass-subtle px-6 py-3 rounded-2xl hover:glass transition-all duration-300 hover-glow"
              >
                View all models
                <ArrowRight className="w-5 h-5 ml-2 text-white" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredModels.map((model, index) => (
                <Link
                  key={model.id}
                  to={`/models/${model.id}`}
                  className="scroll-reveal-scale glass-card rounded-3xl p-8 grain-texture hover:scale-105 transition-all duration-300 group hover-glow"
                  style={{ transitionDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm font-semibold px-4 py-2 rounded-full glass-subtle text-white/90">
                      {model.model_type}
                    </span>
                    {model.is_verified && (
                      <div className="flex items-center status-verified">
                        <Shield className="w-5 h-5 mr-2 text-green-400" />
                        <span className="text-sm font-medium">Verified</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold gradient-text mb-4 group-hover:gradient-text-primary transition-all duration-300">
                    {model.title}
                  </h3>
                  
                  <p className="text-white/70 text-base mb-6 line-clamp-2 leading-relaxed">
                    {model.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-white/60 mb-6">
                    <span>by {model.uploader?.display_name || 'Anonymous'}</span>
                    <span className="glass-subtle px-3 py-1 rounded-xl text-xs font-medium">{model.framework}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-6 text-white/70">
                      {model.accuracy && (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-2 text-yellow-400" />
                          <span className="font-medium">{model.accuracy}%</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2 text-white" />
                        <span className="font-medium">{model.download_count}</span>
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
        <div className="max-w-5xl mx-auto text-center">
          <div className="scroll-reveal glass-strong rounded-3xl p-16 grain-texture hover-glow">
            <div className="inline-flex items-center px-6 py-3 rounded-full glass-subtle text-white/90 text-sm font-medium mb-8">
              <Zap className="w-5 h-5 mr-2 text-white" />
              Start Testing Today
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold gradient-text mb-8">
              Ready to Test Your AI Model?
            </h2>
            <p className="text-xl lg:text-2xl text-white/80 mb-12 leading-relaxed">
              Start testing with Gemini 1.5 Flash for free. Configure, enhance, and explore AI models from the community.
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
    </div>
  );
}