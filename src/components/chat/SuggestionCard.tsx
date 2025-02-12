import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, useTheme, IconButton } from 'react-native-paper';
import Animated from 'react-native-reanimated';

type SuggestionCardProps = {
  suggestion: {
    title: string;
    description?: string;
    priority?: number;
    estimatedDuration?: number;
    category?: string;
  };
  onAccept: (suggestion: any) => void;
};

export default function SuggestionCard({ suggestion, onAccept }: SuggestionCardProps) {
  const theme = useTheme();

  return (
    <Animated.View
      style={styles.container}
    >
      <Card style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="titleMedium" style={styles.title}>
              {suggestion.title}
            </Text>
            {suggestion.priority && (
              <View style={styles.priorityBadge}>
                <Text style={styles.priorityText}>P{suggestion.priority}</Text>
              </View>
            )}
          </View>

          {suggestion.description && (
            <Text variant="bodyMedium" style={styles.description}>
              {suggestion.description}
            </Text>
          )}

          <View style={styles.metadata}>
            {suggestion.estimatedDuration && (
              <View style={styles.metadataItem}>
                <IconButton icon="clock-outline" size={16} />
                <Text variant="bodySmall">
                  {suggestion.estimatedDuration} min
                </Text>
              </View>
            )}
            {suggestion.category && (
              <View style={styles.metadataItem}>
                <IconButton icon="tag-outline" size={16} />
                <Text variant="bodySmall">
                  {suggestion.category}
                </Text>
              </View>
            )}
          </View>

          <Button
            mode="contained"
            onPress={() => onAccept(suggestion)}
            style={styles.button}
          >
            Use Suggestion
          </Button>
        </Card.Content>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  card: {
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    flex: 1,
  },
  priorityBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  description: {
    marginBottom: 12,
    opacity: 0.7,
  },
  metadata: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  button: {
    marginTop: 8,
  },
}); 