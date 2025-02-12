import { supabase } from '@/lib/supabase';
import { FocusSession } from '@/types';

export async function createFocusSession(session: Omit<FocusSession, 'id'>) {
  try {
    const { data, error } = await supabase
      .from('focus_sessions')
      .insert([session])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error(error.message);
    }
    return data as FocusSession;
  } catch (error) {
    console.error('Error creating focus session:', error);
    throw error;
  }
}

export async function updateFocusSession(id: string, updates: Partial<FocusSession>) {
  const { data, error } = await supabase
    .from('focus_sessions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as FocusSession;
}

export async function getFocusSessions(userId: string) {
  const { data, error } = await supabase
    .from('focus_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('start_time', { ascending: false });

  if (error) throw error;
  return data as FocusSession[];
} 