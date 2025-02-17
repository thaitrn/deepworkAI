import React, { Fragment, useEffect, useState, useMemo } from 'react';
import { View, ScrollView, RefreshControl, Pressable, Keyboard, TouchableWithoutFeedback, Image } from 'react-native';
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
import { useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { Task } from '@/types';
import { getTasks } from '@/services/tasks';
import { useRouter, useFocusEffect } from 'expo-router';
import { TaskItem } from '@/components/TaskItem';
import Animated, { FadeIn, FadeInDown, withSpring, withTiming } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { EmptyState } from '@/components/EmptyState';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Header } from '@/components/Header';
import { SafeAreaWrapper } from '@/components/SafeAreaWrapper';
import { TaskList } from '@/components/TaskList';
import { SearchBar } from '@/components/SearchBar';
import { ScreenLayout } from '@/components/ScreenLayout';
import { isToday } from 'date-fns';

type SortOption = 'created' | 'deadline' | 'priority';

function TaskSearchBar({
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Surface
        style={[
          {
            marginBottom: 16,
            borderRadius: 28,
            backgroundColor: theme.colors.surfaceVariant,
          },
          isFocused && {
            backgroundColor: theme.colors.surface,
            elevation: 2,
          }
        ]}
      >
        <View style={{ borderRadius: 28 }}>
          <View style={{ overflow: 'hidden', borderRadius: 28 }}>
            <TextInput
              placeholder="Search tasks..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                setIsFocused(false);
                if (!searchQuery) {
                  Keyboard.dismiss();
                }
              }}
              mode="flat"
              style={{
                backgroundColor: 'transparent',
                fontSize: 16,
              }}
              returnKeyType="search"
              onSubmitEditing={Keyboard.dismiss}
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
                      onPress={() => {
                        onFilterChange('pending');
                        Keyboard.dismiss();
                      }}
                      selected={currentFilter === 'pending'}
                      compact
                    >
                      Pending ({pendingCount})
                    </Chip>
                    <Chip
                      icon="check-circle-outline"
                      onPress={() => {
                        onFilterChange('completed');
                        Keyboard.dismiss();
                      }}
                      selected={currentFilter === 'completed'}
                      compact
                    >
                      Completed ({completedCount})
                    </Chip>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </Surface>
    </TouchableWithoutFeedback>
  );
}

export default function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { session } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [filter, setFilter] = useState<'pending' | 'completed'>('pending');
  const [sortBy, setSortBy] = useState<SortOption>('created');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const isFirstLoad = useRef(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasMore, setHasMore] = useState(true);

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
      setError('');
      setRetryCount(0);
      setHasMore(fetchedTasks.length >= 10);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setError('Failed to load tasks');
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadTasks(showLoading);
        }, 1000 * Math.pow(2, retryCount));
      }
    } finally {
      setLoading(false);
      isFirstLoad.current = false;
    }
  }, [session?.user?.id, retryCount]);

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

  const todayTasks = useMemo(() => {
    return tasks.filter(task => {
      if (task.completed) return false;
      if (!task.due_date) return true; // Tasks without due date show in Today
      return isToday(new Date(task.due_date));
    });
  }, [tasks]);

  if (loading && isFirstLoad.current) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScreenLayout
      title="Today"
      subtitle={new Date().toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      })}
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
        tasks={todayTasks}
        onTaskPress={handleTaskPress}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        loading={loading && !refreshing}
        emptyMessage="You're all done for today! 🎉"
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
    </ScreenLayout>
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
      }}
    >
      <View style={{ borderRadius: 28 }}>
        <View style={{ 
          overflow: 'hidden',
          borderRadius: 28,
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
      </View>
    </Surface>
  );
}