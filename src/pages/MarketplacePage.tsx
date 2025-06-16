import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Download, Shield, Star, Calendar } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface Model {
  id: string;
  title: string;
  description: string;
  model_type: string;
  framework: string;
  tags: string[];
  accuracy: number | null;
  download_count: number;
  is_verified: boolean;
  created_at: string;
  uploader?: {
    display_name: string;
  };
}

const MODEL_TYPES = ['Computer Vision', 'Natural Language Processing', 'Speech', 'Reinforcement Learning', 'Other'];
const FRAMEWORKS = ['TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'ONNX', 'TensorFlow.js', 'Other'];

// Mock data for demonstration
const MOCK_MODELS: Model[] = [
  {
    id: '1',
    title: 'Advanced Image Classifier',
    description: 'A state-of-the-art image classification model trained on ImageNet with 95% accuracy.',
    model_type: 'Computer Vision',
    framework: 'TensorFlow',
    tags: ['image-classification', 'cnn', 'imagenet'],
    accuracy: 95.2,
    download_count: 1250,
    is_verified: true,
    created_at: '2024-01-15T10:30:00Z',
    uploader: { display_name: 'AI Researcher' }
  },
  {
    id: '2',
    title: 'Sentiment Analysis BERT',
    description: 'Fine-tuned BERT model for sentiment analysis on social media text.',
    model_type: 'Natural Language Processing',
    framework: 'PyTorch',
    tags: ['sentiment-analysis', 'bert', 'nlp'],
    accuracy: 92.8,
    download_count: 890,
    is_verified: true,
    created_at: '2024-01-10T14:20:00Z',
    uploader: { display_name: 'NLP Expert' }
  },
  {
    id: '3',
    title: 'Speech Recognition Model',
    description: 'Real-time speech recognition model optimized for mobile devices.',
    model_type: 'Speech',
    framework: 'TensorFlow.js',
    tags: ['speech-recognition', 'mobile', 'real-time'],
    accuracy: 88.5,
    download_count: 567,
    is_verified: false,
    created_at: '2024-01-08T09:15:00Z',
    uploader: { display_name: 'Mobile Dev' }
  }
];

export function MarketplacePage() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedFramework, setSelectedFramework] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [showFilters, setShowFilters] = useState(false);

  useScrollReveal();

  useEffect(() => {
    fetchModels();
  }, [searchTerm, selectedType, selectedFramework, sortBy]);

  const fetchModels = async () => {
    setLoading(true);
    
    try {
      // Get uploaded models from localStorage
      const uploadedModels = JSON.parse(localStorage.getItem('uploaded_models') || '[]');
      
      // Combine with mock models
      let allModels = [...MOCK_MODELS, ...uploadedModels];

      // Apply filters
      if (searchTerm) {
        allModels = allModels.filter(model => 
          model.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          model.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (selectedType) {
        allModels = allModels.filter(model => model.model_type === selectedType);
      }
      
      if (selectedFramework) {
        allModels = allModels.filter(model => model.framework === selectedFramework);
      }

      // Apply sorting
      allModels.sort((a, b) => {
        switch (sortBy) {
          case 'title':
            return a.title.localeCompare(b.title);
          case 'download_count':
            return (b.download_count || 0) - (a.download_count || 0);
          case 'created_at':
          default:
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
      });

      setModels(allModels);
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="scroll-reveal text-3xl font-bold gradient-text mb-4">AI Model Marketplace</h1>
          <p className="scroll-reveal text-lg text-white/70">
            Discover and download AI models from the community
          </p>
        </div>

        {/* Search and Filters */}
        <div className="scroll-reveal glass-strong rounded-2xl p-6 mb-8 grain-texture">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search models by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="glass-input w-full pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-3 glass-subtle rounded-xl hover:glass transition-colors text-white/80 hover:text-white"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Model Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="glass-input w-full px-3 py-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    {MODEL_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Framework
                  </label>
                  <select
                    value={selectedFramework}
                    onChange={(e) => setSelectedFramework(e.target.value)}
                    className="glass-input w-full px-3 py-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">All Frameworks</option>
                    {FRAMEWORKS.map((framework) => (
                      <option key={framework} value={framework}>
                        {framework}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="glass-input w-full px-3 py-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="created_at">Newest First</option>
                    <option value="download_count">Most Downloaded</option>
                    <option value="title">Alphabetical</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-white/60 mt-4">Loading models...</p>
          </div>
        ) : models.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-2xl grain-texture">
            <Search className="w-12 h-12 text-white/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium gradient-text mb-2">No models found</h3>
            <p className="text-white/60">Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((model, index) => (
              <Link
                key={model.id}
                to={`/models/${model.id}`}
                className="scroll-reveal glass-card rounded-2xl hover:scale-105 transition-all duration-300 overflow-hidden group grain-texture"
                style={{ transitionDelay: `${index * 0.1}s` }}
              >
                <div className="p-6">
                  {/* Header */}
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

                  {/* Title */}
                  <h3 className="font-semibold gradient-text mb-2 group-hover:gradient-text-primary transition-all duration-300 line-clamp-1">
                    {model.title}
                  </h3>

                  {/* Description */}
                  <p className="text-white/60 text-sm mb-4 line-clamp-2">
                    {model.description || 'No description available.'}
                  </p>

                  {/* Tags */}
                  {model.tags && model.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {model.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 glass-subtle text-white/60 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {model.tags.length > 3 && (
                        <span className="text-xs px-2 py-1 glass-subtle text-white/60 rounded-full">
                          +{model.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-sm text-white/50 mb-4">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(model.created_at)}
                    </span>
                    <span className="glass-subtle px-2 py-1 rounded-lg text-xs">{model.framework}</span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">
                      by {model.uploader?.display_name || 'Anonymous'}
                    </span>
                    <div className="flex items-center space-x-4 text-white/50">
                      {model.accuracy && (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1 text-yellow-400" />
                          <span>{model.accuracy}%</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        <span>{model.download_count || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Load More or Pagination could be added here */}
        {models.length > 0 && (
          <div className="text-center mt-12">
            <p className="text-white/60">
              Showing {models.length} model{models.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}