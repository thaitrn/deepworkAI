import { View } from 'react-native';
import { Text, FAB, useTheme } from 'react-native-paper';
import { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/auth';
import { Task } from '@/types';
import { getTasks } from '@/services/tasks';
import { useRouter } from 'expo-router';
import { ScreenLayout } from '@/components/ScreenLayout';
import { TaskList } from '@/components/TaskList';
import { format, isAfter, isBefore, startOfTomorrow, endOfWeek, isToday } from 'date-fns';
import { TaskItem } from '@/components/TaskItem';

export default function UpcomingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { session } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const isFirstLoad = useRef(true);

  const loadTasks = useCallback(async (showLoading = true) => {
    if (!session?.user?.id) {
      console.warn('No user ID available');
      return;
    }
    
    try {
      if (showLoading) {
        setLoading(true);
      }
      const fetchedTasks = await getTasks(session.user.id);
      setTasks(fetchedTasks);
      setHasMore(fetchedTasks.length >= 10);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
      isFirstLoad.current = false;
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user?.id) {
      loadTasks();
    }
  }, [session?.user?.id, loadTasks]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadTasks(false).finally(() => {
      setRefreshing(false);
    });
  }, [loadTasks]);

  const handleLoadMore = useCallback(() => {
    if (!hasMore || loading || refreshing) return;
    loadTasks(false);
  }, [hasMore, loading, refreshing, loadTasks]);

  const handleTaskPress = useCallback((task: Task) => {
    router.push(`/(app)/tasks/${task.id}`);
  }, [router]);

  const { upcomingTasks, overdueTasks } = useMemo(() => {
    const now = new Date();
    return {
      overdueTasks: tasks.filter(task => 
        !task.completed && 
        task.due_date && 
        isBefore(new Date(task.due_date), now)
      ),
      upcomingTasks: tasks.filter(task => 
        !task.completed && 
        task.due_date && 
        isAfter(new Date(task.due_date), now) &&
        !isToday(new Date(task.due_date))
      ).sort((a, b) => 
        new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()
      )
    };
  }, [tasks]);

  const renderHeader = useCallback(() => {
    if (overdueTasks.length === 0) return null;

    return (
      <View style={{ marginBottom: 24 }}>
        <Text 
          variant="titleMedium" 
          style={{ 
            color: theme.colors.error,
            marginBottom: 12 
          }}
        >
          Overdue
        </Text>
        {overdueTasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onPress={() => handleTaskPress(task)}
          />
        ))}
      </View>
    );
  }, [overdueTasks, theme.colors.error, handleTaskPress]);

  return (
    <ScreenLayout
      title="Upcoming"
      showSearch
      fab={
        <FAB
          icon="plus"
          onPress={() => router.push('/(app)/tasks/new')}
          style={{
            position: 'absolute',
            right: 16,
            bottom: 80,
            backgroundColor: theme.colors.primary,
          }}
        />
      }
    >
      <TaskList
        tasks={upcomingTasks}
        onTaskPress={handleTaskPress}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        loading={loading && !refreshing}
        emptyMessage="No upcoming tasks"
        ListHeaderComponent={renderHeader}
      />
    </ScreenLayout>
  );
} 