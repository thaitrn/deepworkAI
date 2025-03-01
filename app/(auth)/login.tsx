import { View, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { useState } from 'react';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '@/contexts/auth';
import { Input } from '@/components/Input';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await signIn(email, password);
      router.replace('/(app)/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Animated.View 
          entering={FadeIn}
          style={{ 
            flex: 1,
            padding: 24,
            justifyContent: 'center',
          }}
        >
          <Link href="/" style={{ marginBottom: 32 }}>
            <Text 
              style={{ 
                color: theme.colors.primary,
                fontSize: 16,
              }}
            >
              Close
            </Text>
          </Link>

          <Text 
            variant="displaySmall" 
            style={{ 
              fontWeight: 'bold',
              marginBottom: 8,
            }}
          >
            Log in
          </Text>
          
          <Text 
            variant="bodyLarge" 
            style={{ 
              color: theme.colors.outline,
              marginBottom: 32,
            }}
          >
            Welcome back! Enter your details.
          </Text>

          <Input
            label="Your Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError('');
            }}
            keyboardType="email-address"
            returnKeyType="next"
            error={error}
          />

          <Input
            label="Your Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError('');
            }}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            error={error}
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            style={{ 
              marginTop: 16,
              borderRadius: 8,
              height: 48,
              justifyContent: 'center',
            }}
            contentStyle={{
              height: 48,
            }}
          >
            Log in
          </Button>

          <View style={{ marginTop: 24, alignItems: 'center' }}>
            <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
              Don't have an account?{' '}
              <Link href="/(auth)/signup" style={{ color: theme.colors.primary }}>
                Sign up
              </Link>
            </Text>
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
} 