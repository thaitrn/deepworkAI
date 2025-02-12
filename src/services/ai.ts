import { Task, FocusSession } from '@/types';

type TaskSuggestion = {
  priority: number;
  estimatedDuration: number;
  suggestedTime: string;
  reasoning: string;
};

type ProductivityInsight = {
  type: 'success' | 'warning' | 'tip';
  message: string;
  actionItem?: string;
};

export async function getTaskPrioritization(tasks: Task[]): Promise<TaskSuggestion[]> {
  // TODO: Implement DeepSeek API integration
  return tasks.map(task => ({
    priority: Math.floor(Math.random() * 5) + 1,
    estimatedDuration: 25,
    suggestedTime: 'morning',
    reasoning: 'Based on your past productivity patterns',
  }));
}

export async function getProductivityInsights(
  sessions: FocusSession[],
  tasks: Task[]
): Promise<ProductivityInsight[]> {
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const totalFocusTime = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
  
  const insights: ProductivityInsight[] = [];

  // Example insights based on data analysis
  if (completedTasks.length > 0) {
    insights.push({
      type: 'success',
      message: `You've completed ${completedTasks.length} tasks!`,
      actionItem: 'Keep up the momentum',
    });
  }

  if (totalFocusTime > 0) {
    const averageSessionTime = totalFocusTime / sessions.length;
    if (averageSessionTime < 20 * 60) { // Less than 20 minutes
      insights.push({
        type: 'tip',
        message: 'Try longer focus sessions for deeper work',
        actionItem: 'Aim for 25-minute sessions',
      });
    }
  }

  return insights;
}

export async function analyzeFocusPatterns(sessions: FocusSession[]): Promise<{
  bestTimeOfDay: string;
  recommendedDuration: number;
  productiveStreak: number;
}> {
  // Analyze focus patterns
  const morningCount = sessions.filter(s => {
    const hour = new Date(s.start_time).getHours();
    return hour >= 6 && hour < 12;
  }).length;

  const afternoonCount = sessions.filter(s => {
    const hour = new Date(s.start_time).getHours();
    return hour >= 12 && hour < 18;
  }).length;

  const eveningCount = sessions.filter(s => {
    const hour = new Date(s.start_time).getHours();
    return hour >= 18;
  }).length;

  let bestTimeOfDay = 'morning';
  if (afternoonCount > morningCount && afternoonCount > eveningCount) {
    bestTimeOfDay = 'afternoon';
  } else if (eveningCount > morningCount && eveningCount > afternoonCount) {
    bestTimeOfDay = 'evening';
  }

  return {
    bestTimeOfDay,
    recommendedDuration: 25,
    productiveStreak: Math.floor(sessions.filter(s => s.completed).length / 2),
  };
} 