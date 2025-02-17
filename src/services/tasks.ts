import { supabase } from '@/lib/supabase';
import { Task, TaskError } from '@/types';

export const getTask = async (id: string) => {
  if (!id) {
    throw new Error('Task ID is required');
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getTasks = async (userId: string) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
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
};

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

export const updateTask = async (id: string, updates: Partial<Task>) => {
  if (!id) {
    throw new Error('Task ID is required');
  }

  try {
    console.log('Updating task:', { id, updates });

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', {
        code: error.code,
        message: error.message,
        details: error.details,
      });
      throw error;
    }

    console.log('Task updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Unexpected error in updateTask:', error);
    throw error;
  }
};

export const deleteTask = async (id: string) => {
  if (!id) {
    throw new Error('Task ID is required');
  }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}; 