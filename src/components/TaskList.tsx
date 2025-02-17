import React, { memo } from 'react';
import { FlatList, ListRenderItem, View } from 'react-native';
import { Text, ActivityIndicator, useTheme } from 'react-native-paper';
import { Task } from '@/types';
import { TaskItem } from './TaskItem';

interface Props {
  tasks: Task[];
  onTaskPress: (task: Task) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  loading?: boolean;
  emptyMessage?: string;
  ListHeaderComponent?: React.ReactNode;
}

export const TaskList = memo(({ 
  tasks, 
  onTaskPress, 
  onLoadMore, 
  hasMore,
  refreshing,
  onRefresh,
  loading,
  emptyMessage = 'No tasks yet',
  ListHeaderComponent
}: Props) => {
  const theme = useTheme();

  const renderItem: ListRenderItem<Task> = ({ item }) => (
    <TaskItem task={item} onPress={() => onTaskPress(item)} />
  );

  if (loading) {
    return (
      <View style={{ padding: 24, alignItems: 'center' }}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (!tasks.length) {
    return (
      <View style={{ alignItems: 'center', padding: 24 }}>
        <Text style={{ color: theme.colors.outline }}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={tasks}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      onEndReached={hasMore ? onLoadMore : undefined}
      onEndReachedThreshold={0.5}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListHeaderComponent={ListHeaderComponent}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      contentContainerStyle={{ 
        paddingHorizontal: 16,
        paddingBottom: 16 
      }}
    />
  );
}); 