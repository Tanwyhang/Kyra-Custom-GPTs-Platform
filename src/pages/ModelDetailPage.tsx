import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Download, 
  Shield, 
  Calendar, 
  User, 
  Tag, 
  BarChart3, 
  FileText,
  ArrowLeft,
  Star,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import { PREDEFINED_MODELS } from '../lib/gemini';

interface ModelDetail {
  id: string;
  title: string;
  description: string | null;
  model_type: string;
  framework: string;
  tags: string[];
  accuracy: number | null;
  file_url?: string | null;
  file_size?: number | null;
  file_name?: string;
  is_verified: boolean;
  download_count: number;
  created_at: string;
  updated_at?: string;
  uploader?: {
    id?: string;
    display_name: string | null;
  };
}

export function ModelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [model, setModel] = useState<ModelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchModel();
    }
  }, [id]);

  const fetchModel = async () => {
    if (!id) return;

    try {
      // Check if it's a predefined model
      const predefinedModel = PREDEFINED_MODELS.find(m => m.id === id);
      if (predefinedModel) {
        const modelDetail: ModelDetail = {
          id: predefinedModel.id,
          title: predefinedModel.name,
          description: predefinedModel.description + '\n\nThis is a context-based AI model powered by Gemini 1.5 Flash. It uses specialized prompting to provide responses tailored to specific use cases and domains.',
          model_type: predefinedModel.category,
          framework: 'Gemini 1.5 Flash',
          tags: predefinedModel.tags,
          accuracy: 85 + Math.floor(Math.random() * 15),
          file_size: Math.floor(Math.random() * 500000000) + 50000000, // 50MB to 550MB
          is_verified: true,
          download_count: Math.floor(Math.random() * 1000) + 100,
          created_at: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
          uploader: { display_name: 'AI Model Hub' }
        };
        setModel(modelDetail);
      } else {
        // Handle community models with comprehensive data
        const communityModels: { [key: string]: ModelDetail } = {
          'community-1': {
            id: 'community-1',
            title: 'Advanced Image Classifier',
            description: 'A state-of-the-art image classification model trained on ImageNet with 95% accuracy. This model uses a ResNet-50 architecture with custom modifications for improved performance on edge devices. The model has been fine-tuned on a diverse dataset of over 1 million images across 1000 categories.',
            model_type: 'Computer Vision',
            framework: 'TensorFlow',
            tags: ['image-classification', 'cnn', 'imagenet', 'resnet'],
            accuracy: 95.2,
            file_size: 102400000, // 100MB
            is_verified: true,
            download_count: 1250,
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-15T10:30:00Z',
            uploader: { display_name: 'AI Researcher' }
          },
          'community-2': {
            id: 'community-2',
            title: 'Sentiment Analysis BERT',
            description: 'Fine-tuned BERT model for sentiment analysis on social media text. Trained on a diverse dataset of tweets and social media posts from multiple platforms. Achieves state-of-the-art performance on sentiment classification tasks.',
            model_type: 'Natural Language Processing',
            framework: 'PyTorch',
            tags: ['sentiment-analysis', 'bert', 'nlp', 'social-media'],
            accuracy: 92.8,
            file_size: 438000000, // 438MB
            is_verified: true,
            download_count: 890,
            created_at: '2024-01-10T14:20:00Z',
            updated_at: '2024-01-10T14:20:00Z',
            uploader: { display_name: 'NLP Expert' }
          },
          'community-3': {
            id: 'community-3',
            title: 'Speech Recognition Model',
            description: 'Real-time speech recognition model optimized for mobile devices. Supports multiple languages and accents with low latency processing. Perfect for voice-controlled applications and transcription services.',
            model_type: 'Speech',
            framework: 'TensorFlow.js',
            tags: ['speech-recognition', 'mobile', 'real-time', 'multilingual'],
            accuracy: 88.5,
            file_size: 25600000, // 25MB
            is_verified: false,
            download_count: 567,
            created_at: '2024-01-08T09:15:00Z',
            updated_at: '2024-01-08T09:15:00Z',
            uploader: { display_name: 'Mobile Dev' }
          },
          'community-4': {
            id: 'community-4',
            title: 'Object Detection YOLO',
            description: 'Fast and accurate object detection model for real-time applications. Based on YOLOv8 architecture with custom optimizations for speed and accuracy. Detects 80+ object classes with high precision.',
            model_type: 'Computer Vision',
            framework: 'PyTorch',
            tags: ['object-detection', 'yolo', 'real-time'],
            accuracy: 89.3,
            file_size: 67108864, // 64MB
            is_verified: true,
            download_count: 743,
            created_at: '2024-01-12T16:45:00Z',
            updated_at: '2024-01-12T16:45:00Z',
            uploader: { display_name: 'Vision Expert' }
          },
          'community-5': {
            id: 'community-5',
            title: 'Text Summarization Model',
            description: 'Transformer-based model for automatic text summarization. Capable of generating concise and coherent summaries from long documents. Trained on news articles, research papers, and web content.',
            model_type: 'Natural Language Processing',
            framework: 'TensorFlow',
            tags: ['text-summarization', 'transformer', 'nlp'],
            accuracy: 91.7,
            file_size: 512000000, // 512MB
            is_verified: true,
            download_count: 456,
            created_at: '2024-01-05T11:30:00Z',
            updated_at: '2024-01-05T11:30:00Z',
            uploader: { display_name: 'NLP Researcher' }
          }
        };

        if (communityModels[id]) {
          setModel(communityModels[id]);
        } else {
          setError('Model not found');
        }
      }
    } catch (error) {
      setError('Model not found');
      console.error('Error fetching model:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!model) return;

    setDownloading(true);

    try {
      // Simulate download process
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate file download
      const blob = new Blob(['Mock model file content'], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${model.title.replace(/\s+/g, '_')}.model`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Update local state
      setModel(prev => prev ? { ...prev, download_count: prev.download_count + 1 } : null);
    } catch (err) {
      console.error('Error downloading model:', err);
      setError('Failed to download model');
    } finally {
      setDownloading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white/60">Loading model details...</p>
        </div>
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold gradient-text mb-4">Model Not Found</h2>
          <p className="text-white/60 mb-4">{error || 'The requested model could not be found.'}</p>
          <Link
            to="/marketplace"
            className="inline-flex items-center px-4 py-2 button-primary text-white rounded-xl hover:scale-105 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/marketplace"
            className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Link>
        </div>

        {/* Header */}
        <div className="glass-strong rounded-2xl overflow-hidden mb-6 grain-texture">
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 px-8 py-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold gradient-text mb-2">{model.title}</h1>
                <div className="flex items-center space-x-4 text-white/70">
                  <span className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {model.uploader?.display_name || 'Anonymous'}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(model.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                {model.is_verified && (
                  <div className="flex items-center text-green-400 mb-2">
                    <Shield className="w-5 h-5 mr-2" />
                    <span className="font-medium">Verified Model</span>
                  </div>
                )}
                <div className="flex items-center text-white/70">
                  <Download className="w-4 h-4 mr-1" />
                  <span>{model.download_count} downloads</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl glass-subtle flex items-center justify-center mx-auto mb-2">
                  <Tag className="w-6 h-6 text-purple-400" />
                </div>
                <p className="text-sm text-white/60">Type</p>
                <p className="font-semibold text-white">{model.model_type}</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-xl glass-subtle flex items-center justify-center mx-auto mb-2">
                  <FileText className="w-6 h-6 text-blue-400" />
                </div>
                <p className="text-sm text-white/60">Framework</p>
                <p className="font-semibold text-white">{model.framework}</p>
              </div>

              {model.accuracy && (
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl glass-subtle flex items-center justify-center mx-auto mb-2">
                    <Star className="w-6 h-6 text-green-400" />
                  </div>
                  <p className="text-sm text-white/60">Accuracy</p>
                  <p className="font-semibold text-white">{model.accuracy}%</p>
                </div>
              )}

              {model.file_size && (
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl glass-subtle flex items-center justify-center mx-auto mb-2">
                    <BarChart3 className="w-6 h-6 text-orange-400" />
                  </div>
                  <p className="text-sm text-white/60">File Size</p>
                  <p className="font-semibold text-white">{formatFileSize(model.file_size)}</p>
                </div>
              )}
            </div>

            {/* Description */}
            {model.description && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold gradient-text mb-4">Description</h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-white/80 whitespace-pre-wrap leading-relaxed">{model.description}</p>
                </div>
              </div>
            )}

            {/* Tags */}
            {model.tags && model.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold gradient-text mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {model.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium glass-subtle text-purple-300"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Download Section */}
            <div className="border-t border-white/10 pt-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold gradient-text mb-2">Download Model</h3>
                  <p className="text-white/60">
                    Download this model to use in your projects. Make sure to review the documentation and licensing terms.
                  </p>
                </div>
                
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="button-primary text-white px-6 py-3 rounded-xl font-medium hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center"
                >
                  {downloading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download Model
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Model Info */}
            <div className="mt-8 pt-8 border-t border-white/10">
              <h3 className="text-lg font-semibold gradient-text mb-4">Model Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-white mb-2">Model Details</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-white/60">ID:</dt>
                      <dd className="text-white font-mono text-xs">{model.id}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-white/60">Created:</dt>
                      <dd className="text-white">{new Date(model.created_at).toLocaleString()}</dd>
                    </div>
                    {model.updated_at && (
                      <div className="flex justify-between">
                        <dt className="text-white/60">Updated:</dt>
                        <dd className="text-white">{new Date(model.updated_at).toLocaleString()}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">Usage Statistics</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-white/60">Total Downloads:</dt>
                      <dd className="text-white">{model.download_count}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-white/60">Verification Status:</dt>
                      <dd className="text-white">
                        {model.is_verified ? (
                          <span className="inline-flex items-center text-green-400">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </span>
                        ) : (
                          <span className="text-yellow-400">Pending Review</span>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}