import { supabase } from '@/lib/supabase';
import { Task, TaskError } from '@/types';

export async function getTask(taskId: string): Promise<Task> {
  try {
    if (!taskId || typeof taskId !== 'string') {
      throw new TaskError(
        'Invalid task ID',
        'VALIDATION',
        { taskId }
      );
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new TaskError(
        'Failed to fetch task',
        'DATABASE',
        error
      );
    }

    if (!data) {
      throw new TaskError(
        'Task not found',
        'DATABASE',
        null
      );
    }

    return data as Task;
  } catch (error) {
    if (error instanceof TaskError) throw error;
    console.error('Unexpected error:', error);
    throw new TaskError(
      'An unexpected error occurred',
      'UNKNOWN',
      error
    );
  }
}

export async function getTasks(userId: string) {
  try {
    if (!userId) {
      throw new TaskError('User ID is required', 'VALIDATION', null);
    }

    // First verify the table structure
    const { error: tableError } = await supabase
      .from('tasks')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('Table verification error:', tableError);
      throw new TaskError(
        'Database structure error',
        'DATABASE',
        tableError
      );
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw new TaskError(
        'Failed to fetch tasks',
        'DATABASE',
        error
      );
    }

    return data as Task[];
  } catch (error) {
    if (error instanceof TaskError) throw error;
    console.error('Unexpected error:', error);
    throw new TaskError(
      'An unexpected error occurred',
      'UNKNOWN',
      error
    );
  }
}

export async function createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) {
  try {
    if (!task.user_id) {
      throw new TaskError('User ID is required', 'VALIDATION', null);
    }

    if (!task.title) {
      throw new TaskError('Title is required', 'VALIDATION', null);
    }

    // Prepare the task data
    const taskData = {
      title: task.title.trim(),
      description: task.description?.trim() || null,
      status: task.status || 'pending',
      priority: task.priority || 1,
      user_id: task.user_id,
      // Only include deadline if it's provided
      ...(task.deadline ? { deadline: task.deadline } : {})
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw new TaskError(
        'Failed to create task',
        'DATABASE',
        error
      );
    }

    return data as Task;
  } catch (error) {
    if (error instanceof TaskError) throw error;
    console.error('Unexpected error:', error);
    throw new TaskError(
      'An unexpected error occurred',
      'UNKNOWN',
      error
    );
  }
}

export async function updateTask(id: string, updates: Partial<Task>) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new TaskError(
        'Failed to update task',
        'DATABASE',
        error
      );
    }

    return data as Task;
  } catch (error) {
    if (error instanceof TaskError) throw error;
    console.error('Unexpected error:', error);
    throw new TaskError(
      'An unexpected error occurred',
      'UNKNOWN',
      error
    );
  }
}

export async function deleteTask(id: string) {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      throw new TaskError(
        'Failed to delete task',
        'DATABASE',
        error
      );
    }
  } catch (error) {
    if (error instanceof TaskError) throw error;
    console.error('Unexpected error:', error);
    throw new TaskError(
      'An unexpected error occurred',
      'UNKNOWN',
      error
    );
  }
} 