import { View, ScrollView } from 'react-native';
import { Text, FAB, Card, ActivityIndicator, IconButton, Button } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { Task, FocusSession } from '@/types';
import { getTasks, createTask, updateTask, deleteTask } from '@/services/tasks';
import TaskModal from '@/components/TaskModal';
import { useRouter } from 'expo-router';
import FocusStats from '@/components/FocusStats';
import { getFocusSessions } from '@/services/focus';

export default function Dashboard() {
  const { session } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadTasks();
    loadFocusSessions();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await getTasks(session!.user.id);
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
      // TODO: Show error message
    } finally {
      setLoading(false);
    }
  };

  const loadFocusSessions = async () => {
    try {
      const sessions = await getFocusSessions(session!.user.id);
      setFocusSessions(sessions);
    } catch (error) {
      console.error('Error loading focus sessions:', error);
    }
  };

  const handleAddTask = () => {
    setSelectedTask(undefined);
    setModalVisible(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      // TODO: Show error message
    }
  };

  const handleTaskSubmit = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (selectedTask) {
        const updatedTask = await updateTask(selectedTask.id, taskData);
        setTasks(tasks.map(t => t.id === selectedTask.id ? updatedTask : t));
      } else {
        const newTask = await createTask({
          ...taskData,
          user_id: session!.user.id,
        });
        setTasks([newTask, ...tasks]);
      }
    } catch (error) {
      console.error('Error saving task:', error);
      throw error;
    }
  };

  const handleStartFocus = (taskId: string) => {
    if (!taskId) {
      console.error('No task ID provided');
      return;
    }

    router.push({
      pathname: 'focus',
      params: { taskId }
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Text variant="titleLarge" style={{ marginBottom: 16 }}>
          Welcome back, {session?.user.email}
        </Text>

        <Text variant="titleMedium" style={{ marginBottom: 8 }}>
          Your Tasks
        </Text>

        {tasks.length === 0 ? (
          <Card style={{ padding: 16, marginBottom: 16 }}>
            <Text variant="bodyMedium">
              No tasks yet. Click the + button to add your first task.
            </Text>
          </Card>
        ) : (
          tasks.map((task) => (
            <Card key={task.id} style={{ marginBottom: 8 }}>
              <Card.Content>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <Text variant="titleMedium">{task.title}</Text>
                    <Text variant="bodyMedium">Status: {task.status}</Text>
                    {task.description && (
                      <Text variant="bodySmall" style={{ marginTop: 4 }}>
                        {task.description}
                      </Text>
                    )}
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <IconButton
                      icon="timer"
                      onPress={() => handleStartFocus(task.id)}
                    />
                    <IconButton
                      icon="pencil"
                      onPress={() => handleEditTask(task)}
                    />
                    <IconButton
                      icon="delete"
                      onPress={() => handleDeleteTask(task.id)}
                    />
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          <Button
            mode="outlined"
            onPress={() => router.push('/(app)/stats')}
            icon="chart-line"
          >
            View Statistics
          </Button>
          <Button
            mode="outlined"
            onPress={() => router.push('/(app)/chat')}
            icon="robot"
          >
            AI Assistant
          </Button>
        </View>

        <FocusStats sessions={focusSessions} />
      </ScrollView>

      <FAB
        icon="plus"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
        }}
        onPress={handleAddTask}
      />

      <TaskModal
        visible={modalVisible}
        onDismiss={() => {
          setModalVisible(false);
          setSelectedTask(undefined);
        }}
        onSubmit={handleTaskSubmit}
        initialTask={selectedTask}
      />
    </View>
  );
} 