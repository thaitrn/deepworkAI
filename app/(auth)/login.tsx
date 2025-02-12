import { View } from 'react-native';
import { Link, router } from 'expo-router';
import { Button, Text, TextInput, HelperText } from 'react-native-paper';
import { useState } from 'react';
import { useAuth } from '@/contexts/auth';

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await signIn(email, password);
      router.replace('/(app)/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
      <Text variant="headlineMedium" style={{ marginBottom: 24, textAlign: 'center' }}>
        Login to DeepWork AI
      </Text>

      <TextInput
        mode="outlined"
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ marginBottom: 16 }}
      />

      <TextInput
        mode="outlined"
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
        right={
          <TextInput.Icon
            icon={showPassword ? 'eye-off' : 'eye'}
            onPress={() => setShowPassword(!showPassword)}
          />
        }
        style={{ marginBottom: 24 }}
      />

      {error ? <HelperText type="error">{error}</HelperText> : null}
      <Button
        mode="contained"
        onPress={handleLogin}
        loading={loading}
        disabled={loading}
        style={{ marginBottom: 16 }}
      >
        Login
      </Button>

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
        <Text variant="bodyMedium">Don't have an account?</Text>
        <Link href="/register" asChild>
          <Text variant="bodyMedium" style={{ color: '#6200ee' }}>
            Register
          </Text>
        </Link>
      </View>
    </View>
  );
} 