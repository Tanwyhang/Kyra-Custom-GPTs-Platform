import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  RotateCcw, 
  Upload, 
  FileText, 
  Settings, 
  Save,
  Eye,
  EyeOff,
  X,
  Plus,
  Trash2,
  Clock,
  MessageSquare,
  Bot,
  User as UserIcon,
  Sparkles
} from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ModelConfig {
  temperature: number;
  topP: number;
  maxTokens: number;
  systemPrompt: string;
}

interface PublicationData {
  name: string;
  description: string;
  category: string;
  tags: string[];
  samplePrompts: string[];
  isPublic: boolean;
}

const CATEGORIES = [
  'Conversational AI',
  'Content Generation',
  'Code Assistant',
  'Educational',
  'Creative Writing',
  'Business Assistant',
  'Technical Support',
  'Other'
];

export function TestModelPage() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  useScrollReveal();

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenCount, setTokenCount] = useState(0);

  // Configuration state
  const [config, setConfig] = useState<ModelConfig>({
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 1024,
    systemPrompt: 'You are a helpful AI assistant.'
  });

  // Knowledge enhancement state
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [knowledgeText, setKnowledgeText] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // UI state
  const [showConfig, setShowConfig] = useState(false);
  const [showPublish, setShowPublish] = useState(false);

  // Publication state
  const [publicationData, setPublicationData] = useState<PublicationData>({
    name: '',
    description: '',
    category: '',
    tags: [],
    samplePrompts: [''],
    isPublic: true
  });
  const [newTag, setNewTag] = useState('');
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    // Estimate token count (rough approximation)
    const totalText = messages.map(m => m.content).join(' ') + inputMessage;
    setTokenCount(Math.ceil(totalText.length / 4));
  }, [messages, inputMessage]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Simulate API call to Gemini 1.5 Flash
      // In a real implementation, this would call your Supabase Edge Function
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateMockResponse(userMessage.content),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockResponse = (userInput: string): string => {
    const responses = [
      "I understand your question. Based on the context and configuration, here's my response...",
      "That's an interesting point. Let me provide you with a detailed explanation...",
      "I can help you with that. Here's what I think about your query...",
      "Thank you for your question. Based on my training and the system prompt, I would say...",
      "I appreciate you asking. Let me break this down for you step by step..."
    ];
    
    const baseResponse = responses[Math.floor(Math.random() * responses.length)];
    const elaboration = ` This response is generated using the current model configuration with temperature ${config.temperature}, top-p ${config.topP}, and considering the system prompt: "${config.systemPrompt.substring(0, 50)}..."`;
    
    return baseResponse + elaboration;
  };

  const resetConversation = () => {
    setMessages([]);
    setTokenCount(0);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    const validFiles = Array.from(files).filter(file => {
      const validTypes = ['application/pdf', 'text/plain', 'text/csv'];
      const maxSize = 50 * 1024 * 1024; // 50MB
      return validTypes.includes(file.type) && file.size <= maxSize;
    });

    if (uploadedFiles.length + validFiles.length <= 10) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

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
    handleFileUpload(e.dataTransfer.files);
  };

  const addTag = () => {
    if (newTag.trim() && publicationData.tags.length < 5 && !publicationData.tags.includes(newTag.trim())) {
      setPublicationData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setPublicationData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const addSamplePrompt = () => {
    if (publicationData.samplePrompts.length < 3) {
      setPublicationData(prev => ({
        ...prev,
        samplePrompts: [...prev.samplePrompts, '']
      }));
    }
  };

  const updateSamplePrompt = (index: number, value: string) => {
    setPublicationData(prev => ({
      ...prev,
      samplePrompts: prev.samplePrompts.map((prompt, i) => i === index ? value : prompt)
    }));
  };

  const removeSamplePrompt = (index: number) => {
    setPublicationData(prev => ({
      ...prev,
      samplePrompts: prev.samplePrompts.filter((_, i) => i !== index)
    }));
  };

  const handlePublish = async () => {
    if (!publicationData.name.trim() || !publicationData.description.trim() || !publicationData.category) {
      return;
    }

    setPublishing(true);
    try {
      // Simulate publishing process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would save to Supabase
      console.log('Publishing model:', {
        ...publicationData,
        config,
        knowledgeFiles: uploadedFiles.map(f => f.name),
        knowledgeText,
        userId: user?.id
      });

      // Show success and redirect
      alert('Model published successfully!');
      navigate('/marketplace');
    } catch (error) {
      console.error('Error publishing model:', error);
      alert('Error publishing model. Please try again.');
    } finally {
      setPublishing(false);
      setShowPublish(false);
    }
  };

  if (!user) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold gradient-text mb-4">Authentication Required</h2>
          <p className="text-white/70">Please sign in to test AI models.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col">
      {/* Main Content - Fills entire space */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full py-6">
            {/* Configuration Panel */}
            {showConfig && (
              <div className="lg:col-span-1">
                <div className="glass-strong rounded-2xl p-6 grain-texture space-y-6 h-full overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold gradient-text">Configuration</h3>
                    <button
                      onClick={() => {
                        setConfig({
                          temperature: 0.7,
                          topP: 0.9,
                          maxTokens: 1024,
                          systemPrompt: 'You are a helpful AI assistant.'
                        });
                      }}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      Reset to Defaults
                    </button>
                  </div>

                  {/* Temperature */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Temperature: {config.temperature}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={config.temperature}
                      onChange={(e) => setConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-white/50 mt-1">
                      <span>Focused</span>
                      <span>Creative</span>
                    </div>
                  </div>

                  {/* Top-p */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Top-p: {config.topP}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={config.topP}
                      onChange={(e) => setConfig(prev => ({ ...prev, topP: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                  </div>

                  {/* Max Tokens */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Max Tokens
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="4096"
                      value={config.maxTokens}
                      onChange={(e) => setConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                      className="glass-input w-full px-3 py-2 rounded-xl"
                    />
                  </div>

                  {/* System Prompt */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      System Prompt ({config.systemPrompt.length}/1000)
                    </label>
                    <textarea
                      value={config.systemPrompt}
                      onChange={(e) => {
                        if (e.target.value.length <= 1000) {
                          setConfig(prev => ({ ...prev, systemPrompt: e.target.value }));
                        }
                      }}
                      rows={4}
                      className="glass-input w-full px-3 py-2 rounded-xl resize-none"
                      placeholder="Define how the AI should behave..."
                    />
                  </div>

                  {/* Knowledge Enhancement */}
                  <div className="border-t border-white/10 pt-6">
                    <h4 className="text-sm font-semibold text-white/80 mb-4">Knowledge Enhancement</h4>
                    
                    {/* File Upload */}
                    <div
                      className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors mb-4 ${
                        dragActive ? 'border-purple-400 bg-purple-400/10' : 'border-white/20 hover:border-white/30'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('knowledge-files')?.click()}
                    >
                      <input
                        id="knowledge-files"
                        type="file"
                        multiple
                        accept=".pdf,.txt,.csv"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                      />
                      <Upload className="w-6 h-6 mx-auto mb-2 text-white/50" />
                      <p className="text-sm text-white/70">
                        Drop files or click to upload
                      </p>
                      <p className="text-xs text-white/50 mt-1">
                        PDF, TXT, CSV (max 10 files, 50MB each)
                      </p>
                    </div>

                    {/* Uploaded Files */}
                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between glass-subtle rounded-lg p-2">
                            <div className="flex items-center">
                              <FileText className="w-4 h-4 mr-2 text-white/50" />
                              <span className="text-sm text-white/80 truncate">{file.name}</span>
                            </div>
                            <button
                              onClick={() => removeFile(index)}
                              className="text-white/50 hover:text-red-400 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Text Input */}
                    <textarea
                      value={knowledgeText}
                      onChange={(e) => setKnowledgeText(e.target.value)}
                      rows={3}
                      className="glass-input w-full px-3 py-2 rounded-xl resize-none"
                      placeholder="Or paste text directly here..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Chat Interface */}
            <div className={`${showConfig ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
              <div className="glass-strong rounded-2xl overflow-hidden grain-texture h-full flex flex-col">
                {/* Integrated Header - Now part of chat interface */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
                  {/* Left side - AI Assistant info */}
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-xl icon-bg-primary flex items-center justify-center mr-3 glow-effect">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold gradient-text">AI Model Tester</h3>
                      <p className="text-sm text-white/60">Powered by Gemini 1.5 Flash</p>
                    </div>
                  </div>

                  {/* Center - Status indicators */}
                  <div className="hidden md:flex items-center space-x-4">
                    <div className="flex items-center space-x-2 glass-subtle px-3 py-2 rounded-xl">
                      <Clock className="w-4 h-4 text-white/60" />
                      <span className="text-sm text-white/80">{tokenCount} tokens</span>
                    </div>
                    <div className="flex items-center space-x-2 glass-subtle px-3 py-2 rounded-xl">
                      <MessageSquare className="w-4 h-4 text-white/60" />
                      <span className="text-sm text-white/80">{messages.length} messages</span>
                    </div>
                  </div>

                  {/* Right side - Action buttons */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={resetConversation}
                      className="flex items-center px-3 py-2 glass-subtle rounded-xl hover:glass transition-all duration-300 text-white/80 hover:text-white"
                      title="Reset conversation"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Reset</span>
                    </button>
                    
                    <button
                      onClick={() => setShowConfig(!showConfig)}
                      className={`flex items-center px-3 py-2 rounded-xl transition-all duration-300 ${
                        showConfig ? 'button-primary' : 'glass-subtle hover:glass'
                      } text-white`}
                      title="Configure model"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Configure</span>
                    </button>
                    
                    <button
                      onClick={() => setShowPublish(true)}
                      className="flex items-center px-3 py-2 rounded-xl button-primary text-white transition-all duration-300 hover:scale-105"
                      title="Publish model"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Publish</span>
                    </button>
                  </div>
                </div>

                {/* Mobile status indicators */}
                <div className="md:hidden flex items-center justify-center space-x-4 px-6 py-3 border-b border-white/10">
                  <div className="flex items-center space-x-2 glass-subtle px-3 py-1 rounded-lg">
                    <Clock className="w-3 h-3 text-white/60" />
                    <span className="text-xs text-white/80">{tokenCount} tokens</span>
                  </div>
                  <div className="flex items-center space-x-2 glass-subtle px-3 py-1 rounded-lg">
                    <MessageSquare className="w-3 h-3 text-white/60" />
                    <span className="text-xs text-white/80">{messages.length} messages</span>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 text-white/30" />
                      <p className="text-white/60">Start a conversation to test your AI model</p>
                      <p className="text-white/40 text-sm mt-2">Configure your model settings and begin testing</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-3xl ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                          <div className="flex items-start space-x-3">
                            {message.role === 'assistant' && (
                              <div className="w-8 h-8 rounded-lg icon-bg-primary flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4 text-white" />
                              </div>
                            )}
                            <div className={`rounded-2xl p-4 ${
                              message.role === 'user' 
                                ? 'button-primary text-white' 
                                : 'glass-subtle text-white/90'
                            }`}>
                              <p className="whitespace-pre-wrap">{message.content}</p>
                              <p className="text-xs opacity-60 mt-2">
                                {message.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                            {message.role === 'user' && (
                              <div className="w-8 h-8 rounded-lg glass-subtle flex items-center justify-center flex-shrink-0">
                                <UserIcon className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-lg icon-bg-primary flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="glass-subtle rounded-2xl p-4">
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-6 border-t border-white/10 flex-shrink-0">
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 glass-input px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500"
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      className="button-primary px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Publish Modal */}
      {showPublish && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-strong rounded-2xl p-6 w-full max-w-2xl max-h-[50vh] overflow-y-auto grain-texture">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold gradient-text">Publish Model</h2>
              <button
                onClick={() => setShowPublish(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Required Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Model Name *
                  </label>
                  <input
                    type="text"
                    value={publicationData.name}
                    onChange={(e) => setPublicationData(prev => ({ ...prev, name: e.target.value }))}
                    className="glass-input w-full px-3 py-2 rounded-xl"
                    placeholder="Enter model name (3-50 characters)"
                    minLength={3}
                    maxLength={50}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Category *
                  </label>
                  <select
                    value={publicationData.category}
                    onChange={(e) => setPublicationData(prev => ({ ...prev, category: e.target.value }))}
                    className="glass-input w-full px-3 py-2 rounded-xl"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Description * ({publicationData.description.length}/500)
                </label>
                <textarea
                  value={publicationData.description}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      setPublicationData(prev => ({ ...prev, description: e.target.value }));
                    }
                  }}
                  rows={3}
                  className="glass-input w-full px-3 py-2 rounded-xl resize-none"
                  placeholder="Describe what your model does (50-500 characters)"
                  minLength={50}
                  maxLength={500}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Tags (max 5)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {publicationData.tags.map((tag, index) => (
                    <span key={index} className="flex items-center glass-subtle px-3 py-1 rounded-full text-sm">
                      {tag}
                      <button
                        onClick={() => removeTag(index)}
                        className="ml-2 text-white/50 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                {publicationData.tags.length < 5 && (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      className="glass-input flex-1 px-3 py-2 rounded-xl"
                      placeholder="Add a tag"
                    />
                    <button
                      onClick={addTag}
                      className="glass-subtle px-4 py-2 rounded-xl hover:glass transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Sample Prompts */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Sample Prompts (max 3)
                </label>
                <div className="space-y-2">
                  {publicationData.samplePrompts.map((prompt, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        value={prompt}
                        onChange={(e) => updateSamplePrompt(index, e.target.value)}
                        className="glass-input flex-1 px-3 py-2 rounded-xl"
                        placeholder={`Sample prompt ${index + 1}`}
                      />
                      {publicationData.samplePrompts.length > 1 && (
                        <button
                          onClick={() => removeSamplePrompt(index)}
                          className="text-white/50 hover:text-red-400 transition-colors p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {publicationData.samplePrompts.length < 3 && (
                    <button
                      onClick={addSamplePrompt}
                      className="flex items-center glass-subtle px-4 py-2 rounded-xl hover:glass transition-colors text-white/80"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Sample Prompt
                    </button>
                  )}
                </div>
              </div>

              {/* Visibility */}
              <div className="flex items-center justify-between glass-subtle rounded-xl p-4">
                <div>
                  <h4 className="font-medium text-white">Visibility</h4>
                  <p className="text-sm text-white/60">
                    {publicationData.isPublic ? 'Public - Anyone can discover and use' : 'Private - Only you can access'}
                  </p>
                </div>
                <button
                  onClick={() => setPublicationData(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                  className="flex items-center text-white/80 hover:text-white transition-colors"
                >
                  {publicationData.isPublic ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>

              {/* Terms */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1"
                  required
                />
                <label htmlFor="terms" className="text-sm text-white/70">
                  I agree to the Terms of Service and confirm that I have the right to publish this model configuration.
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-white/10">
                <button
                  onClick={() => setShowPublish(false)}
                  className="px-6 py-3 glass-subtle rounded-xl hover:glass transition-colors text-white/80"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePublish}
                  disabled={publishing || !publicationData.name.trim() || !publicationData.description.trim() || !publicationData.category}
                  className="button-primary px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {publishing ? 'Publishing...' : 'Publish to Marketplace'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}