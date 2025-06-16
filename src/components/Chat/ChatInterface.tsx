import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  RotateCcw, 
  Settings, 
  MessageSquare, 
  Bot, 
  User as UserIcon, 
  Copy, 
  Check, 
  Zap, 
  Database,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Clock
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface ModelConfig {
  temperature: number;
  topP: number;
  maxTokens: number;
}

interface ChatModel {
  id: string;
  title: string;
  system_prompt: string;
  default_temperature: number;
  default_top_p: number;
  default_max_tokens: number;
  knowledge_context?: string;
}

interface ChatInterfaceProps {
  model: ChatModel;
}

function generateIntroduction(model: ChatModel): string {
  const introductions = {
    'General Assistant': "Hello! I'm your General Assistant, ready to help with questions, tasks, and provide clear, helpful information on a wide range of topics.",
    'Creative Writer': "Welcome! I'm here to help spark your creativity. Whether you need story ideas, character development, or writing inspiration, let's create something amazing together.",
    'Code Assistant': "Hi there! I'm your coding companion, ready to help with programming challenges, code reviews, debugging, and technical guidance across multiple languages and frameworks.",
    'Business Advisor': "Greetings! I'm your Business Advisor, here to provide strategic insights, market analysis, and professional guidance to help grow your business.",
    'Educational Tutor': "Hello, learner! I'm here to make complex topics simple and learning enjoyable. What would you like to explore today?",
    'Technical Support': "Hi! I'm your Technical Support specialist, ready to help troubleshoot issues and provide step-by-step solutions to get you back on track."
  };
  
  return introductions[model.title as keyof typeof introductions] || 
    `Hello! I'm ${model.title}, ready to assist you. How can I help today?`;
}

export function ChatInterface({ model }: ChatInterfaceProps) {
  // Chat state
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      content: generateIntroduction(model),
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Configuration state
  const [config, setConfig] = useState<ModelConfig>({
    temperature: model.default_temperature,
    topP: model.default_top_p,
    maxTokens: model.default_max_tokens
  });
  const [showConfig, setShowConfig] = useState(false);

  // Refs
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

    // Add loading message
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      // Simulate API call to Gemini with GPT configuration
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          message: inputMessage.trim(),
          config: {
            temperature: config.temperature,
            topP: config.topP,
            maxTokens: config.maxTokens,
            systemPrompt: model.system_prompt
          },
          knowledgeContext: model.knowledge_context,
          conversationHistory: messages.filter(m => !m.isLoading && m.id !== 'welcome').map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: data.response || 'I apologize, but I encountered an issue generating a response. Please try again.',
        timestamp: new Date()
      };

      // Remove loading message and add real response
      setMessages(prev => prev.filter(m => !m.isLoading).concat(assistantMessage));
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again in a moment.',
        timestamp: new Date()
      };
      
      setMessages(prev => prev.filter(m => !m.isLoading).concat(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const resetConversation = () => {
    const welcomeMessage: Message = {
      id: 'welcome-' + Date.now(),
      role: 'assistant',
      content: generateIntroduction(model),
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const copyMessage = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetToDefaults = () => {
    setConfig({
      temperature: model.default_temperature,
      topP: model.default_top_p,
      maxTokens: model.default_max_tokens
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="glass-strong rounded-2xl overflow-hidden grain-texture h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-xl icon-bg-primary flex items-center justify-center mr-4 glow-effect">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold gradient-text">{model.title}</h3>
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center text-sm text-white/60">
                  <Zap className="w-3 h-3 mr-1" />
                  <span>Gemini 1.5 Flash</span>
                </div>
                {model.knowledge_context && (
                  <div className="flex items-center text-sm text-green-400">
                    <Database className="w-3 h-3 mr-1" />
                    <span>Enhanced</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-3">
              <div className="flex items-center space-x-2 glass-subtle px-3 py-2 rounded-xl">
                <MessageSquare className="w-4 h-4 text-white/60" />
                <span className="text-sm text-white/80">{messages.filter(m => !m.isLoading).length}</span>
              </div>
              
              <div className="flex items-center space-x-2 glass-subtle px-3 py-2 rounded-xl">
                <Clock className="w-4 h-4 text-white/60" />
                <span className="text-sm text-white/80">Live</span>
              </div>
            </div>
            
            <button
              onClick={resetConversation}
              className="flex items-center px-4 py-2 glass-subtle rounded-xl hover:glass transition-all duration-300 text-white/80 hover:text-white"
              title="Reset conversation"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`flex items-center px-4 py-2 rounded-xl transition-all duration-300 ${
                showConfig ? 'button-primary' : 'glass-subtle hover:glass'
              } text-white`}
              title="Configure GPT"
            >
              <Settings className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Config</span>
              {showConfig ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
            </button>
          </div>
        </div>

        {/* Configuration Panel */}
        {showConfig && (
          <div className="p-6 border-b border-white/10 glass-subtle flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold gradient-text">Configuration</h4>
              <button
                onClick={resetToDefaults}
                className="text-sm text-white/60 hover:text-white transition-colors px-3 py-1 glass-subtle rounded-lg hover:glass"
              >
                Reset Defaults
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Temperature: <span className="text-purple-400 font-semibold">{config.temperature}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.temperature}
                  onChange={(e) => setConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-white/50 mt-2">
                  <span>Focused</span>
                  <span>Creative</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Top-p: <span className="text-purple-400 font-semibold">{config.topP}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.topP}
                  onChange={(e) => setConfig(prev => ({ ...prev, topP: parseFloat(e.target.value) }))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-white/50 mt-2">
                  <span>Precise</span>
                  <span>Diverse</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Max Tokens: <span className="text-purple-400 font-semibold">{config.maxTokens}</span>
                </label>
                <input
                  type="range"
                  min="256"
                  max="4096"
                  step="256"
                  value={config.maxTokens}
                  onChange={(e) => setConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-white/50 mt-2">
                  <span>Short</span>
                  <span>Long</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages Container - Increased height */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0"
          style={{ 
            height: '85vh', // 85% of the viewport height
            maxHeight: '85vh',
            scrollBehavior: 'smooth',
            overscrollBehavior: 'contain'
          }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                <div className="flex items-start space-x-4">
                  {message.role === 'assistant' && (
                    <div className="w-10 h-10 rounded-xl icon-bg-primary flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  
                  <div className={`rounded-2xl p-6 relative group shadow-lg ${
                    message.role === 'user' 
                      ? 'button-primary text-white' 
                      : 'glass-subtle text-white/90'
                  }`}>
                    {message.isLoading ? (
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 bg-white/50 rounded-full animate-bounce"></div>
                          <div className="w-3 h-3 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-3 h-3 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-white/70">Thinking...</span>
                      </div>
                    ) : (
                      <>
                        {message.role === 'user' ? (
                          <p className="whitespace-pre-wrap break-words leading-relaxed text-base">{message.content}</p>
                        ) : (
                          <div className="prose prose-invert prose-base max-w-none">
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                code: ({ node, inline, className, children, ...props }) => {
                                  return inline ? (
                                    <code className="bg-white/10 px-2 py-1 rounded text-sm font-mono" {...props}>
                                      {children}
                                    </code>
                                  ) : (
                                    <pre className="bg-white/5 p-4 rounded-lg overflow-x-auto border border-white/10">
                                      <code className="text-sm font-mono" {...props}>
                                        {children}
                                      </code>
                                    </pre>
                                  );
                                },
                                blockquote: ({ children }) => (
                                  <blockquote className="border-l-4 border-purple-400 pl-4 italic text-white/80 bg-white/5 py-2 rounded-r-lg">
                                    {children}
                                  </blockquote>
                                ),
                                table: ({ children }) => (
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full border-collapse border border-white/20 rounded-lg">
                                      {children}
                                    </table>
                                  </div>
                                ),
                                th: ({ children }) => (
                                  <th className="border border-white/20 px-3 py-2 bg-white/10 font-semibold text-left">
                                    {children}
                                  </th>
                                ),
                                td: ({ children }) => (
                                  <td className="border border-white/20 px-3 py-2">
                                    {children}
                                  </td>
                                ),
                                ul: ({ children }) => (
                                  <ul className="list-disc list-inside space-y-2 ml-4">
                                    {children}
                                  </ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="list-decimal list-inside space-y-2 ml-4">
                                    {children}
                                  </ol>
                                ),
                                h1: ({ children }) => (
                                  <h1 className="text-xl font-bold gradient-text mb-4">
                                    {children}
                                  </h1>
                                ),
                                h2: ({ children }) => (
                                  <h2 className="text-lg font-bold gradient-text mb-3">
                                    {children}
                                  </h2>
                                ),
                                h3: ({ children }) => (
                                  <h3 className="text-base font-bold gradient-text mb-2">
                                    {children}
                                  </h3>
                                ),
                                p: ({ children }) => (
                                  <p className="mb-4 last:mb-0 break-words leading-relaxed">
                                    {children}
                                  </p>
                                ),
                                strong: ({ children }) => (
                                  <strong className="font-bold text-white">
                                    {children}
                                  </strong>
                                ),
                                em: ({ children }) => (
                                  <em className="italic text-white/90">
                                    {children}
                                  </em>
                                ),
                                hr: () => (
                                  <hr className="border-white/20 my-6" />
                                )
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
                          <p className="text-xs text-white/50">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                          {message.role === 'assistant' && (
                            <button
                              onClick={() => copyMessage(message.id, message.content)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/10 rounded-lg"
                              title="Copy message"
                            >
                              {copiedMessageId === message.id ? (
                                <Check className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4 text-white/60 hover:text-white" />
                              )}
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="w-10 h-10 rounded-xl glass-subtle flex items-center justify-center flex-shrink-0 shadow-lg">
                      <UserIcon className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {/* Invisible element for auto-scroll reference */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input - Fixed at bottom with better styling */}
        <div className="p-6 border-t border-white/10 flex-shrink-0 bg-gradient-to-t from-black/20 to-transparent">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${model.title}...`}
                className="w-full glass-input px-6 py-4 rounded-xl focus:ring-2 focus:ring-purple-500 text-base placeholder-white/50 border border-white/10 focus:border-purple-400 transition-all duration-300"
                disabled={isLoading}
              />
              {inputMessage && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-white/40">
                  {inputMessage.length}/2000
                </div>
              )}
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="button-primary px-8 py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 shadow-lg flex items-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-4 text-xs text-white/50">
            <div className="flex items-center space-x-4">
              <span>Press Enter to send, Shift+Enter for new line</span>
              {model.knowledge_context && (
                <div className="flex items-center space-x-1 text-green-400">
                  <Database className="w-3 h-3" />
                  <span>Knowledge Enhanced</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-3 h-3" />
              <span>Powered by Gemini 1.5 Flash</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}