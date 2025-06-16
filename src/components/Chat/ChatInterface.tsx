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

  return (
    <div className="h-full flex flex-col">
      <div className="glass-strong rounded-2xl overflow-hidden grain-texture h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl icon-bg-primary flex items-center justify-center mr-3 glow-effect">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold gradient-text">{model.title}</h3>
              <p className="text-sm text-white/60">Interactive Chat</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-3">
              <div className="flex items-center space-x-2 glass-subtle px-3 py-2 rounded-xl">
                <MessageSquare className="w-4 h-4 text-white/60" />
                <span className="text-sm text-white/80">{messages.filter(m => !m.isLoading).length} messages</span>
              </div>
              
              {model.knowledge_context && (
                <div className="flex items-center space-x-2 glass-subtle px-3 py-2 rounded-xl">
                  <Database className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400">KB Active</span>
                </div>
              )}
            </div>
            
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
              <span className="hidden sm:inline">Config</span>
            </button>
          </div>
        </div>

        {/* Configuration Panel */}
        {showConfig && (
          <div className="p-6 border-b border-white/10 glass-subtle flex-shrink-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Messages Container - Fixed height with proper scrolling */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0"
          style={{ 
            height: '700px', // Fixed height
            maxHeight: '700px',
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
                    <div className="w-10 h-10 rounded-xl icon-bg-primary flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  
                  <div className={`rounded-2xl p-6 relative group ${
                    message.role === 'user' 
                      ? 'button-primary text-white' 
                      : 'glass-subtle text-white/90'
                  }`}>
                    {message.isLoading ? (
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-white/50 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-3 h-3 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
                                // Custom styling for markdown elements
                                code: ({ node, inline, className, children, ...props }) => {
                                  return inline ? (
                                    <code className="bg-white/10 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                                      {children}
                                    </code>
                                  ) : (
                                    <pre className="bg-white/5 p-4 rounded-lg overflow-x-auto">
                                      <code className="text-sm font-mono" {...props}>
                                        {children}
                                      </code>
                                    </pre>
                                  );
                                },
                                blockquote: ({ children }) => (
                                  <blockquote className="border-l-4 border-purple-400 pl-4 italic text-white/80">
                                    {children}
                                  </blockquote>
                                ),
                                table: ({ children }) => (
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full border-collapse border border-white/20">
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
                                  <ul className="list-disc list-inside space-y-2">
                                    {children}
                                  </ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="list-decimal list-inside space-y-2">
                                    {children}
                                  </ol>
                                ),
                                h1: ({ children }) => (
                                  <h1 className="text-xl font-bold gradient-text mb-3">
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
                                  <p className="mb-3 last:mb-0 break-words leading-relaxed">
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
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-xs opacity-60">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                          {message.role === 'assistant' && (
                            <button
                              onClick={() => copyMessage(message.id, message.content)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
                              title="Copy message"
                            >
                              {copiedMessageId === message.id ? (
                                <Check className="w-3 h-3 text-green-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="w-10 h-10 rounded-xl glass-subtle flex items-center justify-center flex-shrink-0">
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

        {/* Input - Fixed at bottom */}
        <div className="p-6 border-t border-white/10 flex-shrink-0">
          <div className="flex space-x-4">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Chat with ${model.title}...`}
              className="flex-1 glass-input px-6 py-4 rounded-xl focus:ring-2 focus:ring-purple-500 text-base"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="button-primary px-8 py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-3 text-xs text-white/50">
            <span>Press Enter to send, Shift+Enter for new line</span>
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