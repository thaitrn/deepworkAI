import { supabase } from '@/lib/supabase';

export async function verifyDatabaseStructure() {
  try {
    // Verify tasks table
    const { error: tasksError } = await supabase
      .from('tasks')
      .select('id, deadline')
      .limit(1);

    if (tasksError) {
      console.error('Tasks table verification failed:', tasksError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Database verification error:', error);
    return false;
  }
} 