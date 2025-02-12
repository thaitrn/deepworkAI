export type Task = {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: number;
  due_date?: Date;
  created_at: Date;
  updated_at: Date;
  user_id: string;
  project_id?: string;
  tags?: string[];
};

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