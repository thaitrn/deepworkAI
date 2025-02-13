import { createClient } from '@supabase/supabase-js';
import { Task, User } from '../types';

export class ApiService {
  private static instance: ApiService;
  private supabase;

  private constructor() {
    this.supabase = createClient(
      process.env.EXPO_PUBLIC_SUPABASE_URL!,
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // Optimized query with pagination
  async getTasks(userId: string, page = 1, limit = 20) {
    const from = (page - 1) * limit;
    return this.supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('priority', { ascending: false })
      .range(from, from + limit - 1);
  }

  // ... other API methods
}