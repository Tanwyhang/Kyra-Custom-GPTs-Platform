/**
 * Enhanced Gemini API wrapper with proper knowledge base and context handling
 */

interface ModelConfig {
  temperature: number;
  topP: number;
  maxTokens: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ModelDefinition {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  defaultConfig: ModelConfig;
  category: string;
  tags: string[];
}

/**
 * Enhanced Gemini API wrapper class with knowledge base support
 */
export class GeminiWrapper {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Generate response using Gemini API with enhanced context handling
   */
  async generateResponse(
    messages: Message[],
    systemPrompt: string,
    config: ModelConfig,
    knowledgeContext?: string,
    uploadedFiles?: File[]
  ): Promise<string> {
    try {
      // Build comprehensive prompt with system context
      let fullPrompt = systemPrompt;

      // Add knowledge context if provided
      if (knowledgeContext && knowledgeContext.trim()) {
        fullPrompt += `\n\n=== KNOWLEDGE BASE ===\n${knowledgeContext.trim()}\n=== END KNOWLEDGE BASE ===`;
      }

      // Add file context if files are uploaded
      if (uploadedFiles && uploadedFiles.length > 0) {
        fullPrompt += `\n\n=== UPLOADED FILES CONTEXT ===\n`;
        fullPrompt += `The user has uploaded ${uploadedFiles.length} file(s): `;
        fullPrompt += uploadedFiles.map(f => `"${f.name}" (${f.type}, ${this.formatFileSize(f.size)})`).join(', ');
        fullPrompt += `\nUse this information to provide more contextual and relevant responses.`;
        fullPrompt += `\n=== END FILES CONTEXT ===`;
      }

      // Add conversation history with proper formatting
      if (messages.length > 0) {
        fullPrompt += '\n\n=== CONVERSATION HISTORY ===';
        messages.forEach((msg, index) => {
          const role = msg.role === 'user' ? 'Human' : 'Assistant';
          fullPrompt += `\n\n${role}: ${msg.content}`;
        });
        fullPrompt += '\n=== END CONVERSATION HISTORY ===';
      }

      // Get the latest user message
      const latestMessage = messages[messages.length - 1];
      if (latestMessage?.role === 'user') {
        fullPrompt += `\n\nCurrent Human Message: ${latestMessage.content}`;
        fullPrompt += `\n\nAssistant Response:`;
      }

      // Make API call to Gemini
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }],
          generationConfig: {
            temperature: config.temperature,
            topP: config.topP,
            maxOutputTokens: config.maxTokens,
            candidateCount: 1,
            stopSequences: []
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Gemini API error:', response.status, errorData);
        throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      // Extract response with better error handling
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!responseText) {
        console.error('No response text from Gemini:', data);
        throw new Error('No response generated from Gemini API');
      }

      return responseText;
    } catch (error) {
      console.error('Gemini API error:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('API_KEY')) {
          throw new Error('Invalid API key. Please check your Gemini API configuration.');
        } else if (error.message.includes('QUOTA')) {
          throw new Error('API quota exceeded. Please try again later.');
        } else if (error.message.includes('RATE_LIMIT')) {
          throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
        }
      }
      
      throw new Error('Failed to generate response. Please try again.');
    }
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}

/**
 * Context-based model definitions
 */
export const PREDEFINED_MODELS: ModelDefinition[] = [
  {
    id: 'general-assistant',
    name: 'General Assistant',
    description: 'A helpful AI assistant for general questions and tasks',
    systemPrompt: 'You are a helpful, knowledgeable, and friendly AI assistant. Provide clear, accurate, and helpful responses to user questions. Be concise but thorough in your explanations. Use the knowledge base and context provided to give more relevant and informed answers.',
    defaultConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxTokens: 1024
    },
    category: 'Conversational AI',
    tags: ['general', 'assistant', 'helpful']
  },
  {
    id: 'creative-writer',
    name: 'Creative Writer',
    description: 'An AI specialized in creative writing and storytelling',
    systemPrompt: 'You are a creative writing assistant with expertise in storytelling, poetry, and creative content. Help users craft engaging narratives, develop characters, and explore creative ideas. Be imaginative and inspiring while maintaining literary quality. Use any provided knowledge base to enhance your creative suggestions with relevant context and inspiration.',
    defaultConfig: {
      temperature: 0.9,
      topP: 0.95,
      maxTokens: 2048
    },
    category: 'Creative Writing',
    tags: ['creative', 'writing', 'storytelling', 'poetry']
  },
  {
    id: 'code-assistant',
    name: 'Code Assistant',
    description: 'A programming expert for code help and technical guidance',
    systemPrompt: 'You are an expert programming assistant with deep knowledge of multiple programming languages, frameworks, and best practices. Help users with coding problems, explain programming concepts, review code, and provide technical guidance. Focus on clean code, best practices, and practical solutions. Use any provided documentation or code files to give more specific and contextual assistance.',
    defaultConfig: {
      temperature: 0.3,
      topP: 0.8,
      maxTokens: 1536
    },
    category: 'Code Assistant',
    tags: ['programming', 'code', 'technical', 'development']
  },
  {
    id: 'business-advisor',
    name: 'Business Advisor',
    description: 'An AI consultant for business strategy and professional advice',
    systemPrompt: 'You are a senior business consultant and advisor with expertise in strategy, operations, marketing, and professional development. Provide practical business advice, help with decision-making, and offer insights on industry trends. Be professional and data-driven in your responses. Use any provided business documents or context to give more targeted and relevant advice.',
    defaultConfig: {
      temperature: 0.5,
      topP: 0.85,
      maxTokens: 1280
    },
    category: 'Business Assistant',
    tags: ['business', 'strategy', 'consulting', 'professional']
  },
  {
    id: 'educational-tutor',
    name: 'Educational Tutor',
    description: 'A patient tutor for learning and educational support',
    systemPrompt: 'You are an educational tutor who helps students learn various subjects. Break down complex topics into understandable parts, provide examples, and encourage learning. Be patient, supportive, and adapt your teaching style to the student\'s needs. Focus on understanding rather than just providing answers. Use any provided educational materials or context to create more personalized learning experiences.',
    defaultConfig: {
      temperature: 0.6,
      topP: 0.9,
      maxTokens: 1536
    },
    category: 'Educational',
    tags: ['education', 'tutor', 'learning', 'teaching']
  },
  {
    id: 'technical-support',
    name: 'Technical Support',
    description: 'A technical expert for troubleshooting and IT support',
    systemPrompt: 'You are a technical support specialist with expertise in troubleshooting software, hardware, and IT issues. Provide step-by-step solutions, explain technical concepts clearly, and help users resolve problems efficiently. Be methodical and thorough in your approach. Use any provided system information or error logs to give more accurate diagnostics and solutions.',
    defaultConfig: {
      temperature: 0.4,
      topP: 0.8,
      maxTokens: 1280
    },
    category: 'Technical Support',
    tags: ['technical', 'support', 'troubleshooting', 'IT']
  }
];

/**
 * Enhanced model manager class with real Gemini integration
 */
export class ModelManager {
  private gemini: GeminiWrapper;
  private models: Map<string, ModelDefinition>;

  constructor(apiKey: string) {
    this.gemini = new GeminiWrapper(apiKey);
    this.models = new Map();
    
    // Load predefined models
    PREDEFINED_MODELS.forEach(model => {
      this.models.set(model.id, model);
    });
  }

  /**
   * Get all available models
   */
  getModels(): ModelDefinition[] {
    return Array.from(this.models.values());
  }

  /**
   * Get a specific model by ID
   */
  getModel(id: string): ModelDefinition | undefined {
    return this.models.get(id);
  }

  /**
   * Add a custom model
   */
  addModel(model: ModelDefinition): void {
    this.models.set(model.id, model);
  }

  /**
   * Generate response using a specific model with enhanced context
   */
  async generateResponse(
    modelId: string,
    messages: Message[],
    config?: Partial<ModelConfig>,
    knowledgeContext?: string,
    uploadedFiles?: File[]
  ): Promise<string> {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    const finalConfig = {
      ...model.defaultConfig,
      ...config
    };

    return this.gemini.generateResponse(
      messages,
      model.systemPrompt,
      finalConfig,
      knowledgeContext,
      uploadedFiles
    );
  }

  /**
   * Create a custom model from user configuration
   */
  createCustomModel(
    id: string,
    name: string,
    description: string,
    systemPrompt: string,
    config: ModelConfig,
    category: string = 'Other',
    tags: string[] = []
  ): ModelDefinition {
    const customModel: ModelDefinition = {
      id,
      name,
      description,
      systemPrompt,
      defaultConfig: config,
      category,
      tags
    };

    this.addModel(customModel);
    return customModel;
  }
}

/**
 * Utility function to create a model manager instance
 */
export function createModelManager(apiKey: string): ModelManager {
  return new ModelManager(apiKey);
}

/**
 * Enhanced mock implementation for development/testing
 */
export class MockModelManager extends ModelManager {
  constructor() {
    super('mock-api-key');
  }

  async generateResponse(
    modelId: string,
    messages: Message[],
    config?: Partial<ModelConfig>,
    knowledgeContext?: string,
    uploadedFiles?: File[]
  ): Promise<string> {
    const model = this.getModel(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const latestMessage = messages[messages.length - 1];
    const userInput = latestMessage?.content || '';

    // Generate contextual mock responses based on model type and knowledge
    let response = this.getMockResponse(modelId, userInput);

    // Add knowledge base context to response if provided
    if (knowledgeContext && knowledgeContext.trim()) {
      response += `\n\n*Note: I've incorporated information from your knowledge base to provide a more contextual response.*`;
    }

    // Add file context if files are uploaded
    if (uploadedFiles && uploadedFiles.length > 0) {
      response += `\n\n*I've considered the ${uploadedFiles.length} uploaded file(s): ${uploadedFiles.map(f => f.name).join(', ')} in my response.*`;
    }

    // Add configuration note
    response += `\n\n---\n*Generated using ${model.name} with temperature ${config?.temperature || model.defaultConfig.temperature}*`;

    return response;
  }

  private getMockResponse(modelId: string, userInput: string): string {
    const responses = {
      'general-assistant': [
        "I understand your question and I'm here to help! Based on my knowledge and the context you've provided, here's a comprehensive response that addresses your needs.",
        "That's an interesting point you've raised. Let me provide you with a detailed answer that takes into account the information available to me.",
        "I'd be happy to assist you with that. Here's my analysis and recommendations based on your query and any relevant context."
      ],
      'creative-writer': [
        "What a fascinating creative challenge! Let me craft something imaginative for you, drawing inspiration from the themes and context you've shared.",
        "I love exploring creative ideas with you. Here's an artistic take on your request, incorporating elements that will make your story truly engaging.",
        "Let's dive into the realm of creativity and storytelling together. I'll weave together your ideas with creative techniques to bring your vision to life."
      ],
      'code-assistant': [
        "Looking at your programming question, I'll provide a technical solution with best practices in mind. Here's a clean, efficient approach to solve your problem:",
        "I can help you with this coding challenge. Let me break down the solution step by step, explaining the logic and providing optimized code.",
        "Here's a robust solution to your programming problem, complete with explanations, error handling, and suggestions for improvement."
      ],
      'business-advisor': [
        "From a business perspective, here's my strategic analysis and recommendations based on current market trends and best practices:",
        "Let me provide you with actionable business insights that consider your specific context and industry dynamics.",
        "Here's a professional assessment of your business question with practical next steps and strategic considerations."
      ],
      'educational-tutor': [
        "Great question! Let me explain this concept in a way that's easy to understand, building on what you already know.",
        "I'm here to help you learn effectively. Let's break this topic down into manageable parts and explore it step by step.",
        "Learning is a journey, and I'm here to guide you through this subject with clear explanations and helpful examples."
      ],
      'technical-support': [
        "I can help you troubleshoot this technical issue. Here's a systematic approach to diagnose and resolve the problem:",
        "Let me walk you through the solution to this technical problem with clear, step-by-step instructions.",
        "Based on the symptoms you've described and any system information provided, here's the most likely solution and implementation steps."
      ]
    };

    const modelResponses = responses[modelId as keyof typeof responses] || responses['general-assistant'];
    return modelResponses[Math.floor(Math.random() * modelResponses.length)];
  }
}