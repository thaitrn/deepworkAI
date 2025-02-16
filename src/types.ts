export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  deadline?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
} 