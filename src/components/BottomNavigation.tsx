import { View } from 'react-native';
import { useTheme, IconButton, Text } from 'react-native-paper';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function BottomNavigation() {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const routes = [
    { icon: 'home-variant', label: 'Today', path: '/(app)/dashboard' },
    { icon: 'calendar-blank', label: 'Upcoming', path: '/(app)/upcoming' },
    { icon: 'magnify', label: 'Search', path: '/(app)/search' },
    { icon: 'menu', label: 'Menu', path: '/(app)/menu' },
  ];

  return (
    <View style={{ 
      flexDirection: 'row', 
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outlineVariant,
      paddingBottom: Math.max(insets.bottom, 12),
    }}>
      {routes.map((route) => {
        const isActive = pathname === route.path;
        return (
          <View 
            key={route.path}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingTop: 8,
            }}
          >
            <IconButton
              icon={route.icon}
              selected={isActive}
              onPress={() => router.push(route.path)}
              size={24}
              style={{ margin: 0 }}
              iconColor={isActive ? theme.colors.primary : theme.colors.outline}
            />
            <Text 
              variant="labelSmall"
              style={{ 
                color: isActive ? theme.colors.primary : theme.colors.outline,
                marginTop: -8,
                fontSize: 11,
              }}
            >
              {route.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
} 