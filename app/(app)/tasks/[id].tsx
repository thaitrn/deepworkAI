import { View, ActivityIndicator } from 'react-native';
import { Text, Button, useTheme, Portal, Dialog, IconButton, Snackbar } from 'react-native-paper';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { getTask, updateTask, deleteTask } from '@/services/tasks';
import { Task } from '@/types';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export default function TaskDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { session } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    loadTask();
  }, [id]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadTask();
    }, [id])
  );

  const loadTask = async () => {
    try {
      const taskData = await getTask(id as string);
      setTask(taskData);
    } catch (error) {
      console.error('Error loading task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!task) return;
    try {
      await updateTask(task.id, { ...task, status: 'completed' });
      setSuccess('Task completed successfully');
      setTimeout(() => router.back(), 1500);
    } catch (error) {
      setError('Failed to complete task');
    }
  };

  const handleStartFocus = () => {
    if (!task) return;
    router.push({
      pathname: '/focus',
      params: { taskId: task.id }
    });
  };

  const handleDelete = async () => {
    if (!task) return;
    try {
      await deleteTask(task.id);
      setSuccess('Task deleted successfully');
      setTimeout(() => router.back(), 1500);
    } catch (error) {
      setError('Failed to delete task');
    }
  };

  const handleEdit = () => {
    if (!task) return;
    router.push({
      pathname: '/tasks/edit',
      params: { id: task.id }
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text variant="headlineSmall" style={{ textAlign: 'center', marginBottom: 16 }}>
          Task not found
        </Text>
        <Button mode="contained" onPress={() => router.back()}>
          Go Back
        </Button>
      </View>
    );
  }

  const formatDate = (date: string) => {
    const d = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const getDeadlineStatus = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    
    if (deadlineDate < now) {
      return { text: 'Overdue', color: theme.colors.error };
    }
    
    const diffTime = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffTime === 0) {
      return { text: 'Due Today', color: theme.colors.warning };
    }
    if (diffTime === 1) {
      return { text: 'Due Tomorrow', color: theme.colors.primary };
    }
    return { text: `Due ${formatDate(deadline)}`, color: theme.colors.primary };
  };

  return (
    <>
      <View style={{ flex: 1, backgroundColor: 'white', padding: 16 }}>
        <Animated.View 
          entering={FadeIn}
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}
        >
          <Text variant="headlineMedium">{task.title}</Text>
          <IconButton icon="pencil" onPress={handleEdit} />
        </Animated.View>
        
        <Animated.View entering={FadeInDown.delay(100)}>
          {task.description && (
            <Text variant="bodyLarge" style={{ marginBottom: 24, color: '#666' }}>
              {task.description}
            </Text>
          )}

          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              <Text style={{ color: '#666', width: 80 }}>Priority:</Text>
              <Text>{task.priority === 3 ? 'high' : task.priority === 2 ? 'medium' : 'low'}</Text>
            </View>

            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              <Text style={{ color: '#666', width: 80 }}>Status:</Text>
              <Text>{task.status}</Text>
            </View>

            {task.deadline && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: '#666', width: 80 }}>Deadline:</Text>
                <Text style={{ color: getDeadlineStatus(task.deadline).color }}>
                  {getDeadlineStatus(task.deadline).text}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        <View style={{ flex: 1 }} />

        <Animated.View entering={FadeInDown.delay(200)}>
          <Button
            mode="contained"
            onPress={() => setShowCompleteDialog(true)}
            style={{
              marginBottom: 12,
              borderRadius: 8,
              backgroundColor: theme.colors.primary,
            }}
            contentStyle={{ height: 48 }}
          >
            Mark Complete
          </Button>

          <Button
            mode="contained"
            onPress={handleStartFocus}
            icon="timer"
            style={{
              marginBottom: 12,
              borderRadius: 8,
              backgroundColor: theme.colors.primary,
            }}
            contentStyle={{ height: 48 }}
          >
            Start Focus Mode
          </Button>

          <Button
            mode="outlined"
            onPress={() => setShowDeleteDialog(true)}
            textColor={theme.colors.error}
            style={{
              borderRadius: 8,
              borderColor: theme.colors.error,
            }}
            contentStyle={{ height: 48 }}
          >
            Delete Task
          </Button>
        </Animated.View>
      </View>

      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog visible={showDeleteDialog} onDismiss={() => setShowDeleteDialog(false)}>
          <Dialog.Title>Delete Task</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete this task? This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button textColor={theme.colors.error} onPress={handleDelete}>Delete</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={showCompleteDialog} onDismiss={() => setShowCompleteDialog(false)}>
          <Dialog.Title>Complete Task</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Mark this task as completed?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCompleteDialog(false)}>Cancel</Button>
            <Button onPress={handleMarkComplete}>Complete</Button>
          </Dialog.Actions>
        </Dialog>

        <Snackbar
          visible={!!error}
          onDismiss={() => setError('')}
          duration={3000}
          style={{ backgroundColor: theme.colors.error }}
        >
          {error}
        </Snackbar>

        <Snackbar
          visible={!!success}
          onDismiss={() => setSuccess('')}
          duration={3000}
          style={{ backgroundColor: theme.colors.primary }}
        >
          {success}
        </Snackbar>
      </Portal>
    </>
  );
} 