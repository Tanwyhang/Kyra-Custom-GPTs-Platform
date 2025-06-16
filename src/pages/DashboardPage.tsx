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
  Star,
  TestTube
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
  const [models, setModels] = useState<UserModel[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalModels: 0,
    totalDownloads: 0,
    verifiedModels: 0,
    recentDownloads: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserModels();
    fetchDashboardStats();
  }, []);

  const fetchUserModels = async () => {
    try {
      // Get models from localStorage for demo purposes
      const uploadedModels = JSON.parse(localStorage.getItem('uploaded_models') || '[]');
      setModels(uploadedModels);
    } catch (error) {
      console.error('Error fetching user models:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      // Get models from localStorage
      const uploadedModels = JSON.parse(localStorage.getItem('uploaded_models') || '[]');

      // Generate mock download history for the last 30 days
      const recentDownloads = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        recentDownloads.push({
          date: date.toISOString().split('T')[0],
          downloads: Math.floor(Math.random() * 10)
        });
      }

      const totalModels = uploadedModels.length;
      const totalDownloads = uploadedModels.reduce((sum: number, model: any) => sum + (model.download_count || 0), 0);
      const verifiedModels = uploadedModels.filter((model: any) => model.is_verified).length;

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
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Dashboard</h1>
          <p className="text-white/70">Manage your AI models and track performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card rounded-2xl p-6 grain-texture">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-xl icon-bg-primary flex items-center justify-center">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">Total Models</p>
                <p className="text-2xl font-bold gradient-text">{stats.totalModels}</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 grain-texture">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Download className="w-6 h-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">Total Downloads</p>
                <p className="text-2xl font-bold gradient-text">{stats.totalDownloads}</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 grain-texture">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">Verified Models</p>
                <p className="text-2xl font-bold gradient-text">{stats.verifiedModels}</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 grain-texture">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">Avg. Downloads</p>
                <p className="text-2xl font-bold gradient-text">
                  {stats.totalModels > 0 ? Math.round(stats.totalDownloads / stats.totalModels) : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Downloads Chart */}
          <div className="lg:col-span-2">
            <div className="glass-strong rounded-2xl p-6 grain-texture">
              <h3 className="text-lg font-semibold gradient-text mb-4">
                Downloads (Last 30 Days)
              </h3>
              {stats.recentDownloads.length > 0 ? (
                <div className="h-64">
                  <Line data={chartData} options={chartOptions} />
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-white/50">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 text-white/30" />
                    <p>No download data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="glass-strong rounded-2xl p-6 grain-texture">
              <h3 className="text-lg font-semibold gradient-text mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/test"
                  className="flex items-center p-3 rounded-xl glass-subtle hover:glass transition-all duration-300 group"
                >
                  <TestTube className="w-5 h-5 text-white/60 group-hover:text-purple-400 mr-3" />
                  <span className="text-white/80 group-hover:text-white">Test AI Model</span>
                </Link>
                
                <Link
                  to="/upload"
                  className="flex items-center p-3 rounded-xl glass-subtle hover:glass transition-all duration-300 group"
                >
                  <Upload className="w-5 h-5 text-white/60 group-hover:text-purple-400 mr-3" />
                  <span className="text-white/80 group-hover:text-white">Upload New Model</span>
                </Link>
                
                <Link
                  to="/marketplace"
                  className="flex items-center p-3 rounded-xl glass-subtle hover:glass transition-all duration-300 group"
                >
                  <Eye className="w-5 h-5 text-white/60 group-hover:text-blue-400 mr-3" />
                  <span className="text-white/80 group-hover:text-white">Browse Marketplace</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Your Models */}
        <div className="mt-8">
          <div className="glass-strong rounded-2xl overflow-hidden grain-texture">
            <div className="px-6 py-4 border-b border-white/10">
              <h3 className="text-lg font-semibold gradient-text">Your Models</h3>
            </div>

            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                <p className="text-white/60 mt-2">Loading models...</p>
              </div>
            ) : models.length === 0 ? (
              <div className="p-6 text-center">
                <Upload className="w-12 h-12 text-white/30 mx-auto mb-4" />
                <h4 className="text-lg font-medium gradient-text mb-2">No models yet</h4>
                <p className="text-white/60 mb-4">Upload your first AI model to get started.</p>
                <Link
                  to="/upload"
                  className="inline-flex items-center px-4 py-2 button-primary text-white rounded-xl hover:scale-105 transition-all duration-300"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Model
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="glass-subtle">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Model
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Downloads
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {models.map((model) => (
                      <tr key={model.id} className="hover:glass-subtle transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">{model.title}</div>
                            <div className="text-sm text-white/60">{model.framework}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium glass-subtle text-purple-300">
                            {model.model_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {model.is_verified ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                              <Shield className="w-3 h-3 mr-1" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300">
                              Pending Review
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {model.download_count || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">
                          {new Date(model.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            to={`/models/${model.id}`}
                            className="text-purple-400 hover:text-purple-300 transition-colors"
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