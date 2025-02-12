import { supabase } from '@/lib/supabase';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1';  // Replace with actual endpoint

type DeepSeekResponse = {
  text: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

async function getApiKey(): Promise<string> {
  const { data, error } = await supabase
    .from('api_keys')
    .select('key')
    .eq('service', 'deepseek')
    .single();

  if (error) throw new Error('Failed to get API key');
  return data.key;
}

async function callDeepSeek(
  prompt: string,
  context: Record<string, any> = {},
  options: { temperature?: number; max_tokens?: number } = {}
): Promise<DeepSeekResponse> {
  const apiKey = await getApiKey();

  const response = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant helping with task management and productivity. 
          Context: ${JSON.stringify(context)}`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 150,
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.statusText}`);
  }

  return response.json();
}

export async function analyzeTaskWithAI(
  taskText: string,
  context: { tasks: any[]; userId: string }
): Promise<{
  title: string;
  description: string;
  priority: number;
  estimatedDuration: number;
  category: string;
  reasoning: string;
}> {
  const prompt = `
    Analyze this task: "${taskText}"
    Consider:
    1. Priority (1-5)
    2. Estimated duration (in minutes)
    3. Category
    4. Any additional context or suggestions
    
    Current tasks context: ${JSON.stringify(context.tasks)}
    
    Respond in JSON format with these fields:
    {
      "title": "refined task title",
      "description": "detailed description",
      "priority": number,
      "estimatedDuration": number,
      "category": "string",
      "reasoning": "explanation"
    }
  `;

  try {
    const response = await callDeepSeek(prompt, context);
    return JSON.parse(response.text);
  } catch (error) {
    console.error('AI analysis error:', error);
    // Fallback to basic analysis
    return {
      title: taskText,
      description: '',
      priority: 3,
      estimatedDuration: 25,
      category: 'general',
      reasoning: 'Based on basic analysis (AI unavailable)',
    };
  }
}

export async function generateChatResponse(
  message: string,
  context: { tasks: any[]; userId: string }
): Promise<{
  reply: string;
  suggestions?: any[];
  action?: string;
}> {
  const prompt = `
    User message: "${message}"
    Current context:
    - Tasks: ${JSON.stringify(context.tasks)}
    
    Analyze the user's intent and provide a helpful response.
    If they want to create a task, analyze and suggest task details.
    If they want insights, analyze their task patterns.
    
    Respond in JSON format:
    {
      "reply": "your response",
      "suggestions": [array of suggestions if applicable],
      "action": "create_task/modify_task/show_insights/none"
    }
  `;

  try {
    const response = await callDeepSeek(prompt, context);
    return JSON.parse(response.text);
  } catch (error) {
    console.error('AI response error:', error);
    return {
      reply: "I'm here to help! You can ask me to create tasks, analyze your productivity, or provide focus tips.",
      action: 'none',
    };
  }
} 