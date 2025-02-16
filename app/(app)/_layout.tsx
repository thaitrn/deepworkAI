import { Stack } from 'expo-router';
import { useAuth } from '@/contexts/auth';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function AppLayout() {
  const { session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.replace('/(auth)/login');
    }
  }, [session]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="upcoming" />
      <Stack.Screen name="search" />
      <Stack.Screen name="menu" />
      <Stack.Screen 
        name="tasks/new" 
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen 
        name="tasks/[id]" 
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
} 