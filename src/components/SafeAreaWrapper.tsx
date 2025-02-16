import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
}

export function SafeAreaWrapper({ children }: SafeAreaWrapperProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <View 
      style={{ 
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        backgroundColor: theme.colors.background,
      }}
    >
      {children}
    </View>
  );
} 