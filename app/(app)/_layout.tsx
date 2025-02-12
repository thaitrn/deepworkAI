import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { Button, IconButton } from 'react-native-paper';
import { useAuth } from '@/contexts/auth';

export default function AppLayout() {
  const { session, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) {
      router.replace('/(auth)/login');
    }
  }, [session, loading]);

  if (loading || !session) {
    return null;
  }

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
        name="dashboard"
        options={{
          title: 'Dashboard',
          headerRight: () => (
            <Button 
              textColor="white"
              onPress={async () => {
                await signOut();
                router.replace('/(auth)/login');
              }}
            >
              Logout
            </Button>
          ),
        }}
      />
      <Stack.Screen
        name="focus/index"
        options={{
          title: 'Focus Mode',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="stats"
        options={{
          title: 'Statistics',
        }}
      />
      <Stack.Screen
        name="chat"
        options={{
          title: 'AI Assistant',
          headerRight: () => (
            <IconButton
              icon="information"
              iconColor="white"
              onPress={() => {
                // TODO: Show AI capabilities info
              }}
            />
          ),
        }}
      />
    </Stack>
  );
} 