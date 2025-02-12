import { Task } from '@/types';
import { analyzeTaskWithAI } from './deepseek';

type TaskAnalysis = {
  priority: number;
  estimatedDuration: number;
  category: string;
  complexity: 'low' | 'medium' | 'high';
  suggestedTimeOfDay: 'morning' | 'afternoon' | 'evening';
  reasoning: string;
};

export async function analyzeTaskText(
  text: string,
  context: { tasks: Task[]; userId: string }
): Promise<TaskAnalysis> {
  try {
    const aiAnalysis = await analyzeTaskWithAI(text, context);
    return {
      priority: aiAnalysis.priority,
      estimatedDuration: aiAnalysis.estimatedDuration,
      category: aiAnalysis.category,
      complexity: determineComplexity(aiAnalysis),
      suggestedTimeOfDay: determineBestTime(aiAnalysis),
      reasoning: aiAnalysis.reasoning,
    };
  } catch (error) {
    console.error('AI analysis failed, falling back to basic analysis:', error);
    return basicAnalysis(text);
  }
}

function determineComplexity(analysis: any): 'low' | 'medium' | 'high' {
  if (analysis.estimatedDuration <= 15) return 'low';
  if (analysis.estimatedDuration >= 60) return 'high';
  return 'medium';
}

function determineBestTime(analysis: any): 'morning' | 'afternoon' | 'evening' {
  if (analysis.priority >= 4) return 'morning';
  if (analysis.category === 'meeting') return 'afternoon';
  return 'morning';
}

// Keep the basic analysis as fallback
function basicAnalysis(text: string): TaskAnalysis {
  // TODO: Implement actual NLP analysis
  const words = text.toLowerCase().split(' ');
  
  // Basic priority detection
  const urgentWords = ['urgent', 'asap', 'important', 'critical'];
  const priority = words.some(w => urgentWords.includes(w)) ? 5 : 3;

  // Basic duration estimation (default 25 minutes)
  const durationWords = text.match(/(\d+)\s*(min|hour|hr)/);
  const estimatedDuration = durationWords ? parseInt(durationWords[1]) : 25;

  // Basic category detection
  const categories = {
    coding: ['code', 'programming', 'debug', 'develop'],
    meeting: ['meet', 'call', 'discuss', 'sync'],
    writing: ['write', 'document', 'draft', 'compose'],
    planning: ['plan', 'organize', 'schedule', 'design'],
  };

  let category = 'general';
  for (const [cat, keywords] of Object.entries(categories)) {
    if (keywords.some(k => words.includes(k))) {
      category = cat;
      break;
    }
  }

  return {
    priority,
    estimatedDuration,
    category,
    complexity: 'medium',
    suggestedTimeOfDay: 'morning',
    reasoning: 'Based on task description analysis',
  };
}

export function suggestNextTask(tasks: Task[], timeOfDay: string): Task | null {
  if (tasks.length === 0) return null;

  // Simple scoring system
  const scores = tasks.map(task => {
    let score = 0;
    
    // Priority score
    score += task.priority * 2;

    // Status score
    if (task.status === 'in_progress') score += 3;
    
    // Time of day preference
    const hour = new Date().getHours();
    if (hour < 12 && task.priority >= 4) score += 2; // High priority tasks in morning
    if (hour >= 12 && hour < 17 && task.priority === 3) score += 1; // Medium priority in afternoon
    
    return { task, score };
  });

  // Return highest scoring task
  return scores.sort((a, b) => b.score - a.score)[0]?.task || null;
} 