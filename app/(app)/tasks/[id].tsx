import { View, ScrollView } from 'react-native';
import { Text, useTheme, Button, IconButton, Divider } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Task } from '@/types';
import { getTask, updateTask, deleteTask } from '@/services/tasks';
import { ScreenLayout } from '@/components/ScreenLayout';
import { format } from 'date-fns';

export default function TaskDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTask = async () => {
      try {
        const fetchedTask = await getTask(id);
        setTask(fetchedTask);
      } catch (error) {
        console.error('Error loading task:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, [id]);

  const handleComplete = useCallback(async () => {
    if (!task) return;
    try {
      const updatedTask = await updateTask(task.id, { completed: !task.completed });
      setTask(updatedTask);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }, [task]);

  const handleDelete = useCallback(async () => {
    if (!task) return;
    try {
      await deleteTask(task.id);
      router.back();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }, [task, router]);

  const handleStartFocus = useCallback(() => {
    if (!task) return;
    router.push(`/(app)/focus?taskId=${task.id}`);
  }, [task, router]);

  if (loading || !task) {
    return (
      <ScreenLayout title="Task">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading...</Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      title={task.title}
      action={
        <IconButton 
          icon="pencil" 
          onPress={() => router.push(`/(app)/tasks/edit/${task.id}`)}
        />
      }
    >
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 16 }}>
          {/* Task Details */}
          <View style={{ marginBottom: 24 }}>
            <Text variant="bodyLarge" style={{ marginBottom: 16 }}>
              {task.description}
            </Text>

            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              <Text style={{ width: 80, color: theme.colors.outline }}>
                Priority:
              </Text>
              <Text style={{ color: theme.colors.onSurface }}>
                {task.priority}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              <Text style={{ width: 80, color: theme.colors.outline }}>
                Status:
              </Text>
              <Text style={{ color: theme.colors.onSurface }}>
                {task.completed ? 'Completed' : 'Pending'}
              </Text>
            </View>

            {task.deadline && (
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ width: 80, color: theme.colors.outline }}>
                  Due:
                </Text>
                <Text style={{ color: theme.colors.onSurface }}>
                  {format(new Date(task.deadline), 'PPP')}
                </Text>
              </View>
            )}
          </View>

          <Divider style={{ marginVertical: 24 }} />

          {/* Action Buttons */}
          <View style={{ gap: 12 }}>
            <Button 
              mode="contained"
              onPress={handleComplete}
            >
              Mark {task.completed ? 'Incomplete' : 'Complete'}
            </Button>

            <Button 
              mode="contained"
              icon="timer"
              onPress={handleStartFocus}
              style={{ backgroundColor: theme.colors.secondary }}
            >
              Start Focus Mode
            </Button>

            <Button 
              mode="outlined"
              textColor={theme.colors.error}
              onPress={handleDelete}
            >
              Delete Task
            </Button>
          </View>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
} 