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
  BookOpen,
  Database,
  Check,
  RotateCcw as Reset
} from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { MockModelManager, PREDEFINED_MODELS, type ModelDefinition } from '../lib/gemini';

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
  const navigate = useNavigate();
  useScrollReveal();

  // Model management
  const [modelManager] = useState(() => new MockModelManager());
  const [selectedModelId, setSelectedModelId] = useState('general-assistant');
  const [selectedModel, setSelectedModel] = useState<ModelDefinition | undefined>(
    () => PREDEFINED_MODELS.find(m => m.id === 'general-assistant')
  );

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenCount, setTokenCount] = useState(0);

  // Configuration state with original values for cancel functionality
  const [config, setConfig] = useState<ModelConfig>({
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 1024
  });
  const [originalConfig, setOriginalConfig] = useState<ModelConfig>({
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 1024
  });

  // Enhanced knowledge enhancement state with original values
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [knowledgeText, setKnowledgeText] = useState('');
  const [knowledgeTitle, setKnowledgeTitle] = useState('');
  const [knowledgeDescription, setKnowledgeDescription] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Original knowledge state for cancel functionality
  const [originalKnowledge, setOriginalKnowledge] = useState({
    files: [] as File[],
    text: '',
    title: '',
    description: ''
  });

  // UI state
  const [showConfig, setShowConfig] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [configChanged, setConfigChanged] = useState(false);

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

  // Update config when model changes
  useEffect(() => {
    const model = modelManager.getModel(selectedModelId);
    if (model) {
      setSelectedModel(model);
      const newConfig = model.defaultConfig;
      setConfig(newConfig);
      setOriginalConfig(newConfig);
    }
  }, [selectedModelId, modelManager]);

  // Check if configuration has changed
  useEffect(() => {
    const hasConfigChanged = 
      config.temperature !== originalConfig.temperature ||
      config.topP !== originalConfig.topP ||
      config.maxTokens !== originalConfig.maxTokens ||
      knowledgeText !== originalKnowledge.text ||
      knowledgeTitle !== originalKnowledge.title ||
      knowledgeDescription !== originalKnowledge.description ||
      uploadedFiles.length !== originalKnowledge.files.length ||
      uploadedFiles.some((file, index) => file.name !== originalKnowledge.files[index]?.name);
    
    setConfigChanged(hasConfigChanged);
  }, [config, originalConfig, knowledgeText, knowledgeTitle, knowledgeDescription, uploadedFiles, originalKnowledge]);

  useEffect(() => {
    // Estimate token count (rough approximation)
    const totalText = messages.map(m => m.content).join(' ') + inputMessage;
    setTokenCount(Math.ceil(totalText.length / 4));
  }, [messages, inputMessage]);

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
      // Prepare enhanced knowledge context
      let knowledgeContext = '';
      
      if (knowledgeTitle.trim()) {
        knowledgeContext += `Knowledge Base: ${knowledgeTitle.trim()}\n`;
      }
      
      if (knowledgeDescription.trim()) {
        knowledgeContext += `Description: ${knowledgeDescription.trim()}\n`;
      }
      
      if (knowledgeText.trim()) {
        knowledgeContext += `\nContent:\n${knowledgeText.trim()}`;
      }
      
      if (uploadedFiles.length > 0) {
        knowledgeContext += '\n\nUploaded files: ' + uploadedFiles.map(f => f.name).join(', ');
      }

      // Generate response using the selected model
      const response = await modelManager.generateResponse(
        selectedModelId,
        [...messages, userMessage],
        config,
        knowledgeContext.trim() || undefined
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
        content: 'Sorry, I encountered an error. Please try again.',
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

  // Configuration save/cancel handlers
  const handleSaveConfig = () => {
    setOriginalConfig({ ...config });
    setOriginalKnowledge({
      files: [...uploadedFiles],
      text: knowledgeText,
      title: knowledgeTitle,
      description: knowledgeDescription
    });
    setConfigChanged(false);
  };

  const handleCancelConfig = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Reset all configuration to original values
    setConfig({ ...originalConfig });
    setKnowledgeText(originalKnowledge.text);
    setKnowledgeTitle(originalKnowledge.title);
    setKnowledgeDescription(originalKnowledge.description);
    setUploadedFiles([...originalKnowledge.files]);
    setConfigChanged(false);
  };

  const handleResetToDefaults = () => {
    if (selectedModel) {
      setConfig(selectedModel.defaultConfig);
      setKnowledgeText('');
      setKnowledgeTitle('');
      setKnowledgeDescription('');
      setUploadedFiles([]);
    }
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
      
      // In a real implementation, this would save to local storage or a simple database
      console.log('Publishing model:', {
        ...publicationData,
        config,
        knowledgeFiles: uploadedFiles.map(f => f.name),
        knowledgeText,
        knowledgeTitle,
        knowledgeDescription,
        publishedAt: new Date().toISOString()
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

  return (
    <div className="fixed inset-0 flex flex-col pt-16">
      {/* Main Content - Fills remaining space below navbar */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full py-6">
            {/* Ultra-Compact Configuration Panel with 2-Column Layout */}
            {showConfig && (
              <div className="lg:col-span-1">
                <div className="glass-strong rounded-2xl grain-texture h-full flex flex-col max-h-[calc(100vh-8rem)]">
                  {/* Compact Header */}
                  <div className="flex items-center justify-between p-3 border-b border-white/10 flex-shrink-0">
                    <h3 className="text-base font-semibold gradient-text">Config</h3>
                    <button
                      onClick={handleResetToDefaults}
                      className="text-xs text-white/60 hover:text-white transition-colors flex items-center"
                      title="Reset to defaults"
                    >
                      <Reset className="w-3 h-3 mr-1" />
                      Reset
                    </button>
                  </div>

                  {/* Scrollable Content - Ultra Compact with 2-Column Layout */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm">
                    {/* Model Selection - Full Width */}
                    <div>
                      <label className="block text-xs font-medium text-white/80 mb-1">Model</label>
                      <button
                        onClick={() => setShowModelSelector(true)}
                        className="w-full glass-input px-2 py-1.5 rounded-lg text-left flex items-center justify-between text-xs"
                      >
                        <span className="truncate">{selectedModel?.name || 'Select'}</span>
                        <Zap className="w-3 h-3 text-white/50 flex-shrink-0" />
                      </button>
                    </div>

                    {/* Model Parameters - 2-Column Layout */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-white/80 border-b border-white/10 pb-1">Parameters</h4>
                      
                      {/* Temperature & Top-p in 2 columns */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-xs text-white/70">Temp</label>
                            <span className="text-xs text-white/90 font-mono">{config.temperature}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={config.temperature}
                            onChange={(e) => setConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                            className="w-full h-1"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-xs text-white/70">Top-p</label>
                            <span className="text-xs text-white/90 font-mono">{config.topP}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={config.topP}
                            onChange={(e) => setConfig(prev => ({ ...prev, topP: parseFloat(e.target.value) }))}
                            className="w-full h-1"
                          />
                        </div>
                      </div>

                      {/* Max Tokens - Full Width */}
                      <div>
                        <label className="block text-xs text-white/70 mb-1">Max Tokens</label>
                        <input
                          type="number"
                          min="1"
                          max="4096"
                          value={config.maxTokens}
                          onChange={(e) => setConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                          className="glass-input w-full px-2 py-1 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    {/* Knowledge Base - 2-Column Layout where applicable */}
                    <div className="space-y-2">
                      <div className="flex items-center border-b border-white/10 pb-1">
                        <Database className="w-3 h-3 mr-1 text-white/80" />
                        <h4 className="text-xs font-semibold text-white/80">Knowledge</h4>
                      </div>
                      
                      {/* Title & Description in 2 columns */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-white/70 mb-1">Title</label>
                          <input
                            type="text"
                            value={knowledgeTitle}
                            onChange={(e) => setKnowledgeTitle(e.target.value)}
                            className="glass-input w-full px-2 py-1 rounded-lg text-xs"
                            placeholder="KB name"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-white/70 mb-1">Type</label>
                          <select
                            className="glass-input w-full px-2 py-1 rounded-lg text-xs"
                            defaultValue=""
                          >
                            <option value="">General</option>
                            <option value="technical">Technical</option>
                            <option value="creative">Creative</option>
                            <option value="business">Business</option>
                          </select>
                        </div>
                      </div>

                      {/* Description - Full Width */}
                      <div>
                        <label className="block text-xs text-white/70 mb-1">Description</label>
                        <textarea
                          value={knowledgeDescription}
                          onChange={(e) => setKnowledgeDescription(e.target.value)}
                          rows={2}
                          className="glass-input w-full px-2 py-1 rounded-lg resize-none text-xs"
                          placeholder="Brief description"
                        />
                      </div>

                      {/* Content - Full Width */}
                      <div>
                        <label className="block text-xs text-white/70 mb-1">
                          Content ({knowledgeText.length}/5000)
                        </label>
                        <textarea
                          value={knowledgeText}
                          onChange={(e) => {
                            if (e.target.value.length <= 5000) {
                              setKnowledgeText(e.target.value);
                            }
                          }}
                          rows={3}
                          className="glass-input w-full px-2 py-1 rounded-lg resize-none text-xs"
                          placeholder="Knowledge content..."
                        />
                      </div>
                      
                      {/* Files & Status in 2 columns */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* Ultra Compact File Upload */}
                        <div>
                          <label className="block text-xs text-white/70 mb-1">Files</label>
                          <div
                            className={`border border-dashed rounded-lg p-2 text-center cursor-pointer transition-colors text-xs ${
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
                            <Upload className="w-3 h-3 mx-auto mb-1 text-white/50" />
                            <p className="text-xs text-white/70">Upload</p>
                          </div>
                        </div>

                        {/* Knowledge Status */}
                        <div>
                          <label className="block text-xs text-white/70 mb-1">Status</label>
                          {(knowledgeText.trim() || uploadedFiles.length > 0 || knowledgeTitle.trim()) ? (
                            <div className="glass-subtle rounded-lg p-2">
                              <div className="flex items-center mb-1">
                                <BookOpen className="w-3 h-3 mr-1 text-green-400" />
                                <span className="text-xs font-medium text-green-400">Active</span>
                              </div>
                              <div className="text-xs text-white/60">
                                {knowledgeTitle.trim() && <div>• {knowledgeTitle}</div>}
                                {knowledgeText.trim() && <div>• {knowledgeText.length} chars</div>}
                                {uploadedFiles.length > 0 && <div>• {uploadedFiles.length} files</div>}
                              </div>
                            </div>
                          ) : (
                            <div className="glass-subtle rounded-lg p-2 text-center">
                              <span className="text-xs text-white/50">Inactive</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* File List - Full Width, Compact */}
                      {uploadedFiles.length > 0 && (
                        <div className="space-y-1 max-h-12 overflow-y-auto">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between glass-subtle rounded p-1 text-xs">
                              <span className="text-white/80 truncate flex-1 mr-1">{file.name}</span>
                              <button
                                onClick={() => removeFile(index)}
                                className="text-white/50 hover:text-red-400 transition-colors flex-shrink-0"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Save/Cancel Actions - Always Visible with Fixed Positioning */}
                  <div className="p-3 border-t border-white/10 flex-shrink-0 relative z-10">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={handleCancelConfig}
                        disabled={!configChanged}
                        className="glass-subtle px-2 py-1.5 rounded-lg hover:glass transition-colors text-white/80 text-xs disabled:opacity-50 disabled:cursor-not-allowed relative z-20"
                        style={{ pointerEvents: 'auto' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveConfig}
                        disabled={!configChanged}
                        className="button-primary px-2 py-1.5 rounded-lg text-white text-xs flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed relative z-20"
                        style={{ pointerEvents: 'auto' }}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Save
                      </button>
                    </div>
                    {configChanged && (
                      <p className="text-xs text-orange-400 mt-1 text-center">Unsaved changes</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Chat Interface - Increased height */}
            <div className={`${showConfig ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
              <div className="glass-strong rounded-2xl overflow-hidden grain-texture h-full flex flex-col">
                {/* Integrated Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
                  {/* Left side - AI Assistant info */}
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-xl icon-bg-primary flex items-center justify-center mr-3 glow-effect">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold gradient-text">{selectedModel?.name || 'AI Model Tester'}</h3>
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
                      className={`flex items-center px-3 py-2 rounded-xl transition-all duration-300 relative ${
                        showConfig ? 'button-primary' : 'glass-subtle hover:glass'
                      } text-white`}
                      title="Configure model"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Configure</span>
                      {configChanged && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full"></div>
                      )}
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
                  {(knowledgeText.trim() || uploadedFiles.length > 0) && (
                    <div className="flex items-center space-x-2 glass-subtle px-3 py-1 rounded-lg">
                      <Database className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-green-400">KB</span>
                    </div>
                  )}
                </div>

                {/* Messages - Increased height */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {messages.length === 0 ? (
                    <div className="text-center py-16">
                      <MessageSquare className="w-16 h-16 mx-auto mb-6 text-white/30" />
                      <h3 className="text-xl font-semibold gradient-text mb-4">Start Testing Your AI Model</h3>
                      <p className="text-white/60 mb-2">
                        Currently using: <span className="text-purple-400 font-medium">{selectedModel?.name}</span>
                      </p>
                      {(knowledgeText.trim() || uploadedFiles.length > 0) && (
                        <div className="inline-flex items-center px-4 py-2 glass-subtle rounded-xl mt-4">
                          <Database className="w-4 h-4 mr-2 text-green-400" />
                          <span className="text-sm text-green-400">Knowledge Base is active and ready</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-4xl ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                          <div className="flex items-start space-x-4">
                            {message.role === 'assistant' && (
                              <div className="w-10 h-10 rounded-xl icon-bg-primary flex items-center justify-center flex-shrink-0">
                                <Bot className="w-5 h-5 text-white" />
                              </div>
                            )}
                            <div className={`rounded-2xl p-6 ${
                              message.role === 'user' 
                                ? 'button-primary text-white' 
                                : 'glass-subtle text-white/90'
                            }`}>
                              <p className="whitespace-pre-wrap leading-relaxed text-base">{message.content}</p>
                              <p className="text-xs opacity-60 mt-3">
                                {message.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                            {message.role === 'user' && (
                              <div className="w-10 h-10 rounded-xl glass-subtle flex items-center justify-center flex-shrink-0">
                                <UserIcon className="w-5 h-5 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-xl icon-bg-primary flex items-center justify-center">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="glass-subtle rounded-2xl p-6">
                          <div className="flex space-x-2">
                            <div className="w-3 h-3 bg-white/50 rounded-full animate-bounce"></div>
                            <div className="w-3 h-3 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-3 h-3 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input - Enhanced spacing */}
                <div className="p-6 border-t border-white/10 flex-shrink-0">
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 glass-input px-6 py-4 rounded-xl focus:ring-2 focus:ring-purple-500 text-base"
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      className="button-primary px-8 py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
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

      {/* Model Selector Modal */}
      {showModelSelector && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-strong rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto grain-texture">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold gradient-text">Select AI Model</h2>
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

      {/* Publish Modal */}
      {showPublish && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-strong rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto grain-texture">
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