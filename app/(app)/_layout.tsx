import { Stack } from 'expo-router';
import { Button } from 'react-native-paper';
import { useAuth } from '@/contexts/auth';

export default function AppLayout() {
  const { signOut } = useAuth();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6200ee',
        },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Dashboard',
          headerRight: () => (
            <Button textColor="white" onPress={signOut}>
              Logout
            </Button>
          ),
        }}
      />
      <Stack.Screen
        name="tasks/new"
        options={{
          title: 'New Task',
        }}
      />
      <Stack.Screen
        name="tasks/[id]"
        options={{
          title: 'Task Details',
        }}
      />
      <Stack.Screen
        name="tasks/edit"
        options={{
          title: 'Edit Task',
        }}
      />
      <Stack.Screen
        name="focus/index"
        options={{
          title: 'Focus Mode',
        }}
      />
    </Stack>
  );
} 