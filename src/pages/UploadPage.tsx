import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Tag, Zap, AlertCircle } from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const MODEL_TYPES = ['Computer Vision', 'Natural Language Processing', 'Speech', 'Reinforcement Learning', 'Other'];
const FRAMEWORKS = ['TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'ONNX', 'TensorFlow.js', 'Other'];

export function UploadPage() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    model_type: '',
    framework: '',
    tags: '',
    accuracy: '',
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to upload models.</p>
        </div>
      </div>
    );
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const validateFile = (file: File): boolean => {
    const allowedTypes = ['.onnx', '.pb', '.h5', '.tflite', '.pkl', '.joblib'];
    const maxSize = 500 * 1024 * 1024; // 500MB
    
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      setError('Invalid file type. Please upload ONNX, TensorFlow, Keras, or other supported model files.');
      return false;
    }
    
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 500MB.');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a model file to upload.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('models')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('models')
        .getPublicUrl(fileName);

      // Create model record
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const { data: modelData, error: modelError } = await supabase
        .from('models')
        .insert({
          uploader_id: user.id,
          title: formData.title,
          description: formData.description,
          model_type: formData.model_type,
          framework: formData.framework,
          tags: tagsArray,
          accuracy: formData.accuracy ? parseFloat(formData.accuracy) : null,
          file_url: urlData.publicUrl,
          file_size: file.size,
        })
        .select()
        .single();

      if (modelError) {
        throw modelError;
      }

      navigate(`/models/${modelData.id}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred while uploading the model.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6 text-white">
            <h1 className="text-2xl font-bold mb-2">Upload AI Model</h1>
            <p className="text-purple-100">
              Share your trained model with the community
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model File *
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  dragActive
                    ? 'border-purple-500 bg-purple-50'
                    : file
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-purple-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".onnx,.pb,.h5,.tflite,.pkl,.joblib"
                />
                
                <Upload className={`w-12 h-12 mx-auto mb-4 ${file ? 'text-green-500' : 'text-gray-400'}`} />
                
                {file ? (
                  <div>
                    <p className="text-green-600 font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-2">
                      Drag and drop your model file here, or click to browse
                    </p>
                    <p className="text-sm text-gray-500">
                      Supported formats: ONNX, TensorFlow (.pb), Keras (.h5), TensorFlow Lite (.tflite), Pickle (.pkl)
                    </p>
                    <p className="text-sm text-gray-500">
                      Maximum file size: 500MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Model Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter a descriptive title"
                />
              </div>

              <div>
                <label htmlFor="accuracy" className="block text-sm font-medium text-gray-700 mb-2">
                  Accuracy (%)
                </label>
                <input
                  type="number"
                  id="accuracy"
                  name="accuracy"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.accuracy}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., 95.2"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Describe what your model does, its intended use case, training data, etc."
              />
            </div>

            {/* Model Type and Framework */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="model_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Model Type *
                </label>
                <select
                  id="model_type"
                  name="model_type"
                  required
                  value={formData.model_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select model type</option>
                  {MODEL_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="framework" className="block text-sm font-medium text-gray-700 mb-2">
                  Framework *
                </label>
                <select
                  id="framework"
                  name="framework"
                  required
                  value={formData.framework}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select framework</option>
                  {FRAMEWORKS.map((framework) => (
                    <option key={framework} value={framework}>
                      {framework}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter tags separated by commas (e.g., image classification, resnet, pytorch)"
              />
              <p className="text-sm text-gray-500 mt-1">
                Help others discover your model with relevant tags
              </p>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={uploading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-md font-medium hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {uploading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Model
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}