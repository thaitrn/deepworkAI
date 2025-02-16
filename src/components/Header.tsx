import { View } from 'react-native';
import { Text, useTheme, IconButton } from 'react-native-paper';
import Animated, { FadeIn } from 'react-native-reanimated';

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function Header({ title, subtitle, action }: HeaderProps) {
  const theme = useTheme();

  return (
    <Animated.View 
      entering={FadeIn}
      style={{ 
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: theme.colors.surface,
      }}
    >
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 52,
      }}>
        <View style={{ flex: 1 }}>
          <Text 
            variant="titleLarge" 
            style={{ 
              fontWeight: 'bold',
              color: theme.colors.onSurface,
              fontSize: 28,
            }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text 
              variant="bodyMedium" 
              style={{ 
                color: theme.colors.outline,
                marginTop: 2,
              }}
            >
              {subtitle}
            </Text>
          )}
        </View>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {action}
          <IconButton 
            icon="dots-vertical" 
            size={24}
            iconColor={theme.colors.outline}
          />
        </View>
      </View>
    </Animated.View>
  );
} 