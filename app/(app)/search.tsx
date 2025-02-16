import { View } from 'react-native';
import { Searchbar, useTheme, Chip } from 'react-native-paper';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { ScreenLayout } from '@/components/ScreenLayout';
import { TaskList } from '@/components/TaskList';
import { useAuth } from '@/contexts/auth';
import { getTasks } from '@/services/tasks';
import { Task } from '@/types';
import { isToday, isAfter } from 'date-fns';
import { useRouter } from 'expo-router';

type Filter = 'all' | 'today' | 'upcoming' | 'completed';

export default function SearchScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { session } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = useCallback(async () => {
    if (!session?.user?.id) {
      console.warn('No user ID available');
      return;
    }
    
    try {
      setLoading(true);
      const fetchedTasks = await getTasks(session.user.id);
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user?.id) {
      loadTasks();
    }
  }, [session?.user?.id, loadTasks]);

  const handleTaskPress = useCallback((task: Task) => {
    router.push(`/(app)/tasks/${task.id}`);
  }, [router]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      switch (filter) {
        case 'completed':
          return matchesSearch && task.completed;
        case 'today':
          return matchesSearch && isToday(new Date(task.due_date || Date.now()));
        case 'upcoming':
          return matchesSearch && task.due_date && isAfter(new Date(task.due_date), new Date());
        default:
          return matchesSearch;
      }
    });
  }, [tasks, searchQuery, filter]);

  const renderFilters = () => (
    <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 8 }}>
      {(['all', 'today', 'upcoming', 'completed'] as Filter[]).map((f) => (
        <Chip
          key={f}
          selected={filter === f}
          onPress={() => setFilter(f)}
          style={{ backgroundColor: filter === f ? theme.colors.primaryContainer : undefined }}
        >
          {f.charAt(0).toUpperCase() + f.slice(1)}
        </Chip>
      ))}
    </View>
  );

  return (
    <ScreenLayout
      title="Search"
    >
      <View style={{ padding: 16 }}>
        <Searchbar
          placeholder="Search tasks..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{
            backgroundColor: theme.colors.surface,
            elevation: 2,
            marginBottom: 8,
          }}
        />
        {renderFilters()}
      </View>

      <TaskList
        tasks={filteredTasks}
        onTaskPress={handleTaskPress}
        loading={loading}
        hasMore={false}
        onLoadMore={() => {}}
        emptyMessage={searchQuery ? 'No matching tasks found' : 'Start typing to search'}
      />
    </ScreenLayout>
  );
} 