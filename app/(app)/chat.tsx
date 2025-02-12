import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { getTasks } from '@/services/tasks';
import ChatInterface from '@/components/ChatInterface';

export default function ChatScreen() {
  const { session } = useAuth();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await getTasks(session!.user.id);
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ChatInterface tasks={tasks} onTaskCreated={loadTasks} />
    </View>
  );
} 