import { View, ScrollView, RefreshControl, Pressable, Keyboard } from 'react-native';
import { 
  Text, 
  FAB, 
  ActivityIndicator, 
  IconButton, 
  Button, 
  useTheme, 
  Surface, 
  Chip,
  Snackbar,
  TextInput,
  ProgressBar,
} from 'react-native-paper';
import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { Task } from '@/types';
import { getTasks } from '@/services/tasks';
import { useRouter, useFocusEffect } from 'expo-router';
import { TaskItem } from '@/components/TaskItem';
import Animated, { FadeIn, FadeInDown, withSpring, withTiming } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type SortOption = 'created' | 'deadline' | 'priority';

function SearchBar({ 
  value: searchQuery,
  onChangeText: setSearchQuery,
  onClear,
  onFilterChange,
  filteredTasksCount,
  pendingCount,
  completedCount,
  currentFilter,
}: {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  onFilterChange: (filter: 'pending' | 'completed') => void;
  filteredTasksCount: number;
  pendingCount: number;
  completedCount: number;
  currentFilter: 'pending' | 'completed';
}) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Animated.View
      entering={FadeInDown.delay(200)}
      style={[
        {
          marginBottom: 16,
          borderRadius: 28,
          backgroundColor: theme.colors.surfaceVariant,
          overflow: 'hidden',
        },
        isFocused && {
          backgroundColor: theme.colors.surface,
          elevation: 2,
        }
      ]}
    >
      <TextInput
        placeholder="Search tasks..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        mode="flat"
        style={{
          backgroundColor: 'transparent',
          fontSize: 16,
        }}
        left={
          <TextInput.Icon 
            icon="magnify" 
            color={isFocused ? theme.colors.primary : theme.colors.outline}
          />
        }
        right={searchQuery ? (
          <TextInput.Icon 
            icon="close-circle" 
            color={theme.colors.outline}
            onPress={() => {
              setSearchQuery('');
              onClear();
              Keyboard.dismiss();
            }}
          />
        ) : null}
      />
      {searchQuery && (
        <View style={{ padding: 8, borderTopWidth: 1, borderTopColor: theme.colors.outlineVariant }}>
          <Text variant="labelSmall" style={{ color: theme.colors.outline, marginBottom: 4 }}>
            Found {filteredTasksCount} tasks
          </Text>
          {filteredTasksCount > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <Chip 
                icon="clock-outline"
                onPress={() => onFilterChange('pending')}
                selected={currentFilter === 'pending'}
                compact
              >
                Pending ({pendingCount})
              </Chip>
              <Chip
                icon="check-circle-outline"
                onPress={() => onFilterChange('completed')}
                selected={currentFilter === 'completed'}
                compact
              >
                Completed ({completedCount})
              </Chip>
            </View>
          )}
        </View>
      )}
    </Animated.View>
  );
}

export default function Dashboard() {
  const { session } = useAuth();
  const theme = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [filter, setFilter] = useState<'pending' | 'completed'>('pending');
  const [sortBy, setSortBy] = useState<SortOption>('created');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const router = useRouter();
  const isFirstLoad = useRef(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadTasks = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const data = await getTasks(session!.user.id);
      setTasks(data);
      setError('');
      setRetryCount(0);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setError('Failed to load tasks');
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadTasks(showLoading);
        }, 1000 * Math.pow(2, retryCount)); // Exponential backoff
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session?.user.id, retryCount]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTasks(false);
  }, [loadTasks]);

  // Initial load and background refresh
  useFocusEffect(
    useCallback(() => {
      if (isFirstLoad.current) {
        loadTasks(true);
        isFirstLoad.current = false;
      } else {
        loadTasks(false);
      }
    }, [loadTasks])
  );

  const handleAddTask = () => {
    router.push('/tasks/new');
  };

  const sortTasks = (tasksToSort: Task[]) => {
    return [...tasksToSort].sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'priority':
          return b.priority - a.priority;
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  };

  const filteredAndSortedTasks = sortTasks(
    tasks.filter(task => 
      filter === 'pending' ? task.status !== 'completed' : task.status === 'completed'
    )
  );

  // Calculate task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const todaysTasks = tasks.filter(task => {
    if (!task.deadline) return false;
    const today = new Date();
    const deadline = new Date(task.deadline);
    return (
      deadline.getDate() === today.getDate() &&
      deadline.getMonth() === today.getMonth() &&
      deadline.getFullYear() === today.getFullYear()
    );
  });

  // Filter tasks based on search
  const getFilteredTasks = useCallback(() => {
    return tasks.filter(task => {
      const matchesSearch = searchQuery 
        ? task.title.toLowerCase().includes(searchQuery.toLowerCase()) 
        : true;
      const matchesStatus = filter === 'pending' 
        ? task.status !== 'completed' 
        : task.status === 'completed';
      return matchesSearch && matchesStatus;
    });
  }, [tasks, searchQuery, filter]);

  const handleClearSearch = () => {
    setSearchQuery('');
    // Optional: Reset any search-related state
  };

  if (loading && isFirstLoad.current) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header Section */}
      <Surface style={{ elevation: 1, backgroundColor: theme.colors.surface }}>
        <View style={{ padding: 16, paddingTop: 24 }}>
          <View style={{ marginBottom: 24 }}>
            <Text variant="titleLarge" style={{ fontWeight: 'bold', marginBottom: 4 }}>My Tasks</Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
          </View>

          {/* Replace existing search with new SearchBar */}
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={handleClearSearch}
            onFilterChange={setFilter}
            filteredTasksCount={getFilteredTasks().length}
            pendingCount={getFilteredTasks().filter(t => t.status !== 'completed').length}
            completedCount={getFilteredTasks().filter(t => t.status === 'completed').length}
            currentFilter={filter}
          />

          {/* Show stats only when not searching */}
          {!searchQuery && (
            <>
              {/* Quick Stats */}
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                <Surface style={{ 
                  flex: 1, 
                  padding: 16, 
                  borderRadius: 12,
                  backgroundColor: theme.colors.primaryContainer,
                }}>
                  <Text style={{ color: theme.colors.onPrimaryContainer, fontSize: 24, fontWeight: 'bold' }}>
                    {todaysTasks.length}
                  </Text>
                  <Text style={{ color: theme.colors.onPrimaryContainer }}>Today's Tasks</Text>
                </Surface>
                <Surface style={{ 
                  flex: 1, 
                  padding: 16, 
                  borderRadius: 12,
                  backgroundColor: theme.colors.secondaryContainer,
                }}>
                  <Text style={{ color: theme.colors.onSecondaryContainer, fontSize: 24, fontWeight: 'bold' }}>
                    {Math.round(completionRate)}%
                  </Text>
                  <Text style={{ color: theme.colors.onSecondaryContainer }}>Completion</Text>
                </Surface>
              </View>

              {/* Filter Section */}
              <FilterSection
                filter={filter}
                onFilterChange={setFilter}
              />
            </>
          )}
        </View>
      </Surface>

      {/* Tasks List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        {loading && !refreshing ? (
          <View style={{ padding: 16, alignItems: 'center' }}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : getFilteredTasks().length > 0 ? (
          <Animated.View entering={FadeIn}>
            {searchQuery ? (
              // Search results view
              <View>
                <Text variant="titleMedium" style={{ marginBottom: 12, color: theme.colors.primary }}>
                  Search Results
                </Text>
                {getFilteredTasks().map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onPress={() => router.push(`/tasks/${task.id}`)}
                    highlightText={searchQuery}
                  />
                ))}
              </View>
            ) : (
              // Normal view with Today's and All Tasks
              <>
                {/* Today's Tasks */}
                {todaysTasks.length > 0 && (
                  <View style={{ marginBottom: 24 }}>
                    <Text variant="titleMedium" style={{ marginBottom: 12, color: theme.colors.primary }}>
                      Today's Tasks
                    </Text>
                    {todaysTasks.map(task => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onPress={() => router.push(`/tasks/${task.id}`)}
                      />
                    ))}
                  </View>
                )}

                {/* Other Tasks */}
                <View>
                  <Text variant="titleMedium" style={{ marginBottom: 12, color: theme.colors.primary }}>
                    All Tasks
                  </Text>
                  {getFilteredTasks()
                    .filter(task => !todaysTasks.includes(task))
                    .map(task => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onPress={() => router.push(`/tasks/${task.id}`)}
                      />
                    ))}
                </View>
              </>
            )}
          </Animated.View>
        ) : (
          <View style={{ padding: 24, alignItems: 'center', opacity: 0.7 }}>
            <MaterialCommunityIcons
              name="checkbox-blank-off-outline"
              size={48}
              color={theme.colors.outline}
              style={{ marginBottom: 16 }}
            />
            <Text variant="titleMedium" style={{ marginBottom: 8, textAlign: 'center' }}>
              No tasks found
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.outline, textAlign: 'center' }}>
              {searchQuery 
                ? 'Try adjusting your search'
                : filter === 'pending' 
                  ? 'Add a new task to get started'
                  : 'Complete some tasks to see them here'}
            </Text>
          </View>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        onPress={handleAddTask}
        style={{
          position: 'absolute',
          right: 16,
          bottom: 16,
          backgroundColor: theme.colors.primary,
        }}
      />

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        action={{
          label: 'Retry',
          onPress: () => loadTasks(true),
        }}
      >
        {error}
      </Snackbar>
    </View>
  );
}

function FilterSection({ filter, onFilterChange }: { 
  filter: 'pending' | 'completed';
  onFilterChange: (filter: 'pending' | 'completed') => void;
}) {
  const theme = useTheme();

  return (
    <Surface 
      style={{ 
        borderRadius: 28,
        marginBottom: 24,
        overflow: 'hidden',
      }}
    >
      <View style={{ 
        flexDirection: 'row',
        backgroundColor: theme.colors.surfaceVariant,
      }}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 4,
              bottom: 4,
              width: '50%',
              backgroundColor: theme.colors.primaryContainer,
              borderRadius: 24,
            },
            {
              transform: [{
                translateX: filter === 'pending' ? 4 : '100%',
              }],
            },
          ]}
        />
        <Pressable
          onPress={() => onFilterChange('pending')}
          style={{ 
            flex: 1,
            padding: 12,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <MaterialCommunityIcons
            name="clock-outline"
            size={20}
            color={filter === 'pending' ? theme.colors.primary : theme.colors.outline}
          />
          <Text
            style={{
              color: filter === 'pending' ? theme.colors.primary : theme.colors.outline,
              fontWeight: filter === 'pending' ? 'bold' : 'normal',
            }}
          >
            Pending
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onFilterChange('completed')}
          style={{ 
            flex: 1,
            padding: 12,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <MaterialCommunityIcons
            name="check-circle-outline"
            size={20}
            color={filter === 'completed' ? theme.colors.primary : theme.colors.outline}
          />
          <Text
            style={{
              color: filter === 'completed' ? theme.colors.primary : theme.colors.outline,
              fontWeight: filter === 'completed' ? 'bold' : 'normal',
            }}
          >
            Completed
          </Text>
        </Pressable>
      </View>
    </Surface>
  );
} 