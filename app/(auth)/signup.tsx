import { View, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { useState } from 'react';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '@/contexts/auth';
import { Input } from '@/components/Input';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function SignUpScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await signUp(email, password);
      router.replace('/(auth)/login');
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
          <Link href="/(auth)/login" style={{ marginBottom: 32 }}>
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
            Sign Up
          </Text>
          
          <Text 
            variant="bodyLarge" 
            style={{ 
              color: theme.colors.outline,
              marginBottom: 32,
            }}
          >
            Add your email and password.
          </Text>

          <Input
            label="Your Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            returnKeyType="next"
            error={error}
          />

          <Input
            label="Your Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleSignUp}
            error={error}
          />

          <Button
            mode="contained"
            onPress={handleSignUp}
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
            Sign Up
          </Button>

          <View style={{ marginTop: 24, alignItems: 'center' }}>
            <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
              Already have an account?{' '}
              <Link href="/(auth)/login" style={{ color: theme.colors.primary }}>
                Log in
              </Link>
            </Text>
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
} 