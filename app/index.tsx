import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/auth';

export default function Index() {
  const { session } = useAuth();
  return <Redirect href={session ? '/(app)/dashboard' : '/(auth)/login'} />;
} 