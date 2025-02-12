import { Task } from '@/types';
import { processMessage } from './ai/chatProcessor';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type TaskSuggestion = {
  title: string;
  description?: string;
  priority: number;
  estimatedDuration?: number;
};

export async function sendMessage(
  message: string,
  context: {
    tasks: Task[];
    userId: string;
  }
): Promise<{
  reply: string;
  suggestions?: any[];
  action?: 'create_task' | 'modify_task' | 'none';
}> {
  try {
    return await processMessage(message, context);
  } catch (error) {
    console.error('Error processing message:', error);
    return {
      reply: "I'm sorry, I encountered an error. Please try again.",
      action: 'none',
    };
  }
} 