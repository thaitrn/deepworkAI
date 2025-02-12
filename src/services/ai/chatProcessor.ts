import { Task } from '@/types';
import { generateChatResponse } from './deepseek';
import { analyzeTaskText } from './taskAnalyzer';

type Intent = {
  action: 'create_task' | 'modify_task' | 'get_insights' | 'unknown';
  parameters: Record<string, any>;
  confidence: number;
};

export function detectIntent(message: string): Intent {
  const text = message.toLowerCase();
  
  // Basic intent detection
  if (text.includes('create') || text.includes('add') || text.includes('new task')) {
    return {
      action: 'create_task',
      parameters: {
        taskText: message.replace(/create|add|new task/gi, '').trim(),
      },
      confidence: 0.8,
    };
  }

  if (text.includes('modify') || text.includes('change') || text.includes('update')) {
    return {
      action: 'modify_task',
      parameters: {},
      confidence: 0.7,
    };
  }

  if (text.includes('insight') || text.includes('analyze') || text.includes('help me understand')) {
    return {
      action: 'get_insights',
      parameters: {},
      confidence: 0.6,
    };
  }

  return {
    action: 'unknown',
    parameters: {},
    confidence: 0.3,
  };
}

export async function processMessage(
  message: string,
  context: { tasks: Task[]; userId: string }
) {
  try {
    const response = await generateChatResponse(message, context);
    
    // If it's a task creation, enhance with detailed analysis
    if (response.action === 'create_task' && response.suggestions?.[0]) {
      const taskAnalysis = await analyzeTaskText(
        response.suggestions[0].title,
        context
      );
      
      response.suggestions[0] = {
        ...response.suggestions[0],
        ...taskAnalysis,
      };
    }
    
    return response;
  } catch (error) {
    console.error('Chat processing error:', error);
    return {
      reply: "I'm having trouble understanding. Could you rephrase that?",
      action: 'none',
    };
  }
} 