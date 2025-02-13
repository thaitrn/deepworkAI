// Core type definitions
export interface User {
  id: string;
  email: string;
  settings: UserSettings;
  createdAt: Date;
  lastLogin: Date;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: number;
  dueDate?: Date;
  projectId?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type Project = {
  id: string;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
  user_id: string;
};

export type FocusSession = {
  id: string;
  user_id: string;
  task_id: string;
  start_time: Date;
  end_time?: Date;
  duration?: number;
  completed: boolean;
  notes?: string;
}; 