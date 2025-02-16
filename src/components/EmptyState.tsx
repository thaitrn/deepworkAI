import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ 
  icon = 'check-circle-outline',
  title,
  description,
  action
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <Animated.View 
      entering={FadeIn}
      style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 24 
      }}
    >
      <MaterialCommunityIcons
        name={icon}
        size={80}
        color={theme.colors.primary}
        style={{ marginBottom: 24 }}
      />
      <Text 
        variant="titleLarge" 
        style={{ 
          textAlign: 'center',
          marginBottom: 8,
          color: theme.colors.onSurface,
        }}
      >
        {title}
      </Text>
      {description && (
        <Text
          variant="bodyMedium"
          style={{ 
            textAlign: 'center',
            color: theme.colors.outline,
            marginBottom: action ? 24 : 0,
          }}
        >
          {description}
        </Text>
      )}
      {action}
    </Animated.View>
  );
} 