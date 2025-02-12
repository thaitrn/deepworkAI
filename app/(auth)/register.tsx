import { View } from 'react-native';
import { Link, router } from 'expo-router';
import { Button, Text, TextInput, HelperText } from 'react-native-paper';
import { useState } from 'react';
import { useAuth } from '@/contexts/auth';

export default function Register() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await signUp(email, password);
      // Update the path to match the file structure
      router.replace('/(auth)/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
      <Text variant="headlineMedium" style={{ marginBottom: 24, textAlign: 'center' }}>
        Create Account
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
        style={{ marginBottom: 16 }}
      />

      <TextInput
        mode="outlined"
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={!showPassword}
        style={{ marginBottom: 24 }}
      />

      {error ? <HelperText type="error">{error}</HelperText> : null}
      <Button
        mode="contained"
        onPress={handleRegister}
        loading={loading}
        disabled={loading}
        style={{ marginBottom: 16 }}
      >
        Register
      </Button>

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
        <Text variant="bodyMedium">Already have an account?</Text>
        <Link href="/login" asChild>
          <Text variant="bodyMedium" style={{ color: '#6200ee' }}>
            Login
          </Text>
        </Link>
      </View>
    </View>
  );
} 