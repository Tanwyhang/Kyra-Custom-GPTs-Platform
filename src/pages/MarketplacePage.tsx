import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Download, Shield, Star, Calendar } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { PREDEFINED_MODELS } from '../lib/gemini';

interface GPT {
  id: string;
  title: string;
  description: string;
  gpt_type: string;
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

const GPT_TYPES = ['Conversational AI', 'Content Generation', 'Code Assistant', 'Educational', 'Creative Writing', 'Business Assistant', 'Technical Support', 'Other'];
const FRAMEWORKS = ['Gemini 1.5 Flash', 'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'ONNX', 'TensorFlow.js', 'Other'];

export function MarketplacePage() {
  const [gpts, setGPTs] = useState<GPT[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedFramework, setSelectedFramework] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [showFilters, setShowFilters] = useState(false);

  useScrollReveal();

  useEffect(() => {
    fetchGPTs();
  }, [searchTerm, selectedType, selectedFramework, sortBy]);

  const fetchGPTs = async () => {
    setLoading(true);
    
    try {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create marketplace GPTs from predefined models + additional community GPTs
      const marketplaceGPTs: GPT[] = [
        // Convert predefined models
        ...PREDEFINED_MODELS.map((gpt, index) => ({
          id: gpt.id,
          title: gpt.name,
          description: gpt.description,
          gpt_type: gpt.category,
          framework: 'Gemini 1.5 Flash',
          tags: gpt.tags,
          accuracy: 85 + Math.floor(Math.random() * 15), // Random accuracy between 85-99%
          download_count: Math.floor(Math.random() * 1000) + 100,
          is_verified: true,
          created_at: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
          uploader: { display_name: 'AI GPT Hub' }
        })),
        // Additional community GPTs
        {
          id: 'community-1',
          title: 'Advanced Image Classifier',
          description: 'A state-of-the-art image classification GPT trained on ImageNet with 95% accuracy.',
          gpt_type: 'Computer Vision',
          framework: 'TensorFlow',
          tags: ['image-classification', 'cnn', 'imagenet'],
          accuracy: 95.2,
          download_count: 1250,
          is_verified: true,
          created_at: '2024-01-15T10:30:00Z',
          uploader: { display_name: 'AI Researcher' }
        },
        {
          id: 'community-2',
          title: 'Sentiment Analysis BERT',
          description: 'Fine-tuned BERT GPT for sentiment analysis on social media text.',
          gpt_type: 'Natural Language Processing',
          framework: 'PyTorch',
          tags: ['sentiment-analysis', 'bert', 'nlp'],
          accuracy: 92.8,
          download_count: 890,
          is_verified: true,
          created_at: '2024-01-10T14:20:00Z',
          uploader: { display_name: 'NLP Expert' }
        },
        {
          id: 'community-3',
          title: 'Speech Recognition GPT',
          description: 'Real-time speech recognition GPT optimized for mobile devices.',
          gpt_type: 'Speech',
          framework: 'TensorFlow.js',
          tags: ['speech-recognition', 'mobile', 'real-time'],
          accuracy: 88.5,
          download_count: 567,
          is_verified: false,
          created_at: '2024-01-08T09:15:00Z',
          uploader: { display_name: 'Mobile Dev' }
        },
        {
          id: 'community-4',
          title: 'Object Detection YOLO',
          description: 'Fast and accurate object detection GPT for real-time applications.',
          gpt_type: 'Computer Vision',
          framework: 'PyTorch',
          tags: ['object-detection', 'yolo', 'real-time'],
          accuracy: 89.3,
          download_count: 743,
          is_verified: true,
          created_at: '2024-01-12T16:45:00Z',
          uploader: { display_name: 'Vision Expert' }
        },
        {
          id: 'community-5',
          title: 'Text Summarization GPT',
          description: 'Transformer-based GPT for automatic text summarization.',
          gpt_type: 'Natural Language Processing',
          framework: 'TensorFlow',
          tags: ['text-summarization', 'transformer', 'nlp'],
          accuracy: 91.7,
          download_count: 456,
          is_verified: true,
          created_at: '2024-01-05T11:30:00Z',
          uploader: { display_name: 'NLP Researcher' }
        }
      ];

      // Apply search filter
      let filteredGPTs = [...marketplaceGPTs];
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        filteredGPTs = filteredGPTs.filter(gpt => 
          gpt.title.toLowerCase().includes(searchLower) ||
          gpt.description.toLowerCase().includes(searchLower) ||
          gpt.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      
      // Apply type filter
      if (selectedType) {
        filteredGPTs = filteredGPTs.filter(gpt => gpt.gpt_type === selectedType);
      }
      
      // Apply framework filter
      if (selectedFramework) {
        filteredGPTs = filteredGPTs.filter(gpt => gpt.framework === selectedFramework);
      }

      // Apply sorting
      filteredGPTs.sort((a, b) => {
        switch (sortBy) {
          case 'title':
            return a.title.localeCompare(b.title);
          case 'download_count':
            return b.download_count - a.download_count;
          case 'created_at':
          default:
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
      });

      setGPTs(filteredGPTs);
    } catch (error) {
      console.error('Error fetching GPTs:', error);
      setGPTs([]);
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
          <h1 className="scroll-reveal text-3xl font-bold gradient-text mb-4">AI GPT Marketplace</h1>
          <p className="scroll-reveal text-lg text-white/70">
            Discover and test AI GPTs from the community
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
                  placeholder="Search GPTs by title, description, or tags..."
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
                    GPT Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="glass-input w-full px-3 py-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    {GPT_TYPES.map((type) => (
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
            <p className="text-white/60 mt-4">Loading GPTs...</p>
          </div>
        ) : gpts.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-2xl grain-texture">
            <Search className="w-12 h-12 text-white/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium gradient-text mb-2">No GPTs found</h3>
            <p className="text-white/60">Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gpts.map((gpt, index) => (
                <Link
                  key={gpt.id}
                  to={`/gpts/${gpt.id}`}
                  className="glass-card rounded-2xl hover:scale-105 transition-all duration-300 overflow-hidden group grain-texture"
                  style={{ transitionDelay: `${index * 0.1}s` }}
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-medium px-3 py-1 rounded-full glass-subtle text-white/80">
                        {gpt.gpt_type}
                      </span>
                      {gpt.is_verified && (
                        <div className="flex items-center text-green-400">
                          <Shield className="w-4 h-4 mr-1" />
                          <span className="text-xs">Verified</span>
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold gradient-text mb-2 group-hover:gradient-text-primary transition-all duration-300 line-clamp-1">
                      {gpt.title}
                    </h3>

                    {/* Description */}
                    <p className="text-white/60 text-sm mb-4 line-clamp-2">
                      {gpt.description || 'No description available.'}
                    </p>

                    {/* Tags */}
                    {gpt.tags && gpt.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {gpt.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="text-xs px-2 py-1 glass-subtle text-white/60 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {gpt.tags.length > 3 && (
                          <span className="text-xs px-2 py-1 glass-subtle text-white/60 rounded-full">
                            +{gpt.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-sm text-white/50 mb-4">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(gpt.created_at)}
                      </span>
                      <span className="glass-subtle px-2 py-1 rounded-lg text-xs">{gpt.framework}</span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">
                        by {gpt.uploader?.display_name || 'Anonymous'}
                      </span>
                      <div className="flex items-center space-x-4 text-white/50">
                        {gpt.accuracy && (
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-1 text-yellow-400" />
                            <span>{gpt.accuracy}%</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <Download className="w-4 h-4 mr-1" />
                          <span>{gpt.download_count}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Results Summary */}
            <div className="text-center mt-12">
              <p className="text-white/60">
                Showing {gpts.length} GPT{gpts.length !== 1 ? 's' : ''}
                {searchTerm && ` matching "${searchTerm}"`}
                {selectedType && ` in ${selectedType}`}
                {selectedFramework && ` using ${selectedFramework}`}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}