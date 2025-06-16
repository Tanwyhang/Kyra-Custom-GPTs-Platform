/*
  # Publish Sample GPTs to Database

  1. New Data
    - Insert predefined GPT models into published_models table
    - Add sample prompts for each GPT
    - Set validation status to approved for immediate availability

  2. Security
    - All GPTs are public and approved
    - Sample data for demonstration purposes
*/

-- Insert sample GPTs into published_models table
INSERT INTO published_models (
  id,
  name,
  version,
  description,
  category,
  tags,
  license_type,
  system_prompt,
  default_temperature,
  default_top_p,
  default_max_tokens,
  knowledge_context,
  publisher_name,
  is_public,
  is_featured,
  validation_status,
  accuracy_score,
  download_count,
  rating_average,
  rating_count,
  created_at,
  published_at
) VALUES 
(
  'general-assistant',
  'General Assistant',
  '1.0.0',
  'A helpful AI assistant for general questions and tasks. Provides clear, accurate, and helpful responses to user questions. Be concise but thorough in explanations.',
  'Conversational AI',
  ARRAY['general', 'assistant', 'helpful'],
  'MIT',
  'You are a helpful, knowledgeable, and friendly AI assistant. Provide clear, accurate, and helpful responses to user questions. Be concise but thorough in your explanations. Use the knowledge base and context provided to give more relevant and informed answers.',
  0.7,
  0.9,
  1024,
  'General purpose AI assistant with broad knowledge across multiple domains.',
  'AI GPT Hub',
  true,
  true,
  'approved',
  92.5,
  1250,
  4.8,
  156,
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '14 days'
),
(
  'creative-writer',
  'Creative Writer',
  '1.0.0',
  'An AI specialized in creative writing and storytelling. Help users craft engaging narratives, develop characters, and explore creative ideas. Be imaginative and inspiring while maintaining literary quality.',
  'Creative Writing',
  ARRAY['creative', 'writing', 'storytelling', 'poetry'],
  'MIT',
  'You are a creative writing assistant with expertise in storytelling, poetry, and creative content. Help users craft engaging narratives, develop characters, and explore creative ideas. Be imaginative and inspiring while maintaining literary quality. Use any provided knowledge base to enhance your creative suggestions with relevant context and inspiration.',
  0.9,
  0.95,
  2048,
  'Specialized in creative writing techniques, narrative structure, character development, and literary devices.',
  'AI GPT Hub',
  true,
  true,
  'approved',
  89.3,
  890,
  4.7,
  98,
  NOW() - INTERVAL '12 days',
  NOW() - INTERVAL '11 days'
),
(
  'code-assistant',
  'Code Assistant',
  '1.0.0',
  'A programming expert for code help and technical guidance. Help users with coding problems, explain programming concepts, review code, and provide technical guidance. Focus on clean code, best practices, and practical solutions.',
  'Code Assistant',
  ARRAY['programming', 'code', 'technical', 'development'],
  'MIT',
  'You are an expert programming assistant with deep knowledge of multiple programming languages, frameworks, and best practices. Help users with coding problems, explain programming concepts, review code, and provide technical guidance. Focus on clean code, best practices, and practical solutions. Use any provided documentation or code files to give more specific and contextual assistance.',
  0.3,
  0.8,
  1536,
  'Expert knowledge in multiple programming languages, frameworks, debugging, and software development best practices.',
  'AI GPT Hub',
  true,
  true,
  'approved',
  94.8,
  2150,
  4.9,
  287,
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '19 days'
),
(
  'business-advisor',
  'Business Advisor',
  '1.0.0',
  'An AI consultant for business strategy and professional advice. Provide practical business advice, help with decision-making, and offer insights on industry trends. Be professional and data-driven in responses.',
  'Business Assistant',
  ARRAY['business', 'strategy', 'consulting', 'professional'],
  'MIT',
  'You are a senior business consultant and advisor with expertise in strategy, operations, marketing, and professional development. Provide practical business advice, help with decision-making, and offer insights on industry trends. Be professional and data-driven in your responses. Use any provided business documents or context to give more targeted and relevant advice.',
  0.5,
  0.85,
  1280,
  'Expertise in business strategy, operations, marketing, finance, and professional development across various industries.',
  'AI GPT Hub',
  true,
  false,
  'approved',
  91.2,
  675,
  4.6,
  89,
  NOW() - INTERVAL '8 days',
  NOW() - INTERVAL '7 days'
),
(
  'educational-tutor',
  'Educational Tutor',
  '1.0.0',
  'A patient tutor for learning and educational support. Break down complex topics into understandable parts, provide examples, and encourage learning. Be patient, supportive, and adapt teaching style to student needs.',
  'Educational',
  ARRAY['education', 'tutor', 'learning', 'teaching'],
  'MIT',
  'You are an educational tutor who helps students learn various subjects. Break down complex topics into understandable parts, provide examples, and encourage learning. Be patient, supportive, and adapt your teaching style to the student''s needs. Focus on understanding rather than just providing answers. Use any provided educational materials or context to create more personalized learning experiences.',
  0.6,
  0.9,
  1536,
  'Comprehensive knowledge across academic subjects with expertise in pedagogical methods and learning psychology.',
  'AI GPT Hub',
  true,
  false,
  'approved',
  88.7,
  543,
  4.5,
  67,
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '4 days'
),
(
  'technical-support',
  'Technical Support',
  '1.0.0',
  'A technical expert for troubleshooting and IT support. Provide step-by-step solutions, explain technical concepts clearly, and help users resolve problems efficiently. Be methodical and thorough in approach.',
  'Technical Support',
  ARRAY['technical', 'support', 'troubleshooting', 'IT'],
  'MIT',
  'You are a technical support specialist with expertise in troubleshooting software, hardware, and IT issues. Provide step-by-step solutions, explain technical concepts clearly, and help users resolve problems efficiently. Be methodical and thorough in your approach. Use any provided system information or error logs to give more accurate diagnostics and solutions.',
  0.4,
  0.8,
  1280,
  'Expert knowledge in IT systems, software troubleshooting, hardware diagnostics, and technical problem resolution.',
  'AI GPT Hub',
  true,
  false,
  'approved',
  93.1,
  789,
  4.7,
  112,
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '9 days'
);

-- Insert sample prompts for each GPT
INSERT INTO model_samples (
  model_id,
  sample_type,
  title,
  description,
  input_data,
  tags,
  difficulty_level,
  is_validated,
  validation_score
) VALUES 
-- General Assistant samples
(
  'general-assistant',
  'prompt_template',
  'General Question',
  'Example of a general knowledge question',
  '{"prompt": "What are the benefits of renewable energy?"}',
  ARRAY['general', 'knowledge'],
  'easy',
  true,
  95.0
),
(
  'general-assistant',
  'prompt_template',
  'Problem Solving',
  'Example of problem-solving assistance',
  '{"prompt": "How can I improve my time management skills?"}',
  ARRAY['advice', 'productivity'],
  'medium',
  true,
  92.0
),

-- Creative Writer samples
(
  'creative-writer',
  'prompt_template',
  'Story Beginning',
  'Example of creative story writing',
  '{"prompt": "Write the opening paragraph of a mystery novel set in a small coastal town."}',
  ARRAY['creative', 'story', 'mystery'],
  'medium',
  true,
  94.0
),
(
  'creative-writer',
  'prompt_template',
  'Character Development',
  'Example of character creation',
  '{"prompt": "Create a compelling character profile for a reluctant hero in a fantasy setting."}',
  ARRAY['character', 'fantasy', 'development'],
  'hard',
  true,
  91.0
),

-- Code Assistant samples
(
  'code-assistant',
  'prompt_template',
  'Python Function',
  'Example of Python code generation',
  '{"prompt": "Write a Python function to calculate the factorial of a number with error handling."}',
  ARRAY['python', 'function', 'math'],
  'easy',
  true,
  96.0
),
(
  'code-assistant',
  'prompt_template',
  'Code Review',
  'Example of code review and optimization',
  '{"prompt": "Review this JavaScript code and suggest improvements for performance and readability."}',
  ARRAY['javascript', 'review', 'optimization'],
  'hard',
  true,
  93.0
),

-- Business Advisor samples
(
  'business-advisor',
  'prompt_template',
  'Market Analysis',
  'Example of business market analysis',
  '{"prompt": "Analyze the current trends in the e-commerce market and their implications for small businesses."}',
  ARRAY['market', 'analysis', 'ecommerce'],
  'hard',
  true,
  90.0
),
(
  'business-advisor',
  'prompt_template',
  'Strategy Planning',
  'Example of strategic business planning',
  '{"prompt": "Help me create a go-to-market strategy for a new SaaS product targeting small businesses."}',
  ARRAY['strategy', 'saas', 'planning'],
  'hard',
  true,
  88.0
),

-- Educational Tutor samples
(
  'educational-tutor',
  'prompt_template',
  'Math Explanation',
  'Example of mathematical concept explanation',
  '{"prompt": "Explain the concept of derivatives in calculus using simple examples."}',
  ARRAY['math', 'calculus', 'explanation'],
  'medium',
  true,
  92.0
),
(
  'educational-tutor',
  'prompt_template',
  'Study Plan',
  'Example of personalized study planning',
  '{"prompt": "Create a study plan for learning Spanish in 6 months for a complete beginner."}',
  ARRAY['language', 'study', 'planning'],
  'medium',
  true,
  89.0
),

-- Technical Support samples
(
  'technical-support',
  'prompt_template',
  'Troubleshooting',
  'Example of technical troubleshooting',
  '{"prompt": "My computer is running slowly. Walk me through the steps to diagnose and fix the issue."}',
  ARRAY['troubleshooting', 'performance', 'computer'],
  'medium',
  true,
  94.0
),
(
  'technical-support',
  'prompt_template',
  'Network Issues',
  'Example of network problem resolution',
  '{"prompt": "I cannot connect to WiFi on my laptop. What steps should I follow to resolve this?"}',
  ARRAY['network', 'wifi', 'connectivity'],
  'easy',
  true,
  91.0
);

-- Insert validation records for the sample GPTs
INSERT INTO model_validations (
  model_id,
  validation_type,
  status,
  test_cases_total,
  test_cases_passed,
  test_cases_failed,
  avg_response_time_ms,
  accuracy_score,
  consistency_score,
  safety_score,
  results,
  validator_name,
  validation_started_at,
  validation_completed_at
) VALUES 
(
  'general-assistant',
  'automated',
  'passed',
  15,
  14,
  1,
  850.5,
  92.5,
  89.2,
  98.1,
  '{"overall_score": 92.5, "recommendations": ["Excellent general purpose assistant"], "strengths": ["Clear responses", "Good context understanding"]}',
  'AI Validation System',
  NOW() - INTERVAL '14 days',
  NOW() - INTERVAL '14 days' + INTERVAL '2 hours'
),
(
  'creative-writer',
  'automated',
  'passed',
  12,
  11,
  1,
  1200.3,
  89.3,
  91.7,
  96.8,
  '{"overall_score": 89.3, "recommendations": ["Strong creative capabilities"], "strengths": ["Imaginative content", "Good narrative structure"]}',
  'AI Validation System',
  NOW() - INTERVAL '11 days',
  NOW() - INTERVAL '11 days' + INTERVAL '1.5 hours'
),
(
  'code-assistant',
  'automated',
  'passed',
  20,
  19,
  1,
  750.8,
  94.8,
  93.4,
  97.2,
  '{"overall_score": 94.8, "recommendations": ["Excellent technical assistant"], "strengths": ["Accurate code generation", "Good best practices"]}',
  'AI Validation System',
  NOW() - INTERVAL '19 days',
  NOW() - INTERVAL '19 days' + INTERVAL '3 hours'
),
(
  'business-advisor',
  'automated',
  'passed',
  18,
  16,
  2,
  920.1,
  91.2,
  88.9,
  95.5,
  '{"overall_score": 91.2, "recommendations": ["Strong business knowledge"], "strengths": ["Strategic thinking", "Professional advice"]}',
  'AI Validation System',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '7 days' + INTERVAL '2.5 hours'
),
(
  'educational-tutor',
  'automated',
  'passed',
  16,
  14,
  2,
  1050.7,
  88.7,
  90.3,
  99.1,
  '{"overall_score": 88.7, "recommendations": ["Good educational support"], "strengths": ["Patient explanations", "Adaptive teaching"]}',
  'AI Validation System',
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '4 days' + INTERVAL '2 hours'
),
(
  'technical-support',
  'automated',
  'passed',
  17,
  16,
  1,
  680.4,
  93.1,
  91.8,
  98.7,
  '{"overall_score": 93.1, "recommendations": ["Excellent technical support"], "strengths": ["Clear troubleshooting", "Methodical approach"]}',
  'AI Validation System',
  NOW() - INTERVAL '9 days',
  NOW() - INTERVAL '9 days' + INTERVAL '1.8 hours'
);

-- Insert some download logs for realistic statistics
INSERT INTO model_download_logs (
  model_id,
  download_type,
  user_agent,
  intended_use,
  downloaded_at
) VALUES 
-- General Assistant downloads
('general-assistant', 'full_model', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Personal assistant', NOW() - INTERVAL '1 day'),
('general-assistant', 'config_only', 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', 'Learning', NOW() - INTERVAL '2 days'),
('general-assistant', 'full_model', 'Mozilla/5.0 (X11; Linux x86_64)', 'Research', NOW() - INTERVAL '3 days'),

-- Code Assistant downloads
('code-assistant', 'full_model', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Development', NOW() - INTERVAL '1 day'),
('code-assistant', 'samples_only', 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', 'Learning', NOW() - INTERVAL '2 days'),
('code-assistant', 'full_model', 'Mozilla/5.0 (X11; Linux x86_64)', 'Code review', NOW() - INTERVAL '4 days'),

-- Creative Writer downloads
('creative-writer', 'config_only', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Writing assistance', NOW() - INTERVAL '2 days'),
('creative-writer', 'full_model', 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', 'Creative projects', NOW() - INTERVAL '5 days'),

-- Business Advisor downloads
('business-advisor', 'full_model', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Business planning', NOW() - INTERVAL '3 days'),
('business-advisor', 'config_only', 'Mozilla/5.0 (X11; Linux x86_64)', 'Strategy consulting', NOW() - INTERVAL '6 days'),

-- Educational Tutor downloads
('educational-tutor', 'samples_only', 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', 'Teaching', NOW() - INTERVAL '1 day'),
('educational-tutor', 'full_model', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Student support', NOW() - INTERVAL '4 days'),

-- Technical Support downloads
('technical-support', 'full_model', 'Mozilla/5.0 (X11; Linux x86_64)', 'IT support', NOW() - INTERVAL '2 days'),
('technical-support', 'config_only', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Troubleshooting', NOW() - INTERVAL '7 days');

-- Insert some ratings for the GPTs
INSERT INTO model_ratings (
  model_id,
  rating,
  review_text,
  reviewer_hash,
  use_case,
  helpful_votes,
  total_votes
) VALUES 
-- General Assistant ratings
('general-assistant', 5, 'Excellent general purpose assistant. Very helpful and accurate responses.', 'hash1', 'Personal use', 12, 15),
('general-assistant', 4, 'Good assistant, sometimes could be more detailed.', 'hash2', 'Work assistance', 8, 10),
('general-assistant', 5, 'Love this GPT! Very reliable and easy to use.', 'hash3', 'Learning', 15, 18),

-- Code Assistant ratings
('code-assistant', 5, 'Best coding assistant I have used. Great for debugging and code review.', 'hash4', 'Software development', 25, 28),
('code-assistant', 5, 'Incredibly helpful for learning new programming languages.', 'hash5', 'Education', 18, 20),
('code-assistant', 4, 'Very good, but sometimes explanations could be simpler.', 'hash6', 'Code review', 10, 12),

-- Creative Writer ratings
('creative-writer', 5, 'Amazing for creative writing! Helps overcome writer''s block.', 'hash7', 'Creative writing', 14, 16),
('creative-writer', 4, 'Good creative assistant, generates interesting ideas.', 'hash8', 'Storytelling', 9, 11),

-- Business Advisor ratings
('business-advisor', 4, 'Solid business advice, good for strategic planning.', 'hash9', 'Business planning', 7, 9),
('business-advisor', 5, 'Excellent for market analysis and business insights.', 'hash10', 'Consulting', 11, 13),

-- Educational Tutor ratings
('educational-tutor', 4, 'Good for learning, patient and clear explanations.', 'hash11', 'Education', 6, 8),
('educational-tutor', 5, 'Great tutor! Helps break down complex topics.', 'hash12', 'Student support', 9, 10),

-- Technical Support ratings
('technical-support', 5, 'Excellent technical support, very methodical approach.', 'hash13', 'IT support', 13, 15),
('technical-support', 4, 'Good troubleshooting assistant, saves time.', 'hash14', 'Technical help', 8, 10);