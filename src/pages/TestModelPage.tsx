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
  Sparkles,
  Zap,
  Database,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { ModelManager, PREDEFINED_MODELS, type ModelDefinition } from '../lib/gemini';
import { DatabaseService, type GPTSubmission } from '../lib/database';

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
}

interface PublicationData {
  name: string;
  description: string;
  category: string;
  tags: string[];
  licenseType: string;
  licenseText: string;
  documentationUrl: string;
  repositoryUrl: string;
  samplePrompts: string[];
  publisherName: string;
  publisherEmail: string;
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

const LICENSE_TYPES = [
  'MIT',
  'Apache 2.0',
  'GPL v3',
  'BSD 3-Clause',
  'Creative Commons',
  'Commercial',
  'Custom'
];

// Fixed API key for the application
const FIXED_API_KEY = 'AIzaSyCza_BCXf0cQyYTlgOMEG0t2SmhawS3xMQ'; // Replace with your actual API key

export function TestModelPage() {
  const navigate = useNavigate();
  useScrollReveal();

  // Model management - Initialize with fixed API key
  const [modelManager] = useState<ModelManager>(() => new ModelManager(FIXED_API_KEY));
  const [selectedModelId, setSelectedModelId] = useState('general-assistant');
  const [selectedModel, setSelectedModel] = useState<ModelDefinition | undefined>(
    () => PREDEFINED_MODELS.find(m => m.id === 'general-assistant')
  );

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenCount, setTokenCount] = useState(0);

  // Configuration state
  const [config, setConfig] = useState<ModelConfig>({
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 1024
  });

  // Knowledge enhancement state
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [knowledgeText, setKnowledgeText] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // UI state
  const [showConfig, setShowConfig] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);

  // Publication state
  const [publicationData, setPublicationData] = useState<PublicationData>({
    name: '',
    description: '',
    category: '',
    tags: [],
    licenseType: '',
    licenseText: '',
    documentationUrl: '',
    repositoryUrl: '',
    samplePrompts: [''],
    publisherName: '',
    publisherEmail: '',
    isPublic: true
  });
  const [newTag, setNewTag] = useState('');
  const [publishing, setPublishing] = useState(false);

  // Update config when model changes
  useEffect(() => {
    const model = modelManager.getModel(selectedModelId);
    if (model) {
      setSelectedModel(model);
      setConfig(model.defaultConfig);
    }
  }, [selectedModelId, modelManager]);

  useEffect(() => {
    // Estimate token count (rough approximation)
    const totalText = messages.map(m => m.content).join(' ') + inputMessage + knowledgeText;
    setTokenCount(Math.ceil(totalText.length / 4));
  }, [messages, inputMessage, knowledgeText]);

  const handleModelChange = (modelId: string) => {
    setSelectedModelId(modelId);
    setShowModelSelector(false);
    // Reset conversation when switching models
    setMessages([]);
  };

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
      // Prepare knowledge context
      let knowledgeContext = '';
      if (knowledgeText.trim()) {
        knowledgeContext = knowledgeText.trim();
      }

      // Generate response using the selected model with real Gemini API
      const response = await modelManager.generateResponse(
        selectedModelId,
        [...messages, userMessage],
        config,
        knowledgeContext || undefined,
        uploadedFiles.length > 0 ? uploadedFiles : undefined
      );
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetConversation = () => {
    setMessages([]);
    setTokenCount(0);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    const validFiles = Array.from(files).filter(file => {
      const validTypes = ['application/pdf', 'text/plain', 'text/csv', 'application/json', 'text/markdown'];
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
    if (newTag.trim() && publicationData.tags.length < 10 && !publicationData.tags.includes(newTag.trim())) {
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
    if (publicationData.samplePrompts.length < 5) {
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
    if (!publicationData.name.trim() || !publicationData.description.trim() || !publicationData.category || !selectedModel) {
      return;
    }

    setPublishing(true);
    try {
      // Prepare submission data
      const submission: GPTSubmission = {
        name: publicationData.name,
        description: publicationData.description,
        category: publicationData.category,
        tags: publicationData.tags,
        licenseType: publicationData.licenseType,
        licenseText: publicationData.licenseText || undefined,
        documentationUrl: publicationData.documentationUrl || undefined,
        repositoryUrl: publicationData.repositoryUrl || undefined,
        systemPrompt: selectedModel.systemPrompt,
        defaultConfig: config,
        knowledgeContext: knowledgeText || undefined,
        knowledgeFiles: uploadedFiles.map(f => ({
          name: f.name,
          size: f.size,
          type: f.type
        })),
        samplePrompts: publicationData.samplePrompts.filter(p => p.trim()),
        publisherName: publicationData.publisherName || undefined,
        publisherEmail: publicationData.publisherEmail || undefined,
        isPublic: publicationData.isPublic
      };

      // Submit to database
      const result = await DatabaseService.submitGPT(submission);

      if (result.success) {
        alert('GPT published successfully! It will be reviewed and appear in the marketplace once approved.');
        navigate('/marketplace');
      } else {
        alert(`Error publishing GPT: ${result.error}`);
      }
    } catch (error) {
      console.error('Error publishing GPT:', error);
      alert('Error publishing GPT. Please try again.');
    } finally {
      setPublishing(false);
      setShowPublish(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Configuration Panel */}
          {showConfig && (
            <div className="lg:col-span-1">
              <div className="glass-strong rounded-2xl p-6 grain-texture space-y-6 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold gradient-text">Configuration</h3>
                  <button
                    onClick={() => {
                      if (selectedModel) {
                        setConfig(selectedModel.defaultConfig);
                      }
                    }}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    Reset to Defaults
                  </button>
                </div>

                {/* Model Selection */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    AI GPT
                  </label>
                  <button
                    onClick={() => setShowModelSelector(true)}
                    className="w-full glass-input px-3 py-2 rounded-xl text-left flex items-center justify-between"
                  >
                    <span>{selectedModel?.name || 'Select GPT'}</span>
                    <Zap className="w-4 h-4 text-white/50" />
                  </button>
                  {selectedModel && (
                    <p className="text-xs text-white/60 mt-1">{selectedModel.description}</p>
                  )}
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

                {/* Knowledge Enhancement */}
                <div className="border-t border-white/10 pt-6">
                  <h4 className="text-sm font-semibold text-white/80 mb-4 flex items-center">
                    <Database className="w-4 h-4 mr-2" />
                    Knowledge Enhancement
                  </h4>
                  
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
                      accept=".pdf,.txt,.csv,.json,.md"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                    />
                    <Upload className="w-6 h-6 mx-auto mb-2 text-white/50" />
                    <p className="text-sm text-white/70">
                      Drop files or click to upload
                    </p>
                    <p className="text-xs text-white/50 mt-1">
                      PDF, TXT, CSV, JSON, MD (max 10 files, 50MB each)
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
                    rows={4}
                    className="glass-input w-full px-3 py-2 rounded-xl resize-none"
                    placeholder="Add context, instructions, or knowledge that will enhance the GPT's responses..."
                  />
                  <p className="text-xs text-white/50 mt-1">
                    This context will be included with every message to provide more relevant responses.
                  </p>
                </div>

                {/* API Status */}
                <div className="border-t border-white/10 pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-white/80">API Status</h4>
                    <div className="flex items-center text-green-400">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span className="text-xs">Ready</span>
                    </div>
                  </div>
                  <p className="text-xs text-white/60">
                    Using integrated Gemini 1.5 Flash API for real-time responses
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Chat Interface */}
          <div className={`${showConfig ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            <div className="glass-strong rounded-2xl overflow-hidden grain-texture">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                {/* Left side - AI Assistant info */}
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-xl icon-bg-primary flex items-center justify-center mr-3 glow-effect">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold gradient-text">{selectedModel?.name || 'AI GPT Tester'}</h3>
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
                  {(knowledgeText.trim() || uploadedFiles.length > 0) && (
                    <div className="flex items-center space-x-2 glass-subtle px-3 py-2 rounded-xl">
                      <Database className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-400">KB Active</span>
                    </div>
                  )}
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
                    title="Configure GPT"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Configure</span>
                  </button>
                  
                  <button
                    onClick={() => setShowPublish(true)}
                    className="flex items-center px-3 py-2 rounded-xl button-primary text-white transition-all duration-300 hover:scale-105"
                    title="Publish GPT"
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
                {(knowledgeText.trim() || uploadedFiles.length > 0) && (
                  <div className="flex items-center space-x-2 glass-subtle px-3 py-1 rounded-lg">
                    <Database className="w-3 h-3 text-green-400" />
                    <span className="text-xs text-green-400">KB</span>
                  </div>
                )}
              </div>

              {/* Messages - Fixed height container */}
              <div 
                className="overflow-y-auto p-6 space-y-4"
                style={{ 
                  height: '500px',
                  maxHeight: '500px'
                }}
              >
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-white/30" />
                    <p className="text-white/60">Start a conversation to test your AI GPT</p>
                    <p className="text-white/40 text-sm mt-2">
                      Currently using: <span className="text-purple-400">{selectedModel?.name}</span>
                    </p>
                    {(knowledgeText.trim() || uploadedFiles.length > 0) && (
                      <div className="mt-4 flex items-center justify-center text-green-400">
                        <Database className="w-4 h-4 mr-2" />
                        <span className="text-sm">Knowledge base is active</span>
                      </div>
                    )}
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

              {/* Input - Fixed at bottom */}
              <div className="p-6 border-t border-white/10">
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

      {/* Model Selector Modal */}
      {showModelSelector && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-strong rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto grain-texture">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold gradient-text">Select AI GPT</h2>
              <button
                onClick={() => setShowModelSelector(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PREDEFINED_MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleModelChange(model.id)}
                  className={`text-left p-4 rounded-xl transition-all duration-300 ${
                    selectedModelId === model.id
                      ? 'button-primary text-white'
                      : 'glass-subtle hover:glass text-white/90'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{model.name}</h3>
                    <span className="text-xs px-2 py-1 rounded-full glass-subtle">
                      {model.category}
                    </span>
                  </div>
                  <p className="text-sm opacity-80 mb-3">{model.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {model.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="text-xs px-2 py-1 rounded-full glass-subtle opacity-60">
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Publish Modal */}
      {showPublish && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-strong rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto grain-texture">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold gradient-text">Publish GPT to Marketplace</h2>
              <button
                onClick={() => setShowPublish(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    GPT Name * <span className="text-red-400">({publicationData.name.length}/100)</span>
                  </label>
                  <input
                    type="text"
                    value={publicationData.name}
                    onChange={(e) => setPublicationData(prev => ({ ...prev, name: e.target.value.slice(0, 100) }))}
                    className="glass-input w-full px-3 py-2 rounded-xl"
                    placeholder="Enter GPT name (3-100 characters)"
                    minLength={3}
                    maxLength={100}
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
                  Description * <span className="text-red-400">({publicationData.description.length}/1000)</span>
                </label>
                <textarea
                  value={publicationData.description}
                  onChange={(e) => {
                    if (e.target.value.length <= 1000) {
                      setPublicationData(prev => ({ ...prev, description: e.target.value }));
                    }
                  }}
                  rows={4}
                  className="glass-input w-full px-3 py-2 rounded-xl resize-none"
                  placeholder="Describe what your GPT does, its capabilities, and use cases (50-1000 characters)"
                  minLength={50}
                  maxLength={1000}
                />
              </div>

              {/* Licensing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    License Type *
                  </label>
                  <select
                    value={publicationData.licenseType}
                    onChange={(e) => setPublicationData(prev => ({ ...prev, licenseType: e.target.value }))}
                    className="glass-input w-full px-3 py-2 rounded-xl"
                  >
                    <option value="">Select license</option>
                    {LICENSE_TYPES.map(license => (
                      <option key={license} value={license}>{license}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Documentation URL
                  </label>
                  <input
                    type="url"
                    value={publicationData.documentationUrl}
                    onChange={(e) => setPublicationData(prev => ({ ...prev, documentationUrl: e.target.value }))}
                    className="glass-input w-full px-3 py-2 rounded-xl"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Publisher Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Publisher Name
                  </label>
                  <input
                    type="text"
                    value={publicationData.publisherName}
                    onChange={(e) => setPublicationData(prev => ({ ...prev, publisherName: e.target.value }))}
                    className="glass-input w-full px-3 py-2 rounded-xl"
                    placeholder="Your name or organization"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={publicationData.publisherEmail}
                    onChange={(e) => setPublicationData(prev => ({ ...prev, publisherEmail: e.target.value }))}
                    className="glass-input w-full px-3 py-2 rounded-xl"
                    placeholder="contact@example.com"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Tags (max 10)
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
                {publicationData.tags.length < 10 && (
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
                  Sample Prompts (max 5)
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
                  {publicationData.samplePrompts.length < 5 && (
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
                  I agree to the Terms of Service and confirm that I have the right to publish this GPT configuration. 
                  I understand that my GPT will be reviewed before appearing in the marketplace.
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
                  disabled={publishing || !publicationData.name.trim() || !publicationData.description.trim() || !publicationData.category || !publicationData.licenseType}
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