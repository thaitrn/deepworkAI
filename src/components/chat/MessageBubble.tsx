import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Animated from 'react-native-reanimated';

type MessageBubbleProps = {
  content: string;
  isUser: boolean;
  isLoading?: boolean;
  style?: ViewStyle;
};

export default function MessageBubble({ content, isUser, isLoading, style }: MessageBubbleProps) {
  const theme = useTheme();

  if (isLoading) {
    return (
      <Animated.View
        style={[
          styles.container,
          styles.assistantContainer,
          style,
        ]}
      >
        <View style={styles.loadingContainer}>
          <View style={styles.loadingDot} />
          <View style={styles.loadingDot} />
          <View style={styles.loadingDot} />
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          isUser ? styles.userText : styles.assistantText,
        ]}
      >
        {content}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  userContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  assistantContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#E9E9EB',
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 16,
    lineHeight: 20,
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantText: {
    color: '#000000',
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 24,
    gap: 4,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999',
    opacity: 0.7,
  },
}); 