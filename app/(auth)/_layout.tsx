import { Stack } from 'expo-router';
import { useAuth } from '@/contexts/auth';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function AuthLayout() {
  const { session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.replace('/(app)/dashboard');
    }
  }, [session]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'white' },
        animation: 'slide_from_bottom',
      }}
    />
  );
} 