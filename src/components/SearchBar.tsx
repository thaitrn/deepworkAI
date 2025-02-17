import { View, Pressable } from 'react-native';
import { Text, useTheme, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';

export function SearchBar() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push('/(app)/search')}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceVariant,
        marginHorizontal: 16,
        marginVertical: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 12,
      })}
    >
      <IconButton
        icon="magnify"
        size={20}
        iconColor={theme.colors.outline}
        style={{ margin: 0 }}
      />
      <Text style={{ color: theme.colors.outline }}>
        Search tasks...
      </Text>
    </Pressable>
  );
} 