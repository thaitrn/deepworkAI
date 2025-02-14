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
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: number;
  deadline?: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
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

export class TaskError extends Error {
  constructor(
    message: string,
    public code: 'VALIDATION' | 'DATABASE' | 'NETWORK' | 'UNKNOWN',
    public details?: any
  ) {
    super(message);
    this.name = 'TaskError';
  }
} 