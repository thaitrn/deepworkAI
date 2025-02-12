import { supabase } from '@/lib/supabase';
import { Task } from '@/types';

export async function getTasks(userId: string) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('priority', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      throw new Error(error.message);
    }
    return data as Task[];
  } catch (error) {
    console.error('Error getting tasks:', error);
    throw error;
  }
}

export async function createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error(error.message);
    }
    return data as Task;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
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
      throw new Error(error.message);
    }
    return data as Task;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
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
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
} 