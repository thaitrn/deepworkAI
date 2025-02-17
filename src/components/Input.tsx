import { View } from 'react-native';
import { TextInput, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  onSubmitEditing?: () => void;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
}

export function Input({
  label,
  value,
  onChangeText,
  error,
  secureTextEntry,
  autoCapitalize = 'none',
  keyboardType = 'default',
  onSubmitEditing,
  returnKeyType,
}: InputProps) {
  const theme = useTheme();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={{ marginBottom: 16 }}>
      <Text 
        style={{ 
          marginBottom: 8,
          color: theme.colors.outline,
          textTransform: 'uppercase',
          fontSize: 12,
          letterSpacing: 1,
        }}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !isPasswordVisible}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        onSubmitEditing={onSubmitEditing}
        returnKeyType={returnKeyType}
        mode="outlined"
        style={{
          backgroundColor: theme.colors.surface,
          fontSize: 16,
        }}
        outlineStyle={{
          borderRadius: 8,
        }}
        error={!!error}
        right={secureTextEntry ? (
          <TextInput.Icon
            icon={isPasswordVisible ? 'eye-off' : 'eye'}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            color={theme.colors.outline}
          />
        ) : undefined}
      />
      {error && (
        <Text style={{ color: theme.colors.error, fontSize: 12, marginTop: 4 }}>
          {error}
        </Text>
      )}
    </View>
  );
} 