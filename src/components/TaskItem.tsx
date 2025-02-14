import { View, Pressable } from 'react-native';
import { Card, Text, useTheme, Surface } from 'react-native-paper';
import { Task } from '@/types';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, SlideOutRight, Layout } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Confetti } from './Confetti';

export function TaskItem({ task, onPress, onComplete }: { 
  task: Task; 
  onPress: () => void;
  onComplete?: () => void;
}) {
  const theme = useTheme();
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(false);

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3: return '#ffebee'; // High - Light red
      case 2: return '#fff3e0'; // Medium - Light orange
      default: return '#e8f5e9'; // Low - Light green
    }
  };

  const getPriorityText = (priority: number) => {
    switch (priority) {
      case 3: return 'High';
      case 2: return 'Medium';
      default: return 'Low';
    }
  };

  const getDeadlineText = (deadline: string) => {
    const today = new Date();
    const taskDate = new Date(deadline);
    
    // Reset time part for date comparison
    today.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);

    if (taskDate.getTime() === today.getTime()) {
      return 'Due Today';
    } else if (taskDate.getTime() < today.getTime()) {
      return 'Overdue';
    } else if (taskDate.getTime() === today.getTime() + 86400000) { // tomorrow
      return 'Due Tomorrow';
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `Due ${months[taskDate.getMonth()]} ${taskDate.getDate()}`;
    }
  };

  const handleComplete = () => {
    setShowConfetti(true);
    // Wait for animation to finish
    setTimeout(() => {
      setShowConfetti(false);
      onComplete?.();
    }, 2000);
  };

  return (
    <Animated.View
      entering={FadeIn}
      exiting={SlideOutRight}
      layout={Layout.springify()}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Surface
          style={{
            marginBottom: 12,
            borderRadius: 12,
            overflow: 'hidden',
            borderLeftWidth: 4,
            borderLeftColor: task.priority === 3 
              ? theme.colors.error 
              : task.priority === 2 
                ? theme.colors.warning 
                : theme.colors.success,
          }}
        >
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 4 }}>{task.title}</Text>
            {task.description && (
              <Text variant="bodyMedium" style={{ color: '#666', marginBottom: 8 }}>
                {task.description}
              </Text>
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View
                style={{
                  backgroundColor: getPriorityColor(task.priority),
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 16,
                }}
              >
                <Text style={{ color: '#666' }}>{getPriorityText(task.priority)}</Text>
              </View>
              {task.deadline && (
                <Text 
                  style={{ 
                    color: new Date(task.deadline) < new Date() ? theme.colors.error : '#666'
                  }}
                >
                  {getDeadlineText(task.deadline)}
                </Text>
              )}
            </View>
          </Card.Content>
        </Surface>
      </Pressable>
      <Confetti isActive={showConfetti} />
    </Animated.View>
  );
} 