import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Upload, 
  BarChart3, 
  Download, 
  Eye, 
  Shield, 
  Calendar,
  TrendingUp,
  Users,
  Star
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { useAuthContext } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface UserModel {
  id: string;
  title: string;
  model_type: string;
  framework: string;
  is_verified: boolean;
  download_count: number;
  created_at: string;
}

interface DashboardStats {
  totalModels: number;
  totalDownloads: number;
  verifiedModels: number;
  recentDownloads: Array<{ date: string; downloads: number }>;
}

export function DashboardPage() {
  const { user } = useAuthContext();
  const [models, setModels] = useState<UserModel[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalModels: 0,
    totalDownloads: 0,
    verifiedModels: 0,
    recentDownloads: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserModels();
      fetchDashboardStats();
    }
  }, [user]);

  const fetchUserModels = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('models')
      .select('*')
      .eq('uploader_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user models:', error);
    } else {
      setModels(data || []);
    }
  };

  const fetchDashboardStats = async () => {
    if (!user) return;

    try {
      // Get user's models
      const { data: userModels } = await supabase
        .from('models')
        .select('id, download_count, is_verified')
        .eq('uploader_id', user.id);

      // Get download history for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: downloadHistory } = await supabase
        .from('model_downloads')
        .select('downloaded_at, model_id')
        .gte('downloaded_at', thirtyDaysAgo.toISOString())
        .in('model_id', userModels?.map(m => m.id) || []);

      // Process stats
      const totalModels = userModels?.length || 0;
      const totalDownloads = userModels?.reduce((sum, model) => sum + model.download_count, 0) || 0;
      const verifiedModels = userModels?.filter(model => model.is_verified).length || 0;

      // Process download history by day
      const downloadsByDay = new Map<string, number>();
      downloadHistory?.forEach(download => {
        const date = new Date(download.downloaded_at).toISOString().split('T')[0];
        downloadsByDay.set(date, (downloadsByDay.get(date) || 0) + 1);
      });

      const recentDownloads = Array.from(downloadsByDay.entries())
        .map(([date, downloads]) => ({ date, downloads }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setStats({
        totalModels,
        totalDownloads,
        verifiedModels,
        recentDownloads,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: stats.recentDownloads.map(item => new Date(item.date)),
    datasets: [
      {
        label: 'Downloads',
        data: stats.recentDownloads.map(item => item.downloads),
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'day' as const,
        },
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage your AI models and track performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-3">
                <Upload className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Models</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalModels}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3">
                <Download className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Downloads</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDownloads}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Verified Models</p>
                <p className="text-2xl font-bold text-gray-900">{stats.verifiedModels}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 rounded-lg p-3">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Downloads</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalModels > 0 ? Math.round(stats.totalDownloads / stats.totalModels) : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Downloads Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Downloads (Last 30 Days)
              </h3>
              {stats.recentDownloads.length > 0 ? (
                <div className="h-64">
                  <Line data={chartData} options={chartOptions} />
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No download data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/upload"
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-200 transition-colors group"
                >
                  <Upload className="w-5 h-5 text-gray-400 group-hover:text-purple-600 mr-3" />
                  <span className="text-gray-700 group-hover:text-purple-600">Upload New Model</span>
                </Link>
                
                <Link
                  to="/marketplace"
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors group"
                >
                  <Eye className="w-5 h-5 text-gray-400 group-hover:text-blue-600 mr-3" />
                  <span className="text-gray-700 group-hover:text-blue-600">Browse Marketplace</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Your Models */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Your Models</h3>
            </div>

            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading models...</p>
              </div>
            ) : models.length === 0 ? (
              <div className="p-6 text-center">
                <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No models yet</h4>
                <p className="text-gray-600 mb-4">Upload your first AI model to get started.</p>
                <Link
                  to="/upload"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Model
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Model
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Downloads
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {models.map((model) => (
                      <tr key={model.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{model.title}</div>
                            <div className="text-sm text-gray-500">{model.framework}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {model.model_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {model.is_verified ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Shield className="w-3 h-3 mr-1" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pending Review
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {model.download_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(model.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            to={`/models/${model.id}`}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}