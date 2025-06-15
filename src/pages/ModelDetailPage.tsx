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
import { useAuthContext } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface ModelDetail {
  id: string;
  title: string;
  description: string | null;
  model_type: string;
  framework: string;
  tags: string[];
  accuracy: number | null;
  file_url: string | null;
  file_size: number | null;
  is_verified: boolean;
  download_count: number;
  created_at: string;
  updated_at: string;
  uploader: {
    id: string;
    display_name: string | null;
  };
}

export function ModelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthContext();
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

    const { data, error } = await supabase
      .from('models')
      .select(`
        *,
        uploader:users(id, display_name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      setError('Model not found');
      console.error('Error fetching model:', error);
    } else {
      setModel(data);
    }
    
    setLoading(false);
  };

  const handleDownload = async () => {
    if (!model || !model.file_url) return;

    setDownloading(true);

    try {
      // Record the download
      if (user) {
        await supabase.from('model_downloads').insert({
          model_id: model.id,
          user_id: user.id,
        });

        // Update download count
        await supabase
          .from('models')
          .update({ download_count: model.download_count + 1 })
          .eq('id', model.id);
      }

      // Trigger download
      const link = document.createElement('a');
      link.href = model.file_url;
      link.download = `${model.title}.model`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading model details...</p>
        </div>
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Model Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The requested model could not be found.'}</p>
          <Link
            to="/marketplace"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/marketplace"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">{model.title}</h1>
                <div className="flex items-center space-x-4 text-purple-100">
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
                  <div className="flex items-center text-green-300 mb-2">
                    <Shield className="w-5 h-5 mr-2" />
                    <span className="font-medium">Verified Model</span>
                  </div>
                )}
                <div className="flex items-center text-purple-100">
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
                <div className="bg-purple-100 rounded-lg p-3 w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <Tag className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="font-semibold">{model.model_type}</p>
              </div>

              <div className="text-center">
                <div className="bg-blue-100 rounded-lg p-3 w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">Framework</p>
                <p className="font-semibold">{model.framework}</p>
              </div>

              {model.accuracy && (
                <div className="text-center">
                  <div className="bg-green-100 rounded-lg p-3 w-12 h-12 flex items-center justify-center mx-auto mb-2">
                    <Star className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-600">Accuracy</p>
                  <p className="font-semibold">{model.accuracy}%</p>
                </div>
              )}

              {model.file_size && (
                <div className="text-center">
                  <div className="bg-orange-100 rounded-lg p-3 w-12 h-12 flex items-center justify-center mx-auto mb-2">
                    <BarChart3 className="w-6 h-6 text-orange-600" />
                  </div>
                  <p className="text-sm text-gray-600">File Size</p>
                  <p className="font-semibold">{formatFileSize(model.file_size)}</p>
                </div>
              )}
            </div>

            {/* Description */}
            {model.description && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{model.description}</p>
                </div>
              </div>
            )}

            {/* Tags */}
            {model.tags && model.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {model.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Download Section */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Download Model</h3>
                  <p className="text-gray-600">
                    Download this model to use in your projects. Make sure to review the documentation and licensing terms.
                  </p>
                </div>
                
                <button
                  onClick={handleDownload}
                  disabled={downloading || !model.file_url}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
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
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Model Details</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">ID:</dt>
                      <dd className="text-gray-900 font-mono text-xs">{model.id}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Created:</dt>
                      <dd className="text-gray-900">{new Date(model.created_at).toLocaleString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Updated:</dt>
                      <dd className="text-gray-900">{new Date(model.updated_at).toLocaleString()}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Usage Statistics</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Total Downloads:</dt>
                      <dd className="text-gray-900">{model.download_count}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Verification Status:</dt>
                      <dd className="text-gray-900">
                        {model.is_verified ? (
                          <span className="inline-flex items-center text-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </span>
                        ) : (
                          <span className="text-yellow-600">Pending Review</span>
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