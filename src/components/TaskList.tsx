import React, { memo } from 'react';
import { FlatList, ListRenderItem, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Task } from '@/types';
import { TaskItem } from './TaskItem';

interface Props {
  tasks: Task[];
  onTaskPress: (task: Task) => void;
  onLoadMore: () => void;
  hasMore: boolean;
}

const TaskList = memo(({ tasks, onTaskPress, onLoadMore, hasMore }: Props) => {
  const renderItem: ListRenderItem<Task> = ({ item }) => (
    <TaskItem task={item} onPress={() => onTaskPress(item)} />
  );

  if (!tasks.length) {
    return null;
  }

  return (
    <FlatList
      data={tasks}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      onEndReached={hasMore ? onLoadMore : undefined}
      onEndReachedThreshold={0.5}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      contentContainerStyle={{ paddingBottom: 16 }}
    />
  );
});

export default TaskList; 