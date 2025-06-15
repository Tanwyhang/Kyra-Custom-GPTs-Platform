import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Download, Shield, Star, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

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
  uploader: {
    display_name: string;
  };
}

const MODEL_TYPES = ['Computer Vision', 'Natural Language Processing', 'Speech', 'Reinforcement Learning', 'Other'];
const FRAMEWORKS = ['TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'ONNX', 'TensorFlow.js', 'Other'];

export function MarketplacePage() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedFramework, setSelectedFramework] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchModels();
  }, [searchTerm, selectedType, selectedFramework, sortBy]);

  const fetchModels = async () => {
    setLoading(true);
    
    let query = supabase
      .from('models')
      .select(`
        *,
        uploader:users(display_name)
      `)
      .eq('is_verified', true);

    // Apply filters
    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }
    
    if (selectedType) {
      query = query.eq('model_type', selectedType);
    }
    
    if (selectedFramework) {
      query = query.eq('framework', selectedFramework);
    }

    // Apply sorting
    const ascending = sortBy === 'title';
    query = query.order(sortBy, { ascending });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching models:', error);
    } else {
      setModels(data || []);
    }
    
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Model Marketplace</h1>
          <p className="text-lg text-gray-600">
            Discover verified AI models from the community
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search models by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Framework
                  </label>
                  <select
                    value={selectedFramework}
                    onChange={(e) => setSelectedFramework(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading models...</p>
          </div>
        ) : models.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No models found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((model) => (
              <Link
                key={model.id}
                to={`/models/${model.id}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-105 overflow-hidden group"
              >
                <div className="p-6">
                  {/* Header */}
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

                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors line-clamp-1">
                    {model.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {model.description || 'No description available.'}
                  </p>

                  {/* Tags */}
                  {model.tags && model.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {model.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {model.tags.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                          +{model.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(model.created_at)}
                    </span>
                    <span>{model.framework}</span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      by {model.uploader?.display_name || 'Anonymous'}
                    </span>
                    <div className="flex items-center space-x-4 text-gray-500">
                      {model.accuracy && (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1" />
                          <span>{model.accuracy}%</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        <span>{model.download_count}</span>
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
            <p className="text-gray-600">
              Showing {models.length} model{models.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}