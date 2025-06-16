/**
 * Simple Gemini API wrapper with context-based model definitions
 * Each "model" is defined by its core prompt/context using the same underlying Gemini API
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
 * Base Gemini API wrapper class
 */
export class GeminiWrapper {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Generate response using Gemini API
   */
  async generateResponse(
    messages: Message[],
    systemPrompt: string,
    config: ModelConfig,
    knowledgeContext?: string
  ): Promise<string> {
    try {
      // Build the full prompt with system context
      let fullPrompt = systemPrompt;

      // Add knowledge context if provided
      if (knowledgeContext) {
        fullPrompt += `\n\nAdditional Knowledge Context:\n${knowledgeContext}`;
      }

      // Add conversation history
      if (messages.length > 0) {
        fullPrompt += '\n\nConversation History:';
        messages.forEach(msg => {
          fullPrompt += `\n${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`;
        });
      }

      // Get the latest user message
      const latestMessage = messages[messages.length - 1];
      if (latestMessage?.role === 'user') {
        fullPrompt += `\n\nHuman: ${latestMessage.content}\nAssistant:`;
      }

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
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate response');
    }
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
    systemPrompt: 'You are a helpful, knowledgeable, and friendly AI assistant. Provide clear, accurate, and helpful responses to user questions. Be concise but thorough in your explanations.',
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
    systemPrompt: 'You are a creative writing assistant with expertise in storytelling, poetry, and creative content. Help users craft engaging narratives, develop characters, and explore creative ideas. Be imaginative and inspiring while maintaining literary quality.',
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
    systemPrompt: 'You are an expert programming assistant. Help users with coding problems, explain programming concepts, review code, and provide technical guidance. Focus on best practices, clean code, and practical solutions. Support multiple programming languages and frameworks.',
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
    systemPrompt: 'You are a business consultant and advisor with expertise in strategy, operations, marketing, and professional development. Provide practical business advice, help with decision-making, and offer insights on industry trends. Be professional and data-driven in your responses.',
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
    systemPrompt: 'You are an educational tutor who helps students learn various subjects. Break down complex topics into understandable parts, provide examples, and encourage learning. Be patient, supportive, and adapt your teaching style to the student\'s needs. Focus on understanding rather than just providing answers.',
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
    systemPrompt: 'You are a technical support specialist with expertise in troubleshooting software, hardware, and IT issues. Provide step-by-step solutions, explain technical concepts clearly, and help users resolve problems efficiently. Be methodical and thorough in your approach.',
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
 * Model manager class for handling different context-based models
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
   * Generate response using a specific model
   */
  async generateResponse(
    modelId: string,
    messages: Message[],
    config?: Partial<ModelConfig>,
    knowledgeContext?: string
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
      knowledgeContext
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
 * Mock implementation for development/testing
 */
export class MockModelManager extends ModelManager {
  constructor() {
    super('mock-api-key');
  }

  async generateResponse(
    modelId: string,
    messages: Message[],
    config?: Partial<ModelConfig>,
    knowledgeContext?: string
  ): Promise<string> {
    const model = this.getModel(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const latestMessage = messages[messages.length - 1];
    const userInput = latestMessage?.content || '';

    // Generate contextual mock responses based on model type
    const responses = this.getMockResponses(modelId, userInput);
    const response = responses[Math.floor(Math.random() * responses.length)];

    return `${response} (Generated using ${model.name} with temperature ${config?.temperature || model.defaultConfig.temperature})`;
  }

  private getMockResponses(modelId: string, userInput: string): string[] {
    const baseResponses = {
      'general-assistant': [
        "I understand your question. Let me provide you with a comprehensive answer based on my knowledge.",
        "That's an interesting point. Here's what I can tell you about that topic.",
        "I'd be happy to help you with that. Based on the information available, here's my response."
      ],
      'creative-writer': [
        "What a fascinating creative challenge! Let me craft something imaginative for you.",
        "I love exploring creative ideas. Here's an artistic take on your request.",
        "Let's dive into the realm of creativity and storytelling together."
      ],
      'code-assistant': [
        "Looking at your code question, here's a technical solution with best practices in mind.",
        "I can help you solve this programming challenge. Let me break down the approach step by step.",
        "Here's a clean, efficient solution to your coding problem with explanations."
      ],
      'business-advisor': [
        "From a business perspective, here's my strategic analysis and recommendations.",
        "Let me provide you with actionable business insights based on industry best practices.",
        "Here's a professional assessment of your business question with practical next steps."
      ],
      'educational-tutor': [
        "Great question! Let me explain this concept in a way that's easy to understand.",
        "I'm here to help you learn. Let's break this topic down into manageable parts.",
        "Learning is a journey, and I'm here to guide you through this subject step by step."
      ],
      'technical-support': [
        "I can help you troubleshoot this technical issue. Here's a systematic approach to resolve it.",
        "Let me walk you through the solution to this technical problem with clear steps.",
        "Based on the symptoms you've described, here's the most likely solution and how to implement it."
      ]
    };

    return baseResponses[modelId as keyof typeof baseResponses] || baseResponses['general-assistant'];
  }
}